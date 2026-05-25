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
import {useAuth} from '../context/AuthContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';
import type {WorkerDto, WorkerRole} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Workers'>;

type StatusFilter = 'all' | 'active' | 'inactive';
type RoleFilter = 'all' | 'admin' | 'worker';
type SortMode = 'default' | 'nameAsc' | 'nameDesc' | 'loginAsc';

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
}

function getFullName(worker: WorkerDto): string {
  const fullName = `${worker.firstName ?? ''} ${worker.lastName ?? ''}`.trim();

  return fullName.length > 0 ? fullName : 'Brak imienia i nazwiska';
}

function getWorkerRole(worker: WorkerDto): WorkerRole {
  if (worker.role?.toLowerCase() === 'admin') {
    return 'Admin';
  }

  return 'Worker';
}

function getRoleLabel(worker: WorkerDto): string {
  return getWorkerRole(worker) === 'Admin' ? 'Administrator' : 'Pracownik';
}

function WorkersScreen({navigation}: Props): React.JSX.Element {
  const {user} = useAuth();

  const [workers, setWorkers] = useState<WorkerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<WorkerDto | null>(null);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const filteredWorkers = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let result = workers;

    if (statusFilter === 'active') {
      result = result.filter(worker => worker.isActive !== false);
    }

    if (statusFilter === 'inactive') {
      result = result.filter(worker => worker.isActive === false);
    }

    if (roleFilter === 'admin') {
      result = result.filter(worker => getWorkerRole(worker) === 'Admin');
    }

    if (roleFilter === 'worker') {
      result = result.filter(worker => getWorkerRole(worker) === 'Worker');
    }

    if (search.length > 0) {
      result = result.filter(worker => {
        const firstName = worker.firstName?.toLowerCase() ?? '';
        const lastName = worker.lastName?.toLowerCase() ?? '';
        const fullName = getFullName(worker).toLowerCase();
        const login = worker.login?.toLowerCase() ?? '';
        const role = getRoleLabel(worker).toLowerCase();

        return (
          firstName.includes(search) ||
          lastName.includes(search) ||
          fullName.includes(search) ||
          login.includes(search) ||
          role.includes(search)
        );
      });
    }

    const sorted = [...result];

    if (sortMode === 'nameAsc') {
      sorted.sort((a, b) => getFullName(a).localeCompare(getFullName(b)));
    }

    if (sortMode === 'nameDesc') {
      sorted.sort((a, b) => getFullName(b).localeCompare(getFullName(a)));
    }

    if (sortMode === 'loginAsc') {
      sorted.sort((a, b) => (a.login ?? '').localeCompare(b.login ?? ''));
    }

    return sorted;
  }, [workers, searchText, statusFilter, roleFilter, sortMode]);

  const activeCount = useMemo(() => {
    return workers.filter(worker => worker.isActive !== false).length;
  }, [workers]);

  const inactiveCount = useMemo(() => {
    return workers.filter(worker => worker.isActive === false).length;
  }, [workers]);

  const adminCount = useMemo(() => {
    return workers.filter(worker => getWorkerRole(worker) === 'Admin').length;
  }, [workers]);

  const workerCount = useMemo(() => {
    return workers.filter(worker => getWorkerRole(worker) === 'Worker').length;
  }, [workers]);

  const closeDialog = (): void => {
    setDialog(previous => ({
      ...previous,
      visible: false,
      loading: false,
    }));
  };

  const loadWorkers = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      const data = await apiService.getWorkers();

      setWorkers(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nieznany błąd pobierania danych';

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadWorkers();
    }, [loadWorkers]),
  );

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadWorkers();
  };

  const handleDelete = (worker: WorkerDto): void => {
    if (worker.login === user?.login) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Nie można usunąć konta',
        message: 'Nie możesz usunąć konta, na którym jesteś aktualnie zalogowany.',
        loading: false,
      });

      return;
    }

    setSelectedWorker(worker);

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Usuwanie pracownika',
      message: `Czy na pewno chcesz usunąć pracownika "${getFullName(
        worker,
      )}"?`,
      loading: false,
    });
  };

  const confirmDelete = async (): Promise<void> => {
    if (!selectedWorker) {
      return;
    }

    try {
      setDialog(previous => ({
        ...previous,
        loading: true,
      }));

      await apiService.deleteWorker(selectedWorker.idWorker);

      setWorkers(previousWorkers =>
        previousWorkers.filter(
          item => item.idWorker !== selectedWorker.idWorker,
        ),
      );

      setSelectedWorker(null);

      setDialog({
        visible: true,
        type: 'success',
        title: 'Pracownik usunięty',
        message: 'Pracownik został poprawnie usunięty z listy.',
        loading: false,
      });
    } catch (err) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Błąd usuwania',
        message: (err as Error).message,
        loading: false,
      });
    }
  };

  const handleDialogConfirm = (): void => {
    if (dialog.type === 'confirm') {
      confirmDelete();
      return;
    }

    closeDialog();
  };

  const clearFilters = (): void => {
    setSearchText('');
    setStatusFilter('all');
    setRoleFilter('all');
    setSortMode('default');
  };

  const renderStatusButton = (
    label: string,
    value: StatusFilter,
  ): React.JSX.Element => {
    const selected = statusFilter === value;

    return (
      <TouchableOpacity
        style={[styles.filterButton, selected && styles.filterButtonSelected]}
        onPress={() => setStatusFilter(value)}
        activeOpacity={0.8}>
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

  const renderRoleButton = (
    label: string,
    value: RoleFilter,
  ): React.JSX.Element => {
    const selected = roleFilter === value;

    return (
      <TouchableOpacity
        style={[styles.filterButton, selected && styles.filterButtonSelected]}
        onPress={() => setRoleFilter(value)}
        activeOpacity={0.8}>
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

  const renderSortButton = (
    label: string,
    value: SortMode,
  ): React.JSX.Element => {
    const selected = sortMode === value;

    return (
      <TouchableOpacity
        style={[styles.filterButton, selected && styles.filterButtonSelected]}
        onPress={() => setSortMode(value)}
        activeOpacity={0.8}>
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

  const renderListHeader = (): React.JSX.Element => {
    return (
      <>
        <View style={styles.heroBox}>
          <Text style={styles.shopName}>3D Print Shop</Text>
          <Text style={styles.heroTitle}>Pracownicy</Text>
        </View>

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Lista pracowników</Text>
            <Text style={styles.subtitle}>
              Wyświetlane: {filteredWorkers.length} / {workers.length}
            </Text>
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Odśwież</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Aktywni</Text>
            <Text style={styles.summaryActive}>{activeCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Nieaktywni</Text>
            <Text style={styles.summaryInactive}>{inactiveCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Admini</Text>
            <Text style={styles.summaryAdmin}>{adminCount}</Text>
          </View>

          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Pracownicy</Text>
            <Text style={styles.summaryWorker}>{workerCount}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateWorker')}
          activeOpacity={0.8}>
          <Text style={styles.createButtonText}>+ Dodaj pracownika</Text>
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Szukaj po imieniu, nazwisku, loginie lub roli..."
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Status</Text>

          <View style={styles.filterButtons}>
            {renderStatusButton('Wszyscy', 'all')}
            {renderStatusButton('Aktywni', 'active')}
            {renderStatusButton('Nieaktywni', 'inactive')}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Rola</Text>

          <View style={styles.filterButtons}>
            {renderRoleButton('Wszyscy', 'all')}
            {renderRoleButton('Administratorzy', 'admin')}
            {renderRoleButton('Pracownicy', 'worker')}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Sortowanie</Text>

          <View style={styles.filterButtons}>
            {renderSortButton('Domyślnie', 'default')}
            {renderSortButton('Nazwisko A-Z', 'nameAsc')}
            {renderSortButton('Nazwisko Z-A', 'nameDesc')}
            {renderSortButton('Login A-Z', 'loginAsc')}
          </View>
        </View>

        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={clearFilters}
          activeOpacity={0.8}>
          <Text style={styles.clearFiltersText}>Wyczyść filtry</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderItem = ({item}: {item: WorkerDto}): React.JSX.Element => {
    const fullName = getFullName(item);
    const isActive = item.isActive !== false;
    const role = getWorkerRole(item);

    return (
      <View style={styles.workerCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleBox}>
            <Text style={styles.workerName}>{fullName}</Text>
            <Text style={styles.workerLogin}>{item.login ?? 'Brak loginu'}</Text>
          </View>

          <View style={styles.badgesColumn}>
            <Text style={role === 'Admin' ? styles.adminBadge : styles.workerBadge}>
              {role === 'Admin' ? 'Admin' : 'Worker'}
            </Text>

            <Text style={isActive ? styles.activeBadge : styles.inactiveBadge}>
              {isActive ? 'Aktywny' : 'Nieaktywny'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditWorker', {worker: item})}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Edytuj</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Usuń</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Ładowanie pracowników...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Nie udało się pobrać pracowników
        </Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadWorkers}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
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
        confirmText={dialog.type === 'confirm' ? 'Usuń' : 'OK'}
        cancelText="Anuluj"
        loading={dialog.loading}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />

      <FlatList
        data={filteredWorkers}
        renderItem={renderItem}
        keyExtractor={item => item.idWorker.toString()}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchText.trim().length > 0 ||
            statusFilter !== 'all' ||
            roleFilter !== 'all'
              ? 'Brak pracowników pasujących do filtrów'
              : 'Brak pracowników w API'}
          </Text>
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
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  listContent: {
    paddingBottom: 30,
  },

  heroBox: {
    backgroundColor: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },

  shopName: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  heroTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
  },

  header: {
    padding: 16,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },

  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },

  refreshButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },

  refreshButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  summaryBox: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
  },

  summaryColumn: {
    flex: 1,
  },

  summaryLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },

  summaryActive: {
    color: '#16a34a',
    fontSize: 20,
    fontWeight: '900',
  },

  summaryInactive: {
    color: '#f97316',
    fontSize: 20,
    fontWeight: '900',
  },

  summaryAdmin: {
    color: '#a855f7',
    fontSize: 20,
    fontWeight: '900',
  },

  summaryWorker: {
    color: '#38bdf8',
    fontSize: 20,
    fontWeight: '900',
  },

  createButton: {
    backgroundColor: '#16a34a',
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  createButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#0f172a',
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
    paddingHorizontal: 16,
    paddingTop: 12,
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

  clearFiltersButton: {
    backgroundColor: '#334155',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },

  clearFiltersText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  workerCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  cardTitleBox: {
    flex: 1,
  },

  workerName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
  },

  workerLogin: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },

  badgesColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },

  adminBadge: {
    backgroundColor: '#581c87',
    color: '#f3e8ff',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  workerBadge: {
    backgroundColor: '#0c4a6e',
    color: '#e0f2fe',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  activeBadge: {
    backgroundColor: '#052e16',
    color: '#bbf7d0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  inactiveBadge: {
    backgroundColor: '#7f1d1d',
    color: '#fecaca',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 10,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#7f1d1d',
    paddingVertical: 10,
    borderRadius: 10,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    marginHorizontal: 16,
    fontSize: 16,
  },
});

export default WorkersScreen;