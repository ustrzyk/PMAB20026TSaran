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
import {useAuth} from '../context/AuthContext.tsx';
import {useCart} from '../context/CartContext.tsx';
import {useItems} from '../context/ItemsContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';
import type {Item} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Items'>;

type SortMode = 'default' | 'name' | 'priceAsc' | 'priceDesc' | 'quantity';

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

function ItemsScreen({navigation}: Props): React.JSX.Element {
  const {items, loading, error, refreshItems} = useItems();
  const {addToCart, totalQuantity, totalValue} = useCart();
  const {user, isAdmin, isWorker, isCustomer} = useAuth();

  const [searchText, setSearchText] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

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

  const filteredItems = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = activeItems;

    if (selectedCategory !== 'all') {
      result = result.filter(item => {
        const categoryName = item.categoryName ?? 'Brak kategorii';

        return categoryName === selectedCategory;
      });
    }

    if (onlyAvailable) {
      result = result.filter(item => (item.quantity ?? 0) > 0);
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

    if (sortMode === 'quantity') {
      sorted.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
    }

    return sorted;
  }, [activeItems, searchText, sortMode, selectedCategory, onlyAvailable]);

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

    addToCart(item, 1);

    setDialog({
      visible: true,
      type: 'success',
      title: 'Dodano do koszyka',
      message: `Produkt "${item.name}" został dodany do koszyka.`,
      loading: false,
    });
  };

  const clearFilters = (): void => {
    setSearchText('');
    setSelectedCategory('all');
    setOnlyAvailable(false);
    setSortMode('default');
  };

  const renderSortButton = (
    label: string,
    value: SortMode,
  ): React.JSX.Element => {
    const isSelected = sortMode === value;

    return (
      <TouchableOpacity
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

  const renderCategoryButton = (categoryName: string): React.JSX.Element => {
    const isSelected = selectedCategory === categoryName;

    return (
      <TouchableOpacity
        key={categoryName}
        style={[
          styles.categoryButton,
          isSelected && styles.categoryButtonSelected,
        ]}
        onPress={() => setSelectedCategory(categoryName)}
        activeOpacity={0.8}>
        <Text
          style={[
            styles.categoryButtonText,
            isSelected && styles.categoryButtonTextSelected,
          ]}>
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

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Szukaj produktu, kodu lub kategorii..."
            placeholderTextColor="#64748b"
          />

          <TouchableOpacity
            style={[
              styles.onlyAvailableButton,
              onlyAvailable && styles.onlyAvailableButtonSelected,
            ]}
            onPress={() => setOnlyAvailable(previous => !previous)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.onlyAvailableText,
                onlyAvailable && styles.onlyAvailableTextSelected,
              ]}>
              {onlyAvailable ? '✓ Tylko dostępne' : 'Tylko dostępne'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryBox}>
          <Text style={styles.filterTitle}>Kategorie</Text>

          <View style={styles.categoryButtons}>
            {renderCategoryButton('all')}
            {categories.map(renderCategoryButton)}
          </View>
        </View>

        <View style={styles.sortBox}>
          <Text style={styles.filterTitle}>Sortowanie</Text>

          <View style={styles.filterButtons}>
            {renderSortButton('Domyślnie', 'default')}
            {renderSortButton('Nazwa', 'name')}
            {renderSortButton('Cena ↑', 'priceAsc')}
            {renderSortButton('Cena ↓', 'priceDesc')}
            {renderSortButton('Stan', 'quantity')}
          </View>
        </View>

        <View style={styles.filterSummaryBox}>
          <Text style={styles.filterSummaryText}>
            {selectedCategory === 'all'
              ? 'Wszystkie kategorie'
              : selectedCategory}
            {onlyAvailable ? ' | tylko dostępne' : ''}
            {searchText.trim().length > 0 ? ` | ${searchText.trim()}` : ''}
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
    const isAvailable = quantity > 0 && item.isActive !== false;

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemTopRow}>
          <View style={styles.itemIconBox}>
            <Text style={styles.itemIcon}>🖨️</Text>
          </View>

          <View style={styles.itemContent}>
            <Text style={styles.itemName}>{item.name ?? 'Brak nazwy'}</Text>

            <Text style={styles.itemDescription} numberOfLines={2}>
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
            {isAvailable ? 'Dostępny' : 'Brak na stanie'}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <View>
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

        <View style={styles.shopActions}>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              !isAvailable && styles.disabledButton,
            ]}
            onPress={() => handleAddToCart(item)}
            activeOpacity={0.8}
            disabled={!isAvailable}>
            <Text style={styles.buttonText}>
              {isAvailable ? 'Dodaj' : 'Brak'}
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
        <Text style={styles.errorText}>Błąd: {error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={refreshItems}>
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
            <Text style={styles.emptyText}>
              {searchText.trim().length > 0 ||
              selectedCategory !== 'all' ||
              onlyAvailable
                ? 'Brak produktów pasujących do filtrów'
                : 'Brak produktów w API'}
            </Text>

            <TouchableOpacity
              style={styles.clearEmptyButton}
              onPress={clearFilters}
              activeOpacity={0.8}>
              <Text style={styles.clearEmptyButtonText}>Wyczyść filtry</Text>
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

  errorText: {
    color: '#fca5a5',
    fontSize: 16,
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

  onlyAvailableButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  onlyAvailableButtonSelected: {
    borderColor: '#16a34a',
  },

  onlyAvailableText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '900',
  },

  onlyAvailableTextSelected: {
    color: '#16a34a',
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
  },

  categoryButtonSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },

  categoryButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
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
    marginBottom: 12,
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

  priceRow: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  priceLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 3,
  },

  itemPrice: {
    color: '#f97316',
    fontSize: 18,
    fontWeight: '900',
  },

  stockBox: {
    alignItems: 'flex-end',
  },

  stockLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 3,
  },

  stockValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
  },

  shopActions: {
    flexDirection: 'row',
    gap: 8,
  },

  addToCartButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    borderRadius: 10,
  },

  detailsButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 10,
  },

  disabledButton: {
    opacity: 0.55,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },

  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 12,
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
});

export default ItemsScreen;