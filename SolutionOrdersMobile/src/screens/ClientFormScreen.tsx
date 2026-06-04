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

type CreateProps = NativeStackScreenProps<RootStackParamList, 'CreateClient'>;
type EditProps = NativeStackScreenProps<RootStackParamList, 'EditClient'>;

type Props = CreateProps | EditProps;

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function ClientFormScreen({navigation, route}: Props): React.JSX.Element {
  const isEditMode = route.name === 'EditClient';
  const editedClient = isEditMode ? route.params.client : undefined;

  const [name, setName] = useState(editedClient?.name ?? '');
  const [email, setEmail] = useState(editedClient?.email ?? '');
  const [password, setPassword] = useState('');
  const [adress, setAdress] = useState(editedClient?.adress ?? '');
  const [phoneNumber, setPhoneNumber] = useState(
    editedClient?.phoneNumber ?? '',
  );
  const [isActive, setIsActive] = useState(editedClient?.isActive ?? true);

  const [submitting, setSubmitting] = useState(false);
  const [goBackAfterDialog, setGoBackAfterDialog] = useState(false);

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const safeName = name.trim();
  const safeEmail = email.trim();
  const safePassword = password.trim();
  const safeAddress = adress.trim();
  const safePhone = phoneNumber.trim();

  const nameReady = useMemo(() => {
    return safeName.length >= 2 && safeName.length <= 80;
  }, [safeName]);

  const emailReady = useMemo(() => {
    return safeEmail.length === 0 || isValidEmail(safeEmail);
  }, [safeEmail]);

  const passwordReady = useMemo(() => {
    if (safePassword.length === 0) {
      return true;
    }

    return safePassword.length >= 4;
  }, [safePassword]);

  const contactReady = useMemo(() => {
    return safeAddress.length > 0 || safePhone.length > 0 || safeEmail.length > 0;
  }, [safeAddress, safeEmail, safePhone]);

  const formReady = useMemo(() => {
    return nameReady && emailReady && passwordReady;
  }, [emailReady, nameReady, passwordReady]);

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
    const hasEmail = safeEmail.length > 0;
    const hasPassword = safePassword.length > 0;

    if (safeName.length === 0) {
      return 'Podaj nazwę klienta.';
    }

    if (safeName.length < 2) {
      return 'Nazwa klienta powinna mieć minimum 2 znaki.';
    }

    if (safeName.length > 80) {
      return 'Nazwa klienta może mieć maksymalnie 80 znaków.';
    }

    if (hasEmail && !isValidEmail(safeEmail)) {
      return 'Podaj poprawny adres e-mail.';
    }

    if (!isEditMode && hasEmail && !hasPassword) {
      return 'Podaj hasło albo zostaw e-mail pusty.';
    }

    if (hasPassword && safePassword.length < 4) {
      return 'Hasło powinno mieć minimum 4 znaki.';
    }

    if (safePhone.length > 30) {
      return 'Numer telefonu może mieć maksymalnie 30 znaków.';
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
      title: isEditMode ? 'Zapisać zmiany?' : 'Dodać klienta?',
      message: isEditMode
        ? `Zapisać klienta "${safeName}"?`
        : `Dodać klienta "${safeName}"?`,
      loading: false,
    });
  };

  const submitForm = async (): Promise<void> => {
    const normalizedEmail = safeEmail.toLowerCase();

    try {
      setSubmitting(true);

      setDialog(previous => ({
        ...previous,
        loading: true,
      }));

      const command = {
        name: safeName,
        adress: safeAddress.length > 0 ? safeAddress : null,
        phoneNumber: safePhone.length > 0 ? safePhone : null,
        email: normalizedEmail.length > 0 ? normalizedEmail : null,
        password: safePassword.length > 0 ? safePassword : null,
        isActive,
      };

      if (isEditMode && editedClient) {
        await apiService.updateClient(editedClient.idClient, {
          idClient: editedClient.idClient,
          ...command,
        });

        showDialog('success', 'Zapisano', 'Dane klienta zostały zapisane.', true);
      } else {
        await apiService.createClient(command);

        showDialog('success', 'Dodano', 'Klient został dodany.', true);
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
            {isEditMode ? 'Edytuj klienta' : 'Dodaj klienta'}
          </Text>

          <Text style={styles.subtitle}>
            Uzupełnij dane klienta i zapisz zmiany.
          </Text>
        </View>

        <View style={formReady ? styles.readyBox : styles.warningBox}>
          <Text style={formReady ? styles.readyTitle : styles.warningTitle}>
            {formReady ? 'Gotowe do zapisu' : 'Uzupełnij dane'}
          </Text>

          <Text style={formReady ? styles.readyText : styles.warningText}>
            {formReady
              ? 'Możesz zapisać dane klienta.'
              : 'Wpisz nazwę klienta i sprawdź e-mail oraz hasło.'}
          </Text>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Podgląd</Text>

          <View style={styles.previewHeader}>
            <View style={styles.previewIconBox}>
              <Text style={styles.previewIcon}>👤</Text>
            </View>

            <View style={styles.previewTextBox}>
              <Text style={styles.previewName}>
                {safeName.length > 0 ? safeName : 'Nazwa klienta'}
              </Text>

              <Text style={isActive ? styles.currentBadge : styles.archiveBadge}>
                {isActive ? 'Bieżący' : 'Archiwum'}
              </Text>
            </View>
          </View>

          <View style={styles.previewInfoBox}>
            <Text style={styles.previewLabel}>E-mail</Text>
            <Text style={styles.previewValue}>
              {safeEmail.length > 0 ? safeEmail : 'Brak e-maila'}
            </Text>
          </View>

          <View style={styles.previewInfoBox}>
            <Text style={styles.previewLabel}>Telefon</Text>
            <Text style={styles.previewValue}>
              {safePhone.length > 0 ? safePhone : 'Brak telefonu'}
            </Text>
          </View>

          <View style={styles.previewInfoBox}>
            <Text style={styles.previewLabel}>Adres</Text>
            <Text style={styles.previewValue}>
              {safeAddress.length > 0 ? safeAddress : 'Brak adresu'}
            </Text>
          </View>
        </View>

        <View style={styles.statusGrid}>
          <View style={nameReady ? styles.readyStatusCard : styles.warningStatusCard}>
            <Text style={styles.statusIcon}>{nameReady ? '✓' : '!'}</Text>
            <Text style={styles.statusTitle}>Nazwa</Text>
            <Text style={styles.statusText}>
              {nameReady ? 'Uzupełniona' : 'Wymagana'}
            </Text>
          </View>

          <View style={contactReady ? styles.readyStatusCard : styles.infoStatusCard}>
            <Text style={styles.statusIcon}>{contactReady ? '✓' : 'i'}</Text>
            <Text style={styles.statusTitle}>Kontakt</Text>
            <Text style={styles.statusText}>
              {contactReady ? 'Uzupełniony' : 'Opcjonalny'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane klienta</Text>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Nazwa</Text>
            <Text style={nameReady ? styles.counterOk : styles.counterWarning}>
              {safeName.length}/80
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Np. Jan Kowalski"
            placeholderTextColor="#64748b"
            editable={!submitting}
            returnKeyType="next"
          />

          <Text style={styles.label}>E-mail</Text>

          <TextInput
            style={[styles.input, !emailReady && styles.inputWarning]}
            value={email}
            onChangeText={setEmail}
            placeholder="Np. jan@3dshop.pl"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!submitting}
            returnKeyType="next"
          />

          <Text style={styles.label}>
            {isEditMode ? 'Nowe hasło' : 'Hasło'}
          </Text>

          <TextInput
            style={[styles.input, !passwordReady && styles.inputWarning]}
            value={password}
            onChangeText={setPassword}
            placeholder={
              isEditMode
                ? 'Opcjonalnie'
                : 'Wymagane, jeśli podajesz e-mail'
            }
            placeholderTextColor="#64748b"
            secureTextEntry
            editable={!submitting}
            returnKeyType="next"
          />

          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>Hasło</Text>
            <Text style={styles.hintText}>
              W edycji zostaw puste, jeśli hasło ma pozostać bez zmian.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kontakt</Text>

          <Text style={styles.label}>Adres</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={adress}
            onChangeText={setAdress}
            placeholder="Np. ul. Testowa 10"
            placeholderTextColor="#64748b"
            multiline
            editable={!submitting}
          />

          <Text style={styles.label}>Telefon</Text>

          <TextInput
            style={[styles.input, safePhone.length > 30 && styles.inputWarning]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Np. 500-100-200"
            placeholderTextColor="#64748b"
            keyboardType="phone-pad"
            editable={!submitting}
            returnKeyType="done"
            onSubmitEditing={handleSavePress}
          />
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
                : 'Dodaj klienta'}
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

export default ClientFormScreen;