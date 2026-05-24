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

  const renderCategorySale = (
    category: DashboardCategorySalesDto,
  ): React.JSX.Element => {
    const percentage =
      maxCategoryValue > 0
        ? Math.max((category.totalValue / maxCategoryValue) * 100, 5)
        : 0;

    return (
      <View key={category.idCategory} style={styles.categorySaleCard}>
        <View style={styles.categorySaleHeader}>
          <Text style={styles.categorySaleTitle}>
            {category.categoryName ?? `Kategoria ${category.idCategory}`}
          </Text>

          <Text style={styles.categorySaleValue}>
            {formatMoney(category.totalValue)}
          </Text>
        </View>

        <Text style={styles.categorySaleText}>
          Sprzedana ilość: {category.totalQuantity}
        </Text>

        <View style={styles.categoryBarBackground}>
          <View style={[styles.categoryBarFill, {width: `${percentage}%`}]} />
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
        style={styles.topProductCard}
        onPress={() => navigation.navigate('AdminItems')}
        activeOpacity={0.8}>
        <View style={styles.topProductHeader}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>{index + 1}</Text>
          </View>

          <View style={styles.topProductTitleBox}>
            <Text style={styles.topProductTitle}>
              {product.name ?? `Produkt ${product.idItem}`}
            </Text>

            <Text style={styles.topProductCode}>
              Kod: {product.code ?? 'brak kodu'}
            </Text>
          </View>
        </View>

        <Text style={styles.topProductText}>
          Kategoria: {product.categoryName ?? 'Brak kategorii'}
        </Text>

        <Text style={styles.topProductText}>
          Sprzedana ilość: {product.totalQuantity}
        </Text>

        <Text style={styles.topProductValue}>
          Wartość sprzedaży: {formatMoney(product.totalValue)}
        </Text>

        <View style={styles.topProductBarBackground}>
          <View style={[styles.topProductBarFill, {width: `${percentage}%`}]} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderLatestOrder = (
    order: DashboardLatestOrderDto,
  ): React.JSX.Element => {
    return (
      <TouchableOpacity
        key={order.idOrder}
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate('TrackOrder', {
            idOrder: order.idOrder,
          })
        }
        activeOpacity={0.8}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderTitle}>Zamówienie nr {order.idOrder}</Text>
          <Text style={styles.orderValue}>{formatMoney(order.totalValue)}</Text>
        </View>

        <Text style={styles.orderText}>
          Klient: {order.clientName ?? 'Brak klienta'}
        </Text>

        <Text style={styles.orderText}>
          Pracownik: {order.workerName ?? 'Brak pracownika'}
        </Text>

        <Text style={styles.orderText}>Data: {formatDate(order.dataOrder)}</Text>

        <Text style={styles.orderText}>Pozycje: {order.orderItemsCount}</Text>
      </TouchableOpacity>
    );
  };

  const renderLowStockProduct = (
    product: DashboardLowStockProductDto,
  ): React.JSX.Element => {
    return (
      <TouchableOpacity
        key={product.idItem}
        style={styles.lowStockCard}
        onPress={() => navigation.navigate('AdminItems')}
        activeOpacity={0.8}>
        <View style={styles.lowStockHeader}>
          <View style={styles.lowStockTitleBox}>
            <Text style={styles.lowStockTitle}>
              {product.name ?? `Produkt ${product.idItem}`}
            </Text>

            <Text style={styles.lowStockCode}>
              Kod: {product.code ?? 'brak kodu'}
            </Text>
          </View>

          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockBadgeText}>
              {formatQuantity(product.quantity, product.unitName)}
            </Text>
          </View>
        </View>

        <Text style={styles.lowStockText}>
          Kategoria: {product.categoryName ?? 'Brak kategorii'}
        </Text>

        <Text style={styles.lowStockText}>
          Cena: {formatMoney(product.price)}
        </Text>

        <Text style={styles.lowStockValue}>
          Wartość na stanie: {formatMoney(product.stockValue)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Ładowanie dashboardu...</Text>
      </View>
    );
  }

  if (error || !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Nie udało się pobrać danych Dashboard
        </Text>

        <Text style={styles.errorText}>{error ?? 'Brak danych z API'}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
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

        <Text style={styles.subtitle}>
          Podsumowanie sprzedaży, zamówień, magazynu i produktów.
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.mainSummaryBox}>
          <Text style={styles.summaryLabel}>Wartość zamówień</Text>
          <Text style={styles.summaryValue}>
            {formatMoney(dashboard.ordersTotalValue)}
          </Text>
        </View>

        <View style={styles.mainSummaryBox}>
          <Text style={styles.summaryLabel}>Wartość magazynu</Text>
          <Text style={styles.summaryValue}>
            {formatMoney(dashboard.productsStockValue)}
          </Text>
        </View>
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

      <Text style={styles.sectionTitle}>TOP produkty</Text>

      {dashboard.topProducts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Brak danych</Text>
        </View>
      ) : (
        dashboard.topProducts.map(renderTopProduct)
      )}

      <Text style={styles.sectionTitle}>Sprzedaż według kategorii</Text>

      {dashboard.categorySales.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Brak danych</Text>
        </View>
      ) : (
        dashboard.categorySales.map(renderCategorySale)
      )}

      <Text style={styles.sectionTitle}>Niski stan magazynowy</Text>

      {dashboard.lowStockProducts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Brak produktów z niskim stanem</Text>
        </View>
      ) : (
        dashboard.lowStockProducts.map(renderLowStockProduct)
      )}

      <Text style={styles.sectionTitle}>Najnowsze zamówienia</Text>

      {dashboard.latestOrders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Brak zamówień</Text>
        </View>
      ) : (
        dashboard.latestOrders.map(renderLatestOrder)
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Orders')}
          activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Wszystkie zamówienia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('AdminItems')}
          activeOpacity={0.8}>
          <Text style={styles.secondaryButtonText}>Produkty admin</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  loadingText: {
    color: '#cbd5e1',
    fontSize: 16,
    marginTop: 12,
  },

  errorTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
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

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },

  mainSummaryBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },

  summaryLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 5,
  },

  summaryValue: {
    color: '#f97316',
    fontSize: 19,
    fontWeight: '900',
  },

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 12,
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },

  metricCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },

  metricTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  metricValue: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },

  topProductCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  topProductHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },

  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },

  rankBadgeText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  topProductTitleBox: {
    flex: 1,
  },

  topProductTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
  },

  topProductCode: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },

  topProductText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },

  topProductValue: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 8,
  },

  topProductBarBackground: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 999,
    overflow: 'hidden',
  },

  topProductBarFill: {
    height: 8,
    backgroundColor: '#f97316',
    borderRadius: 999,
  },

  categorySaleCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  categorySaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },

  categorySaleTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
  },

  categorySaleValue: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '900',
  },

  categorySaleText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },

  categoryBarBackground: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 999,
    overflow: 'hidden',
  },

  categoryBarFill: {
    height: 8,
    backgroundColor: '#f97316',
    borderRadius: 999,
  },

  lowStockCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 12,
  },

  lowStockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },

  lowStockTitleBox: {
    flex: 1,
  },

  lowStockTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },

  lowStockCode: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },

  lowStockBadge: {
    backgroundColor: '#f97316',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },

  lowStockBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  lowStockText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },

  lowStockValue: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },

  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },

  orderTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
  },

  orderValue: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '900',
  },

  orderText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: '#f97316',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default DashboardScreen;