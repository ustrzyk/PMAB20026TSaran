import React, {useCallback, useEffect, useState} from 'react';
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

function getWorkerName(worker: WorkerDto): string {
  const name = `${worker.firstName ?? ''} ${worker.lastName ?? ''}`.trim();

  return name.length > 0 ? name : worker.login ?? 'Brak nazwy';
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
    dateToInputValue(editedOrder?.dataOrder),
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
        'Błąd pobierania danych',
        (err as Error).message,
      );
    } finally {
      setDictionaryLoading(false);
    }
  }, [editedOrder?.idClient, editedOrder?.idWorker, isEditMode]);

  useEffect(() => {
    loadDictionaries();
  }, [loadDictionaries]);

  const selectedClient = clients.find(
    client => client.idClient === Number(idClient),
  );

  const selectedWorker = workers.find(
    worker => worker.idWorker === Number(idWorker),
  );

  const validateForm = (): string | null => {
    if (!idClient || Number.isNaN(Number(idClient)) || Number(idClient) <= 0) {
      return 'Wybierz klienta';
    }

    if (!idWorker || Number.isNaN(Number(idWorker)) || Number(idWorker) <= 0) {
      return 'Wybierz pracownika';
    }

    if (!isDateValid(dataOrder)) {
      return 'Data zamówienia musi mieć format RRRR-MM-DD';
    }

    if (!isDateValid(deliveryDate)) {
      return 'Data dostawy musi mieć format RRRR-MM-DD';
    }

    return null;
  };

  const handleSavePress = (): void => {
    const validationError = validateForm();

    if (validationError) {
      showDialog('error', 'Błąd formularza', validationError);
      return;
    }

    setDialog({
      visible: true,
      type: 'confirm',
      title: isEditMode ? 'Potwierdzenie edycji' : 'Potwierdzenie dodania',
      message: isEditMode
        ? `Czy zapisać zmiany w zamówieniu nr ${editedOrder?.idOrder}?`
        : 'Czy dodać nowe zamówienie?',
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
          'Zamówienie zaktualizowane',
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
          'Zamówienie dodane',
          'Nowe zamówienie zostało zapisane w systemie.',
          true,
        );
      }
    } catch (err) {
      showDialog('error', 'Błąd zapisu', (err as Error).message);
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
    const isSelected = Number(idClient) === client.idClient;
    const isClientActive = client.isActive !== false;

    return (
      <TouchableOpacity
        key={client.idClient}
        style={[
          styles.optionButton,
          isSelected && styles.optionButtonSelected,
          !isClientActive && styles.inactiveOptionButton,
        ]}
        onPress={() => setIdClient(client.idClient.toString())}
        activeOpacity={0.8}
        disabled={submitting}>
        <Text
          style={[
            styles.optionButtonText,
            isSelected && styles.optionButtonTextSelected,
          ]}>
          {client.name}
        </Text>

        <Text
          style={[
            styles.optionButtonSubtext,
            isSelected && styles.optionButtonSubtextSelected,
          ]}>
          {client.adress ?? 'Brak adresu'}
          {!isClientActive ? ' | klient nieaktywny' : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderWorkerButton = (worker: WorkerDto): React.JSX.Element => {
    const isSelected = Number(idWorker) === worker.idWorker;
    const isWorkerActive = worker.isActive !== false;

    return (
      <TouchableOpacity
        key={worker.idWorker}
        style={[
          styles.optionButton,
          isSelected && styles.optionButtonSelected,
          !isWorkerActive && styles.inactiveOptionButton,
        ]}
        onPress={() => setIdWorker(worker.idWorker.toString())}
        activeOpacity={0.8}
        disabled={submitting}>
        <Text
          style={[
            styles.optionButtonText,
            isSelected && styles.optionButtonTextSelected,
          ]}>
          {getWorkerName(worker)}
        </Text>

        <Text
          style={[
            styles.optionButtonSubtext,
            isSelected && styles.optionButtonSubtextSelected,
          ]}>
          Login: {worker.login ?? 'brak loginu'}
          {!isWorkerActive ? ' | pracownik nieaktywny' : ''}
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
            Wybierz klienta, pracownika oraz uzupełnij daty i notatki.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Powiązania</Text>

          {dictionaryLoading ? (
            <View style={styles.dictionaryLoadingBox}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.dictionaryLoadingText}>
                Ładowanie klientów i pracowników...
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.label}>Klient</Text>
              <Text style={styles.selectedText}>
                Wybrano:{' '}
                {selectedClient
                  ? selectedClient.name
                  : `ID ${idClient || '-'}`}
              </Text>

              <View style={styles.optionsContainer}>
                {clients.map(renderClientButton)}
              </View>

              <Text style={styles.label}>Pracownik</Text>
              <Text style={styles.selectedText}>
                Wybrano:{' '}
                {selectedWorker
                  ? getWorkerName(selectedWorker)
                  : `ID ${idWorker || '-'}`}
              </Text>

              <View style={styles.optionsContainer}>
                {workers.map(renderWorkerButton)}
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Daty</Text>

          <Text style={styles.label}>Data zamówienia</Text>
          <TextInput
            style={styles.input}
            value={dataOrder}
            onChangeText={setDataOrder}
            placeholder="RRRR-MM-DD, np. 2026-05-23"
            placeholderTextColor="#64748b"
            editable={!submitting}
          />

          <Text style={styles.label}>Data dostawy</Text>
          <TextInput
            style={styles.input}
            value={deliveryDate}
            onChangeText={setDeliveryDate}
            placeholder="RRRR-MM-DD, np. 2026-06-05"
            placeholderTextColor="#64748b"
            editable={!submitting}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notatki</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Np. zamówienie testowe"
            placeholderTextColor="#64748b"
            multiline
            editable={!submitting}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status zamówienia</Text>

          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                isActive && styles.statusButtonActive,
              ]}
              onPress={() => setIsActive(true)}
              activeOpacity={0.8}
              disabled={submitting}>
              <Text
                style={[
                  styles.statusButtonText,
                  isActive && styles.statusButtonTextSelected,
                ]}>
                Aktywne
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusButton,
                !isActive && styles.statusButtonInactive,
              ]}
              onPress={() => setIsActive(false)}
              activeOpacity={0.8}
              disabled={submitting}>
              <Text
                style={[
                  styles.statusButtonText,
                  !isActive && styles.statusButtonTextSelected,
                ]}>
                Nieaktywne
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.disabledButton]}
          onPress={handleSavePress}
          activeOpacity={0.8}
          disabled={submitting || dictionaryLoading}>
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
          activeOpacity={0.8}
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
    borderRadius: 18,
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
    marginBottom: 8,
  },

  title: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 12,
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
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 14,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  dictionaryLoadingBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  dictionaryLoadingText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },

  selectedText: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 8,
  },

  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },

  optionButton: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  optionButtonSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  inactiveOptionButton: {
    borderColor: '#7f1d1d',
  },

  optionButtonText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '900',
  },

  optionButtonTextSelected: {
    color: '#ffffff',
  },

  optionButtonSubtext: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },

  optionButtonSubtextSelected: {
    color: '#ffffff',
  },

  statusButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  statusButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },

  statusButtonActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },

  statusButtonInactive: {
    backgroundColor: '#7f1d1d',
    borderColor: '#7f1d1d',
  },

  statusButtonText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '900',
  },

  statusButtonTextSelected: {
    color: '#ffffff',
  },

  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },

  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default OrderFormScreen;