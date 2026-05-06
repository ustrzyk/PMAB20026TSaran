import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {Product} from '../../types/shop';

interface CartSummaryComponentProps {
  products: Product[];
  onProductPress: (productId: number) => void;
  onClearCart: () => void;
}

function CartSummaryComponent({
  products,
  onProductPress,
  onClearCart,
}: CartSummaryComponentProps): React.JSX.Element {
  const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
  const formattedTotalPrice = `${totalPrice.toLocaleString('pl-PL')} zł`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Twój koszyk</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Liczba produktów</Text>
        <Text style={styles.value}>{products.length}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Wartość koszyka</Text>
        <Text style={styles.value}>{formattedTotalPrice}</Text>
      </View>

      {products.length === 0 ? (
        <Text style={styles.info}>
          Dodaj produkty z listy, aby rozpocząć tworzenie zamówienia.
        </Text>
      ) : (
        <View style={styles.productList}>
          {products.map((product, index) => (
            <TouchableOpacity
              key={`${product.id}-${index}`}
              style={styles.productRow}
              onPress={() => onProductPress(product.id)}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>
                {product.price.toLocaleString('pl-PL')} zł
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.clearButton} onPress={onClearCart}>
            <Text style={styles.clearButtonText}>Wyczyść koszyk</Text>
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },

  productName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },

  productPrice: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '800',
  },

  clearButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },

  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default CartSummaryComponent;