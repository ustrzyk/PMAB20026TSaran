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

    let result = items.filter(item => item.isActive);

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
  }, [items, searchText, sortMode]);

  const closeDialog = (): void => {
    setDialog(previous => ({
      ...previous,
      visible: false,
      loading: false,
    }));
  };

  const handleAddToCart = (item: Item): void => {
    const quantity = item.quantity ?? 0;

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

  const renderSortButton = (
    label: string,
    value: SortMode,
  ): React.JSX.Element => {
    const isSelected = sortMode === value;

    return (
      <TouchableOpacity
        style={[styles.sortButton, isSelected && styles.sortButtonSelected]}
        onPress={() => setSortMode(value)}
        activeOpacity={0.8}>
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

  const renderItem = ({item}: {item: Item}): React.JSX.Element => {
    const price = item.price ?? 0;
    const quantity = item.quantity ?? 0;
    const isAvailable = quantity > 0;

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name ?? 'Brak nazwy'}</Text>

          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description ?? 'Brak opisu produktu'}
          </Text>

          <View style={styles.badgeRow}>
            <Text style={styles.categoryBadge}>
              {item.categoryName ?? 'Brak kategorii'}
            </Text>

            <Text style={styles.codeBadge}>{item.code ?? 'Brak kodu'}</Text>
          </View>

          <Text style={styles.itemPrice}>Cena: {formatMoney(price)}</Text>

          <Text style={styles.itemText}>
            Stan magazynu: {quantity} {item.unitName ?? 'szt'}
          </Text>
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
              {isAvailable ? 'Dodaj do koszyka' : 'Brak na stanie'}
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

      <View style={styles.heroBox}>
        <Text style={styles.shopName}>3D Print Shop</Text>
        <Text style={styles.heroTitle}>Sklep z drukarkami 3D</Text>
        <Text style={styles.heroSubtitle}>
          Wybierz produkt, dodaj go do koszyka i złóż zamówienie z dostawą.
        </Text>
      </View>

      <View style={styles.cartBar}>
        <View>
          <Text style={styles.cartBarTitle}>Koszyk</Text>
          <Text style={styles.cartBarText}>
            Produkty: {totalQuantity} | {formatMoney(totalValue)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.8}>
          <Text style={styles.cartButtonText}>Przejdź</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Produkty</Text>
          <Text style={styles.subtitle}>
            Wyświetlane: {filteredItems.length} / {items.length}
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

        {searchText.trim().length > 0 ? (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => setSearchText('')}
            activeOpacity={0.8}>
            <Text style={styles.clearSearchText}>Wyczyść</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.sortBox}>
        <Text style={styles.sortTitle}>Sortowanie</Text>

        <View style={styles.sortButtons}>
          {renderSortButton('Domyślnie', 'default')}
          {renderSortButton('Nazwa', 'name')}
          {renderSortButton('Cena ↑', 'priceAsc')}
          {renderSortButton('Cena ↓', 'priceDesc')}
          {renderSortButton('Stan', 'quantity')}
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.idItem.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshItems} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchText.trim().length > 0
              ? 'Brak produktów pasujących do wyszukiwania'
              : 'Brak produktów w API'}
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
    backgroundColor: '#f97316',
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

  clearSearchButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },

  clearSearchText: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '800',
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

  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  itemCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  itemContent: {
    marginBottom: 12,
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
    marginBottom: 8,
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },

  categoryBadge: {
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
  },

  codeBadge: {
    backgroundColor: '#422006',
    color: '#fed7aa',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
  },

  itemPrice: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },

  itemText: {
    color: '#94a3b8',
    fontSize: 13,
  },

  shopActions: {
    flexDirection: 'row',
    gap: 8,
  },

  addToCartButton: {
    flex: 2,
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

  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});

export default ItemsScreen;