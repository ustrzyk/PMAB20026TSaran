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

      <Text style={styles.sectionTitle}>Panel administracyjny</Text>

      <TouchableOpacity
        style={[styles.menuCard, styles.dashboardCard]}
        onPress={() => navigation.navigate('Dashboard')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Dashboard</Text>
          <Text style={styles.menuDescription}>
            Raporty sklepu: sprzedaż, TOP produkty, niskie stany magazynowe i
            najnowsze zamówienia.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuCard, styles.adminProductsCard]}
        onPress={() => navigation.navigate('AdminItems')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Produkty - administracja</Text>
          <Text style={styles.menuDescription}>
            Dodawanie, edycja i usuwanie produktów oraz kontrola stanów
            magazynowych.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate('Categories')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Kategorie</Text>
          <Text style={styles.menuDescription}>
            Zarządzanie kategoriami asortymentu sklepu.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate('Units')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Jednostki miary</Text>
          <Text style={styles.menuDescription}>
            Jednostki używane przy produktach i stanach magazynowych.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate('Clients')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Klienci</Text>
          <Text style={styles.menuDescription}>
            Klienci utworzeni ręcznie lub automatycznie podczas składania
            zamówienia.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate('Workers')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Pracownicy</Text>
          <Text style={styles.menuDescription}>
            Pracownicy obsługujący zamówienia w sklepie.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate('Orders')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Zamówienia</Text>
          <Text style={styles.menuDescription}>
            Lista zamówień z klientem, pracownikiem, pozycjami i wartością.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate('OrderItems')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Pozycje zamówienia</Text>
          <Text style={styles.menuDescription}>
            Produkty przypisane do zamówień przez relację wiele do wiele.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Logika aplikacji</Text>

        <Text style={styles.infoText}>
          Część sklepowa pozwala klientowi dodać produkty do koszyka i złożyć
          zamówienie. Część administracyjna pozwala zarządzać danymi i
          analizować sprzedaż.
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

  dashboardCard: {
    borderColor: '#38bdf8',
  },

  adminProductsCard: {
    borderColor: '#a855f7',
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