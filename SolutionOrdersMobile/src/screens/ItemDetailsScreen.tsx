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

type Props = NativeStackScreenProps<RootStackParamList, 'ItemDetails'>;

function ItemDetailsScreen({navigation, route}: Props): React.JSX.Element {
  const {item} = route.params;

  const price = item.price ?? 0;
  const quantity = item.quantity ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroBox}>
        <Text style={styles.appName}>3D Print Shop</Text>

        <Text style={styles.title}>{item.name ?? 'Szczegóły produktu'}</Text>

        <Text style={styles.subtitle}>
          Dane produktu dostępnego w sklepie z drukarkami 3D i akcesoriami.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dane produktu</Text>

        <Text style={styles.label}>Nazwa</Text>
        <Text style={styles.value}>{item.name ?? 'Brak nazwy'}</Text>

        <Text style={styles.label}>Opis</Text>
        <Text style={styles.description}>
          {item.description ?? 'Brak opisu produktu'}
        </Text>

        <View style={styles.row}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Cena</Text>
            <Text style={styles.price}>{price.toFixed(2)} zł</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Stan</Text>
            <Text style={styles.value}>
              {quantity} {item.unitName ?? 'szt'}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Kategoria</Text>
        <Text style={styles.value}>{item.categoryName ?? 'Brak kategorii'}</Text>

        <Text style={styles.label}>Jednostka miary</Text>
        <Text style={styles.value}>{item.unitName ?? 'Brak jednostki'}</Text>

        <Text style={styles.label}>Kod produktu</Text>
        <Text style={styles.value}>{item.code ?? 'Brak kodu'}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>
          {item.isActive ? 'Aktywny' : 'Nieaktywny'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditItem', {item})}
        activeOpacity={0.8}>
        <Text style={styles.editButtonText}>Edytuj produkt</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}>
        <Text style={styles.backButtonText}>Wróć</Text>
      </TouchableOpacity>
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
    fontSize: 25,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },

  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  value: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },

  description: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 21,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  infoBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },

  price: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '900',
  },

  editButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  backButton: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ItemDetailsScreen;