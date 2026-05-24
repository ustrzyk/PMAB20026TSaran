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

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSuccess'>;

function formatMoney(value?: number | null): string {
  const safeValue = value ?? 0;

  return `${safeValue.toFixed(2)} zł`;
}

function OrderSuccessScreen({navigation, route}: Props): React.JSX.Element {
  const {idOrder, totalValue, message} = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.successBox}>
        <Text style={styles.successIcon}>✓</Text>

        <Text style={styles.title}>Dziękujemy za zamówienie</Text>

        <Text style={styles.subtitle}>
          Twoje zamówienie zostało poprawnie zapisane w systemie sklepu.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Podsumowanie</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Numer zamówienia</Text>
          <Text style={styles.orderNumber}>#{idOrder}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Wartość zamówienia</Text>
          <Text style={styles.orderValue}>{formatMoney(totalValue)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>
            {message ?? 'Zamówienie zostało złożone'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Co dalej?</Text>

        <Text style={styles.description}>
          Zamówienie pojawi się w panelu administracyjnym. Pracownik sklepu może
          je sprawdzić, zobaczyć klienta, pozycje zamówienia oraz wartość.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Items')}
        activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>Kontynuuj zakupy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}>
        <Text style={styles.secondaryButtonText}>Wróć na stronę główną</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.adminButton}
        onPress={() => navigation.navigate('Orders')}
        activeOpacity={0.8}>
        <Text style={styles.adminButtonText}>
          Zobacz zamówienia w panelu admina
        </Text>
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

  successBox: {
    backgroundColor: '#052e16',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#16a34a',
    alignItems: 'center',
    marginBottom: 14,
  },

  successIcon: {
    color: '#bbf7d0',
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 8,
  },

  title: {
    color: '#dcfce7',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
  },

  subtitle: {
    color: '#bbf7d0',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },

  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },

  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingVertical: 10,
  },

  infoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  orderNumber: {
    color: '#f97316',
    fontSize: 24,
    fontWeight: '900',
  },

  orderValue: {
    color: '#16a34a',
    fontSize: 22,
    fontWeight: '900',
  },

  infoValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
  },

  description: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  secondaryButton: {
    backgroundColor: '#f97316',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  adminButton: {
    backgroundColor: '#334155',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  adminButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default OrderSuccessScreen;