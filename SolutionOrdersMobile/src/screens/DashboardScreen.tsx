import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import apiService from '../api/apiService.ts';

import type {RootStackParamList} from '../navigation/types.ts';
import type {
  DashboardCategorySalesDto,
  DashboardDto,
  DashboardLatestOrderDto,
  DashboardLowStockProductDto,
  DashboardTopProductDto,
} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

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

function formatQuantity(value?: number | null, unitName?: string | null): string {
  const safeValue = value ?? 0;
  const safeUnit = unitName ?? '';

  return `${safeValue} ${safeUnit}`.trim();
}

function getLatestOrderStatus(order: DashboardLatestOrderDto): string {
  return order.status && order.status.trim().length > 0
    ? order.status
    : 'Nowe';
}

function DashboardScreen({navigation}: Props): React.JSX.Element {
  const [dashboard, setDashboard] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      const data = await apiService.getDashboard();

      setDashboard(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nieznany błąd pobierania danych';

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadDashboard();
    }, [loadDashboard]),
  );

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadDashboard();
  };

  const maxCategoryValue =
    dashboard?.categorySales.reduce((maxValue, category) => {
      return category.totalValue > maxValue ? category.totalValue : maxValue;
    }, 0) ?? 0;

  const maxTopProductValue =
    dashboard?.topProducts.reduce((maxValue, product) => {
      return product.totalValue > maxValue ? product.totalValue : maxValue;
    }, 0) ?? 0;

  const renderMetricCard = (
    title: string,
    value: string | number,
  ): React.JSX.Element => {
    return (
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    );
  };

  const renderStatusCard = (
    title: string,
    value: number,
  ): React.JSX.Element => {
    return (
      <TouchableOpacity
        style={styles.statusCard}
        onPress={() => navigation.navigate('Orders')}
        activeOpacity={0.85}>
        <Text style={styles.statusCardTitle}>{title}</Text>
        <Text style={styles.statusCardValue}>{value}</Text>
      </TouchableOpacity>
    );
  };

  const renderCategorySale = (
    category: DashboardCategorySalesDto,
  ): React.JSX.Element => {
    const percentage =
      maxCategoryValue > 0
        ? Math.max((category.totalValue / maxCategoryValue) * 100, 5)
        : 0;

    return (
      <View key={category.idCategory} style={styles.listCard}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {category.categoryName ?? `Kategoria ${category.idCategory}`}
          </Text>

          <Text style={styles.moneyText}>{formatMoney(category.totalValue)}</Text>
        </View>

        <Text style={styles.smallText}>Ilość: {category.totalQuantity}</Text>

        <View style={styles.barBackground}>
          <View style={[styles.barFill, {width: `${percentage}%`}]} />
        </View>
      </View>
    );
  };

  const renderTopProduct = (
    product: DashboardTopProductDto,
    index: number,
  ): React.JSX.Element => {
    const percentage =
      maxTopProductValue > 0
        ? Math.max((product.totalValue / maxTopProductValue) * 100, 5)
        : 0;

    return (
      <TouchableOpacity
        key={product.idItem}
        style={styles.listCard}
        onPress={() => navigation.navigate('AdminItems')}
        activeOpacity={0.85}>
        <View style={styles.productHeader}>
          <Text style={styles.rankBadge}>{index + 1}</Text>

          <View style={styles.productTitleBox}>
            <Text style={styles.listTitle}>
              {product.name ?? `Produkt ${product.idItem}`}
            </Text>

            <Text style={styles.smallText}>Kod: {product.code ?? 'brak'}</Text>
          </View>
        </View>

        <Text style={styles.smallText}>
          Kategoria: {product.categoryName ?? 'Brak kategorii'}
        </Text>

        <Text style={styles.smallText}>Ilość: {product.totalQuantity}</Text>

        <Text style={styles.moneyText}>{formatMoney(product.totalValue)}</Text>

        <View style={styles.barBackground}>
          <View style={[styles.barFill, {width: `${percentage}%`}]} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderLatestOrder = (
    order: DashboardLatestOrderDto,
  ): React.JSX.Element => {
    const status = getLatestOrderStatus(order);

    return (
      <View key={order.idOrder} style={styles.orderCard}>
        <View style={styles.orderTopRow}>
          <View style={styles.orderTitleBox}>
            <Text style={styles.orderTitle}>Zamówienie #{order.idOrder}</Text>
            <Text style={styles.orderDate}>{formatDate(order.dataOrder)}</Text>
          </View>

          <Text style={styles.statusBadge}>{status}</Text>
        </View>

        <View style={styles.orderInfoGrid}>
          <View style={styles.orderInfoBox}>
            <Text style={styles.orderInfoLabel}>Klient</Text>
            <Text style={styles.orderInfoValue} numberOfLines={1}>
              {order.clientName ?? 'Brak'}
            </Text>
          </View>

          <View style={styles.orderInfoBox}>
            <Text style={styles.orderInfoLabel}>Wartość</Text>
            <Text style={styles.orderMoney}>{formatMoney(order.totalValue)}</Text>
          </View>
        </View>

        <View style={styles.orderInfoGrid}>
          <View style={styles.orderInfoBox}>
            <Text style={styles.orderInfoLabel}>Pracownik</Text>
            <Text style={styles.orderInfoValue} numberOfLines={1}>
              {order.workerName ?? 'Brak'}
            </Text>
          </View>

          <View style={styles.orderInfoBox}>
            <Text style={styles.orderInfoLabel}>Pozycje</Text>
            <Text style={styles.orderInfoValue}>{order.orderItemsCount}</Text>
          </View>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.orderButton}
            onPress={() =>
              navigation.navigate('TrackOrder', {
                idOrder: order.idOrder,
              })
            }
            activeOpacity={0.85}>
            <Text style={styles.orderButtonText}>Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.printButton}
            onPress={() =>
              navigation.navigate('OrderPrint', {
                idOrder: order.idOrder,
              })
            }
            activeOpacity={0.85}>
            <Text style={styles.printButtonText}>Wydruk</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLowStockProduct = (
    product: DashboardLowStockProductDto,
  ): React.JSX.Element => {
    return (
      <TouchableOpacity
        key={product.idItem}
        style={styles.listCard}
        onPress={() => navigation.navigate('AdminItems')}
        activeOpacity={0.85}>
        <View style={styles.listHeader}>
          <View style={styles.productTitleBox}>
            <Text style={styles.listTitle}>
              {product.name ?? `Produkt ${product.idItem}`}
            </Text>

            <Text style={styles.smallText}>Kod: {product.code ?? 'brak'}</Text>
          </View>

          <Text style={styles.stockBadge}>
            {formatQuantity(product.quantity, product.unitName)}
          </Text>
        </View>

        <Text style={styles.smallText}>
          Kategoria: {product.categoryName ?? 'Brak kategorii'}
        </Text>

        <Text style={styles.smallText}>Cena: {formatMoney(product.price)}</Text>

        <Text style={styles.moneyText}>{formatMoney(product.stockValue)}</Text>
      </TouchableOpacity>
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

  if (error || !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Nie udało się pobrać danych</Text>

        <Text style={styles.errorText}>{error ?? 'Brak danych z API'}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
          <Text style={styles.retryButtonText}>Odśwież</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('AdminPanel')}
          activeOpacity={0.85}>
          <Text style={styles.backButtonText}>Panel obsługi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <View style={styles.heroBox}>
        <Text style={styles.appName}>3D Print Shop</Text>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.mainSummaryBox}>
          <Text style={styles.summaryLabel}>Zamówienia</Text>
          <Text style={styles.summaryValue}>
            {formatMoney(dashboard.ordersTotalValue)}
          </Text>
        </View>

        <View style={styles.mainSummaryBox}>
          <Text style={styles.summaryLabel}>Magazyn</Text>
          <Text style={styles.summaryValue}>
            {formatMoney(dashboard.productsStockValue)}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Statusy</Text>

      <View style={styles.statusGrid}>
        {renderStatusCard('Nowe', dashboard.newOrdersCount)}
        {renderStatusCard('W realizacji', dashboard.inProgressOrdersCount)}
        {renderStatusCard('Gotowe', dashboard.readyOrdersCount)}
        {renderStatusCard('Wysłane', dashboard.shippedOrdersCount)}
        {renderStatusCard('Zakończone', dashboard.completedOrdersCount)}
        {renderStatusCard('Anulowane', dashboard.cancelledOrdersCount)}
      </View>

      <Text style={styles.sectionTitle}>Liczniki</Text>

      <View style={styles.metricsGrid}>
        {renderMetricCard('Produkty', dashboard.productsCount)}
        {renderMetricCard('Kategorie', dashboard.categoriesCount)}
        {renderMetricCard('Jednostki', dashboard.unitsCount)}
        {renderMetricCard('Klienci', dashboard.clientsCount)}
        {renderMetricCard('Pracownicy', dashboard.workersCount)}
        {renderMetricCard('Zamówienia', dashboard.ordersCount)}
        {renderMetricCard('Pozycje', dashboard.orderItemsCount)}
      </View>

      <Text style={styles.sectionTitle}>Ostatnie zamówienia</Text>

      {dashboard.latestOrders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Brak zamówień.</Text>
        </View>
      ) : (
        dashboard.latestOrders.map(renderLatestOrder)
      )}

      <Text style={styles.sectionTitle}>TOP produkty</Text>

      {dashboard.topProducts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Brak danych.</Text>
        </View>
      ) : (
        dashboard.topProducts.map(renderTopProduct)
      )}

      <Text style={styles.sectionTitle}>Kategorie</Text>

      {dashboard.categorySales.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Brak danych.</Text>
        </View>
      ) : (
        dashboard.categorySales.map(renderCategorySale)
      )}

      <Text style={styles.sectionTitle}>Niski stan</Text>

      {dashboard.lowStockProducts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Brak produktów.</Text>
        </View>
      ) : (
        dashboard.lowStockProducts.map(renderLowStockProduct)
      )}

      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Orders')}
          activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Zamówienia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('AdminPanel')}
          activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>Panel obsługi</Text>
        </TouchableOpacity>
      </View>
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

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  mainSummaryBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },

  summaryLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 5,
  },

  summaryValue: {
    color: '#16a34a',
    fontSize: 21,
    fontWeight: '900',
  },

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },

  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },

  statusCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },

  statusCardTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 5,
  },

  statusCardValue: {
    color: '#f97316',
    fontSize: 26,
    fontWeight: '900',
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },

  metricCard: {
    width: '31.5%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  metricTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },

  metricValue: {
    color: '#f8fafc',
    fontSize: 21,
    fontWeight: '900',
  },

  listCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  listTitle: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
  },

  productHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  productTitleBox: {
    flex: 1,
  },

  rankBadge: {
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

  smallText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  moneyText: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },

  barBackground: {
    height: 7,
    backgroundColor: '#1e293b',
    borderRadius: 999,
    marginTop: 10,
    overflow: 'hidden',
  },

  barFill: {
    height: 7,
    backgroundColor: '#f97316',
    borderRadius: 999,
  },

  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },

  orderTitleBox: {
    flex: 1,
  },

  orderTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },

  orderDate: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },

  statusBadge: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  orderInfoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  orderInfoBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  orderInfoLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },

  orderInfoValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
  },

  orderMoney: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '900',
  },

  orderActions: {
    flexDirection: 'row',
    gap: 10,
  },

  orderButton: {
    flex: 1,
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },

  orderButtonText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '900',
  },

  printButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },

  printButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  stockBadge: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '800',
  },

  footerButtons: {
    marginTop: 8,
    gap: 10,
  },

  primaryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '900',
  },

  retryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 10,
  },

  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  backButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default DashboardScreen;