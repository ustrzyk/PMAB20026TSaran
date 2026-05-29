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

type ViewFilter = 'current' | 'all' | 'archived';
type StockFilter = 'all' | 'available' | 'low' | 'empty';
type SortMode =
  | 'default'
  | 'nameAsc'
  | 'nameDesc'
  | 'priceAsc'
  | 'priceDesc'
  | 'quantityAsc'
  | 'quantityDesc'
  | 'valueDesc';

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

function getStockLabel(item: Item): string {
  const quantity = item.quantity ?? 0;

  if (item.isActive === false) {
    return 'Archiwum';
  }

  if (quantity <= 0) {
    return 'Brak';
  }

  if (quantity <= 5) {
    return 'Niski';
  }

  return 'Dostępny';
}

function getStockBadgeStyle(item: Item) {
  const quantity = item.quantity ?? 0;

  if (item.isActive === false) {
    return styles.archivedBadge;
  }

  if (quantity <= 0) {
    return styles.emptyBadge;
  }

  if (quantity <= 5) {
    return styles.lowBadge;
  }

  return styles.availableBadge;
}

function AdminItemsScreen({navigation}: Props): React.JSX.Element {
  const {items, loading, error, refreshItems, deleteItem} = useItems();

  const [searchText, setSearchText] = useState('');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('current');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const currentItems = useMemo(() => {
    return items.filter(item => item.isActive !== false);
  }, [items]);

  const archivedItems = useMemo(() => {
    return items.filter(item => item.isActive === false);
  }, [items]);

  const availableItems = useMemo(() => {
    return items.filter(item => item.isActive !== false && (item.quantity ?? 0) > 0);
  }, [items]);

  const lowStockItems = useMemo(() => {
    return items.filter(item => isLowStock(item));
  }, [items]);

  const emptyItems = useMemo(() => {
    return items.filter(item => item.isActive !== false && (item.quantity ?? 0) <= 0);
  }, [items]);

  const totalStockValue = useMemo(() => {
    return currentItems.reduce((sum, item) => {
      return sum + getStockValue(item);
    }, 0);
  }, [currentItems]);

  const filteredItems = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = items;

    if (viewFilter === 'current') {
      result = result.filter(item => item.isActive !== false);
    }

    if (viewFilter === 'archived') {
      result = result.filter(item => item.isActive === false);
    }

    if (selectedCategory !== 'all') {
      result = result.filter(item => {
        return (item.categoryName ?? 'Brak kategorii') === selectedCategory;
      });
    }

    if (stockFilter === 'available') {
      result = result.filter(item => item.isActive !== false && (item.quantity ?? 0) > 5);
    }

    if (stockFilter === 'low') {
      result = result.filter(item => isLowStock(item));
    }

    if (stockFilter === 'empty') {
      result = result.filter(item => item.isActive !== false && (item.quantity ?? 0) <= 0);
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

    if (sortMode === 'nameAsc') {
      sorted.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    }

    if (sortMode === 'nameDesc') {
      sorted.sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
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

    if (sortMode === 'valueDesc') {
      sorted.sort((a, b) => getStockValue(b) - getStockValue(a));
    }

    return sorted;
  }, [
    items,
    searchText,
    selectedCategory,
    sortMode,
    stockFilter,
    viewFilter,
  ]);

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

  const handleRefresh = async (): Promise<void> => {
    await refreshItems();
  };

  const handleArchive = (item: Item): void => {
    setSelectedItem(item);

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Przenieść do archiwum?',
      message: `Produkt "${item.name ?? 'produkt'}" zostanie ukryty z bieżącej listy.`,
      loading: false,
    });
  };

  const confirmArchive = async (): Promise<void> => {
    if (!selectedItem) {
      return;
    }

    try {
      setDialog(previous => ({
        ...previous,
        loading: true,
      }));

      await deleteItem(selectedItem.idItem);
      await refreshItems();

      setSelectedItem(null);

      setDialog({
        visible: true,
        type: 'success',
        title: 'Przeniesiono',
        message: 'Produkt trafił do archiwum.',
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

  const clearFilters = (): void => {
    setSearchText('');
    setViewFilter('current');
    setStockFilter('all');
    setSortMode('default');
    setSelectedCategory('all');
  };

  const renderViewButton = (
    label: string,
    value: ViewFilter,
  ): React.JSX.Element => {
    const selected = viewFilter === value;

    return (
      <TouchableOpacity
        key={`item-view-${value}`}
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

  const renderStockButton = (
    label: string,
    value: StockFilter,
  ): React.JSX.Element => {
    const selected = stockFilter === value;

    return (
      <TouchableOpacity
        key={`item-stock-${value}`}
        style={[styles.stockButton, selected && styles.stockButtonSelected]}
        onPress={() => setStockFilter(value)}
        activeOpacity={0.85}>
        <Text
          style={[
            styles.stockButtonText,
            selected && styles.stockButtonTextSelected,
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
        key={`item-sort-${value}`}
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

  const renderCategoryButton = (categoryName: string): React.JSX.Element => {
    const selected = selectedCategory === categoryName;

    return (
      <TouchableOpacity
        key={`category-${categoryName}`}
        style={[
          styles.categoryButton,
          selected && styles.categoryButtonSelected,
        ]}
        onPress={() => setSelectedCategory(categoryName)}
        activeOpacity={0.85}>
        <Text
          style={[
            styles.categoryButtonText,
            selected && styles.categoryButtonTextSelected,
          ]}
          numberOfLines={1}>
          {categoryName === 'all' ? 'Wszystkie' : categoryName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderListHeader = (): React.JSX.Element => {
    return (
      <>
        <View style={styles.heroBox}>
          <Text style={styles.appName}>3D Print Shop</Text>
          <Text style={styles.heroTitle}>Produkty</Text>
          <Text style={styles.heroSubtitle}>
            Lista produktów, cen i stanów magazynowych.
          </Text>
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
            <Text style={styles.summaryLabel}>Dostępne</Text>
            <Text style={styles.summaryAvailable}>{availableItems.length}</Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Niski stan</Text>
            <Text style={styles.summaryLow}>{lowStockItems.length}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Braki</Text>
            <Text style={styles.summaryEmpty}>{emptyItems.length}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Widoczne</Text>
            <Text style={styles.summaryVisible}>{filteredItems.length}</Text>
          </View>
        </View>

        <View style={styles.valueBox}>
          <Text style={styles.valueLabel}>Wartość bieżącego magazynu</Text>
          <Text style={styles.valueText}>{formatMoney(totalStockValue)}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateItem')}
            activeOpacity={0.85}>
            <Text style={styles.createButtonText}>+ Dodaj</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.panelButton}
            onPress={() => navigation.navigate('AdminPanel')}
            activeOpacity={0.85}>
            <Text style={styles.panelButtonText}>Panel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Szukaj produktu..."
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
          <Text style={styles.filterTitle}>Widok</Text>

          <View style={styles.filterButtons}>
            {renderViewButton('Bieżące', 'current')}
            {renderViewButton('Wszystkie', 'all')}
            {renderViewButton('Archiwum', 'archived')}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Stan</Text>

          <View style={styles.filterButtons}>
            {renderStockButton('Wszystkie', 'all')}
            {renderStockButton('Dostępne', 'available')}
            {renderStockButton('Niski', 'low')}
            {renderStockButton('Braki', 'empty')}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Sortowanie</Text>

          <View style={styles.filterButtons}>
            {renderSortButton('Domyślnie', 'default')}
            {renderSortButton('A-Z', 'nameAsc')}
            {renderSortButton('Z-A', 'nameDesc')}
            {renderSortButton('Cena ↑', 'priceAsc')}
            {renderSortButton('Cena ↓', 'priceDesc')}
            {renderSortButton('Ilość ↑', 'quantityAsc')}
            {renderSortButton('Ilość ↓', 'quantityDesc')}
            {renderSortButton('Wartość ↓', 'valueDesc')}
          </View>
        </View>

        <View style={styles.filterSummaryBox}>
          <Text style={styles.filterSummaryText}>
            Wyświetlane: {filteredItems.length} / {items.length}
          </Text>

          <Text style={styles.filterSummaryText}>
            Ilość widoczna: {visibleQuantity}
          </Text>

          <Text style={styles.filterSummaryText}>
            Wartość widoczna: {formatMoney(visibleStockValue)}
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
          <Text style={styles.refreshButtonText}>Odśwież</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderItem = ({item}: {item: Item}): React.JSX.Element => {
    const isCurrent = item.isActive !== false;
    const stockValue = getStockValue(item);

    return (
      <View style={styles.itemCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.itemIconBox}>
            <Text style={styles.itemIcon}>🖨️</Text>
          </View>

          <View style={styles.cardTitleBox}>
            <Text style={styles.itemName}>{item.name ?? 'Brak nazwy'}</Text>
            <Text style={styles.itemCode}>{item.code ?? 'Brak kodu'}</Text>
          </View>

          <Text style={isCurrent ? styles.currentBadge : styles.archivedBadge}>
            {isCurrent ? 'Bieżący' : 'Archiwum'}
          </Text>
        </View>

        <View style={styles.badgeRow}>
          <Text style={styles.categoryBadge}>
            {item.categoryName ?? 'Brak kategorii'}
          </Text>

          <Text style={getStockBadgeStyle(item)}>{getStockLabel(item)}</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Cena</Text>
            <Text style={styles.priceValue}>{formatMoney(item.price)}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Ilość</Text>
            <Text style={styles.infoValue}>
              {item.quantity ?? 0} {item.unitName ?? 'szt'}
            </Text>
          </View>
        </View>

        <View style={styles.valueSmallBox}>
          <Text style={styles.valueSmallLabel}>Wartość</Text>
          <Text style={styles.valueSmallText}>{formatMoney(stockValue)}</Text>
        </View>

        {item.description ? (
          <Text style={styles.descriptionText} numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditItem', {item})}
            activeOpacity={0.85}>
            <Text style={styles.buttonText}>Edytuj</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.archiveButton,
              !isCurrent && styles.disabledArchiveButton,
            ]}
            onPress={() => handleArchive(item)}
            activeOpacity={0.85}
            disabled={!isCurrent}>
            <Text style={styles.buttonText}>Archiwum</Text>
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
          onPress={handleRefresh}
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
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.idItem.toString()}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🖨️</Text>
            <Text style={styles.emptyTitle}>Brak produktów</Text>

            <Text style={styles.emptyText}>
              {items.length === 0
                ? 'Dodaj pierwszy produkt.'
                : 'Brak wyników dla aktualnych filtrów.'}
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={
                items.length === 0
                  ? () => navigation.navigate('CreateItem')
                  : clearFilters
              }
              activeOpacity={0.85}>
              <Text style={styles.emptyButtonText}>
                {items.length === 0 ? 'Dodaj produkt' : 'Wyczyść filtry'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerBox}>
            <TouchableOpacity
              style={styles.footerPrimaryButton}
              onPress={() => navigation.navigate('CreateItem')}
              activeOpacity={0.85}>
              <Text style={styles.footerPrimaryButtonText}>Dodaj produkt</Text>
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

  summaryAvailable: {
    color: '#16a34a',
    fontSize: 23,
    fontWeight: '900',
  },

  summaryLow: {
    color: '#facc15',
    fontSize: 23,
    fontWeight: '900',
  },

  summaryEmpty: {
    color: '#ef4444',
    fontSize: 23,
    fontWeight: '900',
  },

  summaryVisible: {
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

  panelButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  panelButtonText: {
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

  categoryButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: 160,
  },

  categoryButtonSelected: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },

  categoryButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
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

  stockButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  stockButtonSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },

  stockButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },

  stockButtonTextSelected: {
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

  cardTopRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  itemIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemIcon: {
    fontSize: 26,
  },

  cardTitleBox: {
    flex: 1,
  },

  itemName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },

  itemCode: {
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

  categoryBadge: {
    backgroundColor: '#581c87',
    color: '#f3e8ff',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  availableBadge: {
    backgroundColor: '#052e16',
    color: '#bbf7d0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  lowBadge: {
    backgroundColor: '#422006',
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

  priceValue: {
    color: '#16a34a',
    fontSize: 15,
    fontWeight: '900',
  },

  infoValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
  },

  valueSmallBox: {
    backgroundColor: '#052e16',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 10,
  },

  valueSmallLabel: {
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },

  valueSmallText: {
    color: '#bbf7d0',
    fontSize: 17,
    fontWeight: '900',
  },

  descriptionText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
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

  buttonText: {
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

export default AdminItemsScreen;