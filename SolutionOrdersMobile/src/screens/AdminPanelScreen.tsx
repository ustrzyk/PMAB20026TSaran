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

type Props = NativeStackScreenProps<RootStackParamList, 'AdminPanel'>;

function AdminPanelScreen({navigation}: Props): React.JSX.Element {
  const {user, isAdmin, isWorker, logout} = useAuth();

  const hasAccess = isAdmin || isWorker;

  const handleLogout = (): void => {
    logout();

    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  if (!hasAccess) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.lockIcon}>🔒</Text>

        <Text style={styles.accessTitle}>Zaloguj się</Text>

        <Text style={styles.accessText}>
          Zaloguj się, aby przejść dalej.
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
          <Text style={styles.primaryAccessButtonText}>Zaloguj</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryAccessButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: 'Home'}],
            })
          }
          activeOpacity={0.85}>
          <Text style={styles.secondaryAccessButtonText}>Wróć do sklepu</Text>
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

            <Text style={styles.title}>Panel obsługi</Text>

            <Text style={styles.userText}>
              {user?.name ?? 'Zalogowany użytkownik'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}>
            <Text style={styles.logoutButtonText}>Wyloguj</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.bigCard, styles.dashboardCard]}
        onPress={() => navigation.navigate('Dashboard')}
        activeOpacity={0.85}>
        <Text style={styles.bigIcon}>📊</Text>

        <View style={styles.bigTextBox}>
          <Text style={styles.bigTitle}>Dashboard</Text>
          <Text style={styles.bigDescription}>
            Podsumowanie sprzedaży, zamówień i magazynu
          </Text>
        </View>

        <Text style={styles.arrow}>{'>'}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Sprzedaż</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.menuCard, styles.salesCard]}
          onPress={() => navigation.navigate('Orders')}
          activeOpacity={0.85}>
          <Text style={styles.icon}>📦</Text>
          <Text style={styles.menuTitle}>Zamówienia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, styles.salesCard]}
          onPress={() => navigation.navigate('OrderItems')}
          activeOpacity={0.85}>
          <Text style={styles.icon}>🧾</Text>
          <Text style={styles.menuTitle}>Pozycje</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, styles.salesCard]}
          onPress={() => navigation.navigate('Clients')}
          activeOpacity={0.85}>
          <Text style={styles.icon}>👥</Text>
          <Text style={styles.menuTitle}>Klienci</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Asortyment</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.menuCard, styles.stockCard]}
          onPress={() => navigation.navigate('AdminItems')}
          activeOpacity={0.85}>
          <Text style={styles.icon}>🖨️</Text>
          <Text style={styles.menuTitle}>Produkty</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, styles.stockCard]}
          onPress={() => navigation.navigate('Categories')}
          activeOpacity={0.85}>
          <Text style={styles.icon}>🏷️</Text>
          <Text style={styles.menuTitle}>Kategorie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, styles.stockCard]}
          onPress={() => navigation.navigate('Units')}
          activeOpacity={0.85}>
          <Text style={styles.icon}>📏</Text>
          <Text style={styles.menuTitle}>Jednostki</Text>
        </TouchableOpacity>
      </View>

      {isAdmin ? (
        <>
          <Text style={styles.sectionTitle}>Zespół</Text>

          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.menuCard, styles.teamCard]}
              onPress={() => navigation.navigate('Workers')}
              activeOpacity={0.85}>
              <Text style={styles.icon}>🛠️</Text>
              <Text style={styles.menuTitle}>Pracownicy</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Skróty</Text>

      <View style={styles.shortcutList}>
        <TouchableOpacity
          style={styles.shortcutRow}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}>
          <Text style={styles.shortcutIcon}>🏠</Text>

          <View style={styles.shortcutTextBox}>
            <Text style={styles.shortcutTitle}>Strona główna</Text>
            <Text style={styles.shortcutText}>Powrót do ekranu startowego</Text>
          </View>

          <Text style={styles.shortcutArrow}>{'>'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutRow}
          onPress={() => navigation.navigate('Items')}
          activeOpacity={0.85}>
          <Text style={styles.shortcutIcon}>🛍️</Text>

          <View style={styles.shortcutTextBox}>
            <Text style={styles.shortcutTitle}>Widok sklepu</Text>
            <Text style={styles.shortcutText}>Podgląd produktów dla klienta</Text>
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
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
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

  bigCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  dashboardCard: {
    borderColor: '#38bdf8',
  },

  bigIcon: {
    fontSize: 38,
  },

  bigTextBox: {
    flex: 1,
  },

  bigTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },

  bigDescription: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  arrow: {
    color: '#f97316',
    fontSize: 22,
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
    marginBottom: 18,
  },

  menuCard: {
    width: '30.8%',
    minHeight: 120,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  salesCard: {
    borderColor: '#f97316',
  },

  stockCard: {
    borderColor: '#16a34a',
  },

  teamCard: {
    borderColor: '#a855f7',
  },

  icon: {
    fontSize: 33,
    marginBottom: 8,
  },

  menuTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
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

export default AdminPanelScreen;