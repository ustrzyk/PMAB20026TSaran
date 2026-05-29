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

  if (name.includes('akces') || name.includes('czę') || name.includes('czes')) {
    return '⚙️';
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
    return activeCategories.slice(0, 8);
  }, [activeCategories]);

  const popularProducts = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = activeItems.filter(item => {
      return (item.quantity ?? 0) > 0;
    });

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

  const handleSearch = (): void => {
    const search = searchText.trim();

    if (search.length === 0) {
      navigation.navigate('Items');
      return;
    }

    navigation.navigate('Items', {
      initialSearch: search,
    });
  };

  const getAccountButtonText = (): string => {
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
      return 'Jesteś zalogowany. Możesz przejść do panelu obsługi sklepu.';
    }

    if (isCustomer) {
      return 'Witaj ponownie. Sprawdź koszyk, zamówienia albo przejdź do zakupów.';
    }

    return 'Znajdź produkt, dodaj do koszyka i złóż zamówienie w kilku krokach.';
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

        <Text style={styles.categoryName} numberOfLines={1}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = (item: Item): React.JSX.Element => {
    return (
      <TouchableOpacity
        key={item.idItem}
        style={styles.productCard}
        onPress={() => navigation.navigate('ItemDetails', {item})}
        activeOpacity={0.85}>
        <View style={styles.productTopRow}>
          <Text style={styles.productIcon}>
            {getCategoryIcon(item.categoryName)}
          </Text>

          <View style={styles.productTextBox}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>

            <Text style={styles.productCategory} numberOfLines={1}>
              {item.categoryName ?? 'Produkt'}
            </Text>
          </View>
        </View>

        <View style={styles.productBottomRow}>
          <Text style={styles.productPrice}>{formatMoney(item.price)}</Text>

          <Text style={styles.productStock}>
            Stan: {item.quantity ?? 0} {item.unitName ?? 'szt'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.brandBox}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}>
          <Text style={styles.logo}>🖨️</Text>

          <View style={styles.brandTextBox}>
            <Text style={styles.appName}>3D Print Shop</Text>
            <Text style={styles.appSubtitle}>
              {user ? user.name : 'Sklep mobilny'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accountButton}
          onPress={handleAccountPress}
          activeOpacity={0.85}>
          <Text style={styles.accountButtonText}>{getAccountButtonText()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.searchTitle}>Czego szukasz?</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Wpisz nazwę produktu..."
            placeholderTextColor="#64748b"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            activeOpacity={0.85}>
            <Text style={styles.searchButtonText}>Szukaj</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.heroBox}>
        <Text style={styles.heroTitle}>Zakupy prosto z telefonu</Text>

        <Text style={styles.heroText}>{getWelcomeText()}</Text>

        <View style={styles.mainActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Items')}
            activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Produkty</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.85}>
            <Text style={styles.secondaryButtonText}>Koszyk</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate('Items')}
          activeOpacity={0.85}>
          <Text style={styles.quickIcon}>🛍️</Text>
          <Text style={styles.quickTitle}>Sklep</Text>
          <Text style={styles.quickText}>{availableProductsCount} dostępnych</Text>
        </TouchableOpacity>

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
          <Text style={styles.quickTitle}>Status</Text>
          <Text style={styles.quickText}>Sprawdź zamówienie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={handleAccountPress}
          activeOpacity={0.85}>
          <Text style={styles.quickIcon}>👤</Text>
          <Text style={styles.quickTitle}>
            {isCustomer ? 'Moje konto' : isAdmin || isWorker ? 'Panel' : 'Konto'}
          </Text>
          <Text style={styles.quickText}>
            {user ? 'Otwórz' : 'Zaloguj się'}
          </Text>
        </TouchableOpacity>
      </View>

      {isCustomer ? (
        <TouchableOpacity
          style={styles.customerOrderButton}
          onPress={() => navigation.navigate('CustomerOrders')}
          activeOpacity={0.85}>
          <View>
            <Text style={styles.customerOrderTitle}>Moje zamówienia</Text>
            <Text style={styles.customerOrderText}>
              Zobacz historię i aktualny status realizacji.
            </Text>
          </View>

          <Text style={styles.customerOrderArrow}>{'>'}</Text>
        </TouchableOpacity>
      ) : null}

      {isAdmin || isWorker ? (
        <TouchableOpacity
          style={styles.workerPanelButton}
          onPress={() => navigation.navigate('AdminPanel')}
          activeOpacity={0.85}>
          <View>
            <Text style={styles.workerPanelTitle}>Panel obsługi</Text>
            <Text style={styles.workerPanelText}>
              Zamówienia, produkty, klienci i dashboard.
            </Text>
          </View>

          <Text style={styles.workerPanelArrow}>{'>'}</Text>
        </TouchableOpacity>
      ) : null}

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
              <Text style={styles.emptyText}>Brak kategorii</Text>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchText.trim().length > 0 ? 'Znalezione produkty' : 'Popularne produkty'}
            </Text>

            <TouchableOpacity onPress={handleSearch} activeOpacity={0.85}>
              <Text style={styles.sectionLink}>Więcej</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsList}>
            {popularProducts.length > 0 ? (
              popularProducts.map(renderProduct)
            ) : (
              <Text style={styles.emptyText}>Brak produktów do wyświetlenia</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
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

  searchCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  searchTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 10,
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

  heroBox: {
    backgroundColor: '#111827',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  heroTitle: {
    color: '#f8fafc',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
  },

  heroText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  mainActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },

  quickCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 118,
  },

  quickIcon: {
    fontSize: 30,
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
    lineHeight: 17,
  },

  customerOrderButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  customerOrderTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },

  customerOrderText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },

  customerOrderArrow: {
    color: '#38bdf8',
    fontSize: 22,
    fontWeight: '900',
  },

  workerPanelButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#a855f7',
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  workerPanelTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },

  workerPanelText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },

  workerPanelArrow: {
    color: '#a855f7',
    fontSize: 22,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },

  categoryCard: {
    width: '48%',
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
    fontSize: 24,
  },

  categoryName: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
  },

  productsList: {
    gap: 10,
  },

  productCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },

  productTopRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  productIcon: {
    fontSize: 30,
  },

  productTextBox: {
    flex: 1,
  },

  productName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 19,
  },

  productCategory: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },

  productBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },

  productPrice: {
    color: '#f97316',
    fontSize: 17,
    fontWeight: '900',
  },

  productStock: {
    color: '#bbf7d0',
    fontSize: 12,
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