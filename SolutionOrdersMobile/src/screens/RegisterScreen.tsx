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

  const accountReady = useMemo(() => {
    return (
      name.trim().length >= 3 &&
      email.trim().includes('@') &&
      password.trim().length >= 4
    );
  }, [email, name, password]);

  const deliveryReady = useMemo(() => {
    return adress.trim().length >= 5 && phoneNumber.trim().length >= 6;
  }, [adress, phoneNumber]);

  const canSubmit = accountReady;

  const clearError = (): void => {
    setError(null);
  };

  const handleRegister = async (): Promise<void> => {
    if (!canSubmit) {
      setError('Uzupełnij imię i nazwisko, e-mail oraz hasło.');
      return;
    }

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.logo}>👤</Text>

          <Text style={styles.title}>Utwórz konto</Text>

          <Text style={styles.subtitle}>
            Konto pozwala szybciej zamawiać produkty i sprawdzać status
            realizacji.
          </Text>
        </View>

        <View style={styles.progressBox}>
          <View style={styles.progressRow}>
            <View style={accountReady ? styles.stepDone : styles.stepTodo}>
              <Text style={styles.stepNumber}>{accountReady ? '✓' : '1'}</Text>
            </View>

            <View style={styles.stepTextBox}>
              <Text style={styles.stepTitle}>Konto</Text>
              <Text style={styles.stepText}>
                Imię i nazwisko, e-mail oraz hasło.
              </Text>
            </View>
          </View>

          <View style={styles.progressRow}>
            <View style={deliveryReady ? styles.stepDone : styles.stepTodo}>
              <Text style={styles.stepNumber}>{deliveryReady ? '✓' : '2'}</Text>
            </View>

            <View style={styles.stepTextBox}>
              <Text style={styles.stepTitle}>Dostawa</Text>
              <Text style={styles.stepText}>
                Adres i telefon możesz uzupełnić teraz albo później.
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
            onChangeText={value => {
              setName(value);
              clearError();
            }}
            placeholder="np. Jan Kowalski"
            placeholderTextColor="#64748b"
            editable={!submitting}
            returnKeyType="next"
          />

          <Text style={styles.label}>E-mail</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={value => {
              setEmail(value);
              clearError();
            }}
            placeholder="np. jan@3dshop.pl"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!submitting}
            returnKeyType="next"
          />

          <Text style={styles.label}>Hasło</Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={value => {
              setPassword(value);
              clearError();
            }}
            placeholder="Minimum 4 znaki"
            placeholderTextColor="#64748b"
            secureTextEntry
            editable={!submitting}
            returnKeyType="next"
          />

          <View style={accountReady ? styles.readyBox : styles.warningBox}>
            <Text style={accountReady ? styles.readyTitle : styles.warningTitle}>
              {accountReady ? 'Dane konta są gotowe' : 'Uzupełnij dane konta'}
            </Text>

            <Text style={accountReady ? styles.readyText : styles.warningText}>
              {accountReady
                ? 'Możesz utworzyć konto albo dopisać dane dostawy.'
                : 'Wpisz imię i nazwisko, poprawny e-mail oraz hasło minimum 4 znaki.'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane dostawy</Text>

          <Text style={styles.label}>Adres</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={adress}
            onChangeText={value => {
              setAdress(value);
              clearError();
            }}
            placeholder="np. ul. Testowa 1, Berlin"
            placeholderTextColor="#64748b"
            multiline
            editable={!submitting}
          />

          <Text style={styles.label}>Telefon</Text>

          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={value => {
              setPhoneNumber(value);
              clearError();
            }}
            placeholder="np. 500111222"
            placeholderTextColor="#64748b"
            keyboardType="phone-pad"
            editable={!submitting}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          <View style={deliveryReady ? styles.readyBox : styles.infoBox}>
            <Text style={deliveryReady ? styles.readyTitle : styles.infoTitle}>
              {deliveryReady ? 'Dane dostawy uzupełnione' : 'Dane dostawy są opcjonalne'}
            </Text>

            <Text style={deliveryReady ? styles.readyText : styles.infoText}>
              {deliveryReady
                ? 'Te dane będą dostępne przy składaniu zamówienia.'
                : 'Możesz je dopisać teraz albo później w panelu klienta.'}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.registerButton,
              (!canSubmit || submitting) && styles.disabledButton,
            ]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={!canSubmit || submitting}>
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

        <View style={styles.infoPanel}>
          <Text style={styles.infoPanelTitle}>Po co konto?</Text>

          <Text style={styles.infoPanelText}>• szybki dostęp do zamówień,</Text>
          <Text style={styles.infoPanelText}>• aktualny status realizacji,</Text>
          <Text style={styles.infoPanelText}>• zapisany adres i telefon.</Text>
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
    padding: 22,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
    alignItems: 'center',
  },

  logo: {
    fontSize: 48,
    marginBottom: 10,
  },

  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
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

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },

  stepDone: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepTodo: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  stepTextBox: {
    flex: 1,
  },

  stepTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 3,
  },

  stepText: {
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
    fontSize: 18,
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
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },

  textArea: {
    minHeight: 86,
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
    marginBottom: 4,
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
    marginBottom: 4,
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
    marginBottom: 4,
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

  errorText: {
    color: '#fecaca',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },

  registerButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
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
    fontWeight: '900',
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
    fontWeight: '900',
  },

  infoPanel: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },

  infoPanelTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },

  infoPanelText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
});

export default RegisterScreen;