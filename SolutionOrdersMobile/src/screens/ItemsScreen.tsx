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

type SortMode = 'default' | 'name' | 'priceAsc' | 'priceDesc';
type StockFilter = 'all' | 'available' | 'empty';

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

  return '🏷️';
}

function getStockLabel(item: Item): string {
  const quantity = item.quantity ?? 0;

  if (quantity <= 0) {
    return 'Brak';
  }

  return `${quantity} ${item.unitName ?? 'szt'}`;
}

function ItemsScreen({navigation, route}: Props): React.JSX.Element {
  const {items, loading, error, refreshItems} = useItems();

  const {cartItems, addToCart, totalQuantity, totalValue} = useCart();

  const {isAdmin, isWorker, isCustomer} = useAuth();

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

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
    return activeItems
      .map(item => item.categoryName ?? 'Brak kategorii')
      .filter((categoryName, index, array) => {
        return array.indexOf(categoryName) === index;
      })
      .sort((a, b) => a.localeCompare(b));
  }, [activeItems]);

  const availableItemsCount = useMemo(() => {
    return activeItems.filter(item => (item.quantity ?? 0) > 0).length;
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

    if (stockFilter === 'empty') {
      result = result.filter(item => (item.quantity ?? 0) <= 0);
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

    return sorted;
  }, [activeItems, searchText, selectedCategory, sortMode, stockFilter]);

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

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);

    try {
      await refreshItems();
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAddToCart = (item: Item): void => {
    const quantity = item.quantity ?? 0;
    const quantityInCart = getQuantityInCart(item.idItem);
    const canAddQuantity = quantity - quantityInCart;

    if (quantity <= 0) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Produkt',
        message: 'Produkt niedostępny.',
        loading: false,
      });

      return;
    }

    if (canAddQuantity <= 0) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Koszyk',
        message: 'Maksymalna ilość jest już w koszyku.',
        loading: false,
      });

      return;
    }

    addToCart(item, 1);

    setDialog({
      visible: true,
      type: 'success',
      title: 'Koszyk',
      message: 'Dodano 1 sztukę.',
      loading: false,
    });
  };

  const clearFilters = (): void => {
    setSearchText('');
    setSelectedCategory('all');
    setStockFilter('all');
    setSortMode('default');
  };

  const renderCategoryButton = (
    label: string,
    value: string,
  ): React.JSX.Element => {
    const selected = selectedCategory === value;

    return (
      <TouchableOpacity
        key={`category-${value}`}
        style={[
          styles.filterButton,
          selected && styles.filterButtonSelected,
        ]}
        onPress={() => setSelectedCategory(value)}
        activeOpacity={0.85}>
        <Text
          style={[
            styles.filterButtonText,
            selected && styles.filterButtonTextSelected,
          ]}
          numberOfLines={1}>
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
        key={`stock-${value}`}
        style={[
          styles.filterButton,
          selected && styles.filterButtonSelected,
        ]}
        onPress={() => setStockFilter(value)}
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
        style={[
          styles.sortButton,
          selected && styles.sortButtonSelected,
        ]}
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
        <View style={styles.topBar}>
          <View style={styles.brandBox}>
            <Text style={styles.logo}>🖨️</Text>

            <View style={styles.brandTextBox}>
              <Text style={styles.appName}>3D Print Shop</Text>
              <Text style={styles.appSubtitle}>Produkty</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.accountButton}
            onPress={handleAccountPress}
            activeOpacity={0.85}>
            <Text style={styles.accountButtonText}>{getAccountLabel()}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cartBox}>
          <View style={styles.cartTextBox}>
            <Text style={styles.cartLabel}>Koszyk</Text>
            <Text style={styles.cartValue}>
              {totalQuantity} szt. | {formatMoney(totalValue)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.85}>
            <Text style={styles.cartButtonText}>Otwórz</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Szukaj produktu"
              placeholderTextColor="#64748b"
              returnKeyType="search"
            />

            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={clearFilters}
              activeOpacity={0.85}>
              <Text style={styles.clearSearchButtonText}>Wyczyść</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Kategorie</Text>

          <View style={styles.filterButtons}>
            {renderCategoryButton('Wszystkie', 'all')}

            {categories.map(category => {
              return renderCategoryButton(category, category);
            })}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Dostępność</Text>

          <View style={styles.filterButtons}>
            {renderStockButton('Wszystkie', 'all')}
            {renderStockButton('Dostępne', 'available')}
            {renderStockButton('Brak', 'empty')}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Sortowanie</Text>

          <View style={styles.filterButtons}>
            {renderSortButton('Domyślnie', 'default')}
            {renderSortButton('Nazwa', 'name')}
            {renderSortButton('Cena ↑', 'priceAsc')}
            {renderSortButton('Cena ↓', 'priceDesc')}
          </View>
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultText}>
            Produkty: {filteredItems.length} / {activeItems.length}
          </Text>

          <Text style={styles.resultText}>
            Dostępne: {availableItemsCount}
          </Text>
        </View>
      </>
    );
  };

  const renderItem = ({item}: {item: Item}): React.JSX.Element => {
    const quantity = item.quantity ?? 0;
    const quantityInCart = getQuantityInCart(item.idItem);
    const canAdd = quantity > 0 && quantityInCart < quantity;
    const alreadyInCart = cartItemIds.has(item.idItem);

    return (
      <View style={styles.productCard}>
        <TouchableOpacity
          style={styles.productMain}
          onPress={() => navigation.navigate('ItemDetails', {item})}
          activeOpacity={0.85}>
          <View style={styles.productIconBox}>
            <Text style={styles.productIcon}>
              {getCategoryIcon(item.categoryName)}
            </Text>
          </View>

          <View style={styles.productContent}>
            <View style={styles.productTopRow}>
              <View style={styles.productNameBox}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>

                <Text style={styles.productCode} numberOfLines={1}>
                  {item.code ?? 'Brak kodu'}
                </Text>
              </View>

              <Text style={quantity > 0 ? styles.stockBadge : styles.emptyBadge}>
                {getStockLabel(item)}
              </Text>
            </View>

            <Text style={styles.productCategory} numberOfLines={1}>
              {item.categoryName ?? 'Brak kategorii'}
            </Text>

            <View style={styles.productBottomRow}>
              <Text style={styles.productPrice}>{formatMoney(item.price)}</Text>

              {alreadyInCart ? (
                <Text style={styles.inCartText}>W koszyku: {quantityInCart}</Text>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate('ItemDetails', {item})}
            activeOpacity={0.85}>
            <Text style={styles.detailsButtonText}>Szczegóły</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addButton,
              !canAdd && styles.disabledButton,
            ]}
            onPress={() => handleQuickAddToCart(item)}
            activeOpacity={0.85}
            disabled={!canAdd}>
            <Text style={styles.addButtonText}>
              {canAdd ? '+ Koszyk' : 'Brak'}
            </Text>
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
          style={styles.primaryButton}
          onPress={handleRefresh}
          activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Odśwież</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>Strona główna</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🛍️</Text>
            <Text style={styles.emptyTitle}>Brak produktów</Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={clearFilters}
              activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Wyczyść filtry</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerBox}>
            <TouchableOpacity
              style={styles.footerCartButton}
              onPress={() => navigation.navigate('Cart')}
              activeOpacity={0.85}>
              <Text style={styles.footerCartButtonText}>Koszyk</Text>
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

  listContent: {
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

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 14,
  },

  brandBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  logo: {
    fontSize: 34,
  },

  brandTextBox: {
    flex: 1,
  },

  appName: {
    color: '#f8fafc',
    fontSize: 19,
    fontWeight: '900',
  },

  appSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },

  accountButton: {
    backgroundColor: '#f97316',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  accountButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  cartBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  cartTextBox: {
    flex: 1,
  },

  cartLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  cartValue: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },

  cartButton: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  cartButtonText: {
    color: '#ffffff',
    fontSize: 12,
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

  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },

  searchInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },

  clearSearchButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },

  clearSearchButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
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
    paddingVertical: 8,
    borderRadius: 999,
    maxWidth: '100%',
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
    paddingVertical: 8,
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

  resultBox: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  resultText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },

  productCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  productMain: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  productIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  productIcon: {
    fontSize: 26,
  },

  productContent: {
    flex: 1,
  },

  productTopRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  productNameBox: {
    flex: 1,
  },

  productName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
  },

  productCode: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },

  stockBadge: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  emptyBadge: {
    backgroundColor: '#334155',
    color: '#cbd5e1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  productCategory: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },

  productBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  productPrice: {
    color: '#f97316',
    fontSize: 19,
    fontWeight: '900',
  },

  inCartText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '900',
  },

  productActions: {
    flexDirection: 'row',
    gap: 10,
  },

  detailsButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  detailsButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  addButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  addButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  disabledButton: {
    opacity: 0.5,
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },

  footerBox: {
    paddingTop: 8,
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

  primaryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 10,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  secondaryButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default ItemsScreen;