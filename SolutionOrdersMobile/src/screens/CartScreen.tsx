import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import CartSummaryComponent from '../components/shop/CartSummaryComponent';
import {Product} from '../types/shop';

interface CartScreenProps {
  cartProducts: Product[];
  onProductPress: (productId: number) => void;
  onClearCart: () => void;
}

function CartScreen({
  cartProducts,
  onProductPress,
  onClearCart,
}: CartScreenProps): React.JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Koszyk</Text>
        <Text style={styles.subtitle}>
          Tutaj pojawią się produkty dodane do zamówienia.
        </Text>
      </View>

      <CartSummaryComponent
        products={cartProducts}
        onProductPress={onProductPress}
        onClearCart={onClearCart}
      />
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
});

export default CartScreen;