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

  const orderTotal = order?.totalValue ?? calculatedTotal;

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
      <View key={item.idOrderItem} style={styles.tableRow}>
        <View style={styles.productColumn}>
          <Text style={styles.productIndex}>{index + 1}.</Text>

          <View style={styles.productNameBox}>
            <Text style={styles.productName}>
              {item.itemName ?? 'Produkt'}
            </Text>

            <Text style={styles.productCode}>
              {item.itemCode ?? 'Brak kodu'}
            </Text>
          </View>
        </View>

        <View style={styles.valuesRow}>
          <View style={styles.valueCell}>
            <Text style={styles.cellLabel}>Ilość</Text>
            <Text style={styles.cellValue}>{quantity}</Text>
          </View>

          <View style={styles.valueCell}>
            <Text style={styles.cellLabel}>Cena</Text>
            <Text style={styles.cellValue}>{formatPrintMoney(price)}</Text>
          </View>

          <View style={styles.valueCell}>
            <Text style={styles.cellLabel}>Razem</Text>
            <Text style={styles.cellMoney}>{formatPrintMoney(lineValue)}</Text>
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
      <View style={styles.document}>
        <View style={styles.documentHeader}>
          <View>
            <Text style={styles.companyName}>3D PRINT SHOP</Text>
            <Text style={styles.documentTitle}>Zamówienie #{order.idOrder}</Text>
          </View>

          <Text style={styles.statusBadge}>{orderStatus}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dane zamówienia</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data zamówienia</Text>
            <Text style={styles.infoValue}>{formatPrintDate(order.dataOrder)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data dostawy</Text>
            <Text style={styles.infoValue}>
              {formatPrintDate(order.deliveryDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Klient</Text>
            <Text style={styles.infoValue}>{order.clientName ?? 'Brak danych'}</Text>
          </View>

          <View style={styles.infoRowLast}>
            <Text style={styles.infoLabel}>Pracownik</Text>
            <Text style={styles.infoValue}>
              {order.workerName ?? 'Nieprzypisany'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pozycje</Text>

          {orderItems.length > 0 ? (
            orderItems.map(renderOrderItem)
          ) : (
            <Text style={styles.emptyText}>Brak pozycji.</Text>
          )}
        </View>

        {order.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informacje</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        ) : null}

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Liczba pozycji</Text>
            <Text style={styles.totalValue}>
              {order.orderItemsCount ?? orderItems.length}
            </Text>
          </View>

          <View style={styles.totalRowLast}>
            <Text style={styles.totalLabel}>Wartość razem</Text>
            <Text style={styles.totalMoney}>{formatPrintMoney(orderTotal)}</Text>
          </View>
        </View>
      </View>

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
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}>
        <Text style={styles.backButtonText}>Wróć</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },

  content: {
    padding: 12,
    paddingBottom: 28,
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

  document: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },

  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },

  companyName: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },

  documentTitle: {
    color: '#111827',
    fontSize: 25,
    fontWeight: '900',
  },

  statusBadge: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
  },

  divider: {
    height: 1,
    backgroundColor: '#d1d5db',
    marginVertical: 16,
  },

  section: {
    marginBottom: 16,
  },

  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },

  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },

  infoRowLast: {
    paddingVertical: 8,
  },

  infoLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  infoValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '900',
  },

  tableRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },

  productColumn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  productIndex: {
    color: '#f97316',
    fontSize: 15,
    fontWeight: '900',
    width: 24,
  },

  productNameBox: {
    flex: 1,
  },

  productName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },

  productCode: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },

  valuesRow: {
    flexDirection: 'row',
    gap: 8,
  },

  valueCell: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
  },

  cellLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },

  cellValue: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '900',
  },

  cellMoney: {
    color: '#16a34a',
    fontSize: 13,
    fontWeight: '900',
  },

  emptyText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '800',
  },

  notesText: {
    color: '#111827',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },

  totalSection: {
    borderTopWidth: 2,
    borderTopColor: '#111827',
    paddingTop: 12,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },

  totalRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
  },

  totalLabel: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '900',
  },

  totalValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '900',
  },

  totalMoney: {
    color: '#16a34a',
    fontSize: 20,
    fontWeight: '900',
  },

  shareButton: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },

  shareButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  backButton: {
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },

  backButtonText: {
    color: '#ffffff',
    fontSize: 15,
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