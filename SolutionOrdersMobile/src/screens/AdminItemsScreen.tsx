import React, {useMemo, useState} from 'react';
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

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import AppDialog, {AppDialogType} from '../components/AppDialog.tsx';
import {useItems} from '../context/ItemsContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';
import type {Item} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminItems'>;

type SortMode =
  | 'default'
  | 'name'
  | 'priceAsc'
  | 'priceDesc'
  | 'quantityAsc'
  | 'quantityDesc'
  | 'stockValueDesc'
  | 'lowStockFirst';

type StatusFilter = 'all' | 'active' | 'inactive';
type StockFilter = 'all' | 'available' | 'empty' | 'low' | 'good';
type PriceFilter = 'all' | 'to50' | 'from50to200' | 'from200';

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

function getStockValue(item: Item): number {
  return (item.price ?? 0) * (item.quantity ?? 0);
}

function isLowStock(item: Item): boolean {
  const quantity = item.quantity ?? 0;

  return item.isActive !== false && quantity > 0 && quantity <= 5;
}

function isGoodStock(item: Item): boolean {
  const quantity = item.quantity ?? 0;

  return item.isActive !== false && quantity > 5;
}

function getStockLabel(item: Item): string {
  const quantity = item.quantity ?? 0;

  if (item.isActive === false) {
    return 'Nieaktywny';
  }

  if (quantity <= 0) {
    return 'Brak na stanie';
  }

  if (quantity <= 5) {
    return 'Niski stan';
  }

  return 'Stan OK';
}

function getCategoryIcon(categoryName?: string | null): string {
  const name = categoryName?.toLowerCase() ?? '';

  if (name.includes('druk')) {
    return '🖨️';
  }

  if (
    name.includes('filament') ||
    name.includes('pla') ||
    name.includes('petg')
  ) {
    return '🧵';
  }

  if (
    name.includes('akces') ||
    name.includes('czę') ||
    name.includes('czes')
  ) {
    return '⚙️';
  }

  if (name.includes('serwis') || name.includes('narz')) {
    return '🧰';
  }

  return '🏷️';
}

function AdminItemsScreen({navigation}: Props): React.JSX.Element {
  const {items, loading, error, refreshItems, deleteItem} = useItems();

  const [searchText, setSearchText] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const categories = useMemo(() => {
    return items
      .map(item => item.categoryName ?? 'Brak kategorii')
      .filter((categoryName, index, array) => {
        return array.indexOf(categoryName) === index;
      })
      .sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filteredItems = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = items;

    if (selectedCategory !== 'all') {
      result = result.filter(item => {
        const categoryName = item.categoryName ?? 'Brak kategorii';

        return categoryName === selectedCategory;
      });
    }

    if (statusFilter === 'active') {
      result = result.filter(item => item.isActive !== false);
    }

    if (statusFilter === 'inactive') {
      result = result.filter(item => item.isActive === false);
    }

    if (stockFilter === 'available') {
      result = result.filter(item => (item.quantity ?? 0) > 0);
    }

    if (stockFilter === 'empty') {
      result = result.filter(item => (item.quantity ?? 0) <= 0);
    }

    if (stockFilter === 'low') {
      result = result.filter(item => isLowStock(item));
    }

    if (stockFilter === 'good') {
      result = result.filter(item => isGoodStock(item));
    }

    if (priceFilter === 'to50') {
      result = result.filter(item => (item.price ?? 0) <= 50);
    }

    if (priceFilter === 'from50to200') {
      result = result.filter(item => {
        const price = item.price ?? 0;

        return price > 50 && price <= 200;
      });
    }

    if (priceFilter === 'from200') {
      result = result.filter(item => (item.price ?? 0) > 200);
    }

    if (search.length > 0) {
      result = result.filter(item => {
        const name = item.name?.toLowerCase() ?? '';
        const description = item.description?.toLowerCase() ?? '';
        const code = item.code?.toLowerCase() ?? '';
        const categoryName = item.categoryName?.toLowerCase() ?? '';
        const unitName = item.unitName?.toLowerCase() ?? '';

        return (
          name.includes(search) ||
          description.includes(search) ||
          code.includes(search) ||
          categoryName.includes(search) ||
          unitName.includes(search)
        );
      });
    }

    const sorted = [...result];

    if (sortMode === 'name') {
      sorted.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    }

    if (sortMode === 'priceAsc') {
      sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    }

    if (sortMode === 'priceDesc') {
      sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    if (sortMode === 'quantityAsc') {
      sorted.sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
    }

    if (sortMode === 'quantityDesc') {
      sorted.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
    }

    if (sortMode === 'stockValueDesc') {
      sorted.sort((a, b) => getStockValue(b) - getStockValue(a));
    }

    if (sortMode === 'lowStockFirst') {
      sorted.sort((a, b) => {
        const aQuantity = a.quantity ?? 0;
        const bQuantity = b.quantity ?? 0;

        return aQuantity - bQuantity;
      });
    }

    return sorted;
  }, [
    items,
    priceFilter,
    searchText,
    selectedCategory,
    sortMode,
    statusFilter,
    stockFilter,
  ]);

  const activeCount = useMemo(() => {
    return items.filter(item => item.isActive !== false).length;
  }, [items]);

  const inactiveCount = useMemo(() => {
    return items.filter(item => item.isActive === false).length;
  }, [items]);

  const availableCount = useMemo(() => {
    return items.filter(item => item.isActive !== false && (item.quantity ?? 0) > 0)
      .length;
  }, [items]);

  const emptyCount = useMemo(() => {
    return items.filter(item => item.isActive !== false && (item.quantity ?? 0) <= 0)
      .length;
  }, [items]);

  const lowStockCount = useMemo(() => {
    return items.filter(item => isLowStock(item)).length;
  }, [items]);

  const totalStockValue = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.isActive === false) {
        return sum;
      }

      return sum + getStockValue(item);
    }, 0);
  }, [items]);

  const visibleStockValue = useMemo(() => {
    return filteredItems.reduce((sum, item) => {
      return sum + getStockValue(item);
    }, 0);
  }, [filteredItems]);

  const visibleQuantity = useMemo(() => {
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

  const handleDelete = (item: Item): void => {
    setSelectedItem(item);

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Usuwanie produktu',
      message:
        `Czy na pewno chcesz usunąć produkt "${item.name ?? 'produkt'}"?\n\n` +
        'Po usunięciu produkt nie będzie dostępny na liście.',
      loading: false,
    });
  };

  const confirmDelete = async (): Promise<void> => {
    if (!selectedItem) {
      return;
    }

    try {
      setDialog(previous => ({
        ...previous,
        loading: true,
      }));

      await deleteItem(selectedItem.idItem);

      setSelectedItem(null);

      setDialog({
        visible: true,
        type: 'success',
        title: 'Produkt usunięty',
        message: 'Produkt został usunięty z listy administracyjnej.',
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

  const clearFilters = (): void => {
    setSearchText('');
    setSelectedCategory('all');
    setStatusFilter('all');
    setStockFilter('all');
    setPriceFilter('all');
    setSortMode('default');
  };

  const renderCategoryButton = (categoryName: string): React.JSX.Element => {
    const isSelected = selectedCategory === categoryName;

    return (
      <TouchableOpacity
        key={`admin-category-${categoryName}`}
        style={[
          styles.categoryButton,
          isSelected && styles.categoryButtonSelected,
        ]}
        onPress={() => setSelectedCategory(categoryName)}
        activeOpacity={0.85}>
        <Text style={styles.categoryButtonIcon}>
          {categoryName === 'all' ? '🏷️' : getCategoryIcon(categoryName)}
        </Text>

        <Text
          style={[
            styles.categoryButtonText,
            isSelected && styles.categoryButtonTextSelected,
          ]}
          numberOfLines={1}>
          {categoryName === 'all' ? 'Wszystkie' : categoryName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderStatusButton = (
    label: string,
    value: StatusFilter,
  ): React.JSX.Element => {
    const isSelected = statusFilter === value;

    return (
      <TouchableOpacity
        key={`admin-status-${value}`}
        style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
        onPress={() => setStatusFilter(value)}
        activeOpacity={0.85}>
        <Text
          style={[
            styles.filterButtonText,
            isSelected && styles.filterButtonTextSelected,
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderStockButton = (
    label: string,
    value: StockFilter,
  ): React.JSX.Element => {
    const isSelected = stockFilter === value;

    return (
      <TouchableOpacity
        key={`admin-stock-${value}`}
        style={[
          styles.stockFilterButton,
          isSelected && styles.stockFilterButtonSelected,
        ]}
        onPress={() => setStockFilter(value)}
        activeOpacity={0.85}>
        <Text
          style={[
            styles.stockFilterButtonText,
            isSelected && styles.stockFilterButtonTextSelected,
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPriceButton = (
    label: string,
    value: PriceFilter,
  ): React.JSX.Element => {
    const isSelected = priceFilter === value;

    return (
      <TouchableOpacity
        key={`admin-price-${value}`}
        style={[styles.priceButton, isSelected && styles.priceButtonSelected]}
        onPress={() => setPriceFilter(value)}
        activeOpacity={0.85}>
        <Text
          style={[
            styles.priceButtonText,
            isSelected && styles.priceButtonTextSelected,
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
    const isSelected = sortMode === value;

    return (
      <TouchableOpacity
        key={`admin-sort-${value}`}
        style={[styles.sortButton, isSelected && styles.sortButtonSelected]}
        onPress={() => setSortMode(value)}
        activeOpacity={0.85}>
        <Text
          style={[
            styles.sortButtonText,
            isSelected && styles.sortButtonTextSelected,
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
          <Text style={styles.heroTitle}>Produkty - administracja</Text>

          <Text style={styles.heroSubtitle}>
            Zarządzanie asortymentem, cenami, stanami magazynowymi i
            aktywnością produktów.
          </Text>
        </View>

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Produkty w bazie</Text>

            <Text style={styles.subtitle}>
              Wyświetlane: {filteredItems.length} / {items.length}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshItems}
            activeOpacity={0.85}>
            <Text style={styles.refreshButtonText}>Odśwież</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Aktywne</Text>
            <Text style={styles.summaryActive}>{activeCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Nieaktywne</Text>
            <Text style={styles.summaryInactive}>{inactiveCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Dostępne</Text>
            <Text style={styles.summaryAvailable}>{availableCount}</Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Niski stan</Text>
            <Text style={styles.summaryWarning}>{lowStockCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Brak stanu</Text>
            <Text style={styles.summaryDanger}>{emptyCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Widoczne szt.</Text>
            <Text style={styles.summaryQuantity}>{visibleQuantity}</Text>
          </View>
        </View>

        <View style={styles.valueBox}>
          <View style={styles.valueColumn}>
            <Text style={styles.valueLabel}>Wartość widocznych produktów</Text>
            <Text style={styles.valueText}>{formatMoney(visibleStockValue)}</Text>
          </View>

          <View style={styles.valueColumn}>
            <Text style={styles.valueLabel}>Wartość aktywnego magazynu</Text>
            <Text style={styles.valueText}>{formatMoney(totalStockValue)}</Text>
          </View>
        </View>

        <View style={styles.actionsTopRow}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateItem')}
            activeOpacity={0.85}>
            <Text style={styles.createButtonText}>+ Dodaj produkt</Text>
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
            placeholder="Szukaj produktu, kodu, opisu, kategorii lub jednostki..."
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Kategorie</Text>

          <View style={styles.filterButtons}>
            {renderCategoryButton('all')}
            {categories.map(renderCategoryButton)}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Aktywność</Text>

          <View style={styles.filterButtons}>
            {renderStatusButton('Wszystkie', 'all')}
            {renderStatusButton('Aktywne', 'active')}
            {renderStatusButton('Nieaktywne', 'inactive')}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Stan magazynu</Text>

          <View style={styles.filterButtons}>
            {renderStockButton('Wszystkie', 'all')}
            {renderStockButton('Dostępne', 'available')}
            {renderStockButton('Stan OK', 'good')}
            {renderStockButton('Niski stan', 'low')}
            {renderStockButton('Brak stanu', 'empty')}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Cena</Text>

          <View style={styles.filterButtons}>
            {renderPriceButton('Wszystkie', 'all')}
            {renderPriceButton('do 50 zł', 'to50')}
            {renderPriceButton('50-200 zł', 'from50to200')}
            {renderPriceButton('powyżej 200 zł', 'from200')}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Sortowanie</Text>

          <View style={styles.filterButtons}>
            {renderSortButton('Domyślnie', 'default')}
            {renderSortButton('Nazwa', 'name')}
            {renderSortButton('Cena ↑', 'priceAsc')}
            {renderSortButton('Cena ↓', 'priceDesc')}
            {renderSortButton('Stan ↑', 'quantityAsc')}
            {renderSortButton('Stan ↓', 'quantityDesc')}
            {renderSortButton('Niski stan', 'lowStockFirst')}
            {renderSortButton('Wartość ↓', 'stockValueDesc')}
          </View>
        </View>

        <View style={styles.filterSummaryBox}>
          <Text style={styles.filterSummaryText}>
            Kategoria:{' '}
            {selectedCategory === 'all' ? 'wszystkie' : selectedCategory}
          </Text>

          <Text style={styles.filterSummaryText}>
            Aktywność: {statusFilter} | Stan: {stockFilter} | Cena:{' '}
            {priceFilter}
          </Text>

          <Text style={styles.filterSummaryText}>
            Sortowanie: {sortMode}
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
      </>
    );
  };

  const renderItem = ({item}: {item: Item}): React.JSX.Element => {
    const price = item.price ?? 0;
    const quantity = item.quantity ?? 0;
    const stockValue = getStockValue(item);
    const stockLabel = getStockLabel(item);
    const lowStock = isLowStock(item);

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemTopRow}>
          <View style={styles.itemIconBox}>
            <Text style={styles.itemIcon}>{getCategoryIcon(item.categoryName)}</Text>
          </View>

          <View style={styles.itemContent}>
            <Text style={styles.itemName}>{item.name ?? 'Brak nazwy'}</Text>

            <Text style={styles.itemDescription} numberOfLines={3}>
              {item.description ?? 'Brak opisu produktu'}
            </Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <Text style={styles.categoryBadge}>
            {item.categoryName ?? 'Brak kategorii'}
          </Text>

          <Text style={styles.codeBadge}>{item.code ?? 'Brak kodu'}</Text>

          <Text style={item.isActive !== false ? styles.activeBadge : styles.inactiveBadge}>
            {item.isActive !== false ? 'Aktywny' : 'Nieaktywny'}
          </Text>

          <Text
            style={
              quantity <= 0
                ? styles.emptyBadge
                : lowStock
                  ? styles.lowStockBadge
                  : styles.goodStockBadge
            }>
            {stockLabel}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Cena</Text>
            <Text style={styles.priceValue}>{formatMoney(price)}</Text>
          </View>

          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Stan</Text>
            <Text style={styles.infoValue}>
              {quantity} {item.unitName ?? 'szt'}
            </Text>
          </View>

          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Wartość</Text>
            <Text style={styles.infoValue}>{formatMoney(stockValue)}</Text>
          </View>
        </View>

        {lowStock ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Niski stan magazynowy</Text>
            <Text style={styles.warningText}>
              Ten produkt ma tylko {quantity} {item.unitName ?? 'szt'} na stanie.
              Warto rozważyć uzupełnienie magazynu.
            </Text>
          </View>
        ) : null}

        {quantity <= 0 && item.isActive !== false ? (
          <View style={styles.dangerBox}>
            <Text style={styles.dangerTitle}>Brak produktu na stanie</Text>
            <Text style={styles.dangerText}>
              Produkt jest aktywny, ale nie ma ilości magazynowej. Klient nie
              powinien móc go zamówić.
            </Text>
          </View>
        ) : null}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditItem', {item})}
            activeOpacity={0.85}>
            <Text style={styles.buttonText}>Edytuj</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => navigation.navigate('ItemDetails', {item})}
            activeOpacity={0.85}>
            <Text style={styles.buttonText}>Podgląd</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
            activeOpacity={0.85}>
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
        <Text style={styles.loadingText}>Ładowanie produktów...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Nie udało się pobrać produktów</Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={refreshItems}
          activeOpacity={0.85}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backPanelButton}
          onPress={() => navigation.navigate('AdminPanel')}
          activeOpacity={0.85}>
          <Text style={styles.backPanelButtonText}>Panel pracownika</Text>
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
        keyExtractor={item => item.idItem.toString()}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshItems} />
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Brak produktów</Text>

            <Text style={styles.emptyText}>
              {searchText.trim().length > 0 ||
              selectedCategory !== 'all' ||
              statusFilter !== 'all' ||
              stockFilter !== 'all' ||
              priceFilter !== 'all'
                ? 'Brak produktów pasujących do aktualnych filtrów.'
                : 'Brak produktów w bazie API.'}
            </Text>

            <TouchableOpacity
              style={styles.clearEmptyButton}
              onPress={clearFilters}
              activeOpacity={0.85}>
              <Text style={styles.clearEmptyButtonText}>Wyczyść filtry</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerBox}>
            <TouchableOpacity
              style={styles.footerCreateButton}
              onPress={() => navigation.navigate('CreateItem')}
              activeOpacity={0.85}>
              <Text style={styles.footerCreateButtonText}>Dodaj produkt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerPanelButton}
              onPress={() => navigation.navigate('AdminPanel')}
              activeOpacity={0.85}>
              <Text style={styles.footerPanelButtonText}>Panel pracownika</Text>
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
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 10,
  },

  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  backPanelButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
  },

  backPanelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
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
    fontSize: 24,
    fontWeight: '900',
  },

  heroSubtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    fontWeight: '700',
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
    fontSize: 23,
    fontWeight: '900',
  },

  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },

  refreshButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },

  refreshButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  summaryBox: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 13,
    borderRadius: 14,
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

  summaryActive: {
    color: '#16a34a',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryInactive: {
    color: '#ef4444',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryAvailable: {
    color: '#38bdf8',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryWarning: {
    color: '#f97316',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryDanger: {
    color: '#ef4444',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryQuantity: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
  },

  valueBox: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#16a34a',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 13,
    borderRadius: 14,
    gap: 10,
  },

  valueColumn: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  valueLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },

  valueText: {
    color: '#16a34a',
    fontSize: 20,
    fontWeight: '900',
  },

  actionsTopRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
  },

  createButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 12,
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
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  dashboardButtonText: {
    color: '#ffffff',
    fontSize: 14,
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

  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
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

  categoryButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
  },

  categoryButtonSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },

  categoryButtonIcon: {
    fontSize: 13,
  },

  categoryButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
    maxWidth: 165,
  },

  categoryButtonTextSelected: {
    color: '#ffffff',
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

  stockFilterButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  stockFilterButtonSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },

  stockFilterButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },

  stockFilterButtonTextSelected: {
    color: '#ffffff',
  },

  priceButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  priceButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  priceButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },

  priceButtonTextSelected: {
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
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
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

  itemCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  itemTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },

  itemIconBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemIcon: {
    fontSize: 30,
  },

  itemContent: {
    flex: 1,
  },

  itemName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },

  itemDescription: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },

  categoryBadge: {
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
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

  goodStockBadge: {
    backgroundColor: '#052e16',
    color: '#bbf7d0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  lowStockBadge: {
    backgroundColor: '#431407',
    color: '#fed7aa',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  emptyBadge: {
    backgroundColor: '#7f1d1d',
    color: '#fecaca',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },

  infoCell: {
    flex: 1,
    minWidth: '30%',
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
    fontSize: 13,
    fontWeight: '900',
  },

  priceValue: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: '900',
  },

  warningBox: {
    backgroundColor: '#431407',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 10,
  },

  warningTitle: {
    color: '#fed7aa',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },

  warningText: {
    color: '#fed7aa',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  dangerBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 10,
  },

  dangerTitle: {
    color: '#fecaca',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },

  dangerText: {
    color: '#fecaca',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  previewButton: {
    flex: 1,
    backgroundColor: '#38bdf8',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#7f1d1d',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginHorizontal: 16,
    marginTop: 20,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 8,
  },

  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },

  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },

  clearEmptyButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  clearEmptyButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  footerBox: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },

  footerCreateButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  footerCreateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  footerPanelButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  footerPanelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default AdminItemsScreen;