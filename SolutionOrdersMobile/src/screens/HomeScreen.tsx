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

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function HomeScreen({navigation}: Props): React.JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroBox}>
        <Text style={styles.appName}>3D Print Shop</Text>

        <Text style={styles.title}>Sklep z drukarkami 3D</Text>

        <Text style={styles.subtitle}>
          Mobilny panel sklepu do obsługi produktów, drukarek 3D, filamentów,
          części zamiennych i akcesoriów.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3D</Text>
          <Text style={styles.statLabel}>drukarki i akcesoria</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>API</Text>
          <Text style={styles.statLabel}>połączenie z backendem</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Menu główne</Text>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate('Items')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Produkty</Text>
          <Text style={styles.menuDescription}>
            Lista produktów sklepu: drukarki 3D, filamenty, części i akcesoria.
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
            Kategorie asortymentu sklepu z drukarkami 3D.
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
            Lista klientów sklepu i dane kontaktowe do zamówień.
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
            Pracownicy obsługujący zamówienia i panel sklepu.
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
            Zamówienia klientów z przypisanym klientem i pracownikiem.
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
            Produkty dodane do zamówień wraz z ilościami.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Informacje</Text>

        <Text style={styles.infoText}>
          Aplikacja służy do zarządzania asortymentem sklepu związanego z
          drukiem 3D. Dane są pobierane z API.
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

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },

  statValue: {
    color: '#f97316',
    fontSize: 28,
    fontWeight: '900',
  },

  statLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 4,
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