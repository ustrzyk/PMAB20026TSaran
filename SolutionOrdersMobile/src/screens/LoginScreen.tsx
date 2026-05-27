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

type Props = NativeStackScreenProps<RootStackParamList, 'AuthLogin'>;

function LoginScreen({navigation}: Props): React.JSX.Element {
  const {login} = useAuth();

  const [loginOrEmail, setLoginOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isEmployeeLogin = loginOrEmail.trim().length > 0 &&
    !loginOrEmail.includes('@');

  const handleLogin = async (): Promise<void> => {
    try {
      setSubmitting(true);
      setError(null);

      const loggedUser = await login(loginOrEmail, password);

      if (loggedUser.role === 'admin' || loggedUser.role === 'worker') {
        navigation.reset({
          index: 0,
          routes: [{name: 'AdminPanel'}],
        });

        return;
      }

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

  const updateLoginOrEmail = (value: string): void => {
    setLoginOrEmail(value);
    setError(null);
  };

  const updatePassword = (value: string): void => {
    setPassword(value);
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.logo}>🖨️</Text>
          <Text style={styles.appName}>3D Print Shop</Text>
          <Text style={styles.title}>Logowanie</Text>

          <Text style={styles.subtitle}>
            Klient loguje się adresem e-mail, a pracownik lub administrator
            loginem bez znaku @.
          </Text>
        </View>

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Jak się logować?</Text>

          <View style={styles.helpRow}>
            <Text style={styles.helpIcon}>👤</Text>
            <View style={styles.helpTextBox}>
              <Text style={styles.helpLabel}>Klient</Text>
              <Text style={styles.helpText}>Wpisuje adres e-mail i hasło.</Text>
            </View>
          </View>

          <View style={styles.helpRow}>
            <Text style={styles.helpIcon}>🛠️</Text>
            <View style={styles.helpTextBox}>
              <Text style={styles.helpLabel}>Pracownik/Admin</Text>
              <Text style={styles.helpText}>Wpisuje login systemowy i hasło.</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane konta</Text>

          <Text style={styles.label}>Login albo e-mail</Text>
          <TextInput
            style={styles.input}
            value={loginOrEmail}
            onChangeText={updateLoginOrEmail}
            placeholder="np. jan@3dshop.pl albo tsaran"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            editable={!submitting}
          />

          <View style={isEmployeeLogin ? styles.modeBoxEmployee : styles.modeBoxCustomer}>
            <Text style={styles.modeText}>
              {isEmployeeLogin
                ? 'Tryb: logowanie pracownika / administratora'
                : 'Tryb: logowanie klienta e-mailem'}
            </Text>
          </View>

          <Text style={styles.label}>Hasło</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={updatePassword}
            placeholder="Hasło"
            placeholderTextColor="#64748b"
            secureTextEntry
            editable={!submitting}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Błąd logowania</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.loginButton, submitting && styles.disabledButton]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.loginButtonText}>
              {submitting ? 'Logowanie...' : 'Zaloguj'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.registerButtonText}>Utwórz konto klienta</Text>
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
          <Text style={styles.statusTitle}>Po zalogowaniu klient może:</Text>

          <Text style={styles.statusText}>• przeglądać swoje zamówienia,</Text>
          <Text style={styles.statusText}>• sprawdzać status realizacji,</Text>
          <Text style={styles.statusText}>• edytować dane konta i dostawy.</Text>
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
    fontSize: 30,
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

  helpBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  helpTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 10,
  },

  helpRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 8,
  },

  helpIcon: {
    fontSize: 25,
  },

  helpTextBox: {
    flex: 1,
  },

  helpLabel: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 3,
  },

  helpText: {
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

  modeBoxCustomer: {
    backgroundColor: '#052e16',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 12,
  },

  modeBoxEmployee: {
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#6366f1',
    marginBottom: 12,
  },

  modeText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
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

  loginButton: {
    backgroundColor: '#f97316',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 2,
  },

  disabledButton: {
    opacity: 0.65,
  },

  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  registerButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  registerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  guestButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
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

export default LoginScreen;