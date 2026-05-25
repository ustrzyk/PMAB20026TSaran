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

import {useAuth, UserRole} from '../context/AuthContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthLogin'>;

function LoginScreen({navigation}: Props): React.JSX.Element {
  const {login} = useAuth();

  const [email, setEmail] = useState('himen@test.pl');
  const [password, setPassword] = useState('czopek');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (): void => {
    try {
      setError(null);
      login(email, password, selectedRole);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const renderRoleButton = (
    role: UserRole,
    icon: string,
    title: string,
    description: string,
  ): React.JSX.Element => {
    const selected = selectedRole === role;

    return (
      <TouchableOpacity
        style={[styles.roleCard, selected && styles.roleCardSelected]}
        onPress={() => setSelectedRole(role)}
        activeOpacity={0.85}>
        <Text style={styles.roleIcon}>{icon}</Text>

        <View style={styles.roleTextBox}>
          <Text style={styles.roleTitle}>{title}</Text>
          <Text style={styles.roleDescription}>{description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.logo}>🖨️</Text>
          <Text style={styles.appName}>3D Print Shop</Text>
          <Text style={styles.title}>Zaloguj się</Text>
          <Text style={styles.subtitle}>
            Wybierz tryb pracy i przejdź do sklepu albo administracji.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kim jesteś?</Text>

          {renderRoleButton(
            'customer',
            '🛒',
            'Klient',
            'Sklep, koszyk i moje zamówienie',
          )}

          {renderRoleButton(
            'admin',
            '🛠️',
            'Administrator',
            'Produkty, zamówienia, raporty i słowniki',
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane logowania</Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="np. klient@test.pl"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Hasło</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Hasło"
            placeholderTextColor="#64748b"
            secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.85}>
            <Text style={styles.loginButtonText}>Zaloguj</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}>
            <Text style={styles.registerButtonText}>
              Nie mam konta — zarejestruj klienta
            </Text>
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

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
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

  roleCard: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  roleCardSelected: {
    borderColor: '#f97316',
    backgroundColor: '#1f2937',
  },

  roleIcon: {
    fontSize: 30,
  },

  roleTextBox: {
    flex: 1,
  },

  roleTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 3,
  },

  roleDescription: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
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

  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  registerButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  registerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  infoBox: {
    backgroundColor: '#172554',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
  },

  infoText: {
    color: '#bfdbfe',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default LoginScreen;