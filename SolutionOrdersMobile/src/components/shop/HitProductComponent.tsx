import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Product} from '../../types/shop';

interface HitProductComponentProps {
  product: Product;
}

function HitProductComponent({
  product,
}: HitProductComponentProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.smallText}>Hit tygodnia</Text>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.price}>{product.price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f97316',
    borderRadius: 18,
    padding: 20,
    marginBottom: 22,
  },

  smallText: {
    color: '#431407',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  name: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },

  description: {
    color: '#fff7ed',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },

  price: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
});

export default HitProductComponent;