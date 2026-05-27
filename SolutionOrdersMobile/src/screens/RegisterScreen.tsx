import React, {useState} from 'react';
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

import {useAuth} from '../context/AuthContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

function RegisterScreen({navigation}: Props): React.JSX.Element {
  const {registerCustomer} = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adress, setAdress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAccountPartReady =
    name.trim().length >= 3 &&
    email.trim().includes('@') &&
    password.trim().length >= 4;

  const isDeliveryPartReady =
    adress.trim().length > 0 &&
    phoneNumber.trim().length > 0;

  const handleRegister = async (): Promise<void> => {
    try {
      setSubmitting(true);
      setError(null);

      await registerCustomer(name, email, password, adress, phoneNumber);

      navigation.reset({
        index: 0,
        routes: [{name: 'ClientPanel'}],
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateName = (value: string): void => {
    setName(value);
    setError(null);
  };

  const updateEmail = (value: string): void => {
    setEmail(value);
    setError(null);
  };

  const updatePassword = (value: string): void => {
    setPassword(value);
    setError(null);
  };

  const updateAdress = (value: string): void => {
    setAdress(value);
    setError(null);
  };

  const updatePhoneNumber = (value: string): void => {
    setPhoneNumber(value);
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.logo}>👤</Text>
          <Text style={styles.appName}>3D Print Shop</Text>
          <Text style={styles.title}>Rejestracja klienta</Text>

          <Text style={styles.subtitle}>
            Konto klienta pozwala zapisywać dane dostawy i śledzić statusy
            zamówień.
          </Text>
        </View>

        <View style={styles.progressBox}>
          <Text style={styles.progressTitle}>Postęp formularza</Text>

          <View style={styles.progressRow}>
            <Text style={isAccountPartReady ? styles.progressDone : styles.progressTodo}>
              {isAccountPartReady ? '✓' : '1'}
            </Text>

            <View style={styles.progressTextBox}>
              <Text style={styles.progressLabel}>Dane konta</Text>
              <Text style={styles.progressText}>
                Imię i nazwisko, e-mail oraz hasło.
              </Text>
            </View>
          </View>

          <View style={styles.progressRow}>
            <Text style={isDeliveryPartReady ? styles.progressDone : styles.progressTodo}>
              {isDeliveryPartReady ? '✓' : '2'}
            </Text>

            <View style={styles.progressTextBox}>
              <Text style={styles.progressLabel}>Dane dostawy</Text>
              <Text style={styles.progressText}>
                Adres i telefon ułatwią składanie zamówień.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane konta</Text>

          <Text style={styles.label}>Imię i nazwisko</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={updateName}
            placeholder="np. Jan Kowalski"
            placeholderTextColor="#64748b"
            editable={!submitting}
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={updateEmail}
            placeholder="np. jan@test.pl"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!submitting}
          />

          <Text style={styles.label}>Hasło</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={updatePassword}
            placeholder="Minimum 4 znaki"
            placeholderTextColor="#64748b"
            secureTextEntry
            editable={!submitting}
          />

          <View style={isAccountPartReady ? styles.readyBox : styles.warningBox}>
            <Text style={isAccountPartReady ? styles.readyTitle : styles.warningTitle}>
              {isAccountPartReady ? 'Dane konta wyglądają poprawnie' : 'Uzupełnij dane konta'}
            </Text>

            <Text style={isAccountPartReady ? styles.readyText : styles.warningText}>
              {isAccountPartReady
                ? 'Możesz przejść do danych dostawy albo utworzyć konto.'
                : 'Wpisz minimum 3 znaki w nazwie, poprawny e-mail i hasło minimum 4 znaki.'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane dostawy</Text>

          <Text style={styles.label}>Adres</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={adress}
            onChangeText={updateAdress}
            placeholder="np. ul. Testowa 1, Warszawa"
            placeholderTextColor="#64748b"
            multiline
            editable={!submitting}
          />

          <Text style={styles.label}>Telefon</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={updatePhoneNumber}
            placeholder="np. 500111222"
            placeholderTextColor="#64748b"
            keyboardType="phone-pad"
            editable={!submitting}
          />

          <View style={isDeliveryPartReady ? styles.readyBox : styles.infoBox}>
            <Text style={isDeliveryPartReady ? styles.readyTitle : styles.infoTitle}>
              {isDeliveryPartReady ? 'Dane dostawy uzupełnione' : 'Dane dostawy są opcjonalne'}
            </Text>

            <Text style={isDeliveryPartReady ? styles.readyText : styles.infoText}>
              {isDeliveryPartReady
                ? 'Te dane będą mogły być użyte podczas składania zamówienia.'
                : 'Możesz je uzupełnić teraz albo później w panelu klienta.'}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Błąd rejestracji</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.registerButton, submitting && styles.disabledButton]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.registerButtonText}>
              {submitting ? 'Tworzenie konta...' : 'Utwórz konto'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('AuthLogin')}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.loginButtonText}>Mam już konto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.guestButtonText}>Wróć do sklepu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Co zyskujesz po rejestracji?</Text>

          <Text style={styles.statusText}>• panel klienta,</Text>
          <Text style={styles.statusText}>• historię zamówień,</Text>
          <Text style={styles.statusText}>• śledzenie statusu realizacji,</Text>
          <Text style={styles.statusText}>• zapisane dane dostawy.</Text>
        </View>
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
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
    alignItems: 'center',
  },

  logo: {
    fontSize: 46,
    marginBottom: 8,
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
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },

  progressBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  progressTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 10,
  },

  progressRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 8,
  },

  progressDone: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#16a34a',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 28,
    overflow: 'hidden',
  },

  progressTodo: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#334155',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 28,
    overflow: 'hidden',
  },

  progressTextBox: {
    flex: 1,
  },

  progressLabel: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 3,
  },

  progressText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
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
    marginBottom: 12,
  },

  textArea: {
    minHeight: 78,
    textAlignVertical: 'top',
  },

  readyBox: {
    backgroundColor: '#052e16',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 12,
  },

  readyTitle: {
    color: '#bbf7d0',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },

  readyText: {
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  warningBox: {
    backgroundColor: '#431407',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 12,
  },

  warningTitle: {
    color: '#fed7aa',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },

  warningText: {
    color: '#fed7aa',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  infoBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  infoTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },

  infoText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  errorBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 12,
  },

  errorTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },

  errorText: {
    color: '#fecaca',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },

  registerButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 2,
  },

  disabledButton: {
    opacity: 0.65,
  },

  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  loginButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  loginButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  guestButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },

  guestButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  statusBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },

  statusTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },

  statusText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
});

export default RegisterScreen;