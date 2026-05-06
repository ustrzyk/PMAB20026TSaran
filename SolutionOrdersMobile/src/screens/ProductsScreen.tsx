import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import ProductCardComponent from '../components/shop/ProductCardComponent';
import {products} from '../data/shopData';

function ProductsScreen(): React.JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Lista produktów</Text>
        <Text style={styles.subtitle}>
          Przegląd drukarek 3D, filamentów i akcesoriów.
        </Text>
      </View>

      {products.map(product => (
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
  },
});

export default ProductsScreen;