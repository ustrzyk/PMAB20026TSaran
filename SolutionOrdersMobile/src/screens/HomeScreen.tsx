import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import apiService from '../api/apiService.ts';
import {useAuth} from '../context/AuthContext.tsx';
import {useCart} from '../context/CartContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';
import type {CategoryDto, Item} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function formatMoney(value?: number | null): string {
  const safeValue = value ?? 0;

  return `${safeValue.toFixed(2)} zł`;
}

function getCategoryIcon(categoryName: string): string {
  const name = categoryName.toLowerCase();

  if (name.includes('druk')) {
    return '🖨️';
  }

  if (name.includes('filament') || name.includes('pla') || name.includes('petg')) {
    return '🧵';
  }

  if (name.includes('czę') || name.includes('czes') || name.includes('akces')) {
    return '⚙️';
  }

  if (name.includes('serwis') || name.includes('narz')) {
    return '🧰';
  }

  return '🏷️';
}

function HomeScreen({navigation}: Props): React.JSX.Element {
  const {user, isAdmin, isWorker, isCustomer, logout} = useAuth();
  const {totalQuantity, totalValue} = useCart();

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const [itemsFromApi, categoriesFromApi] = await Promise.all([
        apiService.getItems(),
        apiService.getCategories(),
      ]);

      setItems(itemsFromApi);
      setCategories(categoriesFromApi);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const activeItems = useMemo(() => {
    return items.filter(item => item.isActive !== false);
  }, [items]);

  const activeCategories = useMemo(() => {
    return categories.filter(category => category.isActive !== false);
  }, [categories]);

  const visibleCategories = useMemo(() => {
    return activeCategories.slice(0, 6);
  }, [activeCategories]);

  const visibleProducts = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = activeItems;

    if (search.length > 0) {
      result = result.filter(item => {
        const name = item.name?.toLowerCase() ?? '';
        const code = item.code?.toLowerCase() ?? '';
        const category = item.categoryName?.toLowerCase() ?? '';

        return (
          name.includes(search) ||
          code.includes(search) ||
          category.includes(search)
        );
      });
    }

    return result.slice(0, 6);
  }, [activeItems, searchText]);

  const availableProductsCount = useMemo(() => {
    return activeItems.filter(item => (item.quantity ?? 0) > 0).length;
  }, [activeItems]);

  const lowStockProductsCount = useMemo(() => {
    return activeItems.filter(item => {
      const quantity = item.quantity ?? 0;

      return quantity > 0 && quantity <= 5;
    }).length;
  }, [activeItems]);

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

  const handleLogout = (): void => {
    logout();

    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
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

  const getWelcomeText = (): string => {
    if (isAdmin || isWorker) {
      return 'Panel obsługi sklepu jest dostępny z przycisku Panel.';
    }

    if (isCustomer) {
      return 'Możesz sprawdzić zamówienia, koszyk i dane konta.';
    }

    return 'Zaloguj się jako klient albo przejdź do sklepu bez logowania.';
  };

  const handleSearchPress = (): void => {
    const search = searchText.trim();

    if (search.length === 0) {
      navigation.navigate('Items');
      return;
    }

    navigation.navigate('Items', {
      initialSearch: search,
    });
  };

  const renderCategory = (category: CategoryDto): React.JSX.Element => {
    return (
      <TouchableOpacity
        key={category.idCategory}
        style={styles.categoryCard}
        onPress={() =>
          navigation.navigate('Items', {
            initialCategory: category.name,
          })
        }
        activeOpacity={0.85}>
        <Text style={styles.categoryIcon}>{getCategoryIcon(category.name)}</Text>

        <View style={styles.categoryTextBox}>
          <Text style={styles.categoryName} numberOfLines={1}>
            {category.name}
          </Text>

          <Text style={styles.categoryHint}>Zobacz produkty</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProduct = (item: Item): React.JSX.Element => {
    const isAvailable = (item.quantity ?? 0) > 0;

    return (
      <TouchableOpacity
        key={item.idItem}
        style={styles.productCard}
        onPress={() => navigation.navigate('ItemDetails', {item})}
        activeOpacity={0.85}>
        <View style={styles.productIconBox}>
          <Text style={styles.productIcon}>🖨️</Text>
        </View>

        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={styles.productCategory} numberOfLines={1}>
          {item.categoryName ?? 'Produkt'}
        </Text>

        <View style={styles.productBottomRow}>
          <Text style={styles.productPrice}>{formatMoney(item.price)}</Text>

          <Text style={isAvailable ? styles.productStock : styles.productStockEmpty}>
            {isAvailable ? `Stan: ${item.quantity ?? 0}` : 'Brak na stanie'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View style={styles.brandBox}>
          <Text style={styles.logo}>🖨️</Text>

          <View style={styles.brandTextBox}>
            <Text style={styles.appName}>3D Print Shop</Text>
            <Text style={styles.appSubtitle}>
              {user ? user.name : 'Sklep z drukiem 3D'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.accountButton}
          onPress={handleAccountPress}
          activeOpacity={0.85}>
          <Text style={styles.accountButtonText}>{getAccountLabel()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroBox}>
        <Text style={styles.heroBadge}>Sklep + panel zamówień</Text>

        <Text style={styles.heroTitle}>
          Drukarki 3D, filamenty, akcesoria i obsługa zamówień
        </Text>

        <Text style={styles.heroDescription}>{getWelcomeText()}</Text>

        <View style={styles.heroActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Items')}
            activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Zobacz ofertę</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('TrackOrder')}
            activeOpacity={0.85}>
            <Text style={styles.secondaryButtonText}>Sprawdź status</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryBox}>
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryLabel}>Produkty</Text>
          <Text style={styles.summaryValue}>{activeItems.length}</Text>
        </View>

        <View style={styles.summaryColumn}>
          <Text style={styles.summaryLabel}>Dostępne</Text>
          <Text style={styles.summaryAvailable}>{availableProductsCount}</Text>
        </View>

        <View style={styles.summaryColumn}>
          <Text style={styles.summaryLabel}>Niski stan</Text>
          <Text style={styles.summaryWarning}>{lowStockProductsCount}</Text>
        </View>
      </View>

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.85}>
          <Text style={styles.quickIcon}>🛒</Text>
          <Text style={styles.quickTitle}>Koszyk</Text>
          <Text style={styles.quickText}>
            {totalQuantity} szt. | {formatMoney(totalValue)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate('TrackOrder')}
          activeOpacity={0.85}>
          <Text style={styles.quickIcon}>📦</Text>
          <Text style={styles.quickTitle}>Zamówienie</Text>
          <Text style={styles.quickText}>Sprawdź status</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={handleAccountPress}
          activeOpacity={0.85}>
          <Text style={styles.quickIcon}>👤</Text>
          <Text style={styles.quickTitle}>
            {isCustomer ? 'Moje konto' : isAdmin || isWorker ? 'Panel' : 'Logowanie'}
          </Text>
          <Text style={styles.quickText}>
            {isCustomer
              ? 'Profil i zamówienia'
              : isAdmin || isWorker
                ? 'Obsługa sklepu'
                : 'Klient / pracownik'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate('Items')}
          activeOpacity={0.85}>
          <Text style={styles.quickIcon}>🏷️</Text>
          <Text style={styles.quickTitle}>Oferta</Text>
          <Text style={styles.quickText}>Kategorie i produkty</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.workflowBox}>
        <Text style={styles.workflowTitle}>Statusy zamówienia</Text>

        <View style={styles.workflowRow}>
          <Text style={styles.workflowBadge}>1</Text>
          <Text style={styles.workflowText}>Nowe</Text>
        </View>

        <View style={styles.workflowRow}>
          <Text style={styles.workflowBadge}>2</Text>
          <Text style={styles.workflowText}>W realizacji / Gotowe</Text>
        </View>

        <View style={styles.workflowRow}>
          <Text style={styles.workflowBadge}>3</Text>
          <Text style={styles.workflowText}>Wysłane / Zakończone</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Szukaj produktu, kodu albo kategorii..."
          placeholderTextColor="#64748b"
          onSubmitEditing={handleSearchPress}
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchPress}
          activeOpacity={0.85}>
          <Text style={styles.searchButtonText}>Szukaj</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#f97316" />
          <Text style={styles.loadingText}>Ładowanie oferty...</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Nie udało się pobrać oferty</Text>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadHomeData}
            activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>Odśwież</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!loading && !error ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kategorie</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Items')}
              activeOpacity={0.85}>
              <Text style={styles.sectionLink}>Wszystkie</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryGrid}>
            {visibleCategories.length > 0 ? (
              visibleCategories.map(renderCategory)
            ) : (
              <Text style={styles.emptyText}>Brak aktywnych kategorii</Text>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchText.trim().length > 0
                ? 'Wyniki wyszukiwania'
                : 'Polecane produkty'}
            </Text>

            <TouchableOpacity onPress={handleSearchPress} activeOpacity={0.85}>
              <Text style={styles.sectionLink}>Więcej</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {visibleProducts.length > 0 ? (
              visibleProducts.map(renderProduct)
            ) : (
              <Text style={styles.emptyText}>
                Brak produktów pasujących do wyszukiwania
              </Text>
            )}
          </View>
        </>
      ) : null}

      {user ? (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}>
          <Text style={styles.logoutButtonText}>Wyloguj</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },

  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
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
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  accountButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  heroBox: {
    backgroundColor: '#111827',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  heroBadge: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },

  heroTitle: {
    color: '#f8fafc',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
  },

  heroDescription: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  heroActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  summaryBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
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

  summaryValue: {
    color: '#38bdf8',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryAvailable: {
    color: '#16a34a',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryWarning: {
    color: '#f97316',
    fontSize: 22,
    fontWeight: '900',
  },

  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  quickCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },

  quickIcon: {
    fontSize: 29,
    marginBottom: 8,
  },

  quickTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },

  quickText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },

  workflowBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 14,
  },

  workflowTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },

  workflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 8,
  },

  workflowBadge: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#f97316',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 26,
    overflow: 'hidden',
  },

  workflowText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '800',
  },

  searchBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },

  searchButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  loadingBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 14,
  },

  loadingText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },

  errorBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 14,
  },

  errorTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },

  errorText: {
    color: '#fecaca',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },

  retryButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },

  retryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },

  sectionLink: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '900',
  },

  categoryGrid: {
    gap: 10,
    marginBottom: 18,
  },

  categoryCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  categoryIcon: {
    fontSize: 26,
  },

  categoryTextBox: {
    flex: 1,
  },

  categoryName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
  },

  categoryHint: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },

  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  productCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 170,
  },

  productIconBox: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },

  productIcon: {
    fontSize: 28,
  },

  productName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
    minHeight: 37,
  },

  productCategory: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },

  productBottomRow: {
    marginTop: 'auto',
    paddingTop: 8,
  },

  productPrice: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },

  productStock: {
    color: '#bbf7d0',
    fontSize: 11,
    fontWeight: '800',
  },

  productStockEmpty: {
    color: '#fca5a5',
    fontSize: 11,
    fontWeight: '800',
  },

  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
  },

  logoutButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },

  logoutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default HomeScreen;