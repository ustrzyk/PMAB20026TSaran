import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';

// TypeScript interface dla danych formularza
interface FormData {
  name: string;
  email: string;
}

const SimpleForm: React.FC = () => {
  // State dla formularza
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
  });

  // State dla statusu
  const [submitted, setSubmitted] = useState(false);

  // Handler do zmiany pola
  const handleChangeName = (text: string): void => {
    setFormData({ ...formData, name: text });
  };

  const handleChangeEmail = (text: string): void => {
    setFormData({ ...formData, email: text });
  };

  // Handler do wysłania
  const handleSubmit = (): void => {
    if (!formData.name || !formData.email) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola!');
      return;
    }

    console.log('Submitted:', formData);
    setSubmitted(true);

    // Reset po 2 sekundach
    setTimeout(() => {
      setFormData({ name: '', email: '' });
      setSubmitted(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Formularz Kontaktowy</Text>

      {/* Pole Imię */}
      <TextInput
        style={styles.input}
        placeholder="Wpisz imię"
        value={formData.name}
        onChangeText={handleChangeName}
        placeholderTextColor="#999"
      />

      {/* Pole Email */}
      <TextInput
        style={styles.input}
        placeholder="Wpisz email"
        value={formData.email}
        onChangeText={handleChangeEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#999"
      />

      {/* Przycisk */}
      <Button title="Wyślij" onPress={handleSubmit} />

      {/* Komunikat sukcesu */}
      {submitted && (
        <Text style={styles.success}>
          ✓ Wysłano: {formData.name} ({formData.email})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  success: {
    marginTop: 16,
    color: 'green',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SimpleForm;