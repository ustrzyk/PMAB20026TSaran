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
  const {user, isAdmin, logout} = useAuth();

  const roleName = isAdmin ? 'Administrator' : 'Pracownik';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroBox}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextBox}>
            <Text style={styles.appName}>3D Print Shop</Text>
            <Text style={styles.title}>Panel pracownika</Text>
            <Text style={styles.userText}>
              {user?.name ?? roleName} | {roleName}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
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
          <Text style={styles.bigDescription}>Sprzedaż, magazyn i raporty</Text>
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
          <Text style={styles.sectionTitle}>Administracja</Text>

          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.menuCard, styles.adminCard]}
              onPress={() => navigation.navigate('Workers')}
              activeOpacity={0.85}>
              <Text style={styles.icon}>🛠️</Text>
              <Text style={styles.menuTitle}>Pracownicy</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.85}>
        <Text style={styles.shopButtonText}>Przejdź do sklepu</Text>
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

  adminCard: {
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

  shopButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },

  shopButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default AdminPanelScreen;