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

import AppDialog, {AppDialogType} from '../components/AppDialog.tsx';
import {useAuth} from '../context/AuthContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerProfile'>;

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

function CustomerProfileScreen({navigation}: Props): React.JSX.Element {
  const {user, isCustomer, updateCustomerProfile} = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.login ?? '');
  const [adress, setAdress] = useState(user?.adress ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
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

  const safeName = name.trim();
  const safeEmail = email.trim().toLowerCase();
  const safeAdress = adress.trim();
  const safePhoneNumber = phoneNumber.trim();
  const safePassword = password.trim();

  const nameReady = useMemo(() => {
    return safeName.length >= 3 && safeName.length <= 80;
  }, [safeName]);

  const emailReady = useMemo(() => {
    return safeEmail.length > 0 && isValidEmail(safeEmail);
  }, [safeEmail]);

  const passwordReady = useMemo(() => {
    return safePassword.length === 0 || safePassword.length >= 4;
  }, [safePassword]);

  const deliveryReady = useMemo(() => {
    return safeAdress.length > 0 && safePhoneNumber.length > 0;
  }, [safeAdress, safePhoneNumber]);

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
    if (safeName.length === 0) {
      return 'Podaj imię i nazwisko.';
    }

    if (safeName.length < 3) {
      return 'Imię i nazwisko powinno mieć minimum 3 znaki.';
    }

    if (safeName.length > 80) {
      return 'Imię i nazwisko może mieć maksymalnie 80 znaków.';
    }

    if (safeEmail.length === 0) {
      return 'Podaj adres e-mail.';
    }

    if (!isValidEmail(safeEmail)) {
      return 'Podaj poprawny adres e-mail.';
    }

    if (safePhoneNumber.length > 30) {
      return 'Numer telefonu może mieć maksymalnie 30 znaków.';
    }

    if (safePassword.length > 0 && safePassword.length < 4) {
      return 'Nowe hasło powinno mieć minimum 4 znaki.';
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
      title: 'Zapisać dane?',
      message: 'Zaktualizować dane konta klienta?',
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

      await updateCustomerProfile({
        name: safeName,
        email: safeEmail,
        adress: safeAdress.length > 0 ? safeAdress : null,
        phoneNumber: safePhoneNumber.length > 0 ? safePhoneNumber : null,
        password: safePassword.length > 0 ? safePassword : null,
      });

      showDialog('success', 'Zapisano', 'Dane konta zostały zapisane.', true);
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

  if (!isCustomer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.lockIcon}>👤</Text>

        <Text style={styles.accessTitle}>Dane konta</Text>

        <Text style={styles.accessText}>
          Zaloguj się jako klient, aby edytować dane konta.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: 'AuthLogin'}],
            })
          }
          activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Zaloguj się</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: 'Home'}],
            })
          }
          activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>Wróć do sklepu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.type === 'confirm' ? 'Zapisz' : 'OK'}
        cancelText="Anuluj"
        loading={dialog.loading}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.appName}>3D Print Shop</Text>
          <Text style={styles.title}>Dane konta</Text>
          <Text style={styles.subtitle}>
            Zmień dane kontaktowe i dane dostawy.
          </Text>
        </View>

        <View style={deliveryReady ? styles.readyBox : styles.warningBox}>
          <Text style={deliveryReady ? styles.readyTitle : styles.warningTitle}>
            {deliveryReady ? 'Dane dostawy zapisane' : 'Uzupełnij dostawę'}
          </Text>

          <Text style={deliveryReady ? styles.readyText : styles.warningText}>
            {deliveryReady
              ? 'Adres i telefon są gotowe do użycia przy zamówieniu.'
              : 'Adres i telefon ułatwią składanie zamówienia.'}
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
                {safeName.length > 0 ? safeName : 'Imię i nazwisko'}
              </Text>

              <Text style={styles.currentBadge}>Klient</Text>
            </View>
          </View>

          <View style={styles.previewInfoBox}>
            <Text style={styles.previewLabel}>E-mail</Text>
            <Text style={styles.previewValue}>
              {safeEmail.length > 0 ? safeEmail : 'Brak e-maila'}
            </Text>
          </View>

          <View style={styles.previewInfoBox}>
            <Text style={styles.previewLabel}>Adres</Text>
            <Text style={styles.previewValue}>
              {safeAdress.length > 0 ? safeAdress : 'Brak adresu'}
            </Text>
          </View>

          <View style={styles.previewInfoBox}>
            <Text style={styles.previewLabel}>Telefon</Text>
            <Text style={styles.previewValue}>
              {safePhoneNumber.length > 0 ? safePhoneNumber : 'Brak telefonu'}
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

          <View style={emailReady ? styles.readyStatusCard : styles.warningStatusCard}>
            <Text style={styles.statusIcon}>{emailReady ? '✓' : '!'}</Text>
            <Text style={styles.statusTitle}>E-mail</Text>
            <Text style={styles.statusText}>
              {emailReady ? 'Poprawny' : 'Wymagany'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane podstawowe</Text>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Imię i nazwisko</Text>
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

          <Text style={styles.label}>Nowe hasło</Text>

          <TextInput
            style={[styles.input, !passwordReady && styles.inputWarning]}
            value={password}
            onChangeText={setPassword}
            placeholder="Opcjonalnie"
            placeholderTextColor="#64748b"
            secureTextEntry
            editable={!submitting}
            returnKeyType="next"
          />

          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>Hasło</Text>
            <Text style={styles.hintText}>
              Zostaw puste, jeśli hasło ma pozostać bez zmian.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane dostawy</Text>

          <Text style={styles.label}>Adres</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={adress}
            onChangeText={setAdress}
            placeholder="Np. ul. Testowa 10, Warszawa"
            placeholderTextColor="#64748b"
            multiline
            editable={!submitting}
          />

          <Text style={styles.label}>Telefon</Text>

          <TextInput
            style={[
              styles.input,
              safePhoneNumber.length > 30 && styles.inputWarning,
            ]}
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

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!formReady || submitting) && styles.disabledButton,
          ]}
          onPress={handleSavePress}
          activeOpacity={0.85}
          disabled={!formReady || submitting}>
          <Text style={styles.saveButtonText}>
            {submitting ? 'Zapisywanie...' : 'Zapisz dane'}
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

  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  lockIcon: {
    fontSize: 46,
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
    minHeight: 96,
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

  primaryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 10,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  secondaryButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default CustomerProfileScreen;