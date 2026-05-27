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

  const roleName = isAdmin ? 'Administrator' : 'Pracownik';
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

        <Text style={styles.accessTitle}>Brak dostępu</Text>

        <Text style={styles.accessText}>
          Panel pracownika jest dostępny tylko po zalogowaniu jako pracownik albo
          administrator.
        </Text>

        <TouchableOpacity
          style={styles.primaryAccessButton}
          onPress={() => navigation.reset({index: 0, routes: [{name: 'Home'}]})}
          activeOpacity={0.85}>
          <Text style={styles.primaryAccessButtonText}>Wróć do sklepu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryAccessButton}
          onPress={() =>
            navigation.reset({index: 0, routes: [{name: 'AuthLogin'}]})
          }
          activeOpacity={0.85}>
          <Text style={styles.secondaryAccessButtonText}>Zaloguj</Text>
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
            <Text style={styles.title}>Panel pracownika</Text>

            <Text style={styles.userText}>
              {user?.name ?? roleName} | {roleName}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}>
            <Text style={styles.logoutButtonText}>Wyloguj</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.roleBox}>
          <Text style={styles.roleLabel}>Uprawnienia</Text>

          <Text style={styles.roleText}>
            {isAdmin
              ? 'Administrator może zarządzać całym sklepem, zamówieniami, pracownikami i danymi słownikowymi.'
              : 'Pracownik może obsługiwać produkty, klientów, zamówienia i pozycje zamówień.'}
          </Text>
        </View>
      </View>

      <View style={styles.priorityBox}>
        <Text style={styles.priorityTitle}>Najważniejsze zadania</Text>

        <Text style={styles.priorityText}>
          Zacznij od Dashboardu, sprawdź nowe zamówienia, zmień ich status i
          dopilnuj stanów magazynowych.
        </Text>

        <View style={styles.priorityButtons}>
          <TouchableOpacity
            style={styles.priorityButton}
            onPress={() => navigation.navigate('Dashboard')}
            activeOpacity={0.85}>
            <Text style={styles.priorityButtonText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.priorityButtonSecondary}
            onPress={() => navigation.navigate('Orders')}
            activeOpacity={0.85}>
            <Text style={styles.priorityButtonText}>Zamówienia</Text>
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
            Sprzedaż, magazyn, statusy zamówień, najnowsze zamówienia i TOP
            produkty.
          </Text>
        </View>

        <Text style={styles.arrow}>{'>'}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Obsługa zamówień</Text>

      <View style={styles.wideGrid}>
        <TouchableOpacity
          style={[styles.wideCard, styles.salesCard]}
          onPress={() => navigation.navigate('Orders')}
          activeOpacity={0.85}>
          <Text style={styles.wideIcon}>📦</Text>

          <View style={styles.wideTextBox}>
            <Text style={styles.wideTitle}>Zamówienia</Text>
            <Text style={styles.wideDescription}>
              Lista, filtry, statusy, szybka zmiana etapu i edycja zamówień.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.wideCard, styles.salesCard]}
          onPress={() => navigation.navigate('OrderItems')}
          activeOpacity={0.85}>
          <Text style={styles.wideIcon}>🧾</Text>

          <View style={styles.wideTextBox}>
            <Text style={styles.wideTitle}>Pozycje zamówień</Text>
            <Text style={styles.wideDescription}>
              Produkty przypisane do zamówień, ilości i wartości pozycji.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.wideCard, styles.salesCard]}
          onPress={() => navigation.navigate('Clients')}
          activeOpacity={0.85}>
          <Text style={styles.wideIcon}>👥</Text>

          <View style={styles.wideTextBox}>
            <Text style={styles.wideTitle}>Klienci</Text>
            <Text style={styles.wideDescription}>
              Lista klientów, dane kontaktowe, adresy i aktywność kont.
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.workflowBox}>
        <Text style={styles.workflowTitle}>Proces realizacji zamówienia</Text>

        <View style={styles.workflowStep}>
          <Text style={styles.workflowNumber}>1</Text>
          <View style={styles.workflowTextBox}>
            <Text style={styles.workflowStepTitle}>Nowe</Text>
            <Text style={styles.workflowStepText}>
              Zamówienie zostało złożone i czeka na obsługę.
            </Text>
          </View>
        </View>

        <View style={styles.workflowStep}>
          <Text style={styles.workflowNumber}>2</Text>
          <View style={styles.workflowTextBox}>
            <Text style={styles.workflowStepTitle}>W realizacji</Text>
            <Text style={styles.workflowStepText}>
              Pracownik przygotowuje produkty albo wydruk.
            </Text>
          </View>
        </View>

        <View style={styles.workflowStep}>
          <Text style={styles.workflowNumber}>3</Text>
          <View style={styles.workflowTextBox}>
            <Text style={styles.workflowStepTitle}>Gotowe / Wysłane</Text>
            <Text style={styles.workflowStepText}>
              Zamówienie jest gotowe lub przekazane do dostawy.
            </Text>
          </View>
        </View>

        <View style={styles.workflowStep}>
          <Text style={styles.workflowNumber}>4</Text>
          <View style={styles.workflowTextBox}>
            <Text style={styles.workflowStepTitle}>Zakończone / Anulowane</Text>
            <Text style={styles.workflowStepText}>
              Zamówienie kończy proces albo zostaje anulowane.
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Asortyment i magazyn</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.menuCard, styles.stockCard]}
          onPress={() => navigation.navigate('AdminItems')}
          activeOpacity={0.85}>
          <Text style={styles.icon}>🖨️</Text>
          <Text style={styles.menuTitle}>Produkty</Text>
          <Text style={styles.menuDescription}>Ceny, stany, zdjęcia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, styles.stockCard]}
          onPress={() => navigation.navigate('Categories')}
          activeOpacity={0.85}>
          <Text style={styles.icon}>🏷️</Text>
          <Text style={styles.menuTitle}>Kategorie</Text>
          <Text style={styles.menuDescription}>Grupy produktów</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, styles.stockCard]}
          onPress={() => navigation.navigate('Units')}
          activeOpacity={0.85}>
          <Text style={styles.icon}>📏</Text>
          <Text style={styles.menuTitle}>Jednostki</Text>
          <Text style={styles.menuDescription}>szt., kg, m itd.</Text>
        </TouchableOpacity>
      </View>

      {isAdmin ? (
        <>
          <Text style={styles.sectionTitle}>Administracja</Text>

          <View style={styles.adminInfoBox}>
            <Text style={styles.adminInfoTitle}>Tylko administrator</Text>
            <Text style={styles.adminInfoText}>
              Z tego miejsca można zarządzać kontami pracowników. Zwykły
              pracownik nie powinien mieć możliwości dodawania ani edycji
              pracowników.
            </Text>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.menuCard, styles.adminCard]}
              onPress={() => navigation.navigate('Workers')}
              activeOpacity={0.85}>
              <Text style={styles.icon}>🛠️</Text>
              <Text style={styles.menuTitle}>Pracownicy</Text>
              <Text style={styles.menuDescription}>Role i dostępy</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Szybkie przejścia</Text>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}>
          <Text style={styles.shopButtonText}>Strona główna</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clientShopButton}
          onPress={() => navigation.navigate('Items')}
          activeOpacity={0.85}>
          <Text style={styles.clientShopButtonText}>Sklep klienta</Text>
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
    fontSize: 25,
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

  roleBox: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 14,
  },

  roleLabel: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  roleText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },

  priorityBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 14,
  },

  priorityTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },

  priorityText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 12,
  },

  priorityButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  priorityButton: {
    flex: 1,
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },

  priorityButtonSecondary: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },

  priorityButtonText: {
    color: '#ffffff',
    fontSize: 14,
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

  wideGrid: {
    gap: 12,
    marginBottom: 18,
  },

  wideCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  wideIcon: {
    fontSize: 33,
  },

  wideTextBox: {
    flex: 1,
  },

  wideTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 3,
  },

  wideDescription: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  workflowBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 18,
  },

  workflowTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 10,
  },

  workflowStep: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 9,
  },

  workflowNumber: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#f97316',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 28,
    overflow: 'hidden',
  },

  workflowTextBox: {
    flex: 1,
  },

  workflowStepTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 3,
  },

  workflowStepText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },

  menuCard: {
    width: '30.8%',
    minHeight: 128,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 10,
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
    fontSize: 31,
    marginBottom: 8,
  },

  menuTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 5,
  },

  menuDescription: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },

  adminInfoBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#a855f7',
    marginBottom: 12,
  },

  adminInfoTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },

  adminInfoText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },

  bottomActions: {
    flexDirection: 'row',
    gap: 10,
  },

  shopButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  shopButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  clientShopButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  clientShopButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default AdminPanelScreen;