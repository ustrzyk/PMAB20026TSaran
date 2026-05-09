import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import CartSummaryComponent from '../components/shop/CartSummaryComponent.tsx';
import {CartItem} from '../types/shop.ts';

interface CartScreenProps {
  cartItems: CartItem[];
  onProductPress: (productId: number) => void;
  onIncreaseQuantity: (productId: number) => void;
  onDecreaseQuantity: (productId: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onClearCart: () => void;
}

function CartScreen({
  cartItems,
  onProductPress,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveFromCart,
  onClearCart,
}: CartScreenProps): React.JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Koszyk</Text>
        <Text style={styles.subtitle}>
          Zarządzaj produktami przed złożeniem zamówienia.
        </Text>
      </View>

      <CartSummaryComponent
        cartItems={cartItems}
        onProductPress={onProductPress}
        onIncreaseQuantity={onIncreaseQuantity}
        onDecreaseQuantity={onDecreaseQuantity}
        onRemoveFromCart={onRemoveFromCart}
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