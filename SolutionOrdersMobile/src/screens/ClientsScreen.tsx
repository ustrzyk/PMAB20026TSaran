import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import apiService from '../api/apiService.ts';
import AppDialog, {AppDialogType} from '../components/AppDialog.tsx';

import type {RootStackParamList} from '../navigation/types.ts';
import type {ClientDto} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Clients'>;

type ViewFilter = 'current' | 'all' | 'archived';
type AccountFilter = 'all' | 'withAccount' | 'withoutAccount';
type SortMode = 'default' | 'nameAsc' | 'nameDesc' | 'emailAsc';

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
}

function hasClientAccount(client: ClientDto): boolean {
  return (client.email ?? '').trim().length > 0;
}

function hasContactData(client: ClientDto): boolean {
  return (
    (client.adress ?? '').trim().length > 0 ||
    (client.phoneNumber ?? '').trim().length > 0 ||
    (client.email ?? '').trim().length > 0
  );
}

function ClientsScreen({navigation}: Props): React.JSX.Element {
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);

  const [searchText, setSearchText] = useState('');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('current');
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const currentClients = useMemo(() => {
    return clients.filter(client => client.isActive !== false);
  }, [clients]);

  const archivedClients = useMemo(() => {
    return clients.filter(client => client.isActive === false);
  }, [clients]);

  const accountClients = useMemo(() => {
    return clients.filter(client => hasClientAccount(client));
  }, [clients]);

  const contactClients = useMemo(() => {
    return clients.filter(client => hasContactData(client));
  }, [clients]);

  const filteredClients = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = clients;

    if (viewFilter === 'current') {
      result = result.filter(client => client.isActive !== false);
    }

    if (viewFilter === 'archived') {
      result = result.filter(client => client.isActive === false);
    }

    if (accountFilter === 'withAccount') {
      result = result.filter(client => hasClientAccount(client));
    }

    if (accountFilter === 'withoutAccount') {
      result = result.filter(client => !hasClientAccount(client));
    }

    if (search.length > 0) {
      result = result.filter(client => {
        const name = client.name?.toLowerCase() ?? '';
        const email = client.email?.toLowerCase() ?? '';
        const address = client.adress?.toLowerCase() ?? '';
        const phoneNumber = client.phoneNumber?.toLowerCase() ?? '';

        return (
          name.includes(search) ||
          email.includes(search) ||
          address.includes(search) ||
          phoneNumber.includes(search)
        );
      });
    }

    const sorted = [...result];

    if (sortMode === 'nameAsc') {
      sorted.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    }

    if (sortMode === 'nameDesc') {
      sorted.sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
    }

    if (sortMode === 'emailAsc') {
      sorted.sort((a, b) => (a.email ?? '').localeCompare(b.email ?? ''));
    }

    return sorted;
  }, [clients, searchText, viewFilter, accountFilter, sortMode]);

  const closeDialog = (): void => {
    setDialog(previous => ({
      ...previous,
      visible: false,
      loading: false,
    }));
  };

  const loadClients = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      const data = await apiService.getClients();

      setClients(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nie udało się pobrać klientów';

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadClients();
    }, [loadClients]),
  );

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadClients();
  };

  const handleArchive = (client: ClientDto): void => {
    setSelectedClient(client);

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Przenieść do archiwum?',
      message: `Klient "${client.name ?? 'bez nazwy'}" zostanie ukryty z bieżącej listy.`,
      loading: false,
    });
  };

  const confirmArchive = async (): Promise<void> => {
    if (!selectedClient) {
      return;
    }

    try {
      setDialog(previous => ({
        ...previous,
        loading: true,
      }));

      await apiService.deleteClient(selectedClient.idClient);

      setClients(previousClients =>
        previousClients.map(client => {
          if (client.idClient === selectedClient.idClient) {
            return {
              ...client,
              isActive: false,
            };
          }

          return client;
        }),
      );

      setSelectedClient(null);

      setDialog({
        visible: true,
        type: 'success',
        title: 'Przeniesiono',
        message: 'Klient trafił do archiwum.',
        loading: false,
      });
    } catch (err) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Nie udało się wykonać operacji',
        message: (err as Error).message,
        loading: false,
      });
    }
  };

  const handleDialogConfirm = (): void => {
    if (dialog.type === 'confirm') {
      confirmArchive();
      return;
    }

    closeDialog();
  };

  const clearFilters = (): void => {
    setSearchText('');
    setViewFilter('current');
    setAccountFilter('all');
    setSortMode('default');
  };

  const renderViewButton = (
    label: string,
    value: ViewFilter,
  ): React.JSX.Element => {
    const selected = viewFilter === value;

    return (
      <TouchableOpacity
        key={`client-view-${value}`}
        style={[styles.filterButton, selected && styles.filterButtonSelected]}
        onPress={() => setViewFilter(value)}
        activeOpacity={0.85}>
        <Text
          style={[
            styles.filterButtonText,
            selected && styles.filterButtonTextSelected,
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAccountButton = (
    label: string,
    value: AccountFilter,
  ): React.JSX.Element => {
    const selected = accountFilter === value;

    return (
      <TouchableOpacity
        key={`client-account-${value}`}
        style={[styles.accountButton, selected && styles.accountButtonSelected]}
        onPress={() => setAccountFilter(value)}
        activeOpacity={0.85}>
        <Text
          style={[
            styles.accountButtonText,
            selected && styles.accountButtonTextSelected,
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSortButton = (
    label: string,
    value: SortMode,
  ): React.JSX.Element => {
    const selected = sortMode === value;

    return (
      <TouchableOpacity
        key={`client-sort-${value}`}
        style={[styles.sortButton, selected && styles.sortButtonSelected]}
        onPress={() => setSortMode(value)}
        activeOpacity={0.85}>
        <Text
          style={[
            styles.sortButtonText,
            selected && styles.sortButtonTextSelected,
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderListHeader = (): React.JSX.Element => {
    return (
      <>
        <View style={styles.heroBox}>
          <Text style={styles.appName}>3D Print Shop</Text>
          <Text style={styles.heroTitle}>Klienci</Text>
          <Text style={styles.heroSubtitle}>
            Lista klientów i dane kontaktowe.
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Bieżący</Text>
            <Text style={styles.summaryCurrent}>{currentClients.length}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Archiwum</Text>
            <Text style={styles.summaryArchived}>{archivedClients.length}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Konta</Text>
            <Text style={styles.summaryAccount}>{accountClients.length}</Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Kontakt</Text>
            <Text style={styles.summaryContact}>{contactClients.length}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Widoczni</Text>
            <Text style={styles.summaryVisible}>{filteredClients.length}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Razem</Text>
            <Text style={styles.summaryTotal}>{clients.length}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateClient')}
            activeOpacity={0.85}>
            <Text style={styles.createButtonText}>+ Dodaj</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.panelButton}
            onPress={() => navigation.navigate('AdminPanel')}
            activeOpacity={0.85}>
            <Text style={styles.panelButtonText}>Panel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Szukaj klienta..."
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Widok</Text>

          <View style={styles.filterButtons}>
            {renderViewButton('Bieżący', 'current')}
            {renderViewButton('Wszyscy', 'all')}
            {renderViewButton('Archiwum', 'archived')}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Konto</Text>

          <View style={styles.filterButtons}>
            {renderAccountButton('Wszyscy', 'all')}
            {renderAccountButton('Z kontem', 'withAccount')}
            {renderAccountButton('Bez konta', 'withoutAccount')}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Sortowanie</Text>

          <View style={styles.filterButtons}>
            {renderSortButton('Domyślnie', 'default')}
            {renderSortButton('A-Z', 'nameAsc')}
            {renderSortButton('Z-A', 'nameDesc')}
            {renderSortButton('E-mail', 'emailAsc')}
          </View>
        </View>

        <View style={styles.filterSummaryBox}>
          <Text style={styles.filterSummaryText}>
            Wyświetlane: {filteredClients.length} / {clients.length}
          </Text>

          <Text style={styles.filterSummaryText}>
            Szukaj:{' '}
            {searchText.trim().length > 0
              ? searchText.trim()
              : 'brak wyszukiwania'}
          </Text>

          <TouchableOpacity onPress={clearFilters} activeOpacity={0.85}>
            <Text style={styles.clearFiltersText}>Wyczyść filtry</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.85}>
          <Text style={styles.refreshButtonText}>Odśwież</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderItem = ({item}: {item: ClientDto}): React.JSX.Element => {
    const isCurrent = item.isActive !== false;
    const hasAccount = hasClientAccount(item);

    return (
      <View style={styles.clientCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.clientIconBox}>
            <Text style={styles.clientIcon}>👤</Text>
          </View>

          <View style={styles.cardTitleBox}>
            <Text style={styles.clientName}>{item.name ?? 'Brak nazwy'}</Text>

            <Text style={styles.clientEmail}>
              {item.email ?? 'Brak e-maila'}
            </Text>
          </View>

          <Text style={isCurrent ? styles.currentBadge : styles.archivedBadge}>
            {isCurrent ? 'Bieżący' : 'Archiwum'}
          </Text>
        </View>

        <View style={styles.badgeRow}>
          <Text style={hasAccount ? styles.accountBadge : styles.noAccountBadge}>
            {hasAccount ? 'Konto' : 'Bez konta'}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Telefon</Text>
          <Text style={styles.infoValue}>
            {item.phoneNumber ?? 'Brak telefonu'}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Adres</Text>
          <Text style={styles.infoValue}>
            {item.adress ?? 'Brak adresu'}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditClient', {client: item})}
            activeOpacity={0.85}>
            <Text style={styles.buttonText}>Edytuj</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.archiveButton,
              !isCurrent && styles.disabledArchiveButton,
            ]}
            onPress={() => handleArchive(item)}
            activeOpacity={0.85}
            disabled={!isCurrent}>
            <Text style={styles.buttonText}>Archiwum</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Ładowanie klientów...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Nie udało się pobrać klientów</Text>
        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadClients}
          activeOpacity={0.85}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('AdminPanel')}
          activeOpacity={0.85}>
          <Text style={styles.backButtonText}>Panel obsługi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.type === 'confirm' ? 'Przenieś' : 'OK'}
        cancelText="Anuluj"
        loading={dialog.loading}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />

      <FlatList
        data={filteredClients}
        renderItem={renderItem}
        keyExtractor={item => item.idClient.toString()}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>Brak klientów</Text>

            <Text style={styles.emptyText}>
              {clients.length === 0
                ? 'Dodaj pierwszego klienta.'
                : 'Brak wyników dla aktualnych filtrów.'}
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={
                clients.length === 0
                  ? () => navigation.navigate('CreateClient')
                  : clearFilters
              }
              activeOpacity={0.85}>
              <Text style={styles.emptyButtonText}>
                {clients.length === 0 ? 'Dodaj klienta' : 'Wyczyść filtry'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerBox}>
            <TouchableOpacity
              style={styles.footerPrimaryButton}
              onPress={() => navigation.navigate('CreateClient')}
              activeOpacity={0.85}>
              <Text style={styles.footerPrimaryButtonText}>Dodaj klienta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerSecondaryButton}
              onPress={() => navigation.navigate('AdminPanel')}
              activeOpacity={0.85}>
              <Text style={styles.footerSecondaryButtonText}>Panel obsługi</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  loadingText: {
    color: '#cbd5e1',
    fontSize: 16,
    marginTop: 12,
  },

  errorTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 10,
  },

  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  backButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
  },

  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  listContent: {
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

  appName: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 7,
  },

  heroTitle: {
    color: '#f8fafc',
    fontSize: 27,
    fontWeight: '900',
  },

  heroSubtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontWeight: '700',
  },

  summaryBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 10,
  },

  summaryColumn: {
    flex: 1,
  },

  summaryLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },

  summaryCurrent: {
    color: '#f97316',
    fontSize: 23,
    fontWeight: '900',
  },

  summaryArchived: {
    color: '#94a3b8',
    fontSize: 23,
    fontWeight: '900',
  },

  summaryAccount: {
    color: '#16a34a',
    fontSize: 23,
    fontWeight: '900',
  },

  summaryContact: {
    color: '#38bdf8',
    fontSize: 23,
    fontWeight: '900',
  },

  summaryVisible: {
    color: '#a855f7',
    fontSize: 23,
    fontWeight: '900',
  },

  summaryTotal: {
    color: '#f8fafc',
    fontSize: 23,
    fontWeight: '900',
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  createButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  panelButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  panelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  searchBox: {
    marginBottom: 12,
  },

  searchInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },

  filterSection: {
    marginBottom: 12,
  },

  filterTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },

  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filterButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  filterButtonSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  filterButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },

  filterButtonTextSelected: {
    color: '#ffffff',
  },

  accountButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  accountButtonSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },

  accountButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },

  accountButtonTextSelected: {
    color: '#ffffff',
  },

  sortButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  sortButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  sortButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },

  sortButtonTextSelected: {
    color: '#ffffff',
  },

  filterSummaryBox: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  filterSummaryText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },

  clearFiltersText: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '900',
  },

  refreshButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 4,
  },

  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  clientCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 12,
  },

  cardTopRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  clientIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clientIcon: {
    fontSize: 26,
  },

  cardTitleBox: {
    flex: 1,
  },

  clientName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },

  clientEmail: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
  },

  currentBadge: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  archivedBadge: {
    backgroundColor: '#334155',
    color: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },

  accountBadge: {
    backgroundColor: '#052e16',
    color: '#bbf7d0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  noAccountBadge: {
    backgroundColor: '#334155',
    color: '#cbd5e1',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  infoBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 9,
  },

  infoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  infoValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },

  archiveButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },

  disabledArchiveButton: {
    opacity: 0.5,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 14,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 44,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },

  emptyText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },

  emptyButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  emptyButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  footerBox: {
    paddingTop: 16,
    gap: 10,
  },

  footerPrimaryButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  footerPrimaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  footerSecondaryButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  footerSecondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default ClientsScreen;