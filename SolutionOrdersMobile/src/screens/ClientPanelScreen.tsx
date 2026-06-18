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

type Props = NativeStackScreenProps<RootStackParamList, 'ClientPanel'>;

function formatMoney(value?: number | null): string {
  const safeValue = value ?? 0;

  return `${safeValue.toFixed(2)} zł`;
}

function ClientPanelScreen({navigation}: Props): React.JSX.Element {
  const {user, isCustomer, isAdmin, isWorker, logout} = useAuth();
  const {totalQuantity, totalValue} = useCart();

  const hasAddress = !!user?.adress && user.adress.trim().length > 0;
  const hasPhone = !!user?.phoneNumber && user.phoneNumber.trim().length > 0;

  const handleLogout = (): void => {
    logout();

    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  const handleBackPress = (): void => {
    if (isAdmin || isWorker) {
      navigation.reset({
        index: 0,
        routes: [{name: 'AdminPanel'}],
      });

      return;
    }

    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  if (!isCustomer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.lockIcon}>👤</Text>

        <Text style={styles.accessTitle}>Moje konto</Text>

        <TouchableOpacity
          style={styles.primaryAccessButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: 'AuthLogin'}],
            })
          }
          activeOpacity={0.85}>
          <Text style={styles.primaryAccessButtonText}>Zaloguj się</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryAccessButton}
          onPress={handleBackPress}
          activeOpacity={0.85}>
          <Text style={styles.secondaryAccessButtonText}>
            {isAdmin || isWorker ? 'Panel obsługi' : 'Sklep'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroBox}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextBox}>
            <Text style={styles.appName}>3D Print Shop</Text>
            <Text style={styles.title}>Moje konto</Text>
            <Text style={styles.userText}>{user?.name}</Text>
            <Text style={styles.emailText}>{user?.login}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}>
            <Text style={styles.logoutButtonText}>Wyloguj</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cartBox}>
        <View style={styles.cartTextBox}>
          <Text style={styles.cartTitle}>Koszyk</Text>

          <Text style={styles.cartValue}>
            {totalQuantity} szt. | {formatMoney(totalValue)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.85}>
          <Text style={styles.cartButtonText}>Otwórz</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainGrid}>
        <TouchableOpacity
          style={[styles.mainCard, styles.shopCard]}
          onPress={() => navigation.navigate('Items')}
          activeOpacity={0.85}>
          <Text style={styles.mainIcon}>🛍️</Text>
          <Text style={styles.mainTitle}>Sklep</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainCard, styles.ordersCard]}
          onPress={() => navigation.navigate('CustomerOrders')}
          activeOpacity={0.85}>
          <Text style={styles.mainIcon}>📋</Text>
          <Text style={styles.mainTitle}>Zamówienia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainCard, styles.statusCard]}
          onPress={() => navigation.navigate('TrackOrder')}
          activeOpacity={0.85}>
          <Text style={styles.mainIcon}>📦</Text>
          <Text style={styles.mainTitle}>Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainCard, styles.profileCard]}
          onPress={() => navigation.navigate('CustomerProfile')}
          activeOpacity={0.85}>
          <Text style={styles.mainIcon}>👤</Text>
          <Text style={styles.mainTitle}>Dane</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deliveryBox}>
        <View style={styles.deliveryHeaderRow}>
          <Text style={styles.deliveryTitle}>Dostawa</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('CustomerProfile')}
            activeOpacity={0.85}>
            <Text style={styles.editButtonText}>Edytuj</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.deliveryRow}>
          <Text style={styles.deliveryLabel}>Adres</Text>
          <Text style={styles.deliveryValue}>
            {hasAddress ? user?.adress : 'Brak adresu'}
          </Text>
        </View>

        <View style={styles.deliveryRowLast}>
          <Text style={styles.deliveryLabel}>Telefon</Text>
          <Text style={styles.deliveryValue}>
            {hasPhone ? user?.phoneNumber : 'Brak telefonu'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.85}>
        <Text style={styles.homeButtonText}>Strona główna</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  lockIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  accessTitle: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 18,
  },

  primaryAccessButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 10,
  },

  primaryAccessButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  secondaryAccessButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  secondaryAccessButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
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

  heroTextBox: {
    flex: 1,
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
    fontSize: 26,
    fontWeight: '900',
  },

  userText: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 12,
  },

  emailText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
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
    borderColor: '#334155',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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

  cartValue: {
    color: '#f97316',
    fontSize: 15,
    fontWeight: '900',
  },

  cartButton: {
    backgroundColor: '#f97316',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  cartButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  mainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },

  mainCard: {
    width: '48%',
    minHeight: 105,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    justifyContent: 'center',
  },

  shopCard: {
    borderColor: '#16a34a',
  },

  ordersCard: {
    borderColor: '#a855f7',
  },

  statusCard: {
    borderColor: '#38bdf8',
  },

  profileCard: {
    borderColor: '#f97316',
  },

  mainIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  mainTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },

  deliveryBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  deliveryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  deliveryTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
  },

  editButton: {
    backgroundColor: '#2563eb',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  editButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  deliveryRow: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 8,
  },

  deliveryRowLast: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  deliveryLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  deliveryValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
  },

  homeButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  homeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default ClientPanelScreen;