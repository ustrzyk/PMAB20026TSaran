import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {useCart} from '../context/CartContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function formatMoney(value?: number | null): string {
  const safeValue = value ?? 0;

  return `${safeValue.toFixed(2)} zł`;
}

function HomeScreen({navigation}: Props): React.JSX.Element {
  const {totalQuantity, totalValue} = useCart();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroBox}>
        <Text style={styles.appName}>3D Print Shop</Text>

        <Text style={styles.title}>Sklep z drukarkami 3D</Text>

        <Text style={styles.subtitle}>
          Kup drukarki 3D, filamenty, dysze, części zamienne i akcesoria.
          Wybierz produkt, dodaj go do koszyka i złóż zamówienie z dostawą.
        </Text>
      </View>

      <View style={styles.cartSummaryBox}>
        <View>
          <Text style={styles.cartSummaryTitle}>Twój koszyk</Text>
          <Text style={styles.cartSummaryText}>
            Produkty: {totalQuantity} | Wartość: {formatMoney(totalValue)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.8}>
          <Text style={styles.cartButtonText}>Koszyk</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Sklep internetowy</Text>

      <TouchableOpacity
        style={[styles.menuCard, styles.shopCard]}
        onPress={() => navigation.navigate('Items')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Przeglądaj produkty</Text>
          <Text style={styles.menuDescription}>
            Lista produktów sklepu: drukarki 3D, filamenty, stoły robocze,
            części, dysze i narzędzia.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuCard, styles.cartCard]}
        onPress={() => navigation.navigate('Cart')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Koszyk i zamówienie</Text>
          <Text style={styles.menuDescription}>
            Sprawdź wybrane produkty, wpisz dane klienta i złóż zamówienie.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Administracja</Text>

      <TouchableOpacity
        style={[styles.menuCard, styles.adminCard]}
        onPress={() => navigation.navigate('AdminPanel')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Panel administracyjny</Text>
          <Text style={styles.menuDescription}>
            Zarządzanie produktami, kategoriami, klientami, pracownikami,
            zamówieniami i raportami sprzedaży.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Logika aplikacji</Text>

        <Text style={styles.infoText}>
          Ekran główny pokazuje prostą część sklepową dla klienta. Wszystkie
          funkcje zarządzania sklepem są przeniesione do osobnego panelu
          administracyjnego.
        </Text>
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
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  appName: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  title: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  cartSummaryBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  cartSummaryTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },

  cartSummaryText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },

  cartButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  cartButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },

  menuCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  shopCard: {
    borderColor: '#16a34a',
  },

  cartCard: {
    borderColor: '#f97316',
  },

  adminCard: {
    borderColor: '#38bdf8',
  },

  menuTextBox: {
    flex: 1,
  },

  menuTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 5,
  },

  menuDescription: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },

  menuArrow: {
    color: '#f97316',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 12,
  },

  infoBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 4,
  },

  infoTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },

  infoText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
  },
});

export default HomeScreen;