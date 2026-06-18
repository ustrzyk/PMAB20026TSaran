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
      const quantity = item.quantity ?? 0;
      const price = item.itemPrice ?? 0;

      return sum + (item.lineValue ?? price * quantity);
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
      setOrderItems(orderItemsFromApi.filter(item => item.isActive !== false));
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

  const renderOrderItem = (
    item: OrderItemDto,
    index: number,
  ): React.JSX.Element => {
    const quantity = item.quantity ?? 0;
    const price = item.itemPrice ?? 0;
    const lineValue = item.lineValue ?? price * quantity;

    return (
      <View key={item.idOrderItem} style={styles.itemCard}>
        <View style={styles.itemTopRow}>
          <Text style={styles.itemIndex}>{index + 1}</Text>

          <View style={styles.itemNameBox}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.itemName ?? 'Produkt'}
            </Text>

            <Text style={styles.itemCode}>Kod: {item.itemCode ?? 'brak'}</Text>
          </View>
        </View>

        <View style={styles.itemValues}>
          <View style={styles.itemValueBox}>
            <Text style={styles.itemValueLabel}>Ilość</Text>
            <Text style={styles.itemValue}>{quantity}</Text>
          </View>

          <View style={styles.itemValueBox}>
            <Text style={styles.itemValueLabel}>Cena</Text>
            <Text style={styles.itemValue}>{formatPrintMoney(price)}</Text>
          </View>

          <View style={styles.itemValueBox}>
            <Text style={styles.itemValueLabel}>Razem</Text>
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
        <Text style={styles.loadingText}>Ładowanie...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Nie udało się pobrać zamówienia</Text>

        <Text style={styles.errorText}>
          {error ?? 'Brak danych zamówienia.'}
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={loadPrintData}
          activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Odśwież</Text>
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
      <View style={styles.headerCard}>
        <Text style={styles.appName}>3D Print Shop</Text>
        <Text style={styles.title}>Zamówienie #{order.idOrder}</Text>
        <Text style={styles.statusBadge}>{orderStatus}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dane zamówienia</Text>

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
          <Text style={styles.rowValue}>{order.clientName ?? 'Brak danych'}</Text>
        </View>

        <View style={styles.rowLast}>
          <Text style={styles.rowLabel}>Pracownik</Text>
          <Text style={styles.rowValue}>
            {order.workerName ?? 'Nieprzypisany'}
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Pozycje</Text>
          <Text style={styles.summaryValue}>
            {order.orderItemsCount ?? orderItems.length}
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Na liście</Text>
          <Text style={styles.summaryValue}>{orderItems.length}</Text>
        </View>

        <View style={styles.summaryBoxWide}>
          <Text style={styles.summaryLabel}>Wartość</Text>
          <Text style={styles.summaryMoney}>
            {formatPrintMoney(order.totalValue ?? calculatedTotal)}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pozycje</Text>

        {orderItems.length > 0 ? (
          orderItems.map(renderOrderItem)
        ) : (
          <Text style={styles.emptyText}>Brak pozycji.</Text>
        )}
      </View>

      {order.notes ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informacje</Text>
          <Text style={styles.notesText}>{order.notes}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.shareButton, sharing && styles.disabledButton]}
        onPress={shareOrder}
        activeOpacity={0.85}
        disabled={sharing}>
        <Text style={styles.shareButtonText}>
          {sharing ? 'Udostępnianie...' : 'Udostępnij'}
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
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
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

  headerCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
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
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 10,
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

  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingVertical: 10,
  },

  rowLast: {
    paddingVertical: 10,
  },

  rowLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  rowValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
  },

  summaryCard: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },

  summaryBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  summaryBoxWide: {
    flex: 2,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#16a34a',
  },

  summaryLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 5,
  },

  summaryValue: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
  },

  summaryMoney: {
    color: '#16a34a',
    fontSize: 20,
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

  itemTopRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  itemIndex: {
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

  itemNameBox: {
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

  itemValues: {
    flexDirection: 'row',
    gap: 8,
  },

  itemValueBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 8,
  },

  itemValueLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },

  itemValue: {
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
    color: '#94a3b8',
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
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  shareButtonText: {
    color: '#ffffff',
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