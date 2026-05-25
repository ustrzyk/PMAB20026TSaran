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

import type {RootStackParamList} from '../navigation/types.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSuccess'>;

function formatMoney(value?: number | null): string {
  const safeValue = value ?? 0;

  return `${safeValue.toFixed(2)} zł`;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return 'Brak daty';
  }

  return value.substring(0, 10);
}

function OrderSuccessScreen({navigation, route}: Props): React.JSX.Element {
  const {isAdmin, isWorker, isCustomer} = useAuth();

  const {
    idOrder,
    totalValue,
    message,
    deliveryPrice,
    finalValue,
    deliveryMethod,
    paymentMethod,
    deliveryDate,
  } = route.params;

  const safeDeliveryPrice = deliveryPrice ?? 0;
  const safeFinalValue = finalValue ?? totalValue + safeDeliveryPrice;

  const goHome = (): void => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  const goToCustomerPanel = (): void => {
    navigation.reset({
      index: 0,
      routes: [{name: 'ClientPanel'}],
    });
  };

  const goToAdminPanel = (): void => {
    navigation.reset({
      index: 0,
      routes: [{name: 'AdminPanel'}],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.successBox}>
        <Text style={styles.successIcon}>✓</Text>

        <Text style={styles.title}>Zamówienie złożone</Text>

        <Text style={styles.subtitle}>
          Numer zamówienia zapisz albo użyj przycisku sprawdzenia statusu.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Podsumowanie</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Numer zamówienia</Text>
          <Text style={styles.orderNumber}>#{idOrder}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>
            {message ?? 'Zamówienie zostało złożone'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Wartość produktów</Text>
          <Text style={styles.productValue}>{formatMoney(totalValue)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dostawa</Text>
          <Text style={styles.deliveryValue}>
            {formatMoney(safeDeliveryPrice)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Razem do zapłaty</Text>
          <Text style={styles.finalValue}>{formatMoney(safeFinalValue)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dostawa i płatność</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Metoda dostawy</Text>
          <Text style={styles.infoValue}>
            {deliveryMethod ?? 'Brak informacji'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Metoda płatności</Text>
          <Text style={styles.infoValue}>
            {paymentMethod ?? 'Brak informacji'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Przewidywana data dostawy</Text>
          <Text style={styles.infoValue}>{formatDate(deliveryDate)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.trackButton}
        onPress={() =>
          navigation.navigate('TrackOrder', {
            idOrder,
          })
        }
        activeOpacity={0.8}>
        <Text style={styles.trackButtonText}>Sprawdź to zamówienie</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Items')}
        activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>Kontynuuj zakupy</Text>
      </TouchableOpacity>

      {isCustomer ? (
        <TouchableOpacity
          style={styles.customerButton}
          onPress={goToCustomerPanel}
          activeOpacity={0.8}>
          <Text style={styles.customerButtonText}>Moje konto</Text>
        </TouchableOpacity>
      ) : null}

      {isAdmin || isWorker ? (
        <TouchableOpacity
          style={styles.adminButton}
          onPress={goToAdminPanel}
          activeOpacity={0.8}>
          <Text style={styles.adminButtonText}>Panel pracownika</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={goHome}
        activeOpacity={0.8}>
        <Text style={styles.secondaryButtonText}>Strona główna</Text>
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

  productValue: {
    color: '#f97316',
    fontSize: 20,
    fontWeight: '900',
  },

  deliveryValue: {
    color: '#38bdf8',
    fontSize: 20,
    fontWeight: '900',
  },

  finalValue: {
    color: '#16a34a',
    fontSize: 24,
    fontWeight: '900',
  },

  infoValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
  },

  trackButton: {
    backgroundColor: '#38bdf8',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  trackButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '900',
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

  customerButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  customerButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  adminButton: {
    backgroundColor: '#a855f7',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  adminButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  secondaryButton: {
    backgroundColor: '#334155',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default OrderSuccessScreen;