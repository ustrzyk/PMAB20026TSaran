import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import apiService from '../api/apiService.ts';
import AppDialog, {AppDialogType} from '../components/AppDialog.tsx';
import {sharedStyles as styles} from '../components/styles/sharedStyles.ts';

import type {RootStackParamList} from '../navigation/types.ts';
import type {WorkerRole} from '../types/models.ts';

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

function normalizeRole(role?: string | null): WorkerRole {
  if (role?.toLowerCase() === 'admin') {
    return 'Admin';
  }

  return 'Worker';
}

function WorkerFormScreen({navigation, route}: Props): React.JSX.Element {
  const isEditMode = route.name === 'EditWorker';
  const editedWorker = isEditMode ? route.params.worker : undefined;

  const [firstName, setFirstName] = useState(editedWorker?.firstName ?? '');
  const [lastName, setLastName] = useState(editedWorker?.lastName ?? '');
  const [login, setLogin] = useState(editedWorker?.login ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<WorkerRole>(
    normalizeRole(editedWorker?.role),
  );
  const [isActive, setIsActive] = useState(editedWorker?.isActive ?? true);

  const [submitting, setSubmitting] = useState(false);
  const [goBackAfterDialog, setGoBackAfterDialog] = useState(false);

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const safeFirstName = firstName.trim();
  const safeLastName = lastName.trim();
  const safeLogin = login.trim();
  const safePassword = password.trim();

  const fullName = `${safeFirstName} ${safeLastName}`.trim();

  const firstNameReady = useMemo(() => {
    return safeFirstName.length >= 2 && safeFirstName.length <= 50;
  }, [safeFirstName]);

  const lastNameReady = useMemo(() => {
    return safeLastName.length >= 2 && safeLastName.length <= 50;
  }, [safeLastName]);

  const loginReady = useMemo(() => {
    return safeLogin.length >= 3 && safeLogin.length <= 50;
  }, [safeLogin]);

  const passwordReady = useMemo(() => {
    if (isEditMode && safePassword.length === 0) {
      return true;
    }

    return safePassword.length >= 4;
  }, [isEditMode, safePassword]);

  const formReady = useMemo(() => {
    return firstNameReady && lastNameReady && loginReady && passwordReady;
  }, [firstNameReady, lastNameReady, loginReady, passwordReady]);

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
    if (safeFirstName.length === 0) {
      return 'Podaj imię.';
    }

    if (safeFirstName.length < 2) {
      return 'Imię powinno mieć minimum 2 znaki.';
    }

    if (safeFirstName.length > 50) {
      return 'Imię może mieć maksymalnie 50 znaków.';
    }

    if (safeLastName.length === 0) {
      return 'Podaj nazwisko.';
    }

    if (safeLastName.length < 2) {
      return 'Nazwisko powinno mieć minimum 2 znaki.';
    }

    if (safeLastName.length > 50) {
      return 'Nazwisko może mieć maksymalnie 50 znaków.';
    }

    if (safeLogin.length === 0) {
      return 'Podaj login.';
    }

    if (safeLogin.length < 3) {
      return 'Login powinien mieć minimum 3 znaki.';
    }

    if (safeLogin.length > 50) {
      return 'Login może mieć maksymalnie 50 znaków.';
    }

    if (!isEditMode && safePassword.length === 0) {
      return 'Podaj hasło.';
    }

    if (safePassword.length > 0 && safePassword.length < 4) {
      return 'Hasło powinno mieć minimum 4 znaki.';
    }

    return null;
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
      title: isEditMode ? 'Zapisać zmiany?' : 'Dodać pracownika?',
      message: isEditMode
        ? `Zapisać konto "${fullName}"?`
        : `Dodać konto "${fullName}"?`,
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

      const command = {
        firstName: safeFirstName,
        lastName: safeLastName,
        login: safeLogin,
        password: safePassword.length > 0 ? safePassword : null,
        role,
        isActive,
      };

      if (isEditMode && editedWorker) {
        await apiService.updateWorker(editedWorker.idWorker, {
          idWorker: editedWorker.idWorker,
          ...command,
        });

        showDialog(
          'success',
          'Zapisano',
          'Dane pracownika zostały zapisane.',
          true,
        );
      } else {
        await apiService.createWorker(command);

        showDialog('success', 'Dodano', 'Pracownik został dodany.', true);
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
            {isEditMode ? 'Edytuj pracownika' : 'Dodaj pracownika'}
          </Text>

          <Text style={styles.subtitle}>
            Uzupełnij dane konta i zapisz zmiany.
          </Text>
        </View>

        <View style={formReady ? styles.readyBox : styles.warningBox}>
          <Text style={formReady ? styles.readyTitle : styles.warningTitle}>
            {formReady ? 'Gotowe do zapisu' : 'Uzupełnij dane'}
          </Text>

          <Text style={formReady ? styles.readyText : styles.warningText}>
            {formReady
              ? 'Możesz zapisać konto pracownika.'
              : 'Wpisz imię, nazwisko, login i hasło.'}
          </Text>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Podgląd</Text>

          <View style={styles.previewHeader}>
            <View style={styles.previewIconBox}>
              <Text style={styles.previewIcon}>
                {role === 'Admin' ? '⭐' : '🛠️'}
              </Text>
            </View>

            <View style={styles.previewTextBox}>
              <Text style={styles.previewName}>
                {fullName.length > 0 ? fullName : 'Imię i nazwisko'}
              </Text>

              <Text style={isActive ? styles.currentBadge : styles.archiveBadge}>
                {isActive ? 'Bieżący' : 'Archiwum'}
              </Text>
            </View>
          </View>

          <View style={styles.previewInfoBox}>
            <Text style={styles.previewLabel}>Login</Text>
            <Text style={styles.previewValue}>
              {safeLogin.length > 0 ? safeLogin : 'Brak loginu'}
            </Text>
          </View>

          <View style={styles.previewInfoBox}>
            <Text style={styles.previewLabel}>Rola</Text>
            <Text style={styles.previewValue}>
              {role === 'Admin' ? 'Administrator' : 'Pracownik'}
            </Text>
          </View>
        </View>

        <View style={styles.statusGrid}>
          <View style={firstNameReady ? styles.readyStatusCard : styles.warningStatusCard}>
            <Text style={styles.statusIcon}>{firstNameReady ? '✓' : '!'}</Text>
            <Text style={styles.statusTitle}>Imię</Text>
            <Text style={styles.statusText}>
              {firstNameReady ? 'Uzupełnione' : 'Wymagane'}
            </Text>
          </View>

          <View style={loginReady ? styles.readyStatusCard : styles.warningStatusCard}>
            <Text style={styles.statusIcon}>{loginReady ? '✓' : '!'}</Text>
            <Text style={styles.statusTitle}>Login</Text>
            <Text style={styles.statusText}>
              {loginReady ? 'Uzupełniony' : 'Wymagany'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane pracownika</Text>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Imię</Text>
            <Text
              style={firstNameReady ? styles.counterOk : styles.counterWarning}>
              {safeFirstName.length}/50
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Np. Adam"
            placeholderTextColor="#64748b"
            editable={!submitting}
            returnKeyType="next"
          />

          <View style={styles.labelRow}>
            <Text style={styles.label}>Nazwisko</Text>
            <Text
              style={lastNameReady ? styles.counterOk : styles.counterWarning}>
              {safeLastName.length}/50
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Np. Kowalski"
            placeholderTextColor="#64748b"
            editable={!submitting}
            returnKeyType="next"
          />

          <View style={styles.labelRow}>
            <Text style={styles.label}>Login</Text>
            <Text style={loginReady ? styles.counterOk : styles.counterWarning}>
              {safeLogin.length}/50
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={login}
            onChangeText={setLogin}
            placeholder="Np. akowalski"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            editable={!submitting}
            returnKeyType="next"
          />

          <Text style={styles.label}>{isEditMode ? 'Nowe hasło' : 'Hasło'}</Text>

          <TextInput
            style={[styles.input, !passwordReady && styles.inputWarning]}
            value={password}
            onChangeText={setPassword}
            placeholder={isEditMode ? 'Opcjonalnie' : 'Wpisz hasło'}
            placeholderTextColor="#64748b"
            secureTextEntry
            editable={!submitting}
            returnKeyType="done"
            onSubmitEditing={handleSavePress}
          />

          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>Hasło</Text>
            <Text style={styles.hintText}>
              W edycji zostaw puste, jeśli hasło ma pozostać bez zmian.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rola</Text>

          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'Worker' && styles.roleButtonWorker,
              ]}
              onPress={() => setRole('Worker')}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text
                style={[
                  styles.roleButtonText,
                  role === 'Worker' && styles.roleButtonTextSelected,
                ]}>
                Pracownik
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'Admin' && styles.roleButtonAdmin,
              ]}
              onPress={() => setRole('Admin')}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text
                style={[
                  styles.roleButtonText,
                  role === 'Admin' && styles.roleButtonTextSelected,
                ]}>
                Administrator
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Widoczność</Text>

          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                isActive && styles.statusButtonActive,
              ]}
              onPress={() => setIsActive(true)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text
                style={[
                  styles.statusButtonText,
                  isActive && styles.statusButtonTextSelected,
                ]}>
                Bieżący
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusButton,
                !isActive && styles.statusButtonArchive,
              ]}
              onPress={() => setIsActive(false)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text
                style={[
                  styles.statusButtonText,
                  !isActive && styles.statusButtonTextSelected,
                ]}>
                Archiwum
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!formReady || submitting) && styles.disabledButton,
          ]}
          onPress={handleSavePress}
          activeOpacity={0.85}
          disabled={!formReady || submitting}>
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
          activeOpacity={0.85}
          disabled={submitting}>
          <Text style={styles.cancelButtonText}>Anuluj</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default WorkerFormScreen;