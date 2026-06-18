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

  const phoneReady = useMemo(() => {
    return safePhoneNumber.length <= 30;
  }, [safePhoneNumber]);

  const formReady = useMemo(() => {
    return nameReady && emailReady && passwordReady && phoneReady;
  }, [emailReady, nameReady, passwordReady, phoneReady]);

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
      showDialog('error', 'Błąd', validationError);
      return;
    }

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Zapisać zmiany?',
      message: 'Dane konta zostaną zaktualizowane.',
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

      showDialog('success', 'Zapisano', 'Dane konta zapisane.', true);
    } catch (err) {
      showDialog('error', 'Błąd', (err as Error).message);
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
          <Text style={styles.secondaryButtonText}>Sklep</Text>
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
          <Text style={styles.userText}>{user?.name}</Text>
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
            style={[styles.input, !nameReady && styles.inputWarning]}
            value={name}
            onChangeText={setName}
            placeholder="Imię i nazwisko"
            placeholderTextColor="#64748b"
            editable={!submitting}
            returnKeyType="next"
          />

          <Text style={styles.label}>E-mail</Text>

          <TextInput
            style={[styles.input, !emailReady && styles.inputWarning]}
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
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
            placeholder="Bez zmian"
            placeholderTextColor="#64748b"
            secureTextEntry
            editable={!submitting}
            returnKeyType="next"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dostawa</Text>

          <Text style={styles.label}>Adres</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={adress}
            onChangeText={setAdress}
            placeholder="Adres"
            placeholderTextColor="#64748b"
            multiline
            editable={!submitting}
          />

          <Text style={styles.label}>Telefon</Text>

          <TextInput
            style={[styles.input, !phoneReady && styles.inputWarning]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Telefon"
            placeholderTextColor="#64748b"
            keyboardType="phone-pad"
            editable={!submitting}
            returnKeyType="done"
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
            {submitting ? 'Zapisywanie...' : 'Zapisz'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          disabled={submitting}>
          <Text style={styles.secondaryButtonText}>Anuluj</Text>
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
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 18,
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

  userText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
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
  },

  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 6,
    marginTop: 10,
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
    marginBottom: 6,
  },

  inputWarning: {
    borderColor: '#f97316',
  },

  textArea: {
    minHeight: 86,
    textAlignVertical: 'top',
  },

  saveButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
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
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  disabledButton: {
    opacity: 0.55,
  },
});

export default CustomerProfileScreen;