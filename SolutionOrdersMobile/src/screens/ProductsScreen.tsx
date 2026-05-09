import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import CategoryFilterComponent from '../components/shop/CategoryFilterComponent.tsx';
import ProductCardComponent from '../components/shop/ProductCardComponent.tsx';
import SearchSortComponent from '../components/shop/SearchSortComponent.tsx';
import {categories, products} from '../data/shopData.ts';
import {Product, ProductSortOption} from '../types/shop.ts';

interface ProductsScreenProps {
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  onProductPress: (productId: number) => void;
}

function ProductsScreen({
  selectedCategoryId,
  onCategoryChange,
  onProductPress,
}: ProductsScreenProps): React.JSX.Element {
  const [searchText, setSearchText] = useState('');
  const [selectedSort, setSelectedSort] =
    useState<ProductSortOption>('default');

  const selectedCategory = categories.find(
    category => category.id === selectedCategoryId,
  );

  const visibleProducts = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    let filteredProducts = selectedCategoryId
      ? products.filter(product => product.categoryId === selectedCategoryId)
      : products;

    filteredProducts = filteredProducts.filter(product => {
      const searchableText =
        `${product.name} ${product.categoryName} ${product.description}`.toLowerCase();

      return searchableText.includes(normalizedSearchText);
    });

    return [...filteredProducts].sort(
      (firstProduct: Product, secondProduct: Product) => {
        if (selectedSort === 'name') {
          return firstProduct.name.localeCompare(secondProduct.name);
        }

        if (selectedSort === 'priceAsc') {
          return firstProduct.price - secondProduct.price;
        }

        if (selectedSort === 'priceDesc') {
          return secondProduct.price - firstProduct.price;
        }

        return firstProduct.id - secondProduct.id;
      },
    );
  }, [searchText, selectedSort, selectedCategoryId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Lista produktów</Text>

        <Text style={styles.subtitle}>
          {selectedCategory
            ? `Aktualnie wybrana kategoria: ${selectedCategory.name}`
            : 'Przegląd wszystkich produktów w sklepie.'}
        </Text>
      </View>

      <CategoryFilterComponent
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={onCategoryChange}
      />

      <SearchSortComponent
        searchText={searchText}
        selectedSort={selectedSort}
        onSearchChange={setSearchText}
        onSortChange={setSelectedSort}
      />

      <Text style={styles.resultText}>
        Znaleziono produktów: {visibleProducts.length}
      </Text>

      {visibleProducts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Brak wyników</Text>
          <Text style={styles.emptyText}>
            Spróbuj wpisać inną nazwę produktu lub wybierz inną kategorię.
          </Text>
        </View>
      ) : (
        visibleProducts.map(product => (
          <ProductCardComponent
            key={product.id}
            product={product}
            onPress={onProductPress}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 24,
  },

  headerBox: {
    marginBottom: 16,
  },

  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },

  resultText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },

  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },

  emptyText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ProductsScreen;