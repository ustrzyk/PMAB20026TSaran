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
import type {OrderDto, OrderStatus} from '../types/models.ts';
import {ORDER_STATUSES} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

type SortMode = 'newest' | 'oldest' | 'valueDesc' | 'valueAsc' | 'itemsDesc';
type RecordFilter = 'all' | 'active' | 'inactive';
type OrderStatusFilter = 'all' | OrderStatus;

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

function getOrderStatus(order: OrderDto): OrderStatus {
  const status = order.status?.trim();

  if (status && ORDER_STATUSES.includes(status as OrderStatus)) {
    return status as OrderStatus;
  }

  return 'Nowe';
}

function isOrderInProgress(order: OrderDto): boolean {
  const status = getOrderStatus(order);

  return (
    status === 'Nowe' ||
    status === 'W realizacji' ||
    status === 'Gotowe' ||
    status === 'Wysłane'
  );
}

function OrdersScreen({navigation}: Props): React.JSX.Element {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState<
    number | null
  >(null);

  const [searchText, setSearchText] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [recordFilter, setRecordFilter] = useState<RecordFilter>('active');
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<OrderStatusFilter>('all');

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const filteredOrders = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = orders;

    if (recordFilter === 'active') {
      result = result.filter(order => order.isActive !== false);
    }

    if (recordFilter === 'inactive') {
      result = result.filter(order => order.isActive === false);
    }

    if (orderStatusFilter !== 'all') {
      result = result.filter(order => {
        return getOrderStatus(order) === orderStatusFilter;
      });
    }

    if (search.length > 0) {
      result = result.filter(order => {
        const idOrder = order.idOrder.toString();
        const clientName = order.clientName?.toLowerCase() ?? '';
        const workerName = order.workerName?.toLowerCase() ?? '';
        const notes = order.notes?.toLowerCase() ?? '';
        const status = getOrderStatus(order).toLowerCase();

        return (
          idOrder.includes(search) ||
          clientName.includes(search) ||
          workerName.includes(search) ||
          notes.includes(search) ||
          status.includes(search)
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
      sorted.sort((a, b) => (b.orderItemsCount ?? 0) - (a.orderItemsCount ?? 0));
    }

    return sorted;
  }, [orders, searchText, sortMode, recordFilter, orderStatusFilter]);

  const activeCount = useMemo(() => {
    return orders.filter(order => order.isActive !== false).length;
  }, [orders]);

  const inactiveCount = useMemo(() => {
    return orders.filter(order => order.isActive === false).length;
  }, [orders]);

  const inProgressCount = useMemo(() => {
    return orders.filter(order => order.isActive !== false && isOrderInProgress(order))
      .length;
  }, [orders]);

  const completedCount = useMemo(() => {
    return orders.filter(order => getOrderStatus(order) === 'Zakończone').length;
  }, [orders]);

  const cancelledCount = useMemo(() => {
    return orders.filter(order => getOrderStatus(order) === 'Anulowane').length;
  }, [orders]);

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
      loadOrders();
    }, [loadOrders]),
  );

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadOrders();
  };

  const handleDelete = (order: OrderDto): void => {
    setSelectedOrder(order);

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Usuwanie zamówienia',
      message: `Czy na pewno chcesz oznaczyć zamówienie nr ${order.idOrder} jako nieaktywne?`,
      loading: false,
    });
  };

  const confirmDelete = async (): Promise<void> => {
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
        title: 'Zamówienie oznaczone jako nieaktywne',
        message: 'Zamówienie zostało przeniesione do nieaktywnych.',
        loading: false,
      });
    } catch (err) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Błąd usuwania',
        message: (err as Error).message,
        loading: false,
      });
    }
  };

  const changeOrderStatus = async (
    order: OrderDto,
    newStatus: OrderStatus,
  ): Promise<void> => {
    const currentStatus = getOrderStatus(order);

    if (currentStatus === newStatus) {
      return;
    }

    if (!order.idClient || order.idClient <= 0) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Brak klienta',
        message: 'Nie można zmienić statusu, bo zamówienie nie ma klienta.',
        loading: false,
      });

      return;
    }

    if (!order.idWorker || order.idWorker <= 0) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Brak pracownika',
        message:
          'Nie można zmienić statusu, bo zamówienie nie ma przypisanego pracownika.',
        loading: false,
      });

      return;
    }

    try {
      setUpdatingStatusOrderId(order.idOrder);

      await apiService.updateOrder(order.idOrder, {
        idOrder: order.idOrder,
        dataOrder: order.dataOrder ?? null,
        idClient: order.idClient,
        idWorker: order.idWorker,
        notes: order.notes ?? null,
        deliveryDate: order.deliveryDate ?? null,
        status: newStatus,
        isActive: order.isActive !== false,
      });

      setOrders(previousOrders =>
        previousOrders.map(previousOrder => {
          if (previousOrder.idOrder === order.idOrder) {
            return {
              ...previousOrder,
              status: newStatus,
            };
          }

          return previousOrder;
        }),
      );
    } catch (err) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Błąd zmiany statusu',
        message: (err as Error).message,
        loading: false,
      });
    } finally {
      setUpdatingStatusOrderId(null);
    }
  };

  const handleDialogConfirm = (): void => {
    if (dialog.type === 'confirm') {
      confirmDelete();
      return;
    }

    closeDialog();
  };

  const openOrderItems = (order: OrderDto): void => {
    navigation.navigate('OrderItems', {
      idOrder: order.idOrder,
      orderTitle: `Zamówienie nr ${order.idOrder}`,
    });
  };

  const clearFilters = (): void => {
    setSearchText('');
    setRecordFilter('active');
    setOrderStatusFilter('all');
    setSortMode('newest');
  };

  const renderRecordFilterButton = (
    label: string,
    value: RecordFilter,
  ): React.JSX.Element => {
    const selected = recordFilter === value;

    return (
      <TouchableOpacity
        style={[styles.sortButton, selected && styles.sortButtonSelected]}
        onPress={() => setRecordFilter(value)}
        activeOpacity={0.8}>
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

  const renderOrderStatusFilterButton = (
    label: string,
    value: OrderStatusFilter,
  ): React.JSX.Element => {
    const selected = orderStatusFilter === value;

    return (
      <TouchableOpacity
        style={[
          styles.statusFilterButton,
          selected && styles.statusFilterButtonSelected,
        ]}
        onPress={() => setOrderStatusFilter(value)}
        activeOpacity={0.8}>
        <Text
          style={[
            styles.statusFilterButtonText,
            selected && styles.statusFilterButtonTextSelected,
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
        style={[styles.sortButton, selected && styles.sortButtonSelected]}
        onPress={() => setSortMode(value)}
        activeOpacity={0.8}>
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

  const renderQuickStatusButton = (
    order: OrderDto,
    status: OrderStatus,
  ): React.JSX.Element => {
    const currentStatus = getOrderStatus(order);
    const selected = currentStatus === status;
    const disabled = updatingStatusOrderId === order.idOrder;

    return (
      <TouchableOpacity
        key={status}
        style={[
          styles.quickStatusButton,
          selected && styles.quickStatusButtonSelected,
          disabled && styles.quickStatusButtonDisabled,
        ]}
        onPress={() => changeOrderStatus(order, status)}
        activeOpacity={0.8}
        disabled={selected || disabled}>
        <Text
          style={[
            styles.quickStatusButtonText,
            selected && styles.quickStatusButtonTextSelected,
          ]}>
          {status}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderListHeader = (): React.JSX.Element => {
    return (
      <>
        <View style={styles.heroBox}>
          <Text style={styles.shopName}>3D Print Shop</Text>
          <Text style={styles.heroTitle}>Zamówienia</Text>
          <Text style={styles.heroSubtitle}>
            Obsługa zamówień klientów, statusów realizacji i wartości sprzedaży.
          </Text>
        </View>

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Zamówienia</Text>
            <Text style={styles.subtitle}>
              Wyświetlane: {filteredOrders.length} / {orders.length}
            </Text>
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Odśwież</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Aktywne</Text>
            <Text style={styles.summaryActive}>{activeCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>W toku</Text>
            <Text style={styles.summaryProgress}>{inProgressCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Nieaktywne</Text>
            <Text style={styles.summaryInactive}>{inactiveCount}</Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Zakończone</Text>
            <Text style={styles.summaryCompleted}>{completedCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Anulowane</Text>
            <Text style={styles.summaryCancelled}>{cancelledCount}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateOrder')}
          activeOpacity={0.8}>
          <Text style={styles.createButtonText}>+ Dodaj zamówienie</Text>
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Szukaj po numerze, kliencie, pracowniku, statusie lub notatce..."
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.sortBox}>
          <Text style={styles.sortTitle}>Aktywność rekordu</Text>

          <View style={styles.sortButtons}>
            {renderRecordFilterButton('Wszystkie', 'all')}
            {renderRecordFilterButton('Aktywne', 'active')}
            {renderRecordFilterButton('Nieaktywne', 'inactive')}
          </View>
        </View>

        <View style={styles.sortBox}>
          <Text style={styles.sortTitle}>Status realizacji</Text>

          <View style={styles.sortButtons}>
            {renderOrderStatusFilterButton('Wszystkie', 'all')}
            {ORDER_STATUSES.map(status =>
              renderOrderStatusFilterButton(status, status),
            )}
          </View>
        </View>

        <View style={styles.sortBox}>
          <Text style={styles.sortTitle}>Sortowanie</Text>

          <View style={styles.sortButtons}>
            {renderSortButton('Najnowsze', 'newest')}
            {renderSortButton('Najstarsze', 'oldest')}
            {renderSortButton('Wartość ↓', 'valueDesc')}
            {renderSortButton('Wartość ↑', 'valueAsc')}
            {renderSortButton('Pozycje ↓', 'itemsDesc')}
          </View>
        </View>

        <View style={styles.filterSummaryBox}>
          <Text style={styles.filterSummaryText}>
            Wyszukiwanie:{' '}
            {searchText.trim().length > 0
              ? searchText.trim()
              : 'brak wyszukiwania'}
          </Text>

          <Text style={styles.filterSummaryText}>
            Status realizacji:{' '}
            {orderStatusFilter === 'all' ? 'wszystkie' : orderStatusFilter}
          </Text>

          <TouchableOpacity onPress={clearFilters} activeOpacity={0.8}>
            <Text style={styles.clearFiltersText}>Wyczyść filtry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderItem = ({item}: {item: OrderDto}): React.JSX.Element => {
    const isActive = item.isActive !== false;
    const orderStatus = getOrderStatus(item);
    const hasItems = item.orderItemsCount > 0;
    const isUpdatingThisOrder = updatingStatusOrderId === item.idOrder;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderTopRow}>
          <View style={styles.orderTitleBox}>
            <Text style={styles.orderTitle}>Zamówienie nr {item.idOrder}</Text>
            <Text style={styles.orderDate}>
              Data: {formatDate(item.dataOrder)}
            </Text>
          </View>

          <View style={styles.badgesBox}>
            <Text style={isActive ? styles.activeBadge : styles.inactiveBadge}>
              {isActive ? 'Aktywne' : 'Nieaktywne'}
            </Text>

            <Text style={styles.orderStatusBadge}>{orderStatus}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Status realizacji</Text>
          <Text style={styles.statusValue}>
            {isUpdatingThisOrder ? 'Zapisywanie...' : orderStatus}
          </Text>
        </View>

        <View style={styles.quickStatusSection}>
          <Text style={styles.quickStatusTitle}>Szybka zmiana statusu</Text>

          <View style={styles.quickStatusButtons}>
            {ORDER_STATUSES.map(status => renderQuickStatusButton(item, status))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Klient</Text>
          <Text style={styles.infoValue}>
            {item.clientName ?? `ID ${item.idClient ?? '-'}`}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Pracownik</Text>
          <Text style={styles.infoValue}>
            {item.workerName ?? `ID ${item.idWorker ?? '-'}`}
          </Text>
        </View>

        <View style={styles.rowBox}>
          <View style={styles.smallInfoBox}>
            <Text style={styles.infoLabel}>Dostawa</Text>
            <Text style={styles.infoValue}>{formatDate(item.deliveryDate)}</Text>
          </View>

          <View style={styles.smallInfoBox}>
            <Text style={styles.infoLabel}>Pozycje</Text>
            <Text style={styles.infoValue}>{item.orderItemsCount}</Text>
          </View>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Wartość produktów</Text>
          <Text style={styles.totalValue}>{formatMoney(item.totalValue)}</Text>
        </View>

        <View style={styles.itemStateBox}>
          <Text style={styles.itemStateText}>
            {hasItems
              ? 'Zamówienie ma dodane pozycje'
              : 'Zamówienie nie ma jeszcze pozycji'}
          </Text>
        </View>

        {item.notes ? (
          <Text style={styles.orderNotes} numberOfLines={4}>
            {item.notes}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() =>
              navigation.navigate('TrackOrder', {
                idOrder: item.idOrder,
              })
            }
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Podgląd</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.itemsButton}
            onPress={() => openOrderItems(item)}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Pozycje</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditOrder', {order: item})}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Edytuj</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Usuń</Text>
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

        <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
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
        confirmText={dialog.type === 'confirm' ? 'Usuń' : 'OK'}
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
          <Text style={styles.emptyText}>
            {searchText.trim().length > 0 ||
            recordFilter !== 'active' ||
            orderStatusFilter !== 'all'
              ? 'Brak zamówień pasujących do filtrów'
              : 'Brak aktywnych zamówień w API'}
          </Text>
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

  listContent: {
    paddingBottom: 30,
  },

  heroBox: {
    backgroundColor: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },

  shopName: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  heroTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
  },

  heroSubtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  header: {
    padding: 16,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },

  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },

  refreshButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },

  refreshButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  summaryBox: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
  },

  summaryColumn: {
    flex: 1,
  },

  summaryLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  summaryActive: {
    color: '#16a34a',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryProgress: {
    color: '#f97316',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryInactive: {
    color: '#ef4444',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryCompleted: {
    color: '#38bdf8',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryCancelled: {
    color: '#fca5a5',
    fontSize: 22,
    fontWeight: '900',
  },

  createButton: {
    backgroundColor: '#16a34a',
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  createButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#0f172a',
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

  sortBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  sortTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },

  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  sortButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },

  sortButtonTextSelected: {
    color: '#ffffff',
  },

  statusFilterButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  statusFilterButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  statusFilterButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },

  statusFilterButtonTextSelected: {
    color: '#ffffff',
  },

  filterSummaryBox: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 12,
  },

  filterSummaryText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },

  clearFiltersText: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '900',
  },

  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
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
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },

  orderDate: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
  },

  badgesBox: {
    alignItems: 'flex-end',
    gap: 6,
  },

  activeBadge: {
    backgroundColor: '#052e16',
    color: '#bbf7d0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  inactiveBadge: {
    backgroundColor: '#7f1d1d',
    color: '#fecaca',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  orderStatusBadge: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  infoBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },

  quickStatusSection: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },

  quickStatusTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },

  quickStatusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  quickStatusButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  quickStatusButtonSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  quickStatusButtonDisabled: {
    opacity: 0.65,
  },

  quickStatusButtonText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '900',
  },

  quickStatusButtonTextSelected: {
    color: '#ffffff',
  },

  rowBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },

  smallInfoBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
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

  statusValue: {
    color: '#f97316',
    fontSize: 15,
    fontWeight: '900',
  },

  totalBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 10,
    marginTop: 2,
    marginBottom: 8,
  },

  totalLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  totalValue: {
    color: '#f97316',
    fontSize: 20,
    fontWeight: '900',
  },

  itemStateBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },

  itemStateText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },

  orderNotes: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  previewButton: {
    flex: 1,
    backgroundColor: '#38bdf8',
    paddingVertical: 10,
    borderRadius: 10,
  },

  itemsButton: {
    flex: 1,
    backgroundColor: '#9333ea',
    paddingVertical: 10,
    borderRadius: 10,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 10,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#7f1d1d',
    paddingVertical: 10,
    borderRadius: 10,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    marginHorizontal: 16,
    fontSize: 16,
  },
});

export default OrdersScreen;