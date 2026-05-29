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
import type {OrderItemDto} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderItems'>;

type SortMode = 'default' | 'name' | 'quantityDesc' | 'valueDesc' | 'valueAsc';
type ViewFilter = 'current' | 'all' | 'archived';

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

function OrderItemsScreen({navigation, route}: Props): React.JSX.Element {
  const idOrderFromRoute = route.params?.idOrder;
  const orderTitleFromRoute = route.params?.orderTitle;

  const isOrderFiltered = typeof idOrderFromRoute === 'number';

  const [orderItems, setOrderItems] = useState<OrderItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedOrderItem, setSelectedOrderItem] =
    useState<OrderItemDto | null>(null);

  const [searchText, setSearchText] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('current');

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const currentItems = useMemo(() => {
    return orderItems.filter(item => item.isActive !== false);
  }, [orderItems]);

  const archivedItems = useMemo(() => {
    return orderItems.filter(item => item.isActive === false);
  }, [orderItems]);

  const filteredItems = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = orderItems;

    if (viewFilter === 'current') {
      result = result.filter(item => item.isActive !== false);
    }

    if (viewFilter === 'archived') {
      result = result.filter(item => item.isActive === false);
    }

    if (search.length > 0) {
      result = result.filter(item => {
        const orderNumber = item.idOrder.toString();
        const itemName = item.itemName?.toLowerCase() ?? '';
        const itemCode = item.itemCode?.toLowerCase() ?? '';

        return (
          orderNumber.includes(search) ||
          itemName.includes(search) ||
          itemCode.includes(search)
        );
      });
    }

    const sorted = [...result];

    if (sortMode === 'name') {
      sorted.sort((a, b) =>
        (a.itemName ?? '').localeCompare(b.itemName ?? ''),
      );
    }

    if (sortMode === 'quantityDesc') {
      sorted.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
    }

    if (sortMode === 'valueDesc') {
      sorted.sort((a, b) => (b.lineValue ?? 0) - (a.lineValue ?? 0));
    }

    if (sortMode === 'valueAsc') {
      sorted.sort((a, b) => (a.lineValue ?? 0) - (b.lineValue ?? 0));
    }

    return sorted;
  }, [orderItems, searchText, sortMode, viewFilter]);

  const visibleTotalValue = useMemo(() => {
    return filteredItems.reduce((sum, item) => {
      return sum + (item.lineValue ?? 0);
    }, 0);
  }, [filteredItems]);

  const visibleTotalQuantity = useMemo(() => {
    return filteredItems.reduce((sum, item) => {
      return sum + (item.quantity ?? 0);
    }, 0);
  }, [filteredItems]);

  const currentTotalValue = useMemo(() => {
    return currentItems.reduce((sum, item) => {
      return sum + (item.lineValue ?? 0);
    }, 0);
  }, [currentItems]);

  const closeDialog = (): void => {
    setDialog(previous => ({
      ...previous,
      visible: false,
      loading: false,
    }));
  };

  const loadOrderItems = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      const data =
        isOrderFiltered && idOrderFromRoute
          ? await apiService.getOrderItemsByOrder(idOrderFromRoute)
          : await apiService.getOrderItems();

      setOrderItems(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nie udało się pobrać pozycji';

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [idOrderFromRoute, isOrderFiltered]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadOrderItems();
    }, [loadOrderItems]),
  );

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadOrderItems();
  };

  const handleArchive = (orderItem: OrderItemDto): void => {
    setSelectedOrderItem(orderItem);

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Przenieść do archiwum?',
      message: `Pozycja "${
        orderItem.itemName ?? 'produkt'
      }" zostanie ukryta z bieżącej listy.`,
      loading: false,
    });
  };

  const confirmArchive = async (): Promise<void> => {
    if (!selectedOrderItem) {
      return;
    }

    try {
      setDialog(previous => ({
        ...previous,
        loading: true,
      }));

      await apiService.deleteOrderItem(selectedOrderItem.idOrderItem);

      setOrderItems(previousItems =>
        previousItems.map(item => {
          if (item.idOrderItem === selectedOrderItem.idOrderItem) {
            return {
              ...item,
              isActive: false,
            };
          }

          return item;
        }),
      );

      setSelectedOrderItem(null);

      setDialog({
        visible: true,
        type: 'success',
        title: 'Pozycja przeniesiona',
        message: 'Pozycja trafiła do archiwum.',
        loading: false,
      });
    } catch (err) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Nie udało się wykonać operacji',
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

  const openCreateOrderItem = (): void => {
    if (isOrderFiltered && idOrderFromRoute) {
      navigation.navigate('CreateOrderItem', {
        idOrder: idOrderFromRoute,
      });

      return;
    }

    navigation.navigate('CreateOrderItem');
  };

  const clearFilters = (): void => {
    setSearchText('');
    setViewFilter('current');
    setSortMode('default');
  };

  const screenTitle = isOrderFiltered
    ? orderTitleFromRoute ?? `Zamówienie #${idOrderFromRoute}`
    : 'Pozycje zamówień';

  const screenSubtitle = isOrderFiltered
    ? 'Produkty przypisane do wybranego zamówienia.'
    : 'Produkty przypisane do zamówień klientów.';

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
          <Text style={styles.heroTitle}>{screenTitle}</Text>
          <Text style={styles.heroSubtitle}>{screenSubtitle}</Text>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Bieżące</Text>
            <Text style={styles.summaryCurrent}>{currentItems.length}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Archiwum</Text>
            <Text style={styles.summaryArchived}>{archivedItems.length}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Sztuki</Text>
            <Text style={styles.summaryQuantity}>{visibleTotalQuantity}</Text>
          </View>
        </View>

        <View style={styles.valueBox}>
          <Text style={styles.valueLabel}>Wartość bieżących pozycji</Text>
          <Text style={styles.valueText}>{formatMoney(currentTotalValue)}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={openCreateOrderItem}
            activeOpacity={0.85}>
            <Text style={styles.createButtonText}>+ Dodaj pozycję</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => navigation.navigate('Orders')}
            activeOpacity={0.85}>
            <Text style={styles.ordersButtonText}>Zamówienia</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Szukaj produktu, kodu albo numeru zamówienia..."
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
            {renderSortButton('Domyślnie', 'default')}
            {renderSortButton('Nazwa', 'name')}
            {renderSortButton('Ilość ↓', 'quantityDesc')}
            {renderSortButton('Wartość ↓', 'valueDesc')}
            {renderSortButton('Wartość ↑', 'valueAsc')}
          </View>
        </View>

        <View style={styles.filterSummaryBox}>
          <Text style={styles.filterSummaryText}>
            Wyświetlane: {filteredItems.length} / {orderItems.length}
          </Text>

          <Text style={styles.filterSummaryText}>
            Wartość widocznych: {formatMoney(visibleTotalValue)}
          </Text>

          <Text style={styles.filterSummaryText}>
            Szukaj:{' '}
            {searchText.trim().length > 0
              ? searchText.trim()
              : 'brak wyszukiwania'}
          </Text>

          <TouchableOpacity onPress={clearFilters} activeOpacity={0.85}>
            <Text style={styles.clearFiltersText}>Wyczyść filtry</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.85}>
          <Text style={styles.refreshButtonText}>Odśwież listę</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderItem = ({item}: {item: OrderItemDto}): React.JSX.Element => {
    const isCurrent = item.isActive !== false;
    const quantity = item.quantity ?? 0;
    const unitPrice = item.itemPrice ?? 0;
    const lineValue = item.lineValue ?? quantity * unitPrice;

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemTopRow}>
          <View style={styles.itemTitleBox}>
            <Text style={styles.itemName}>
              {item.itemName ?? `Produkt ID ${item.idItem}`}
            </Text>

            <Text style={styles.itemSubtitle}>
              Zamówienie #{item.idOrder}
            </Text>
          </View>

          <Text style={isCurrent ? styles.currentBadge : styles.archivedBadge}>
            {isCurrent ? 'Bieżące' : 'Archiwum'}
          </Text>
        </View>

        <View style={styles.badgeRow}>
          <Text style={styles.codeBadge}>{item.itemCode ?? 'Brak kodu'}</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Ilość</Text>
            <Text style={styles.infoValue}>{quantity}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Cena</Text>
            <Text style={styles.infoValue}>{formatMoney(unitPrice)}</Text>
          </View>
        </View>

        <View style={styles.lineValueBox}>
          <Text style={styles.lineValueLabel}>Wartość pozycji</Text>
          <Text style={styles.lineValueText}>{formatMoney(lineValue)}</Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditOrderItem', {orderItem: item})}
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
        <Text style={styles.loadingText}>Ładowanie pozycji...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Nie udało się pobrać pozycji</Text>
        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadOrderItems}
          activeOpacity={0.85}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Orders')}
          activeOpacity={0.85}>
          <Text style={styles.backButtonText}>Zamówienia</Text>
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
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.idOrderItem.toString()}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyTitle}>Brak pozycji</Text>

            <Text style={styles.emptyText}>
              {orderItems.length === 0
                ? 'To zamówienie nie ma jeszcze dodanych produktów.'
                : 'Brak pozycji pasujących do filtrów.'}
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={orderItems.length === 0 ? openCreateOrderItem : clearFilters}
              activeOpacity={0.85}>
              <Text style={styles.emptyButtonText}>
                {orderItems.length === 0 ? 'Dodaj pozycję' : 'Wyczyść filtry'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerBox}>
            <TouchableOpacity
              style={styles.footerPrimaryButton}
              onPress={openCreateOrderItem}
              activeOpacity={0.85}>
              <Text style={styles.footerPrimaryButtonText}>Dodaj pozycję</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerSecondaryButton}
              onPress={() => navigation.navigate('Orders')}
              activeOpacity={0.85}>
              <Text style={styles.footerSecondaryButtonText}>Zamówienia</Text>
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

  heroSubtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontWeight: '700',
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

  summaryArchived: {
    color: '#94a3b8',
    fontSize: 23,
    fontWeight: '900',
  },

  summaryQuantity: {
    color: '#38bdf8',
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

  ordersButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  ordersButtonText: {
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

  itemCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 12,
  },

  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  itemTitleBox: {
    flex: 1,
  },

  itemName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },

  itemSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
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

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },

  codeBadge: {
    backgroundColor: '#422006',
    color: '#fed7aa',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
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
    fontSize: 15,
    fontWeight: '900',
  },

  lineValueBox: {
    backgroundColor: '#052e16',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 10,
  },

  lineValueLabel: {
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },

  lineValueText: {
    color: '#bbf7d0',
    fontSize: 18,
    fontWeight: '900',
  },

  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },

  editButton: {
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

export default OrderItemsScreen;