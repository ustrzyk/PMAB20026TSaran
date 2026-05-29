import React, {useEffect, useMemo, useState} from 'react';
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
import {useAuth} from '../context/AuthContext.tsx';
import {useCart} from '../context/CartContext.tsx';
import {useItems} from '../context/ItemsContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';
import type {Item} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Items'>;

type SortMode =
  | 'default'
  | 'name'
  | 'priceAsc'
  | 'priceDesc'
  | 'quantityDesc'
  | 'lowStock'
  | 'stockValueDesc';

type StockFilter = 'all' | 'available' | 'low' | 'empty';
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

function getCategoryIcon(categoryName?: string | null): string {
  const safeName = categoryName?.toLowerCase() ?? '';

  if (safeName.includes('druk')) {
    return '🖨️';
  }

  if (
    safeName.includes('filament') ||
    safeName.includes('pla') ||
    safeName.includes('petg')
  ) {
    return '🧵';
  }

  if (
    safeName.includes('akces') ||
    safeName.includes('czę') ||
    safeName.includes('czes')
  ) {
    return '⚙️';
  }

  if (safeName.includes('serwis') || safeName.includes('narz')) {
    return '🧰';
  }

  return '🏷️';
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

  return 'Dostępny';
}

function isLowStock(item: Item): boolean {
  const quantity = item.quantity ?? 0;

  return item.isActive !== false && quantity > 0 && quantity <= 5;
}

function ItemsScreen({navigation, route}: Props): React.JSX.Element {
  const {items, loading, error, refreshItems} = useItems();
  const {
    cartItems,
    addToCart,
    totalQuantity,
    totalValue,
  } = useCart();

  const {user, isAdmin, isWorker, isCustomer} = useAuth();

  const [searchText, setSearchText] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  useEffect(() => {
    const initialSearch = route.params?.initialSearch;
    const initialCategory = route.params?.initialCategory;

    if (initialSearch && initialSearch.trim().length > 0) {
      setSearchText(initialSearch.trim());
    }

    if (initialCategory && initialCategory.trim().length > 0) {
      setSelectedCategory(initialCategory.trim());
    }
  }, [route.params?.initialCategory, route.params?.initialSearch]);

  const activeItems = useMemo(() => {
    return items.filter(item => item.isActive !== false);
  }, [items]);

  const categories = useMemo(() => {
    const categoryNames = activeItems
      .map(item => item.categoryName ?? 'Brak kategorii')
      .filter((categoryName, index, array) => {
        return array.indexOf(categoryName) === index;
      })
      .sort((a, b) => a.localeCompare(b));

    return categoryNames;
  }, [activeItems]);

  const availableItemsCount = useMemo(() => {
    return activeItems.filter(item => (item.quantity ?? 0) > 0).length;
  }, [activeItems]);

  const lowStockItemsCount = useMemo(() => {
    return activeItems.filter(item => isLowStock(item)).length;
  }, [activeItems]);

  const emptyStockItemsCount = useMemo(() => {
    return activeItems.filter(item => (item.quantity ?? 0) <= 0).length;
  }, [activeItems]);

  const allStockValue = useMemo(() => {
    return activeItems.reduce((sum, item) => {
      return sum + getStockValue(item);
    }, 0);
  }, [activeItems]);

  const cartItemIds = useMemo(() => {
    return new Set(cartItems.map(cartItem => cartItem.item.idItem));
  }, [cartItems]);

  const filteredItems = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = activeItems;

    if (selectedCategory !== 'all') {
      result = result.filter(item => {
        const categoryName = item.categoryName ?? 'Brak kategorii';

        return categoryName === selectedCategory;
      });
    }

    if (stockFilter === 'available') {
      result = result.filter(item => (item.quantity ?? 0) > 0);
    }

    if (stockFilter === 'low') {
      result = result.filter(item => isLowStock(item));
    }

    if (stockFilter === 'empty') {
      result = result.filter(item => (item.quantity ?? 0) <= 0);
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

        return (
          name.includes(search) ||
          description.includes(search) ||
          code.includes(search) ||
          categoryName.includes(search)
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

    if (sortMode === 'quantityDesc') {
      sorted.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
    }

    if (sortMode === 'lowStock') {
      sorted.sort((a, b) => {
        const aQuantity = a.quantity ?? 0;
        const bQuantity = b.quantity ?? 0;

        return aQuantity - bQuantity;
      });
    }

    if (sortMode === 'stockValueDesc') {
      sorted.sort((a, b) => getStockValue(b) - getStockValue(a));
    }

    return sorted;
  }, [
    activeItems,
    priceFilter,
    searchText,
    selectedCategory,
    sortMode,
    stockFilter,
  ]);

  const visibleStockValue = useMemo(() => {
    return filteredItems.reduce((sum, item) => {
      return sum + getStockValue(item);
    }, 0);
  }, [filteredItems]);

  const getQuantityInCart = (idItem: number): number => {
    const cartItem = cartItems.find(item => item.item.idItem === idItem);

    return cartItem?.quantity ?? 0;
  };

  const closeDialog = (): void => {
    setDialog(previous => ({
      ...previous,
      visible: false,
      loading: false,
    }));
  };

  const getAccountLabel = (): string => {
    if (isAdmin || isWorker) {
      return 'Panel';
    }

    if (isCustomer) {
      return 'Konto';
    }

    return 'Zaloguj';
  };

  const handleAccountPress = (): void => {
    if (isAdmin || isWorker) {
      navigation.navigate('AdminPanel');
      return;
    }

    if (isCustomer) {
      navigation.navigate('ClientPanel');
      return;
    }

    navigation.navigate('AuthLogin');
  };

  const handleAddToCart = (item: Item): void => {
    const quantity = item.quantity ?? 0;
    const quantityInCart = getQuantityInCart(item.idItem);
    const canAddQuantity = quantity - quantityInCart;

    if (item.isActive === false) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Produkt nieaktywny',
        message: 'Tego produktu nie można aktualnie kupić.',
        loading: false,
      });

      return;
    }

    if (quantity <= 0) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Brak produktu',
        message: 'Tego produktu nie ma aktualnie na stanie.',
        loading: false,
      });

      return;
    }

    if (canAddQuantity <= 0) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Produkt już w koszyku',
        message:
          'Masz już w koszyku maksymalną dostępną ilość tego produktu.',
        loading: false,
      });

      return;
    }

    addToCart(item, 1);

    setDialog({
      visible: true,
      type: 'success',
      title: 'Dodano do koszyka',
      message:
        `Produkt "${item.name}" został dodany do koszyka.\n\n` +
        `W koszyku: ${quantityInCart + 1} z ${quantity} szt.`,
      loading: false,
    });
  };

  const clearFilters = (): void => {
    setSearchText('');
    setSelectedCategory('all');
    setStockFilter('all');
    setPriceFilter('all');
    setSortMode('default');
  };

  const renderSortButton = (
    label: string,
    value: SortMode,
  ): React.JSX.Element => {
    const isSelected = sortMode === value;

    return (
      <TouchableOpacity
        key={`sort-${value}`}
        style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
        onPress={() => setSortMode(value)}
        activeOpacity={0.8}>
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
        key={`stock-${value}`}
        style={[
          styles.stockFilterButton,
          isSelected && styles.stockFilterButtonSelected,
        ]}
        onPress={() => setStockFilter(value)}
        activeOpacity={0.8}>
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
        key={`price-${value}`}
        style={[styles.priceButton, isSelected && styles.priceButtonSelected]}
        onPress={() => setPriceFilter(value)}
        activeOpacity={0.8}>
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

  const renderCategoryButton = (categoryName: string): React.JSX.Element => {
    const isSelected = selectedCategory === categoryName;

    return (
      <TouchableOpacity
        key={`category-${categoryName}`}
        style={[
          styles.categoryButton,
          isSelected && styles.categoryButtonSelected,
        ]}
        onPress={() => setSelectedCategory(categoryName)}
        activeOpacity={0.8}>
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

  const renderListHeader = (): React.JSX.Element => {
    return (
      <>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}>
            <Text style={styles.homeButtonText}>3D Print Shop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.accountButton}
            onPress={handleAccountPress}
            activeOpacity={0.8}>
            <Text style={styles.accountButtonText}>{getAccountLabel()}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroBox}>
          <Text style={styles.heroBadge}>Oferta sklepu</Text>
          <Text style={styles.heroTitle}>Produkty dla druku 3D</Text>

          <Text style={styles.heroSubtitle}>
            Wybierz produkt, sprawdź stan magazynowy i dodaj go do koszyka.
            Zamówienie po zakupie otrzyma status „Nowe”.
          </Text>
        </View>

        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartBarTitle}>Koszyk</Text>
            <Text style={styles.cartBarText}>
              {totalQuantity} szt. | {formatMoney(totalValue)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.8}>
            <Text style={styles.cartButtonText}>Otwórz</Text>
          </TouchableOpacity>
        </View>

        {(isAdmin || isWorker) ? (
          <View style={styles.adminShortcutBox}>
            <View style={styles.adminShortcutTextBox}>
              <Text style={styles.adminShortcutTitle}>Tryb pracownika</Text>
              <Text style={styles.adminShortcutText}>
                Możesz przejść do administracji produktów i edytować ceny, stany
                oraz aktywność.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.adminShortcutButton}
              onPress={() => navigation.navigate('AdminItems')}
              activeOpacity={0.85}>
              <Text style={styles.adminShortcutButtonText}>Admin</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Produkty</Text>
            <Text style={styles.subtitle}>
              Wyświetlane: {filteredItems.length} / {activeItems.length}
            </Text>
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={refreshItems}>
            <Text style={styles.refreshButtonText}>Odśwież</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Aktywne</Text>
            <Text style={styles.summaryValue}>{activeItems.length}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Dostępne</Text>
            <Text style={styles.summaryAvailable}>{availableItemsCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Niski stan</Text>
            <Text style={styles.summaryWarning}>{lowStockItemsCount}</Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Brak stanu</Text>
            <Text style={styles.summaryDanger}>{emptyStockItemsCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Wartość widoczna</Text>
            <Text style={styles.summaryMoney}>
              {formatMoney(visibleStockValue)}
            </Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Wartość całości</Text>
            <Text style={styles.summaryMoney}>{formatMoney(allStockValue)}</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Szukaj produktu, kodu, opisu lub kategorii..."
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.categoryBox}>
          <Text style={styles.filterTitle}>Kategorie</Text>

          <View style={styles.categoryButtons}>
            {renderCategoryButton('all')}
            {categories.map(renderCategoryButton)}
          </View>
        </View>

        <View style={styles.sortBox}>
          <Text style={styles.filterTitle}>Stan magazynu</Text>

          <View style={styles.filterButtons}>
            {renderStockButton('Wszystkie', 'all')}
            {renderStockButton('Dostępne', 'available')}
            {renderStockButton('Niski stan', 'low')}
            {renderStockButton('Brak stanu', 'empty')}
          </View>
        </View>

        <View style={styles.sortBox}>
          <Text style={styles.filterTitle}>Cena</Text>

          <View style={styles.filterButtons}>
            {renderPriceButton('Wszystkie', 'all')}
            {renderPriceButton('do 50 zł', 'to50')}
            {renderPriceButton('50-200 zł', 'from50to200')}
            {renderPriceButton('powyżej 200 zł', 'from200')}
          </View>
        </View>

        <View style={styles.sortBox}>
          <Text style={styles.filterTitle}>Sortowanie</Text>

          <View style={styles.filterButtons}>
            {renderSortButton('Domyślnie', 'default')}
            {renderSortButton('Nazwa', 'name')}
            {renderSortButton('Cena ↑', 'priceAsc')}
            {renderSortButton('Cena ↓', 'priceDesc')}
            {renderSortButton('Stan ↓', 'quantityDesc')}
            {renderSortButton('Niski stan', 'lowStock')}
            {renderSortButton('Wartość magazynu', 'stockValueDesc')}
          </View>
        </View>

        <View style={styles.filterSummaryBox}>
          <Text style={styles.filterSummaryText}>
            Kategoria:{' '}
            {selectedCategory === 'all' ? 'wszystkie' : selectedCategory}
          </Text>

          <Text style={styles.filterSummaryText}>
            Stan: {stockFilter} | Cena: {priceFilter} | Sort: {sortMode}
          </Text>

          <Text style={styles.filterSummaryText}>
            Szukaj:{' '}
            {searchText.trim().length > 0
              ? searchText.trim()
              : 'brak wyszukiwania'}
          </Text>

          <TouchableOpacity onPress={clearFilters} activeOpacity={0.8}>
            <Text style={styles.clearFiltersText}>Wyczyść filtry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderItem = ({item}: {item: Item}): React.JSX.Element => {
    const price = item.price ?? 0;
    const quantity = item.quantity ?? 0;
    const quantityInCart = getQuantityInCart(item.idItem);
    const canAddQuantity = quantity - quantityInCart;
    const isAvailable = quantity > 0 && item.isActive !== false;
    const canAddToCart = isAvailable && canAddQuantity > 0;
    const stockLabel = getStockLabel(item);
    const stockValue = getStockValue(item);
    const isInCart = cartItemIds.has(item.idItem);

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemTopRow}>
          <View style={styles.itemIconBox}>
            <Text style={styles.itemIcon}>
              {getCategoryIcon(item.categoryName)}
            </Text>
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

          <Text
            style={
              isAvailable ? styles.availableBadge : styles.notAvailableBadge
            }>
            {stockLabel}
          </Text>

          {isInCart ? (
            <Text style={styles.inCartBadge}>W koszyku</Text>
          ) : null}
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Cena</Text>
            <Text style={styles.itemPrice}>{formatMoney(price)}</Text>
          </View>

          <View style={styles.stockBox}>
            <Text style={styles.stockLabel}>Stan</Text>
            <Text style={styles.stockValue}>
              {quantity} {item.unitName ?? 'szt'}
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>W koszyku</Text>
            <Text style={styles.infoValue}>
              {quantityInCart} {item.unitName ?? 'szt'}
            </Text>
          </View>

          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Można dodać</Text>
            <Text style={styles.infoValue}>
              {Math.max(canAddQuantity, 0)} {item.unitName ?? 'szt'}
            </Text>
          </View>

          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Wartość stanu</Text>
            <Text style={styles.infoValue}>{formatMoney(stockValue)}</Text>
          </View>
        </View>

        {isLowStock(item) ? (
          <View style={styles.lowStockBox}>
            <Text style={styles.lowStockTitle}>Niski stan magazynowy</Text>
            <Text style={styles.lowStockText}>
              Produkt może szybko się skończyć. Dostępna ilość: {quantity}{' '}
              {item.unitName ?? 'szt'}.
            </Text>
          </View>
        ) : null}

        <View style={styles.shopActions}>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              !canAddToCart && styles.disabledButton,
            ]}
            onPress={() => handleAddToCart(item)}
            activeOpacity={0.8}
            disabled={!canAddToCart}>
            <Text style={styles.buttonText}>
              {canAddToCart ? 'Dodaj' : 'Brak'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate('ItemDetails', {item})}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Szczegóły</Text>
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

        <TouchableOpacity style={styles.retryButton} onPress={refreshItems}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeReturnButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}>
          <Text style={styles.homeReturnButtonText}>Wróć na start</Text>
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
        confirmText="OK"
        cancelText="Anuluj"
        loading={dialog.loading}
        onConfirm={closeDialog}
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
            <Text style={styles.emptyIcon}>🔎</Text>

            <Text style={styles.emptyTitle}>Brak produktów</Text>

            <Text style={styles.emptyText}>
              {searchText.trim().length > 0 ||
              selectedCategory !== 'all' ||
              stockFilter !== 'all' ||
              priceFilter !== 'all'
                ? 'Brak produktów pasujących do aktualnych filtrów.'
                : 'Brak aktywnych produktów w API.'}
            </Text>

            <TouchableOpacity
              style={styles.clearEmptyButton}
              onPress={clearFilters}
              activeOpacity={0.8}>
              <Text style={styles.clearEmptyButtonText}>Wyczyść filtry</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerBox}>
            <TouchableOpacity
              style={styles.footerCartButton}
              onPress={() => navigation.navigate('Cart')}
              activeOpacity={0.85}>
              <Text style={styles.footerCartButtonText}>
                Koszyk: {totalQuantity} szt. | {formatMoney(totalValue)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerHomeButton}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.85}>
              <Text style={styles.footerHomeButtonText}>Strona główna</Text>
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

  homeReturnButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
  },

  homeReturnButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  listContent: {
    paddingBottom: 30,
  },

  topBar: {
    backgroundColor: '#111827',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  homeButton: {
    flex: 1,
  },

  homeButtonText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },

  accountButton: {
    backgroundColor: '#f97316',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  accountButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  heroBox: {
    backgroundColor: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },

  heroBadge: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
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

  cartBar: {
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cartBarTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },

  cartBarText: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 3,
    fontWeight: '700',
  },

  cartButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },

  cartButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  adminShortcutBox: {
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#6366f1',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  adminShortcutTextBox: {
    flex: 1,
  },

  adminShortcutTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 3,
  },

  adminShortcutText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  adminShortcutButton: {
    backgroundColor: '#6366f1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  adminShortcutButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
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
    backgroundColor: '#334155',
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
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
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

  summaryValue: {
    color: '#38bdf8',
    fontSize: 21,
    fontWeight: '900',
  },

  summaryAvailable: {
    color: '#16a34a',
    fontSize: 21,
    fontWeight: '900',
  },

  summaryWarning: {
    color: '#f97316',
    fontSize: 21,
    fontWeight: '900',
  },

  summaryDanger: {
    color: '#ef4444',
    fontSize: 21,
    fontWeight: '900',
  },

  summaryMoney: {
    color: '#16a34a',
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

  categoryBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  sortBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  filterTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },

  categoryButtons: {
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
    maxWidth: 160,
  },

  categoryButtonTextSelected: {
    color: '#ffffff',
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

  notAvailableBadge: {
    backgroundColor: '#7f1d1d',
    color: '#fecaca',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  inCartBadge: {
    backgroundColor: '#1e1b4b',
    color: '#c4b5fd',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  priceRow: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },

  priceBox: {
    flex: 1,
  },

  priceLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  itemPrice: {
    color: '#f97316',
    fontSize: 22,
    fontWeight: '900',
  },

  stockBox: {
    alignItems: 'flex-end',
  },

  stockLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  stockValue: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
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
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  infoLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 3,
  },

  infoValue: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '900',
  },

  lowStockBox: {
    backgroundColor: '#431407',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 10,
  },

  lowStockTitle: {
    color: '#fed7aa',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },

  lowStockText: {
    color: '#fed7aa',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  shopActions: {
    flexDirection: 'row',
    gap: 8,
  },

  addToCartButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.55,
  },

  detailsButton: {
    flex: 1,
    backgroundColor: '#f97316',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 13,
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

  footerCartButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  footerCartButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  footerHomeButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  footerHomeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default ItemsScreen;