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

import type {RootStackParamList} from '../navigation/types.ts';
import type {OrderDto} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

type SortMode = 'newest' | 'oldest' | 'valueDesc' | 'valueAsc' | 'itemsDesc';
type ViewFilter = 'current' | 'all' | 'archived';

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return 'Brak daty';
  }

  return value.substring(0, 10);
}

function formatMoney(value?: number | null): string {
  const safeValue = value ?? 0;

  return `${safeValue.toFixed(2)} zł`;
}

function getDateTime(value?: string | null): number {
  if (!value) {
    return 0;
  }

  return new Date(value).getTime();
}

function OrdersScreen({navigation}: Props): React.JSX.Element {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

  const [searchText, setSearchText] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('current');

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const currentOrders = useMemo(() => {
    return orders.filter(order => order.isActive !== false);
  }, [orders]);

  const archivedOrders = useMemo(() => {
    return orders.filter(order => order.isActive === false);
  }, [orders]);

  const totalOrdersValue = useMemo(() => {
    return currentOrders.reduce((sum, order) => {
      return sum + (order.totalValue ?? 0);
    }, 0);
  }, [currentOrders]);

  const todayOrdersCount = useMemo(() => {
    const today = new Date().toISOString().substring(0, 10);

    return currentOrders.filter(order => {
      return formatDate(order.dataOrder) === today;
    }).length;
  }, [currentOrders]);

  const filteredOrders = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = orders;

    if (viewFilter === 'current') {
      result = result.filter(order => order.isActive !== false);
    }

    if (viewFilter === 'archived') {
      result = result.filter(order => order.isActive === false);
    }

    if (search.length > 0) {
      result = result.filter(order => {
        const idOrder = order.idOrder.toString();
        const clientName = order.clientName?.toLowerCase() ?? '';
        const workerName = order.workerName?.toLowerCase() ?? '';
        const notes = order.notes?.toLowerCase() ?? '';
        const date = order.dataOrder?.toLowerCase() ?? '';
        const deliveryDate = order.deliveryDate?.toLowerCase() ?? '';

        return (
          idOrder.includes(search) ||
          clientName.includes(search) ||
          workerName.includes(search) ||
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

    if (sortMode === 'itemsDesc') {
      sorted.sort((a, b) => {
        return (b.orderItemsCount ?? 0) - (a.orderItemsCount ?? 0);
      });
    }

    return sorted;
  }, [orders, searchText, sortMode, viewFilter]);

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

  const loadOrders = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      const data = await apiService.getOrders();

      setOrders(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nie udało się pobrać zamówień';

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

  const handleArchive = (order: OrderDto): void => {
    setSelectedOrder(order);

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Archiwum',
      message: `Przenieść zamówienie #${order.idOrder} do archiwum?`,
      loading: false,
    });
  };

  const confirmArchive = async (): Promise<void> => {
    if (!selectedOrder) {
      return;
    }

    try {
      setDialog(previous => ({
        ...previous,
        loading: true,
      }));

      await apiService.deleteOrder(selectedOrder.idOrder);

      setOrders(previousOrders =>
        previousOrders.map(order => {
          if (order.idOrder === selectedOrder.idOrder) {
            return {
              ...order,
              isActive: false,
            };
          }

          return order;
        }),
      );

      setSelectedOrder(null);

      setDialog({
        visible: true,
        type: 'success',
        title: 'Zapisano',
        message: 'Zamówienie trafiło do archiwum.',
        loading: false,
      });
    } catch (err) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Błąd',
        message: (err as Error).message,
        loading: false,
      });
    }
  };

  const handleDialogConfirm = (): void => {
    if (dialog.type === 'confirm') {
      confirmArchive();
      return;
    }

    closeDialog();
  };

  const openOrderItems = (order: OrderDto): void => {
    navigation.navigate('OrderItems', {
      idOrder: order.idOrder,
      orderTitle: `Zamówienie #${order.idOrder}`,
    });
  };

  const openOrderPrint = (order: OrderDto): void => {
    navigation.navigate('OrderPrint', {
      idOrder: order.idOrder,
    });
  };

  const clearFilters = (): void => {
    setSearchText('');
    setViewFilter('current');
    setSortMode('newest');
  };

  const renderViewButton = (
    label: string,
    value: ViewFilter,
  ): React.JSX.Element => {
    const selected = viewFilter === value;

    return (
      <TouchableOpacity
        key={`view-${value}`}
        style={[styles.filterButton, selected && styles.filterButtonSelected]}
        onPress={() => setViewFilter(value)}
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
    value: SortMode,
  ): React.JSX.Element => {
    const selected = sortMode === value;

    return (
      <TouchableOpacity
        key={`sort-${value}`}
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

  const renderListHeader = (): React.JSX.Element => {
    return (
      <>
        <View style={styles.heroBox}>
          <Text style={styles.appName}>3D Print Shop</Text>
          <Text style={styles.heroTitle}>Zamówienia</Text>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Bieżące</Text>
            <Text style={styles.summaryCurrent}>{currentOrders.length}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Dzisiaj</Text>
            <Text style={styles.summaryToday}>{todayOrdersCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Archiwum</Text>
            <Text style={styles.summaryArchived}>{archivedOrders.length}</Text>
          </View>
        </View>

        <View style={styles.valueBox}>
          <Text style={styles.valueLabel}>Wartość</Text>
          <Text style={styles.valueText}>{formatMoney(totalOrdersValue)}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateOrder')}
            activeOpacity={0.85}>
            <Text style={styles.createButtonText}>+ Dodaj</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashboardButton}
            onPress={() => navigation.navigate('Dashboard')}
            activeOpacity={0.85}>
            <Text style={styles.dashboardButtonText}>Dashboard</Text>
          </TouchableOpacity>
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
          <Text style={styles.filterTitle}>Widok</Text>

          <View style={styles.filterButtons}>
            {renderViewButton('Bieżące', 'current')}
            {renderViewButton('Wszystkie', 'all')}
            {renderViewButton('Archiwum', 'archived')}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Sortowanie</Text>

          <View style={styles.filterButtons}>
            {renderSortButton('Najnowsze', 'newest')}
            {renderSortButton('Najstarsze', 'oldest')}
            {renderSortButton('Wartość ↓', 'valueDesc')}
            {renderSortButton('Wartość ↑', 'valueAsc')}
            {renderSortButton('Pozycje ↓', 'itemsDesc')}
          </View>
        </View>

        <View style={styles.filterSummaryBox}>
          <Text style={styles.filterSummaryText}>
            Wyświetlane: {filteredOrders.length} / {orders.length}
          </Text>

          <Text style={styles.filterSummaryText}>
            Wartość: {formatMoney(visibleOrdersValue)}
          </Text>

          {(searchText.trim().length > 0 ||
            viewFilter !== 'current' ||
            sortMode !== 'newest') && (
            <TouchableOpacity onPress={clearFilters} activeOpacity={0.85}>
              <Text style={styles.clearFiltersText}>Wyczyść filtry</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.85}>
          <Text style={styles.refreshButtonText}>Odśwież</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderItem = ({item}: {item: OrderDto}): React.JSX.Element => {
    const isCurrent = item.isActive !== false;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderTopRow}>
          <View style={styles.orderTitleBox}>
            <Text style={styles.orderTitle}>Zamówienie #{item.idOrder}</Text>

            <Text style={styles.orderDate}>
              {formatDate(item.dataOrder)}
            </Text>
          </View>

          <Text style={isCurrent ? styles.currentBadge : styles.archivedBadge}>
            {isCurrent ? 'Bieżące' : 'Archiwum'}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Klient</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {item.clientName ?? 'Brak danych'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Wartość</Text>
            <Text style={styles.orderValue}>{formatMoney(item.totalValue)}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Dostawa</Text>
            <Text style={styles.infoValue}>{formatDate(item.deliveryDate)}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Pozycje</Text>
            <Text style={styles.infoValue}>{item.orderItemsCount ?? 0}</Text>
          </View>
        </View>

        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Informacje</Text>
            <Text style={styles.notesText} numberOfLines={3}>
              {item.notes}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.primaryCardButton}
            onPress={() => openOrderItems(item)}
            activeOpacity={0.85}>
            <Text style={styles.cardButtonText}>Pozycje</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.printCardButton}
            onPress={() => openOrderPrint(item)}
            activeOpacity={0.85}>
            <Text style={styles.cardButtonText}>Wydruk</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.secondaryCardButton}
            onPress={() => navigation.navigate('EditOrder', {order: item})}
            activeOpacity={0.85}>
            <Text style={styles.cardButtonText}>Edytuj</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.archiveButton,
              !isCurrent && styles.disabledArchiveButton,
            ]}
            onPress={() => handleArchive(item)}
            activeOpacity={0.85}
            disabled={!isCurrent}>
            <Text style={styles.cardButtonText}>Archiwum</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadOrders}
          activeOpacity={0.85}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
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
    <View style={styles.container}>
      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.type === 'confirm' ? 'Przenieś' : 'OK'}
        cancelText="Anuluj"
        loading={dialog.loading}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />

      <FlatList
        data={filteredOrders}
        renderItem={renderItem}
        keyExtractor={item => item.idOrder.toString()}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Brak zamówień</Text>

            <Text style={styles.emptyText}>
              {orders.length === 0
                ? 'Nie ma jeszcze zamówień w systemie.'
                : 'Brak zamówień dla wybranych filtrów.'}
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={
                orders.length === 0
                  ? () => navigation.navigate('CreateOrder')
                  : clearFilters
              }
              activeOpacity={0.85}>
              <Text style={styles.emptyButtonText}>
                {orders.length === 0 ? 'Dodaj zamówienie' : 'Wyczyść filtry'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerBox}>
            <TouchableOpacity
              style={styles.footerPrimaryButton}
              onPress={() => navigation.navigate('CreateOrder')}
              activeOpacity={0.85}>
              <Text style={styles.footerPrimaryButtonText}>Dodaj zamówienie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerSecondaryButton}
              onPress={() => navigation.navigate('AdminPanel')}
              activeOpacity={0.85}>
              <Text style={styles.footerSecondaryButtonText}>Panel obsługi</Text>
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
    lineHeight: 20,
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
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
    paddingVertical: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
  },

  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  listContent: {
    padding: 16,
    paddingBottom: 32,
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

  heroTitle: {
    color: '#f8fafc',
    fontSize: 27,
    fontWeight: '900',
  },

  summaryBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 10,
  },

  summaryColumn: {
    flex: 1,
  },

  summaryLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },

  summaryCurrent: {
    color: '#f97316',
    fontSize: 23,
    fontWeight: '900',
  },

  summaryToday: {
    color: '#38bdf8',
    fontSize: 23,
    fontWeight: '900',
  },

  summaryArchived: {
    color: '#94a3b8',
    fontSize: 23,
    fontWeight: '900',
  },

  valueBox: {
    backgroundColor: '#052e16',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 12,
  },

  valueLabel: {
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },

  valueText: {
    color: '#bbf7d0',
    fontSize: 24,
    fontWeight: '900',
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  createButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  dashboardButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  dashboardButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  searchBox: {
    marginBottom: 12,
  },

  searchInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },

  filterSection: {
    marginBottom: 12,
  },

  filterTitle: {
    color: '#cbd5e1',
    fontSize: 13,
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
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  filterButtonSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  filterButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },

  filterButtonTextSelected: {
    color: '#ffffff',
  },

  sortButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  sortButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  sortButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },

  sortButtonTextSelected: {
    color: '#ffffff',
  },

  filterSummaryBox: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  filterSummaryText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },

  clearFiltersText: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '900',
  },

  refreshButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 4,
  },

  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 12,
  },

  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  orderTitleBox: {
    flex: 1,
  },

  orderTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },

  orderDate: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },

  currentBadge: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  archivedBadge: {
    backgroundColor: '#334155',
    color: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  infoGrid: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 9,
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
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  infoValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
  },

  orderValue: {
    color: '#16a34a',
    fontSize: 16,
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

  notesLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  notesText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },

  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },

  primaryCardButton: {
    flex: 1,
    backgroundColor: '#f97316',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },

  printCardButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },

  secondaryCardButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },

  archiveButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },

  disabledArchiveButton: {
    opacity: 0.5,
  },

  cardButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 14,
    alignItems: 'center',
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
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },

  emptyButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  emptyButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  footerBox: {
    paddingTop: 16,
    gap: 10,
  },

  footerPrimaryButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  footerPrimaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  footerSecondaryButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  footerSecondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default OrdersScreen;