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
          Aplikacja mobilna do zarządzania produktami, akcesoriami,
          kategoriami i zamówieniami w sklepie z drukarkami 3D.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>aktywny moduł CRUD</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>planowanych klas</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Moduły aplikacji</Text>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate('Items')}
        activeOpacity={0.8}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Produkty</Text>
          <Text style={styles.menuDescription}>
            Drukarki 3D, filamenty, części zamienne i akcesoria.
          </Text>
        </View>

        <Text style={styles.menuArrow}>{'>'}</Text>
      </TouchableOpacity>

      <View style={styles.menuCardDisabled}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Kategorie</Text>
          <Text style={styles.menuDescription}>
            Docelowo kategorie produktów, np. drukarki, filamenty, części.
          </Text>
        </View>

        <Text style={styles.disabledText}>wkrótce</Text>
      </View>

      <View style={styles.menuCardDisabled}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Jednostki miary</Text>
          <Text style={styles.menuDescription}>
            Docelowo sztuki, kilogramy, rolki i zestawy.
          </Text>
        </View>

        <Text style={styles.disabledText}>wkrótce</Text>
      </View>

      <View style={styles.menuCardDisabled}>
        <View style={styles.menuTextBox}>
          <Text style={styles.menuTitle}>Zamówienia</Text>
          <Text style={styles.menuDescription}>
            Docelowo obsługa zamówień klientów i pozycji zamówienia.
          </Text>
        </View>

        <Text style={styles.disabledText}>wkrótce</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Plan rozbudowy</Text>

        <Text style={styles.infoText}>
          Projekt będzie rozwijany etapami: najpierw layout, potem CRUD dla
          kolejnych klas, a następnie relacje z kluczami obcymi.
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

  menuCardDisabled: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 0.55,
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

  disabledText: {
    color: '#f97316',
    fontSize: 12,
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