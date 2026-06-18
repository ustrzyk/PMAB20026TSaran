import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import apiService from '../api/apiService.ts';
import {
  buildOrderPrintText,
  formatPrintDate,
  formatPrintMoney,
  getPrintOrderStatus,
} from '../utils/orderPrint.ts';

import type {RootStackParamList} from '../navigation/types.ts';
import type {OrderDto, OrderItemDto} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderPrint'>;

function OrderPrintScreen({navigation, route}: Props): React.JSX.Element {
  const {idOrder} = route.params;

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderStatus = useMemo(() => {
    if (!order) {
      return 'Brak danych';
    }

    return getPrintOrderStatus(order);
  }, [order]);

  const calculatedTotal = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      return sum + (item.lineValue ?? 0);
    }, 0);
  }, [orderItems]);

  const loadPrintData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [orderFromApi, orderItemsFromApi] = await Promise.all([
        apiService.getOrder(idOrder),
        apiService.getOrderItemsByOrder(idOrder),
      ]);

      setOrder(orderFromApi);
      setOrderItems(orderItemsFromApi);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nieznany błąd pobierania danych';

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [idOrder]);

  useEffect(() => {
    loadPrintData();
  }, [loadPrintData]);

  const shareOrder = async (): Promise<void> => {
    if (!order) {
      return;
    }

    try {
      setSharing(true);

      await Share.share({
        title: `Zamówienie #${order.idOrder}`,
        message: buildOrderPrintText(order, orderItems),
      });
    } finally {
      setSharing(false);
    }
  };

  const renderOrderItem = (item: OrderItemDto, index: number): React.JSX.Element => {
    const quantity = item.quantity ?? 0;
    const itemPrice = item.itemPrice ?? 0;
    const lineValue = item.lineValue ?? itemPrice * quantity;

    return (
      <View key={item.idOrderItem} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemNumber}>{index + 1}</Text>

          <View style={styles.itemTitleBox}>
            <Text style={styles.itemName}>
              {item.itemName ?? 'Produkt'}
            </Text>

            <Text style={styles.itemCode}>
              Kod: {item.itemCode ?? 'brak'}
            </Text>
          </View>
        </View>

        <View style={styles.itemGrid}>
          <View style={styles.itemInfoBox}>
            <Text style={styles.infoLabel}>Ilość</Text>
            <Text style={styles.infoValue}>{quantity}</Text>
          </View>

          <View style={styles.itemInfoBox}>
            <Text style={styles.infoLabel}>Cena</Text>
            <Text style={styles.infoValue}>{formatPrintMoney(itemPrice)}</Text>
          </View>

          <View style={styles.itemInfoBox}>
            <Text style={styles.infoLabel}>Wartość</Text>
            <Text style={styles.itemMoney}>{formatPrintMoney(lineValue)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Przygotowywanie wydruku...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>

        <Text style={styles.errorTitle}>Nie udało się przygotować wydruku</Text>

        <Text style={styles.errorText}>
          {error ?? 'Brak danych zamówienia.'}
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={loadPrintData}
          activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>Wróć</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroBox}>
        <Text style={styles.appName}>3D Print Shop</Text>

        <Text style={styles.title}>Wydruk zamówienia</Text>

        <Text style={styles.subtitle}>
          Podgląd danych do późniejszego PDF albo wydruku.
        </Text>
      </View>

      <View style={styles.printCard}>
        <Text style={styles.documentTitle}>Potwierdzenie zamówienia</Text>
        <Text style={styles.documentNumber}>#{order.idOrder}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <Text style={styles.statusBadge}>{orderStatus}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Data zamówienia</Text>
          <Text style={styles.rowValue}>{formatPrintDate(order.dataOrder)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Data dostawy</Text>
          <Text style={styles.rowValue}>
            {formatPrintDate(order.deliveryDate)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Klient</Text>
          <Text style={styles.rowValue}>{order.clientName ?? 'Brak klienta'}</Text>
        </View>

        <View style={styles.rowLast}>
          <Text style={styles.rowLabel}>Pracownik</Text>
          <Text style={styles.rowValue}>
            {order.workerName ?? 'Nieprzypisany'}
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Podsumowanie</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Pozycje</Text>
            <Text style={styles.summaryValue}>
              {order.orderItemsCount ?? orderItems.length}
            </Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Z listy</Text>
            <Text style={styles.summaryValue}>{orderItems.length}</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Suma</Text>
            <Text style={styles.summaryMoney}>
              {formatPrintMoney(order.totalValue ?? calculatedTotal)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pozycje zamówienia</Text>

        {orderItems.length > 0 ? (
          orderItems.map(renderOrderItem)
        ) : (
          <Text style={styles.emptyText}>Brak pozycji zamówienia.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notatki</Text>

        <Text style={styles.notesText}>
          {order.notes ?? 'Brak notatek.'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.shareButton, sharing && styles.disabledButton]}
        onPress={shareOrder}
        activeOpacity={0.85}
        disabled={sharing}>
        <Text style={styles.shareButtonText}>
          {sharing ? 'Przygotowywanie...' : 'Udostępnij podsumowanie'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}>
        <Text style={styles.secondaryButtonText}>Wróć</Text>
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

  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  loadingText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },

  errorIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  errorTitle: {
    color: '#f8fafc',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },

  heroBox: {
    backgroundColor: '#111827',
    borderRadius: 22,
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
    marginBottom: 7,
  },

  title: {
    color: '#f8fafc',
    fontSize: 27,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontWeight: '700',
  },

  printCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  documentTitle: {
    color: '#0f172a',
    fontSize: 21,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  documentNumber: {
    color: '#f97316',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 14,
  },

  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
  },

  rowLast: {
    paddingVertical: 10,
  },

  rowLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },

  rowValue: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
  },

  summaryCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 14,
  },

  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
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

  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },

  summaryBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  summaryLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },

  summaryValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },

  summaryMoney: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '900',
  },

  itemCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
  },

  itemHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  itemNumber: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: '#f97316',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 30,
    fontSize: 14,
    fontWeight: '900',
    overflow: 'hidden',
  },

  itemTitleBox: {
    flex: 1,
  },

  itemName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
  },

  itemCode: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },

  itemGrid: {
    flexDirection: 'row',
    gap: 8,
  },

  itemInfoBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 8,
  },

  infoLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },

  infoValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
  },

  itemMoney: {
    color: '#16a34a',
    fontSize: 13,
    fontWeight: '900',
  },

  emptyText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },

  notesText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },

  shareButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  shareButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },

  primaryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 10,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  secondaryButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  disabledButton: {
    opacity: 0.65,
  },
});

export default OrderPrintScreen;