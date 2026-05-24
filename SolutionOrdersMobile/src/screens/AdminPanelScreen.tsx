import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../navigation/types.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminPanel'>;

function AdminPanelScreen({navigation}: Props): React.JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroBox}>
        <Text style={styles.appName}>3D Print Shop</Text>

        <Text style={styles.title}>Panel administracyjny</Text>

        <Text style={styles.subtitle}>
          Zarządzanie sklepem, produktami, kategoriami, klientami,
          zamówieniami oraz raportami sprzedaży.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Raporty</Text>

      <TouchableOpacity
        style={[styles.menuCard, styles.dashboardCard]}
        onPress={() => navigation.navigate('Dashboard')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Dashboard</Text>
          <Text style={styles.menuDescription}>
            Raporty sklepu: sprzedaż, TOP produkty, niskie stany magazynowe,
            sprzedaż według kategorii i najnowsze zamówienia.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Zarządzanie asortymentem</Text>

      <TouchableOpacity
        style={[styles.menuCard, styles.productsCard]}
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
            Zarządzanie kategoriami produktów, np. drukarki 3D, filamenty,
            dysze, części i akcesoria.
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
            Jednostki używane przy produktach i magazynie, np. sztuki,
            kilogramy albo rolki.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Obsługa sprzedaży</Text>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate('Clients')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Klienci</Text>
          <Text style={styles.menuDescription}>
            Klienci utworzeni ręcznie lub automatycznie podczas finalizacji
            koszyka.
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
            Pracownicy przypisywani do obsługi zamówień składanych w sklepie.
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
            Lista zamówień z klientem, pracownikiem, datą dostawy, notatką i
            wartością.
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
            Produkty przypisane do zamówień przez tabelę pośrednią OrderItem.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Po co ten ekran?</Text>

        <Text style={styles.infoText}>
          Ekran sklepu jest przeznaczony dla klienta, a ten panel jest dla
          właściciela lub pracownika sklepu. Dzięki temu aplikacja ma logiczny
          podział na część zakupową i administracyjną.
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

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
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

  dashboardCard: {
    borderColor: '#38bdf8',
  },

  productsCard: {
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

export default AdminPanelScreen;