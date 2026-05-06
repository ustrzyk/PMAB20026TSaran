import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import ProductCardComponent from '../components/shop/ProductCardComponent.tsx';
import {categories, products} from '../data/shopData.ts';

interface ProductsScreenProps {
  selectedCategoryId: number | null;
  onClearCategory: () => void;
}

function ProductsScreen({
  selectedCategoryId,
  onClearCategory,
}: ProductsScreenProps): React.JSX.Element {
  const selectedCategory = categories.find(
    category => category.id === selectedCategoryId,
  );

  const visibleProducts = selectedCategoryId
    ? products.filter(product => product.categoryId === selectedCategoryId)
    : products;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Lista produktów</Text>

        <Text style={styles.subtitle}>
          {selectedCategory
            ? `Produkty z kategorii: ${selectedCategory.name}`
            : 'Przegląd drukarek 3D, filamentów i akcesoriów.'}
        </Text>
      </View>

      {selectedCategory && (
        <TouchableOpacity style={styles.clearButton} onPress={onClearCategory}>
          <Text style={styles.clearButtonText}>Pokaż wszystkie produkty</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.resultText}>
        Liczba produktów: {visibleProducts.length}
      </Text>

      {visibleProducts.map(product => (
        <ProductCardComponent key={product.id} product={product} />
      ))}
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

  clearButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    alignItems: 'center',
  },

  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  resultText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
});

export default ProductsScreen;