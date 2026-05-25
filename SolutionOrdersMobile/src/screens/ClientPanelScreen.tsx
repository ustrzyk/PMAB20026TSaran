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

  const handleLogout = (): void => {
    logout();

    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  const handlePanelPress = (): void => {
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
        <Text style={styles.accessTitle}>Panel klienta</Text>
        <Text style={styles.accessText}>
          Ten ekran jest dostępny po zalogowaniu albo rejestracji konta klienta.
        </Text>

        <TouchableOpacity
          style={styles.primaryAccessButton}
          onPress={() =>
            navigation.reset({index: 0, routes: [{name: 'AuthLogin'}]})
          }
          activeOpacity={0.85}>
          <Text style={styles.primaryAccessButtonText}>Zaloguj</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryAccessButton}
          onPress={handlePanelPress}
          activeOpacity={0.85}>
          <Text style={styles.secondaryAccessButtonText}>
            {isAdmin || isWorker ? 'Panel pracownika' : 'Wróć do sklepu'}
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
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}>
            <Text style={styles.logoutButtonText}>Wyloguj</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.userText}>{user?.name}</Text>
        <Text style={styles.emailText}>{user?.login}</Text>
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

      <Text style={styles.sectionTitle}>Szybkie akcje</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.actionCard, styles.shopCard]}
          onPress={() => navigation.navigate('Items')}
          activeOpacity={0.85}>
          <Text style={styles.actionIcon}>🖨️</Text>
          <Text style={styles.actionTitle}>Sklep</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.cartCard]}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.85}>
          <Text style={styles.actionIcon}>🛒</Text>
          <Text style={styles.actionTitle}>Koszyk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.orderCard]}
          onPress={() => navigation.navigate('TrackOrder')}
          activeOpacity={0.85}>
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionTitle}>Zamówienie</Text>
        </TouchableOpacity>
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
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  accessText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 24,
    fontWeight: '900',
  },

  userText: {
    color: '#f8fafc',
    fontSize: 16,
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
    minHeight: 118,
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
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },

  homeButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },

  homeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default ClientPanelScreen;