import React, {useMemo, useState} from 'react';
import {
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
            style={[
              styles.input,
              !emailReady && styles.inputWarning,
            ]}
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
            style={[
              styles.input,
              !passwordReady && styles.inputWarning,
            ]}
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
            style={styles.input}
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

  previewHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  previewIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewIcon: {
    fontSize: 28,
  },

  previewTextBox: {
    flex: 1,
  },

  previewName: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },

  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  archiveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#334155',
    color: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  previewInfoBox: {
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
    marginBottom: 4,
  },

  previewValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },

  statusGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  readyStatusCard: {
    flex: 1,
    backgroundColor: '#052e16',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#16a34a',
  },

  warningStatusCard: {
    flex: 1,
    backgroundColor: '#431407',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f97316',
  },

  infoStatusCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  statusIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },

  statusTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },

  statusText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
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

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    marginBottom: 6,
  },

  label: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },

  counterOk: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '900',
  },

  counterWarning: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '900',
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
    marginBottom: 14,
  },

  inputWarning: {
    borderColor: '#f97316',
  },

  textArea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },

  hintBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },

  hintTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 4,
  },

  hintText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
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
    paddingVertical: 12,
    alignItems: 'center',
  },

  statusButtonActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  statusButtonArchive: {
    backgroundColor: '#334155',
    borderColor: '#475569',
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

export default ClientFormScreen;