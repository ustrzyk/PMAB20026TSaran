import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import apiService from '../api/apiService.ts';
import AppDialog, {AppDialogType} from '../components/AppDialog.tsx';

import type {RootStackParamList} from '../navigation/types.ts';

type CreateProps = NativeStackScreenProps<RootStackParamList, 'CreateWorker'>;
type EditProps = NativeStackScreenProps<RootStackParamList, 'EditWorker'>;

type Props = CreateProps | EditProps;

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
}

function WorkerFormScreen({navigation, route}: Props): React.JSX.Element {
  const isEditMode = route.name === 'EditWorker';
  const editedWorker = isEditMode ? route.params.worker : undefined;

  const [firstName, setFirstName] = useState(editedWorker?.firstName ?? '');
  const [lastName, setLastName] = useState(editedWorker?.lastName ?? '');
  const [login, setLogin] = useState(editedWorker?.login ?? '');
  const [password, setPassword] = useState('');

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

  const validateForm = (): string | null => {
    if (firstName.trim().length === 0) {
      return 'Podaj imię pracownika';
    }

    if (lastName.trim().length === 0) {
      return 'Podaj nazwisko pracownika';
    }

    if (login.trim().length === 0) {
      return 'Podaj login pracownika';
    }

    if (!isEditMode && password.trim().length === 0) {
      return 'Podaj hasło dla nowego pracownika';
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
        ? `Czy zapisać zmiany pracownika "${firstName.trim()} ${lastName.trim()}"?`
        : `Czy dodać nowego pracownika "${firstName.trim()} ${lastName.trim()}"?`,
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

      if (isEditMode && editedWorker) {
        await apiService.updateWorker(editedWorker.idWorker, {
          idWorker: editedWorker.idWorker,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          login: login.trim(),
          password: password.trim().length > 0 ? password.trim() : null,
          isActive: editedWorker.isActive ?? true,
        });

        showDialog(
          'success',
          'Pracownik zaktualizowany',
          'Dane pracownika zostały zapisane.',
          true,
        );
      } else {
        await apiService.createWorker({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          login: login.trim(),
          password: password.trim(),
        });

        showDialog(
          'success',
          'Pracownik dodany',
          'Nowy pracownik został zapisany w systemie.',
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
        <Text style={styles.appName}>3D Print Shop</Text>

        <Text style={styles.title}>
          {isEditMode ? 'Edytuj pracownika' : 'Dodaj pracownika'}
        </Text>

        <Text style={styles.subtitle}>
          Pracownicy będą później przypisywani do zamówień obsługiwanych w
          sklepie.
        </Text>

        <Text style={styles.label}>Imię</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Np. Adam"
          placeholderTextColor="#64748b"
          editable={!submitting}
        />

        <Text style={styles.label}>Nazwisko</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Np. Kowalski"
          placeholderTextColor="#64748b"
          editable={!submitting}
        />

        <Text style={styles.label}>Login</Text>
        <TextInput
          style={styles.input}
          value={login}
          onChangeText={setLogin}
          placeholder="Np. akowalski"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          editable={!submitting}
        />

        <Text style={styles.label}>
          {isEditMode ? 'Nowe hasło' : 'Hasło'}
        </Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder={
            isEditMode ? 'Opcjonalnie - wpisz nowe hasło' : 'Hasło pracownika'
          }
          placeholderTextColor="#64748b"
          secureTextEntry
          editable={!submitting}
        />

        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.disabledButton]}
          onPress={handleSavePress}
          activeOpacity={0.8}
          disabled={submitting}>
          <Text style={styles.saveButtonText}>
            {submitting
              ? 'Zapisywanie...'
              : isEditMode
                ? 'Zapisz zmiany'
                : 'Dodaj pracownika'}
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
    marginBottom: 20,
  },

  label: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 14,
  },

  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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

export default WorkerFormScreen;