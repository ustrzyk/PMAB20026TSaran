import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {CartItem} from '../../types/shop.ts';

interface CartSummaryComponentProps {
  cartItems: CartItem[];
  onProductPress: (productId: number) => void;
  onIncreaseQuantity: (productId: number) => void;
  onDecreaseQuantity: (productId: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onClearCart: () => void;
}

function CartSummaryComponent({
  cartItems,
  onProductPress,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveFromCart,
  onClearCart,
}: CartSummaryComponentProps): React.JSX.Element {
  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const formattedTotalPrice = `${totalPrice.toLocaleString('pl-PL')} zł`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Twój koszyk</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Liczba produktów</Text>
        <Text style={styles.value}>{totalQuantity}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Wartość koszyka</Text>
        <Text style={styles.value}>{formattedTotalPrice}</Text>
      </View>

      {cartItems.length === 0 ? (
        <Text style={styles.info}>
          Dodaj produkty z listy, aby rozpocząć tworzenie zamówienia.
        </Text>
      ) : (
        <View style={styles.productList}>
          {cartItems.map(item => {
            const productTotalPrice =
              item.product.price * item.quantity;

            return (
              <View key={item.product.id} style={styles.productRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onProductPress(item.product.id)}>
                  <Text style={styles.productName}>{item.product.name}</Text>
                  <Text style={styles.productCategory}>
                    {item.product.categoryName}
                  </Text>
                </TouchableOpacity>

                <View style={styles.productInfoRow}>
                  <Text style={styles.productPrice}>
                    {productTotalPrice.toLocaleString('pl-PL')} zł
                  </Text>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => onRemoveFromCart(item.product.id)}>
                    <Text style={styles.removeButtonText}>Usuń</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => onDecreaseQuantity(item.product.id)}>
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => onIncreaseQuantity(item.product.id)}>
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <TouchableOpacity style={styles.clearButton} onPress={onClearCart}>
            <Text style={styles.clearButtonText}>Wyczyść koszyk</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.orderButton}>
            <Text style={styles.orderButtonText}>Przejdź do zamówienia</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },

  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  label: {
    color: '#cbd5e1',
    fontSize: 14,
  },

  value: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '800',
  },

  info: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },

  productList: {
    marginTop: 12,
  },

  productRow: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  productName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },

  productCategory: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },

  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  productPrice: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '900',
  },

  removeButton: {
    backgroundColor: '#7f1d1d',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  quantityButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },

  quantityText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginHorizontal: 16,
  },

  clearButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },

  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  orderButton: {
    backgroundColor: '#f97316',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  orderButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default CartSummaryComponent;