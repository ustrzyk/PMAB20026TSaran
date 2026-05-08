import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {Product} from '../../types/shop';

interface ProductCardComponentProps {
  product: Product;
  onPress: (productId: number) => void;
}

function ProductCardComponent({
  product,
  onPress,
}: ProductCardComponentProps): React.JSX.Element {
  const formattedPrice = `${product.price.toLocaleString('pl-PL')} zł`;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress(product.id)}>
      <View style={styles.topRow}>
        <Text style={styles.category}>{product.categoryName}</Text>
        <Text style={styles.tag}>{product.tag}</Text>
      </View>

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.description}>{product.description}</Text>

      <View style={styles.bottomRow}>
        <Text style={styles.price}>{formattedPrice}</Text>
        <Text style={styles.button}>Szczegóły</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  category: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },

  tag: {
    color: '#ffffff',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '700',
  },

  name: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  description: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '900',
  },

  button: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: '800',
  },
});

export default ProductCardComponent;