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
  const deliveryReady = hasAddress && hasPhone;

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

        <Text style={styles.accessText}>
          Zaloguj się albo utwórz konto, aby zobaczyć swoje zamówienia i dane
          dostawy.
        </Text>

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
            {isAdmin || isWorker ? 'Panel obsługi' : 'Wróć do sklepu'}
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

      <View style={deliveryReady ? styles.readyBox : styles.warningBox}>
        <Text style={deliveryReady ? styles.readyTitle : styles.warningTitle}>
          {deliveryReady ? 'Konto gotowe do zakupów' : 'Uzupełnij dane dostawy'}
        </Text>

        <Text style={deliveryReady ? styles.readyText : styles.warningText}>
          {deliveryReady
            ? 'Adres i telefon są zapisane. Przy zamówieniu będzie szybciej.'
            : 'Dodaj adres i telefon, żeby łatwiej składać zamówienia.'}
        </Text>

        <TouchableOpacity
          style={deliveryReady ? styles.readyButton : styles.warningButton}
          onPress={() => navigation.navigate('CustomerProfile')}
          activeOpacity={0.85}>
          <Text style={styles.statusButtonText}>
            {deliveryReady ? 'Zobacz dane' : 'Uzupełnij teraz'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cartBox}>
        <View style={styles.cartIconBox}>
          <Text style={styles.cartIcon}>🛒</Text>
        </View>

        <View style={styles.cartTextBox}>
          <Text style={styles.cartTitle}>Twój koszyk</Text>

          <Text style={styles.cartValue}>
            {totalQuantity} szt. | {formatMoney(totalValue)}
          </Text>

          <Text style={styles.cartHint}>
            {totalQuantity > 0
              ? 'Możesz przejść do koszyka i złożyć zamówienie.'
              : 'Koszyk jest pusty. Przejdź do sklepu i dodaj produkty.'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.85}>
          <Text style={styles.cartButtonText}>Otwórz</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Najczęściej używane</Text>

      <View style={styles.mainGrid}>
        <TouchableOpacity
          style={[styles.mainCard, styles.shopCard]}
          onPress={() => navigation.navigate('Items')}
          activeOpacity={0.85}>
          <Text style={styles.mainIcon}>🛍️</Text>
          <Text style={styles.mainTitle}>Sklep</Text>
          <Text style={styles.mainText}>Produkty i kategorie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainCard, styles.ordersCard]}
          onPress={() => navigation.navigate('CustomerOrders')}
          activeOpacity={0.85}>
          <Text style={styles.mainIcon}>📋</Text>
          <Text style={styles.mainTitle}>Zamówienia</Text>
          <Text style={styles.mainText}>Historia i statusy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainCard, styles.statusCard]}
          onPress={() => navigation.navigate('TrackOrder')}
          activeOpacity={0.85}>
          <Text style={styles.mainIcon}>📦</Text>
          <Text style={styles.mainTitle}>Status</Text>
          <Text style={styles.mainText}>Sprawdź numer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainCard, styles.profileCard]}
          onPress={() => navigation.navigate('CustomerProfile')}
          activeOpacity={0.85}>
          <Text style={styles.mainIcon}>👤</Text>
          <Text style={styles.mainTitle}>Dane</Text>
          <Text style={styles.mainText}>Adres i konto</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deliveryBox}>
        <View style={styles.deliveryHeaderRow}>
          <Text style={styles.deliveryTitle}>Dane dostawy</Text>

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

        <View style={styles.deliveryRow}>
          <Text style={styles.deliveryLabel}>Telefon</Text>
          <Text style={styles.deliveryValue}>
            {hasPhone ? user?.phoneNumber : 'Brak telefonu'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Skróty</Text>

      <View style={styles.shortcutList}>
        <TouchableOpacity
          style={styles.shortcutRow}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}>
          <Text style={styles.shortcutIcon}>🏠</Text>
          <View style={styles.shortcutTextBox}>
            <Text style={styles.shortcutTitle}>Strona główna</Text>
            <Text style={styles.shortcutText}>Wróć do ekranu startowego</Text>
          </View>
          <Text style={styles.shortcutArrow}>{'>'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutRow}
          onPress={() => navigation.navigate('Items')}
          activeOpacity={0.85}>
          <Text style={styles.shortcutIcon}>🖨️</Text>
          <View style={styles.shortcutTextBox}>
            <Text style={styles.shortcutTitle}>Produkty</Text>
            <Text style={styles.shortcutText}>Przeglądaj ofertę sklepu</Text>
          </View>
          <Text style={styles.shortcutArrow}>{'>'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutRow}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.85}>
          <Text style={styles.shortcutIcon}>🛒</Text>
          <View style={styles.shortcutTextBox}>
            <Text style={styles.shortcutTitle}>Koszyk</Text>
            <Text style={styles.shortcutText}>Przejdź do zamówienia</Text>
          </View>
          <Text style={styles.shortcutArrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>
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

  readyBox: {
    backgroundColor: '#052e16',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 14,
  },

  warningBox: {
    backgroundColor: '#431407',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 14,
  },

  readyTitle: {
    color: '#bbf7d0',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 5,
  },

  warningTitle: {
    color: '#fed7aa',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 5,
  },

  readyText: {
    color: '#bbf7d0',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 12,
  },

  warningText: {
    color: '#fed7aa',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 12,
  },

  readyButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },

  warningButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },

  statusButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  cartBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  cartIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cartIcon: {
    fontSize: 28,
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
    marginBottom: 3,
  },

  cartHint: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
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

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },

  mainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },

  mainCard: {
    width: '48%',
    minHeight: 130,
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
    marginBottom: 4,
  },

  mainText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  deliveryBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 18,
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

  shortcutList: {
    gap: 10,
  },

  shortcutRow: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  shortcutIcon: {
    fontSize: 26,
  },

  shortcutTextBox: {
    flex: 1,
  },

  shortcutTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 3,
  },

  shortcutText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },

  shortcutArrow: {
    color: '#f97316',
    fontSize: 20,
    fontWeight: '900',
  },
});

export default ClientPanelScreen;