import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {useAuth} from '../context/AuthContext.tsx';
import {useCart} from '../context/CartContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function formatMoney(value?: number | null): string {
  const safeValue = value ?? 0;

  return `${safeValue.toFixed(2)} zł`;
}

function HomeScreen({navigation}: Props): React.JSX.Element {
  const {user, logout} = useAuth();
  const {totalQuantity, totalValue} = useCart();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroBox}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.appName}>3D Print Shop</Text>
            <Text style={styles.title}>Cześć, {user?.name ?? 'Kliencie'}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
            activeOpacity={0.85}>
            <Text style={styles.logoutButtonText}>Wyloguj</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Wybierz produkty, dodaj je do koszyka i sprawdź swoje zamówienie.
        </Text>
      </View>

      <View style={styles.cartBox}>
        <Text style={styles.cartIcon}>🛒</Text>

        <View style={styles.cartTextBox}>
          <Text style={styles.cartTitle}>Koszyk</Text>
          <Text style={styles.cartText}>
            {totalQuantity} szt. | {formatMoney(totalValue)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.85}>
          <Text style={styles.smallButtonText}>Otwórz</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Co chcesz zrobić?</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.actionCard, styles.shopCard]}
          onPress={() => navigation.navigate('Items')}
          activeOpacity={0.85}>
          <Text style={styles.actionIcon}>🖨️</Text>
          <Text style={styles.actionTitle}>Sklep</Text>
          <Text style={styles.actionText}>Produkty 3D</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.cartCard]}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.85}>
          <Text style={styles.actionIcon}>🛒</Text>
          <Text style={styles.actionTitle}>Koszyk</Text>
          <Text style={styles.actionText}>Finalizacja</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.orderCard]}
          onPress={() => navigation.navigate('TrackOrder')}
          activeOpacity={0.85}>
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionTitle}>Zamówienie</Text>
          <Text style={styles.actionText}>Status po numerze</Text>
        </TouchableOpacity>
      </View>
            
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  heroBox: {
    backgroundColor: '#111827',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },

  appName: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 7,
  },

  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },

  logoutButton: {
    backgroundColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  logoutButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  cartBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  cartIcon: {
    fontSize: 34,
  },

  cartTextBox: {
    flex: 1,
  },

  cartTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 3,
  },

  cartText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },

  smallButton: {
    backgroundColor: '#f97316',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  smallButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  actionCard: {
    width: '30.8%',
    minHeight: 132,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  shopCard: {
    borderColor: '#16a34a',
  },

  cartCard: {
    borderColor: '#f97316',
  },

  orderCard: {
    borderColor: '#38bdf8',
  },

  actionIcon: {
    fontSize: 34,
    marginBottom: 8,
  },

  actionTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },

  actionText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },

  tipBox: {
    backgroundColor: '#172554',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2563eb',
    marginTop: 18,
  },

  tipTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 5,
  },

  tipText: {
    color: '#bfdbfe',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
});

export default HomeScreen;