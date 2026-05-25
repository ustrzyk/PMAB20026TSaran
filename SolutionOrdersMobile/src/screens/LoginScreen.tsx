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

  const [loginOrEmail, setLoginOrEmail] = useState('tsaran');
  const [password, setPassword] = useState('dalej');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (): Promise<void> => {
    try {
      setSubmitting(true);
      setError(null);

      await login(loginOrEmail, password);
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
          <Text style={styles.logo}>🖨️</Text>
          <Text style={styles.appName}>3D Print Shop</Text>
          <Text style={styles.title}>Logowanie</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane konta</Text>

          <Text style={styles.label}>Login albo e-mail</Text>
          <TextInput
            style={styles.input}
            value={loginOrEmail}
            onChangeText={setLoginOrEmail}
            placeholder="np. tsaran albo klient@3dshop.pl"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            editable={!submitting}
          />

          <Text style={styles.label}>Hasło</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Hasło"
            placeholderTextColor="#64748b"
            secureTextEntry
            editable={!submitting}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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

  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
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
});

export default LoginScreen;