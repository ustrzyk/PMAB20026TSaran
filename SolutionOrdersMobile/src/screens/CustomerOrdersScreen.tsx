import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import apiService from '../api/apiService.ts';
import AppDialog, {AppDialogType} from '../components/AppDialog.tsx';
import {useAuth} from '../context/AuthContext.tsx';
import {useCart} from '../context/CartContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';
import type {Item, OrderDto, OrderItemDto} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerOrders'>;

type OrderStatusFilter = 'all' | 'active' | 'finished' | 'cancelled';
type OrderSortMode = 'newest' | 'oldest' | 'valueDesc' | 'valueAsc';

type OrderWithStatus = OrderDto & {
  status?: string | null;
};

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
}

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

function getDateTime(value?: string | null): number {
  if (!value) {
    return 0;
  }

  return new Date(value).getTime();
}

function getOrderStatus(order: OrderDto): string {
  const status = (order as OrderWithStatus).status?.trim();

  if (!status || status.length === 0) {
    return 'Nowe';
  }

  return status;
}

function isFinishedStatus(status: string): boolean {
  return status === 'Zakończone';
}

function isCancelledStatus(status: string): boolean {
  return status === 'Anulowane';
}

function isActiveStatus(status: string): boolean {
  return !isFinishedStatus(status) && !isCancelledStatus(status);
}

function findProductForOrderItem(
  orderItem: OrderItemDto,
  products: Item[],
): Item | undefined {
  return products.find(product => {
    return (
      product.idItem === orderItem.idItem &&
      product.isActive !== false &&
      (product.quantity ?? 0) > 0
    );
  });
}

function getSafeQuantity(
  orderItem: OrderItemDto,
  product: Item,
): number {
  const orderedQuantity = orderItem.quantity ?? 0;
  const availableQuantity = product.quantity ?? 0;

  return Math.min(orderedQuantity, availableQuantity);
}

function CustomerOrdersScreen({navigation}: Props): React.JSX.Element {
  const {user, isCustomer} = useAuth();
  const {addToCart} = useCart();

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [sortMode, setSortMode] = useState<OrderSortMode>('newest');

  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const totalOrdersValue = useMemo(() => {
    return orders.reduce((sum, order) => {
      return sum + (order.totalValue ?? 0);
    }, 0);
  }, [orders]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter(order => isActiveStatus(getOrderStatus(order))).length;
  }, [orders]);

  const finishedOrdersCount = useMemo(() => {
    return orders.filter(order => isFinishedStatus(getOrderStatus(order))).length;
  }, [orders]);

  const cancelledOrdersCount = useMemo(() => {
    return orders.filter(order => isCancelledStatus(getOrderStatus(order))).length;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = orders;

    if (statusFilter === 'active') {
      result = result.filter(order => isActiveStatus(getOrderStatus(order)));
    }

    if (statusFilter === 'finished') {
      result = result.filter(order => isFinishedStatus(getOrderStatus(order)));
    }

    if (statusFilter === 'cancelled') {
      result = result.filter(order => isCancelledStatus(getOrderStatus(order)));
    }

    if (search.length > 0) {
      result = result.filter(order => {
        const orderNumber = order.idOrder.toString();
        const status = getOrderStatus(order).toLowerCase();
        const notes = order.notes?.toLowerCase() ?? '';
        const date = order.dataOrder?.toLowerCase() ?? '';
        const deliveryDate = order.deliveryDate?.toLowerCase() ?? '';

        return (
          orderNumber.includes(search) ||
          status.includes(search) ||
          notes.includes(search) ||
          date.includes(search) ||
          deliveryDate.includes(search)
        );
      });
    }

    const sorted = [...result];

    if (sortMode === 'newest') {
      sorted.sort((a, b) => getDateTime(b.dataOrder) - getDateTime(a.dataOrder));
    }

    if (sortMode === 'oldest') {
      sorted.sort((a, b) => getDateTime(a.dataOrder) - getDateTime(b.dataOrder));
    }

    if (sortMode === 'valueDesc') {
      sorted.sort((a, b) => (b.totalValue ?? 0) - (a.totalValue ?? 0));
    }

    if (sortMode === 'valueAsc') {
      sorted.sort((a, b) => (a.totalValue ?? 0) - (b.totalValue ?? 0));
    }

    return sorted;
  }, [orders, searchText, sortMode, statusFilter]);

  const visibleOrdersValue = useMemo(() => {
    return filteredOrders.reduce((sum, order) => {
      return sum + (order.totalValue ?? 0);
    }, 0);
  }, [filteredOrders]);

  const closeDialog = (): void => {
    setDialog(previous => ({
      ...previous,
      visible: false,
      loading: false,
    }));
  };

  const showDialog = (
    type: AppDialogType,
    title: string,
    message: string,
  ): void => {
    setDialog({
      visible: true,
      type,
      title,
      message,
      loading: false,
    });
  };

  const loadOrders = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      if (!user?.id) {
        setOrders([]);
        return;
      }

      const data = await apiService.getOrdersByClient(user.id);

      setOrders(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nieznany błąd pobierania danych';

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadOrders();
    }, [loadOrders]),
  );

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadOrders();
  };

  const clearFilters = (): void => {
    setSearchText('');
    setStatusFilter('all');
    setSortMode('newest');
  };

  const openOrderDetails = (order: OrderDto): void => {
    navigation.navigate('TrackOrder', {
      idOrder: order.idOrder,
    });
  };

  const openOrderPrint = (order: OrderDto): void => {
    navigation.navigate('OrderPrint', {
      idOrder: order.idOrder,
    });
  };

  const handleReorderPress = (order: OrderDto): void => {
    setSelectedOrder(order);

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Ponów zamówienie',
      message: `Dodać produkty z zamówienia #${order.idOrder} do koszyka?`,
      loading: false,
    });
  };

  const confirmReorder = async (): Promise<void> => {
    if (!selectedOrder) {
      return;
    }

    try {
      setDialog(previous => ({
        ...previous,
        loading: true,
      }));

      const [orderItems, products] = await Promise.all([
        apiService.getOrderItemsByOrder(selectedOrder.idOrder),
        apiService.getItems(),
      ]);

      let addedProductsCount = 0;

      orderItems.forEach(orderItem => {
        const product = findProductForOrderItem(orderItem, products);

        if (!product) {
          return;
        }

        const quantityToAdd = getSafeQuantity(orderItem, product);

        if (quantityToAdd <= 0) {
          return;
        }

        addToCart(product, quantityToAdd);
        addedProductsCount += 1;
      });

      setSelectedOrder(null);

      if (addedProductsCount === 0) {
        showDialog(
          'error',
          'Koszyk',
          'Nie udało się dodać produktów z tego zamówienia.',
        );
        return;
      }

      showDialog(
        'success',
        'Koszyk',
        `Dodano produkty: ${addedProductsCount}.`,
      );
    } catch (err) {
      showDialog('error', 'Błąd', (err as Error).message);
    }
  };

  const handleDialogConfirm = (): void => {
    if (dialog.type === 'confirm') {
      confirmReorder();
      return;
    }

    closeDialog();
  };

  const renderFilterButton = (
    label: string,
    value: OrderStatusFilter,
  ): React.JSX.Element => {
    const selected = statusFilter === value;

    return (
      <TouchableOpacity
        key={`order-filter-${value}`}
        style={[styles.filterButton, selected && styles.filterButtonSelected]}
        onPress={() => setStatusFilter(value)}
        activeOpacity={0.85}>
        <Text
          style={[
            styles.filterButtonText,
            selected && styles.filterButtonTextSelected,
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSortButton = (
    label: string,
    value: OrderSortMode,
  ): React.JSX.Element => {
    const selected = sortMode === value;

    return (
      <TouchableOpacity
        key={`order-sort-${value}`}
        style={[styles.sortButton, selected && styles.sortButtonSelected]}
        onPress={() => setSortMode(value)}
        activeOpacity={0.85}>
        <Text
          style={[
            styles.sortButtonText,
            selected && styles.sortButtonTextSelected,
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderOrder = ({item}: {item: OrderDto}): React.JSX.Element => {
    const status = getOrderStatus(item);
    const cancelled = isCancelledStatus(status);
    const finished = isFinishedStatus(status);

    return (
      <View style={styles.orderCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleBox}>
            <Text style={styles.orderTitle}>Zamówienie #{item.idOrder}</Text>
            <Text style={styles.orderDate}>{formatDate(item.dataOrder)}</Text>
          </View>

          <Text
            style={
              cancelled
                ? styles.cancelledBadge
                : finished
                  ? styles.finishedBadge
                  : styles.activeBadge
            }>
            {status}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Wartość</Text>
            <Text style={styles.orderValue}>{formatMoney(item.totalValue)}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Pozycje</Text>
            <Text style={styles.infoValue}>{item.orderItemsCount}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Dostawa</Text>
            <Text style={styles.infoValue}>{formatDate(item.deliveryDate)}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.statusValue}>{status}</Text>
          </View>
        </View>

        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.infoLabel}>Informacje</Text>
            <Text style={styles.notesText} numberOfLines={4}>
              {item.notes}
            </Text>
          </View>
        ) : null}

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => openOrderDetails(item)}
            activeOpacity={0.85}>
            <Text style={styles.detailsButtonText}>Szczegóły</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.printButton}
            onPress={() => openOrderPrint(item)}
            activeOpacity={0.85}>
            <Text style={styles.printButtonText}>Wydruk</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.reorderButton}
          onPress={() => handleReorderPress(item)}
          activeOpacity={0.85}>
          <Text style={styles.reorderButtonText}>Ponów zamówienie</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!isCustomer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.lockIcon}>🔒</Text>

        <Text style={styles.accessTitle}>Moje zamówienia</Text>

        <Text style={styles.accessText}>
          Zaloguj się, aby zobaczyć swoją historię zamówień.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: 'AuthLogin'}],
            })
          }
          activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Zaloguj się</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: 'Home'}],
            })
          }
          activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>Wróć do sklepu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Ładowanie zamówień...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Nie udało się pobrać zamówień</Text>
        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={loadOrders}>
          <Text style={styles.primaryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('ClientPanel')}
          activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>Wróć do konta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.type === 'confirm' ? 'Dodaj' : 'OK'}
        cancelText="Anuluj"
        loading={dialog.loading}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />

      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={item => item.idOrder.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.heroBox}>
              <Text style={styles.appName}>3D Print Shop</Text>
              <Text style={styles.title}>Moje zamówienia</Text>
              <Text style={styles.subtitle}>Historia Twoich zamówień.</Text>
            </View>

            <View style={styles.summaryBox}>
              <View style={styles.summaryColumn}>
                <Text style={styles.summaryLabel}>Wszystkie</Text>
                <Text style={styles.summaryValue}>{orders.length}</Text>
              </View>

              <View style={styles.summaryColumn}>
                <Text style={styles.summaryLabel}>Aktywne</Text>
                <Text style={styles.summaryActive}>{activeOrdersCount}</Text>
              </View>

              <View style={styles.summaryColumn}>
                <Text style={styles.summaryLabel}>Zakończone</Text>
                <Text style={styles.summaryFinished}>{finishedOrdersCount}</Text>
              </View>
            </View>

            <View style={styles.summaryBox}>
              <View style={styles.summaryColumn}>
                <Text style={styles.summaryLabel}>Anulowane</Text>
                <Text style={styles.summaryCancelled}>
                  {cancelledOrdersCount}
                </Text>
              </View>

              <View style={styles.summaryColumnWide}>
                <Text style={styles.summaryLabel}>Wartość</Text>
                <Text style={styles.summaryMoney}>
                  {formatMoney(totalOrdersValue)}
                </Text>
              </View>
            </View>

            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Szukaj zamówienia"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Status</Text>

              <View style={styles.filterButtons}>
                {renderFilterButton('Wszystkie', 'all')}
                {renderFilterButton('Aktywne', 'active')}
                {renderFilterButton('Zakończone', 'finished')}
                {renderFilterButton('Anulowane', 'cancelled')}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Sortowanie</Text>

              <View style={styles.filterButtons}>
                {renderSortButton('Najnowsze', 'newest')}
                {renderSortButton('Najstarsze', 'oldest')}
                {renderSortButton('Wartość ↓', 'valueDesc')}
                {renderSortButton('Wartość ↑', 'valueAsc')}
              </View>
            </View>

            <View style={styles.filterSummaryBox}>
              <Text style={styles.filterSummaryText}>
                Wyświetlane: {filteredOrders.length} / {orders.length}
              </Text>

              <Text style={styles.filterSummaryText}>
                Wartość: {formatMoney(visibleOrdersValue)}
              </Text>

              {(searchText.length > 0 ||
                statusFilter !== 'all' ||
                sortMode !== 'newest') && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearFilters}
                  activeOpacity={0.85}>
                  <Text style={styles.clearButtonText}>Wyczyść filtry</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Brak zamówień</Text>
            <Text style={styles.emptyText}>
              Nie znaleziono zamówień dla wybranych filtrów.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Items')}
              activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Przejdź do sklepu</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Items')}
              activeOpacity={0.85}>
              <Text style={styles.shopButtonText}>Produkty</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.accountButton}
              onPress={() => navigation.navigate('ClientPanel')}
              activeOpacity={0.85}>
              <Text style={styles.accountButtonText}>Moje konto</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  listContent: {
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

  lockIcon: {
    fontSize: 46,
    marginBottom: 12,
  },

  accessTitle: {
    color: '#f8fafc',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  accessText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },

  loadingText: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '700',
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

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontWeight: '700',
  },

  summaryBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  summaryColumn: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  summaryColumnWide: {
    flex: 2,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  summaryLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 5,
  },

  summaryValue: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryActive: {
    color: '#f97316',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryFinished: {
    color: '#16a34a',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryCancelled: {
    color: '#ef4444',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryMoney: {
    color: '#16a34a',
    fontSize: 20,
    fontWeight: '900',
  },

  searchBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  searchInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },

  filterSection: {
    marginBottom: 14,
  },

  filterTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
  },

  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filterButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
  },

  filterButtonSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  filterButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '900',
  },

  filterButtonTextSelected: {
    color: '#ffffff',
  },

  sortButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
  },

  sortButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  sortButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '900',
  },

  sortButtonTextSelected: {
    color: '#ffffff',
  },

  filterSummaryBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  filterSummaryText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },

  clearButton: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },

  clearButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  cardTopRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  cardTitleBox: {
    flex: 1,
  },

  orderTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },

  orderDate: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },

  activeBadge: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  finishedBadge: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  cancelledBadge: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
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

  infoLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },

  infoValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
  },

  orderValue: {
    color: '#16a34a',
    fontSize: 15,
    fontWeight: '900',
  },

  statusValue: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '900',
  },

  notesBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
  },

  notesText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },

  orderActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  detailsButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },

  detailsButtonText: {
    color: '#ffffff',
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

  reorderButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  reorderButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    marginTop: 16,
  },

  emptyIcon: {
    fontSize: 44,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },

  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 14,
  },

  footerButtons: {
    gap: 10,
    marginTop: 4,
  },

  shopButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  shopButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  accountButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  accountButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  primaryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 10,
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
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default CustomerOrdersScreen;