import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import apiService from '../api/apiService.ts';
import {useAuth} from '../context/AuthContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';
import type {OrderDto, OrderItemDto} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'TrackOrder'>;

type OrderWithStatus = OrderDto & {
  status?: string | null;
};

function formatMoney(value?: number | null): string {
  const safeValue = value ?? 0;

  return `${safeValue.toFixed(2)} zł`;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return 'Brak daty';
  }

  return value.substring(0, 10);
}

function getOrderStatus(order?: OrderDto | null): string {
  if (!order) {
    return 'Nowe';
  }

  const status = (order as OrderWithStatus).status?.trim();

  if (!status || status.length === 0) {
    return 'Nowe';
  }

  return status;
}

function TrackOrderScreen({navigation, route}: Props): React.JSX.Element {
  const {user, isAdmin, isWorker, isCustomer} = useAuth();

  const initialOrderId = route.params?.idOrder;

  const [orderNumber, setOrderNumber] = useState(
    initialOrderId ? initialOrderId.toString() : '',
  );

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStatus = getOrderStatus(order);

  const orderTotalFromItems = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      return sum + (item.lineValue ?? 0);
    }, 0);
  }, [orderItems]);

  const clearResult = (): void => {
    setOrder(null);
    setOrderItems([]);
    setError(null);
  };

  const checkCustomerAccess = (foundOrder: OrderDto): void => {
    if (!isCustomer) {
      return;
    }

    if (!user?.id) {
      throw new Error('Nie udało się rozpoznać konta klienta.');
    }

    if (foundOrder.idClient !== user.id) {
      throw new Error('To zamówienie nie jest przypisane do Twojego konta.');
    }
  };

  const loadOrder = async (idOrder: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const foundOrder = await apiService.getOrder(idOrder);

      if (foundOrder.isActive === false) {
        throw new Error('Zamówienie jest nieaktywne.');
      }

      checkCustomerAccess(foundOrder);

      const foundItems = await apiService.getOrderItemsByOrder(idOrder);
      const activeItems = foundItems.filter(item => item.isActive !== false);

      setOrder(foundOrder);
      setOrderItems(activeItems);
    } catch (err) {
      setOrder(null);
      setOrderItems([]);

      if (err instanceof Error && err.message.length > 0) {
        setError(err.message);
        return;
      }

      setError('Nie udało się pobrać zamówienia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId && initialOrderId > 0) {
      loadOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const searchOrder = async (): Promise<void> => {
    const parsedId = Number(orderNumber.trim());

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      setError('Podaj poprawny numer zamówienia');
      setOrder(null);
      setOrderItems([]);
      return;
    }

    await loadOrder(parsedId);
  };

  const goToAccount = (): void => {
    if (isAdmin || isWorker) {
      navigation.navigate('AdminPanel');
      return;
    }

    if (isCustomer) {
      navigation.navigate('ClientPanel');
      return;
    }

    navigation.navigate('AuthLogin');
  };

  const openPrintPreview = (): void => {
    if (!order) {
      return;
    }

    navigation.navigate('OrderPrint', {
      idOrder: order.idOrder,
    });
  };

  const renderOrderItem = (item: OrderItemDto): React.JSX.Element => {
    return (
      <View key={item.idOrderItem} style={styles.itemCard}>
        <Text style={styles.itemName}>
          {item.itemName ?? `Produkt ID ${item.idItem}`}
        </Text>

        <View style={styles.itemInfoRow}>
          <Text style={styles.itemLabel}>Kod</Text>
          <Text style={styles.itemValue}>{item.itemCode ?? 'Brak kodu'}</Text>
        </View>

        <View style={styles.itemInfoRow}>
          <Text style={styles.itemLabel}>Ilość</Text>
          <Text style={styles.itemValue}>{item.quantity ?? 0}</Text>
        </View>

        <View style={styles.itemInfoRow}>
          <Text style={styles.itemLabel}>Cena</Text>
          <Text style={styles.itemValue}>{formatMoney(item.itemPrice)}</Text>
        </View>

        <View style={styles.itemSummaryBox}>
          <Text style={styles.itemSummaryLabel}>Wartość</Text>
          <Text style={styles.itemSummaryValue}>{formatMoney(item.lineValue)}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroBox}>
        <Text style={styles.appName}>3D Print Shop</Text>
        <Text style={styles.title}>Status zamówienia</Text>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.label}>Numer zamówienia</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={orderNumber}
            onChangeText={value => {
              setOrderNumber(value);
              clearResult();
            }}
            placeholder="Np. 7"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            editable={!loading}
            returnKeyType="search"
            onSubmitEditing={searchOrder}
          />

          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchOrder}
            activeOpacity={0.85}
            disabled={loading}>
            <Text style={styles.searchButtonText}>
              {loading ? '...' : 'Szukaj'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Pobieranie...</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Błąd</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {order ? (
        <>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Status</Text>

            <Text
              style={
                currentStatus === 'Anulowane'
                  ? styles.cancelledStatusValue
                  : styles.statusValue
              }>
              {currentStatus}
            </Text>
          </View>

          <View style={styles.orderCard}>
            <Text style={styles.sectionTitle}>Zamówienie #{order.idOrder}</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Zamówiono</Text>
                <Text style={styles.infoValue}>{formatDate(order.dataOrder)}</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Dostawa</Text>
                <Text style={styles.infoValue}>
                  {formatDate(order.deliveryDate)}
                </Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Pozycje</Text>
                <Text style={styles.infoValue}>
                  {order.orderItemsCount ?? orderItems.length}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Wartość</Text>
                <Text style={styles.orderValue}>
                  {formatMoney(order.totalValue)}
                </Text>
              </View>
            </View>

            <View style={styles.infoBoxFull}>
              <Text style={styles.infoLabel}>Klient</Text>
              <Text style={styles.infoValue}>
                {order.clientName ?? 'Brak danych klienta'}
              </Text>
            </View>
          </View>

          {order.notes ? (
            <View style={styles.notesCard}>
              <Text style={styles.sectionTitle}>Informacje</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          ) : null}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.printButton}
              onPress={openPrintPreview}
              activeOpacity={0.85}>
              <Text style={styles.printButtonText}>Wydruk</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => loadOrder(order.idOrder)}
              activeOpacity={0.85}>
              <Text style={styles.refreshButtonText}>Odśwież</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitleOutside}>Produkty</Text>

          {orderItems.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Brak pozycji.</Text>
            </View>
          ) : (
            orderItems.map(renderOrderItem)
          )}

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Suma pozycji</Text>
            <Text style={styles.totalValue}>
              {formatMoney(orderTotalFromItems)}
            </Text>
          </View>
        </>
      ) : null}

      {isCustomer ? (
        <TouchableOpacity
          style={styles.customerPanelButton}
          onPress={() => navigation.navigate('ClientPanel')}
          activeOpacity={0.85}>
          <Text style={styles.customerPanelButtonText}>Moje konto</Text>
        </TouchableOpacity>
      ) : null}

      {isCustomer ? (
        <TouchableOpacity
          style={styles.customerOrdersButton}
          onPress={() => navigation.navigate('CustomerOrders')}
          activeOpacity={0.85}>
          <Text style={styles.customerOrdersButtonText}>Moje zamówienia</Text>
        </TouchableOpacity>
      ) : null}

      {isAdmin || isWorker ? (
        <TouchableOpacity
          style={styles.panelButton}
          onPress={goToAccount}
          activeOpacity={0.85}>
          <Text style={styles.panelButtonText}>Panel obsługi</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('Items')}
        activeOpacity={0.85}>
        <Text style={styles.shopButtonText}>Produkty</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.85}>
        <Text style={styles.homeButtonText}>Strona główna</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  heroBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  appName: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
  },

  searchCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  label: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },

  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },

  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },

  searchButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  loadingBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    marginBottom: 14,
  },

  loadingText: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 10,
  },

  errorBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 14,
  },

  errorTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },

  errorText: {
    color: '#fecaca',
    fontSize: 13,
    lineHeight: 18,
  },

  statusCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 14,
  },

  statusLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },

  statusValue: {
    color: '#f97316',
    fontSize: 30,
    fontWeight: '900',
  },

  cancelledStatusValue: {
    color: '#fca5a5',
    fontSize: 30,
    fontWeight: '900',
  },

  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },

  infoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  infoBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  infoBoxFull: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  infoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  infoValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
  },

  orderValue: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '900',
  },

  notesCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  notesText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  printButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  printButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  refreshButton: {
    flex: 1,
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  refreshButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
  },

  sectionTitleOutside: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },

  itemCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  itemName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },

  itemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingVertical: 7,
  },

  itemLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
  },

  itemValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },

  itemSummaryBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 10,
  },

  itemSummaryLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  itemSummaryValue: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: '900',
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },

  totalCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 14,
  },

  totalLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },

  totalValue: {
    color: '#16a34a',
    fontSize: 24,
    fontWeight: '900',
  },

  customerPanelButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },

  customerPanelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  customerOrdersButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },

  customerOrdersButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
  },

  panelButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },

  panelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  shopButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },

  shopButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  homeButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  homeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default TrackOrderScreen;