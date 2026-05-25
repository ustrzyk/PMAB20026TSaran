import React, {useEffect, useState} from 'react';
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

function TrackOrderScreen({navigation, route}: Props): React.JSX.Element {
  const {isAdmin, isWorker, isCustomer} = useAuth();

  const initialOrderId = route.params?.idOrder;

  const [orderNumber, setOrderNumber] = useState(
    initialOrderId ? initialOrderId.toString() : '',
  );

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearResult = (): void => {
    setOrder(null);
    setOrderItems([]);
    setError(null);
  };

  const loadOrder = async (idOrder: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const foundOrder = await apiService.getOrder(idOrder);

      if (foundOrder.isActive === false) {
        throw new Error('Zamówienie jest nieaktywne');
      }

      const foundItems = await apiService.getOrderItemsByOrder(idOrder);
      const activeItems = foundItems.filter(item => item.isActive !== false);

      setOrder(foundOrder);
      setOrderItems(activeItems);
    } catch (err) {
      setOrder(null);
      setOrderItems([]);
      setError(
        'Nie znaleziono aktywnego zamówienia albo wystąpił błąd pobierania danych.',
      );
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

  const renderOrderItem = (item: OrderItemDto): React.JSX.Element => {
    return (
      <View key={item.idOrderItem} style={styles.itemCard}>
        <Text style={styles.itemName}>
          {item.itemName ?? `Produkt ID ${item.idItem}`}
        </Text>

        <Text style={styles.itemText}>Kod: {item.itemCode ?? 'Brak kodu'}</Text>

        <Text style={styles.itemText}>Ilość: {item.quantity ?? 0}</Text>

        <Text style={styles.itemText}>
          Cena produktu: {formatMoney(item.itemPrice)}
        </Text>

        <Text style={styles.itemValue}>
          Wartość pozycji: {formatMoney(item.lineValue)}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroBox}>
        <Text style={styles.appName}>3D Print Shop</Text>

        <Text style={styles.title}>Sprawdź zamówienie</Text>

        <Text style={styles.subtitle}>
          Wpisz numer zamówienia, aby zobaczyć jego podstawowe dane i pozycje.
        </Text>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.label}>Numer zamówienia</Text>

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
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={searchOrder}
          activeOpacity={0.8}
          disabled={loading}>
          <Text style={styles.searchButtonText}>
            {loading ? 'Sprawdzanie...' : 'Sprawdź zamówienie'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Pobieranie zamówienia...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Nie udało się pobrać zamówienia</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {order && (
        <>
          <View style={styles.orderCard}>
            <Text style={styles.sectionTitle}>Zamówienie #{order.idOrder}</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data zamówienia</Text>
              <Text style={styles.infoValue}>{formatDate(order.dataOrder)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data dostawy</Text>
              <Text style={styles.infoValue}>
                {formatDate(order.deliveryDate)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Klient</Text>
              <Text style={styles.infoValue}>
                {order.clientName ?? 'Brak klienta'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Obsługuje</Text>
              <Text style={styles.infoValue}>
                {order.workerName ?? 'Brak pracownika'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Liczba pozycji</Text>
              <Text style={styles.infoValue}>{order.orderItemsCount}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Wartość produktów</Text>
              <Text style={styles.orderValue}>
                {formatMoney(order.totalValue)}
              </Text>
            </View>
          </View>

          {order.notes && (
            <View style={styles.notesCard}>
              <Text style={styles.sectionTitle}>Dostawa i płatność</Text>

              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          )}

          <Text style={styles.sectionTitleOutside}>Produkty w zamówieniu</Text>

          {orderItems.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Brak pozycji dla tego zamówienia
              </Text>
            </View>
          ) : (
            orderItems.map(renderOrderItem)
          )}
        </>
      )}

      {isCustomer ? (
        <TouchableOpacity
          style={styles.customerPanelButton}
          onPress={() => navigation.navigate('ClientPanel')}
          activeOpacity={0.8}>
          <Text style={styles.customerPanelButtonText}>Moje konto</Text>
        </TouchableOpacity>
      ) : null}

      {isAdmin || isWorker ? (
        <TouchableOpacity
          style={styles.adminPanelButton}
          onPress={() => navigation.navigate('AdminPanel')}
          activeOpacity={0.8}>
          <Text style={styles.adminPanelButtonText}>Panel pracownika</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('Items')}
        activeOpacity={0.8}>
        <Text style={styles.shopButtonText}>Przejdź do sklepu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}>
        <Text style={styles.homeButtonText}>Wróć na stronę główną</Text>
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
    fontSize: 26,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
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

  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 12,
  },

  searchButton: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  searchButtonText: {
    color: '#ffffff',
    fontSize: 15,
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

  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 14,
  },

  notesCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },

  sectionTitleOutside: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },

  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingVertical: 9,
  },

  infoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  infoValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
  },

  orderValue: {
    color: '#16a34a',
    fontSize: 20,
    fontWeight: '900',
  },

  notesText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
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
    marginBottom: 6,
  },

  itemText: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 4,
  },

  itemValue: {
    color: '#f97316',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },

  customerPanelButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },

  customerPanelButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  adminPanelButton: {
    backgroundColor: '#a855f7',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },

  adminPanelButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  shopButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },

  shopButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  homeButton: {
    backgroundColor: '#f97316',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  homeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default TrackOrderScreen;