import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

function CartSummaryComponent(): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Twój koszyk</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Liczba produktów</Text>
        <Text style={styles.value}>0</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Wartość koszyka</Text>
        <Text style={styles.value}>0 zł</Text>
      </View>

      <Text style={styles.info}>
        Dodaj produkty z listy, aby rozpocząć tworzenie zamówienia.
      </Text>
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
});

export default CartSummaryComponent;