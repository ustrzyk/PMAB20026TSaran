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

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerProfile'>;

function CustomerProfileScreen({navigation}: Props): React.JSX.Element {
  const {user, isCustomer, updateCustomerProfile} = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.login ?? '');
  const [adress, setAdress] = useState(user?.adress ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async (): Promise<void> => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await updateCustomerProfile({
        name,
        email,
        adress,
        phoneNumber,
        password: password.trim().length > 0 ? password : null,
      });

      setPassword('');
      setSuccess('Dane konta zostały zapisane.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isCustomer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.lockIcon}>🔒</Text>

        <Text style={styles.accessTitle}>Brak dostępu</Text>

        <Text style={styles.accessText}>
          Edycja danych konta jest dostępna tylko po zalogowaniu jako klient.
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
          <Text style={styles.primaryButtonText}>Zaloguj</Text>
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
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.appName}>3D Print Shop</Text>
          <Text style={styles.title}>Dane konta</Text>
          <Text style={styles.subtitle}>
            Edytuj dane używane do logowania i dostawy zamówień.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Konto klienta</Text>

          <Text style={styles.label}>Imię i nazwisko</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={value => {
              setName(value);
              setError(null);
              setSuccess(null);
            }}
            placeholder="Np. Jan Kowalski"
            placeholderTextColor="#64748b"
            editable={!submitting}
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={value => {
              setEmail(value);
              setError(null);
              setSuccess(null);
            }}
            placeholder="Np. jan@3dshop.pl"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!submitting}
          />

          <Text style={styles.label}>Nowe hasło</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={value => {
              setPassword(value);
              setError(null);
              setSuccess(null);
            }}
            placeholder="Opcjonalnie"
            placeholderTextColor="#64748b"
            secureTextEntry
            editable={!submitting}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane dostawy</Text>

          <Text style={styles.label}>Adres</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={adress}
            onChangeText={value => {
              setAdress(value);
              setError(null);
              setSuccess(null);
            }}
            placeholder="Np. ul. Testowa 1, Warszawa"
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
              setError(null);
              setSuccess(null);
            }}
            placeholder="Np. 500111222"
            placeholderTextColor="#64748b"
            keyboardType="phone-pad"
            editable={!submitting}
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.disabledButton]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={submitting}>
          <Text style={styles.saveButtonText}>
            {submitting ? 'Zapisywanie...' : 'Zapisz dane'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('ClientPanel')}
          activeOpacity={0.85}
          disabled={submitting}>
          <Text style={styles.backButtonText}>Wróć do konta</Text>
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

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  lockIcon: {
    fontSize: 48,
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
    fontSize: 26,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
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
    minHeight: 92,
    textAlignVertical: 'top',
  },

  errorBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 12,
  },

  errorText: {
    color: '#fecaca',
    fontSize: 13,
    fontWeight: '800',
  },

  successBox: {
    backgroundColor: '#052e16',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 12,
  },

  successText: {
    color: '#bbf7d0',
    fontSize: 13,
    fontWeight: '800',
  },

  saveButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  backButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },

  backButtonText: {
    color: '#ffffff',
    fontSize: 15,
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
    alignSelf: 'stretch',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default CustomerProfileScreen;