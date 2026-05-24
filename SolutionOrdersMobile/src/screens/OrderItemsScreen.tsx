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

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const filteredItems = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = orderItems;

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
  }, [orderItems, searchText, sortMode]);

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
        err instanceof Error ? err.message : 'Nieznany błąd pobierania danych';

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

  const handleDelete = (orderItem: OrderItemDto): void => {
    setSelectedOrderItem(orderItem);

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Usuwanie pozycji',
      message: `Czy na pewno chcesz usunąć pozycję "${
        orderItem.itemName ?? 'produkt'
      }" z zamówienia nr ${orderItem.idOrder}?`,
      loading: false,
    });
  };

  const confirmDelete = async (): Promise<void> => {
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
        previousItems.filter(
          item => item.idOrderItem !== selectedOrderItem.idOrderItem,
        ),
      );

      setSelectedOrderItem(null);

      setDialog({
        visible: true,
        type: 'success',
        title: 'Pozycja usunięta',
        message: 'Pozycja zamówienia została poprawnie usunięta.',
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

  const handleDialogConfirm = (): void => {
    if (dialog.type === 'confirm') {
      confirmDelete();
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
    setSortMode('default');
  };

  const screenTitle = isOrderFiltered
    ? orderTitleFromRoute ?? `Zamówienie nr ${idOrderFromRoute}`
    : 'Pozycje zamówienia';

  const screenSubtitle = isOrderFiltered
    ? `Produkty w zamówieniu nr ${idOrderFromRoute}`
    : 'Produkty przypisane do zamówień.';

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

  const renderListHeader = (): React.JSX.Element => {
    return (
      <>
        <View style={styles.heroBox}>
          <Text style={styles.shopName}>3D Print Shop</Text>
          <Text style={styles.heroTitle}>{screenTitle}</Text>
          <Text style={styles.heroSubtitle}>{screenSubtitle}</Text>
        </View>

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              {isOrderFiltered ? 'Produkty w zamówieniu' : 'Pozycje'}
            </Text>
            <Text style={styles.subtitle}>
              Wyświetlane: {filteredItems.length} / {orderItems.length}
            </Text>
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Odśwież</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Ilość produktów</Text>
            <Text style={styles.summaryQuantity}>{visibleTotalQuantity}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Wartość</Text>
            <Text style={styles.summaryValue}>
              {formatMoney(visibleTotalValue)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={openCreateOrderItem}
          activeOpacity={0.8}>
          <Text style={styles.createButtonText}>+ Dodaj pozycję</Text>
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Szukaj po produkcie, kodzie albo numerze zamówienia..."
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.sortBox}>
          <Text style={styles.sortTitle}>Sortowanie</Text>

          <View style={styles.sortButtons}>
            {renderSortButton('Domyślnie', 'default')}
            {renderSortButton('Nazwa', 'name')}
            {renderSortButton('Ilość ↓', 'quantityDesc')}
            {renderSortButton('Wartość ↓', 'valueDesc')}
            {renderSortButton('Wartość ↑', 'valueAsc')}
          </View>
        </View>

        <View style={styles.filterSummaryBox}>
          <Text style={styles.filterSummaryText}>
            Filtr:{' '}
            {searchText.trim().length > 0
              ? searchText.trim()
              : 'brak wyszukiwania'}
          </Text>

          <TouchableOpacity onPress={clearFilters} activeOpacity={0.8}>
            <Text style={styles.clearFiltersText}>Wyczyść</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderItem = ({item}: {item: OrderItemDto}): React.JSX.Element => {
    return (
      <View style={styles.orderItemCard}>
        <View style={styles.topRow}>
          <View style={styles.itemTitleBox}>
            <Text style={styles.orderItemTitle}>
              {item.itemName ?? `Produkt ${item.idItem}`}
            </Text>

            <Text style={styles.orderItemCode}>
              Kod: {item.itemCode ?? 'Brak kodu'}
            </Text>
          </View>

          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeText}>Zam. {item.idOrder}</Text>
          </View>
        </View>

        <View style={styles.rowBox}>
          <View style={styles.smallInfoBox}>
            <Text style={styles.infoLabel}>Ilość</Text>
            <Text style={styles.infoValue}>{item.quantity ?? 0}</Text>
          </View>

          <View style={styles.smallInfoBox}>
            <Text style={styles.infoLabel}>Cena</Text>
            <Text style={styles.infoValue}>{formatMoney(item.itemPrice)}</Text>
          </View>
        </View>

        <View style={styles.valueBox}>
          <Text style={styles.valueLabel}>Wartość pozycji</Text>
          <Text style={styles.lineValue}>{formatMoney(item.lineValue)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate('EditOrderItem', {orderItem: item})
            }
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
        <Text style={styles.loadingText}>
          Ładowanie pozycji zamówienia...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Nie udało się pobrać pozycji zamówienia
        </Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadOrderItems}>
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
          <Text style={styles.emptyText}>
            {searchText.trim().length > 0
              ? 'Brak pozycji pasujących do wyszukiwania'
              : isOrderFiltered
                ? 'Brak pozycji dla tego zamówienia'
                : 'Brak pozycji zamówienia w API'}
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

  summaryQuantity: {
    color: '#38bdf8',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryValue: {
    color: '#f97316',
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

  orderItemCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },

  itemTitleBox: {
    flex: 1,
  },

  orderItemTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },

  orderItemCode: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
  },

  orderBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },

  orderBadgeText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '900',
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

  valueBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 10,
  },

  valueLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  lineValue: {
    color: '#f97316',
    fontSize: 19,
    fontWeight: '900',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
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
    fontSize: 13,
    fontWeight: '800',
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

export default OrderItemsScreen;