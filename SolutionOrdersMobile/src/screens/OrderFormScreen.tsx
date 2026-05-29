import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import apiService from '../api/apiService.ts';
import AppDialog, {AppDialogType} from '../components/AppDialog.tsx';

import type {RootStackParamList} from '../navigation/types.ts';
import type {ClientDto, WorkerDto} from '../types/models.ts';

type CreateProps = NativeStackScreenProps<RootStackParamList, 'CreateOrder'>;
type EditProps = NativeStackScreenProps<RootStackParamList, 'EditOrder'>;

type Props = CreateProps | EditProps;

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
}

function dateToInputValue(value?: string | null): string {
  if (!value) {
    return '';
  }

  return value.substring(0, 10);
}

function inputDateToApiValue(value: string): string | null {
  if (value.trim().length === 0) {
    return null;
  }

  if (value.includes('T')) {
    return value.trim();
  }

  return `${value.trim()}T00:00:00`;
}

function isDateValid(value: string): boolean {
  if (value.trim().length === 0) {
    return true;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function formatDate(value: Date): string {
  return value.toISOString().substring(0, 10);
}

function getWorkerName(worker: WorkerDto): string {
  const name = `${worker.firstName ?? ''} ${worker.lastName ?? ''}`.trim();

  return name.length > 0 ? name : worker.login ?? 'Pracownik';
}

function getClientContact(client?: ClientDto): string {
  if (!client) {
    return 'Brak danych';
  }

  const parts = [
    client.email,
    client.phoneNumber,
  ].filter(part => !!part && part.trim().length > 0);

  if (parts.length === 0) {
    return client.adress ?? 'Brak kontaktu';
  }

  return parts.join(' | ');
}

function OrderFormScreen({navigation, route}: Props): React.JSX.Element {
  const isEditMode = route.name === 'EditOrder';
  const editedOrder = isEditMode ? route.params.order : undefined;

  const [idClient, setIdClient] = useState(
    editedOrder?.idClient?.toString() ?? '',
  );

  const [idWorker, setIdWorker] = useState(
    editedOrder?.idWorker?.toString() ?? '',
  );

  const [dataOrder, setDataOrder] = useState(
    dateToInputValue(editedOrder?.dataOrder) || formatDate(new Date()),
  );

  const [deliveryDate, setDeliveryDate] = useState(
    dateToInputValue(editedOrder?.deliveryDate),
  );

  const [notes, setNotes] = useState(editedOrder?.notes ?? '');
  const [isActive, setIsActive] = useState(editedOrder?.isActive ?? true);

  const [clients, setClients] = useState<ClientDto[]>([]);
  const [workers, setWorkers] = useState<WorkerDto[]>([]);
  const [dictionaryLoading, setDictionaryLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [goBackAfterDialog, setGoBackAfterDialog] = useState(false);

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const selectedClient = useMemo(() => {
    return clients.find(client => {
      return client.idClient === Number(idClient);
    });
  }, [clients, idClient]);

  const selectedWorker = useMemo(() => {
    return workers.find(worker => {
      return worker.idWorker === Number(idWorker);
    });
  }, [idWorker, workers]);

  const formReady = useMemo(() => {
    return (
      Number(idClient) > 0 &&
      Number(idWorker) > 0 &&
      isDateValid(dataOrder) &&
      isDateValid(deliveryDate)
    );
  }, [dataOrder, deliveryDate, idClient, idWorker]);

  const showDialog = (
    type: AppDialogType,
    title: string,
    message: string,
    shouldGoBack = false,
  ): void => {
    setGoBackAfterDialog(shouldGoBack);

    setDialog({
      visible: true,
      type,
      title,
      message,
      loading: false,
    });
  };

  const closeDialog = (): void => {
    setDialog(previous => ({
      ...previous,
      visible: false,
      loading: false,
    }));

    if (goBackAfterDialog) {
      setGoBackAfterDialog(false);
      navigation.goBack();
    }
  };

  const loadDictionaries = useCallback(async (): Promise<void> => {
    try {
      setDictionaryLoading(true);

      const [clientsFromApi, workersFromApi] = await Promise.all([
        apiService.getClients(),
        apiService.getWorkers(),
      ]);

      const visibleClients = isEditMode
        ? clientsFromApi.filter(client => {
            return (
              client.isActive !== false ||
              client.idClient === editedOrder?.idClient
            );
          })
        : clientsFromApi.filter(client => client.isActive !== false);

      const visibleWorkers = isEditMode
        ? workersFromApi.filter(worker => {
            return (
              worker.isActive !== false ||
              worker.idWorker === editedOrder?.idWorker
            );
          })
        : workersFromApi.filter(worker => worker.isActive !== false);

      setClients(visibleClients);
      setWorkers(visibleWorkers);

      if (!isEditMode) {
        if (visibleClients.length > 0) {
          setIdClient(visibleClients[0].idClient.toString());
        }

        if (visibleWorkers.length > 0) {
          setIdWorker(visibleWorkers[0].idWorker.toString());
        }
      }
    } catch (err) {
      showDialog(
        'error',
        'Nie udało się pobrać danych',
        (err as Error).message,
      );
    } finally {
      setDictionaryLoading(false);
    }
  }, [editedOrder?.idClient, editedOrder?.idWorker, isEditMode]);

  useEffect(() => {
    loadDictionaries();
  }, [loadDictionaries]);

  const validateForm = (): string | null => {
    if (!idClient || Number.isNaN(Number(idClient)) || Number(idClient) <= 0) {
      return 'Wybierz klienta.';
    }

    if (!idWorker || Number.isNaN(Number(idWorker)) || Number(idWorker) <= 0) {
      return 'Wybierz osobę obsługującą.';
    }

    if (!isDateValid(dataOrder)) {
      return 'Data zamówienia musi mieć format RRRR-MM-DD.';
    }

    if (!isDateValid(deliveryDate)) {
      return 'Data dostawy musi mieć format RRRR-MM-DD.';
    }

    return null;
  };

  const setToday = (): void => {
    setDataOrder(formatDate(new Date()));
  };

  const setDeliveryInDays = (days: number): void => {
    const date = new Date();
    date.setDate(date.getDate() + days);

    setDeliveryDate(formatDate(date));
  };

  const handleSavePress = (): void => {
    const validationError = validateForm();

    if (validationError) {
      showDialog('error', 'Sprawdź formularz', validationError);
      return;
    }

    setDialog({
      visible: true,
      type: 'confirm',
      title: isEditMode ? 'Zapisać zmiany?' : 'Dodać zamówienie?',
      message: isEditMode
        ? `Zapisać zmiany w zamówieniu #${editedOrder?.idOrder}?`
        : 'Dodać nowe zamówienie do listy?',
      loading: false,
    });
  };

  const submitForm = async (): Promise<void> => {
    try {
      setSubmitting(true);

      setDialog(previous => ({
        ...previous,
        loading: true,
      }));

      if (isEditMode && editedOrder) {
        await apiService.updateOrder(editedOrder.idOrder, {
          idOrder: editedOrder.idOrder,
          dataOrder: inputDateToApiValue(dataOrder),
          idClient: Number(idClient),
          idWorker: Number(idWorker),
          notes: notes.trim().length > 0 ? notes.trim() : null,
          deliveryDate: inputDateToApiValue(deliveryDate),
          isActive,
        });

        showDialog(
          'success',
          'Zapisano',
          'Zmiany zamówienia zostały zapisane.',
          true,
        );
      } else {
        await apiService.createOrder({
          dataOrder: inputDateToApiValue(dataOrder),
          idClient: Number(idClient),
          idWorker: Number(idWorker),
          notes: notes.trim().length > 0 ? notes.trim() : null,
          deliveryDate: inputDateToApiValue(deliveryDate),
          isActive,
        });

        showDialog(
          'success',
          'Dodano',
          'Nowe zamówienie zostało dodane.',
          true,
        );
      }
    } catch (err) {
      showDialog('error', 'Nie udało się zapisać', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogConfirm = (): void => {
    if (dialog.type === 'confirm') {
      submitForm();
      return;
    }

    closeDialog();
  };

  const renderClientButton = (client: ClientDto): React.JSX.Element => {
    const selected = Number(idClient) === client.idClient;
    const available = client.isActive !== false;

    return (
      <TouchableOpacity
        key={`client-${client.idClient}`}
        style={[
          styles.optionButton,
          selected && styles.optionButtonSelected,
          !available && styles.optionButtonMuted,
        ]}
        onPress={() => setIdClient(client.idClient.toString())}
        activeOpacity={0.85}
        disabled={submitting}>
        <View style={styles.optionTopRow}>
          <Text
            style={[
              styles.optionTitle,
              selected && styles.optionTitleSelected,
            ]}
            numberOfLines={1}>
            {client.name}
          </Text>

          {selected ? (
            <Text style={styles.selectedBadge}>Wybrano</Text>
          ) : null}
        </View>

        <Text
          style={[
            styles.optionText,
            selected && styles.optionTextSelected,
          ]}
          numberOfLines={2}>
          {getClientContact(client)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderWorkerButton = (worker: WorkerDto): React.JSX.Element => {
    const selected = Number(idWorker) === worker.idWorker;
    const available = worker.isActive !== false;

    return (
      <TouchableOpacity
        key={`worker-${worker.idWorker}`}
        style={[
          styles.optionButton,
          selected && styles.optionButtonSelected,
          !available && styles.optionButtonMuted,
        ]}
        onPress={() => setIdWorker(worker.idWorker.toString())}
        activeOpacity={0.85}
        disabled={submitting}>
        <View style={styles.optionTopRow}>
          <Text
            style={[
              styles.optionTitle,
              selected && styles.optionTitleSelected,
            ]}
            numberOfLines={1}>
            {getWorkerName(worker)}
          </Text>

          {selected ? (
            <Text style={styles.selectedBadge}>Wybrano</Text>
          ) : null}
        </View>

        <Text
          style={[
            styles.optionText,
            selected && styles.optionTextSelected,
          ]}>
          Obsługa zamówienia
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={
          dialog.type === 'confirm'
            ? isEditMode
              ? 'Zapisz'
              : 'Dodaj'
            : 'OK'
        }
        cancelText="Anuluj"
        loading={dialog.loading}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.appName}>3D Print Shop</Text>

          <Text style={styles.title}>
            {isEditMode ? 'Edytuj zamówienie' : 'Dodaj zamówienie'}
          </Text>

          <Text style={styles.subtitle}>
            Wybierz klienta, osobę obsługującą i daty zamówienia.
          </Text>
        </View>

        <View style={formReady ? styles.readyBox : styles.warningBox}>
          <Text style={formReady ? styles.readyTitle : styles.warningTitle}>
            {formReady ? 'Formularz gotowy' : 'Uzupełnij dane'}
          </Text>

          <Text style={formReady ? styles.readyText : styles.warningText}>
            {formReady
              ? 'Możesz zapisać zamówienie.'
              : 'Wybierz klienta, osobę obsługującą i sprawdź daty.'}
          </Text>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Podgląd</Text>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Klient</Text>
            <Text style={styles.previewValue}>
              {selectedClient?.name ?? 'Nie wybrano'}
            </Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Obsługa</Text>
            <Text style={styles.previewValue}>
              {selectedWorker ? getWorkerName(selectedWorker) : 'Nie wybrano'}
            </Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Data</Text>
            <Text style={styles.previewValue}>
              {dataOrder.trim().length > 0 ? dataOrder : 'Brak daty'}
            </Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Dostawa</Text>
            <Text style={styles.previewValue}>
              {deliveryDate.trim().length > 0 ? deliveryDate : 'Brak daty'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Klient</Text>

          {dictionaryLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.loadingText}>Ładowanie klientów...</Text>
            </View>
          ) : clients.length > 0 ? (
            <View style={styles.optionList}>
              {clients.map(renderClientButton)}
            </View>
          ) : (
            <Text style={styles.emptyText}>Brak klientów do wyboru.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Obsługa</Text>

          {dictionaryLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.loadingText}>Ładowanie listy...</Text>
            </View>
          ) : workers.length > 0 ? (
            <View style={styles.optionList}>
              {workers.map(renderWorkerButton)}
            </View>
          ) : (
            <Text style={styles.emptyText}>Brak osób do wyboru.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Daty</Text>

          <Text style={styles.label}>Data zamówienia</Text>

          <TextInput
            style={styles.input}
            value={dataOrder}
            onChangeText={setDataOrder}
            placeholder="RRRR-MM-DD"
            placeholderTextColor="#64748b"
            editable={!submitting}
          />

          <View style={styles.quickButtons}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={setToday}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>Dzisiaj</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Data dostawy</Text>

          <TextInput
            style={styles.input}
            value={deliveryDate}
            onChangeText={setDeliveryDate}
            placeholder="RRRR-MM-DD"
            placeholderTextColor="#64748b"
            editable={!submitting}
          />

          <View style={styles.quickButtons}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setDeliveryInDays(1)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>Jutro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setDeliveryInDays(2)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>+2 dni</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setDeliveryInDays(3)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>+3 dni</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informacje</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Opcjonalnie, np. sposób dostawy albo uwagi klienta"
            placeholderTextColor="#64748b"
            multiline
            editable={!submitting}
          />

          <TouchableOpacity
            style={isActive ? styles.visibleSwitch : styles.archiveSwitch}
            onPress={() => setIsActive(previous => !previous)}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.switchText}>
              {isActive ? 'Widoczne na liście' : 'W archiwum'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!formReady || submitting || dictionaryLoading) && styles.disabledButton,
          ]}
          onPress={handleSavePress}
          activeOpacity={0.85}
          disabled={!formReady || submitting || dictionaryLoading}>
          <Text style={styles.saveButtonText}>
            {submitting
              ? 'Zapisywanie...'
              : isEditMode
                ? 'Zapisz zmiany'
                : 'Dodaj zamówienie'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          disabled={submitting}>
          <Text style={styles.cancelButtonText}>Anuluj</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 27,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontWeight: '700',
  },

  readyBox: {
    backgroundColor: '#052e16',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 14,
  },

  warningBox: {
    backgroundColor: '#431407',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 14,
  },

  readyTitle: {
    color: '#bbf7d0',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },

  warningTitle: {
    color: '#fed7aa',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },

  readyText: {
    color: '#bbf7d0',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  warningText: {
    color: '#fed7aa',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  previewCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginBottom: 14,
  },

  previewRow: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 8,
  },

  previewLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  previewValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
  },

  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },

  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
  },

  loadingText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },

  optionList: {
    gap: 10,
  },

  optionButton: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  optionButtonSelected: {
    backgroundColor: '#1e293b',
    borderColor: '#f97316',
  },

  optionButtonMuted: {
    opacity: 0.6,
  },

  optionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    marginBottom: 4,
  },

  optionTitle: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
  },

  optionTitleSelected: {
    color: '#ffffff',
  },

  optionText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  optionTextSelected: {
    color: '#cbd5e1',
  },

  selectedBadge: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  emptyText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },

  label: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },

  quickButton: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  quickButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '900',
  },

  visibleSwitch: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  archiveSwitch: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  switchText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  saveButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  disabledButton: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  cancelButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default OrderFormScreen;