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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async (): Promise<void> => {
    if (!canSubmit) {
      setError('Podaj e-mail i hasło');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const loggedUser = await login(email, password);

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

  const updateEmail = (value: string): void => {
    setEmail(value);
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
          <Text style={styles.logo}>👤</Text>

          <Text style={styles.title}>Zaloguj się</Text>

          <Text style={styles.subtitle}>
            Wejdź do swojego konta, sprawdź zamówienia i szybciej składaj
            kolejne zakupy.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane logowania</Text>

          <Text style={styles.label}>E-mail</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={updateEmail}
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
            onChangeText={updatePassword}
            placeholder="Wpisz hasło"
            placeholderTextColor="#64748b"
            secureTextEntry
            editable={!submitting}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.loginButton,
              (!canSubmit || submitting) && styles.disabledButton,
            ]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={!canSubmit || submitting}>
            <Text style={styles.loginButtonText}>
              {submitting ? 'Logowanie...' : 'Zaloguj'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.registerButtonText}>Utwórz konto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickBox}>
          <Text style={styles.quickTitle}>Chcesz tylko kupić produkt?</Text>

          <Text style={styles.quickText}>
            Możesz przejść do sklepu bez logowania. Konto przyda się później do
            historii zamówień i zapisanych danych dostawy.
          </Text>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{name: 'Home'}],
              })
            }
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.guestButtonText}>Przejdź do sklepu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Po zalogowaniu możesz:</Text>

          <Text style={styles.infoText}>• sprawdzić swoje zamówienia,</Text>
          <Text style={styles.infoText}>• zobaczyć aktualny status realizacji,</Text>
          <Text style={styles.infoText}>• szybciej uzupełnić dane dostawy.</Text>
        </View>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
          disabled={submitting}>
          <Text style={styles.homeButtonText}>Wróć na start</Text>
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

  loginButton: {
    backgroundColor: '#f97316',
    paddingVertical: 14,
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
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  registerButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  quickBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  quickTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 5,
  },

  quickText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 12,
  },

  guestButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  guestButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  infoBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginBottom: 14,
  },

  infoTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },

  infoText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },

  homeButton: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },

  homeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default LoginScreen;