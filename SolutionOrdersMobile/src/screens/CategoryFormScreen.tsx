import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import apiService from '../api/apiService.ts';

import type {RootStackParamList} from '../navigation/types.ts';

type CreateProps = NativeStackScreenProps<RootStackParamList, 'CreateCategory'>;
type EditProps = NativeStackScreenProps<RootStackParamList, 'EditCategory'>;

type Props = CreateProps | EditProps;

function CategoryFormScreen({navigation, route}: Props): React.JSX.Element {
  const isEditMode = route.name === 'EditCategory';
  const editedCategory = isEditMode ? route.params.category : undefined;

  const [name, setName] = useState(editedCategory?.name ?? '');
  const [description, setDescription] = useState(
    editedCategory?.description ?? '',
  );
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (): boolean => {
    if (name.trim().length === 0) {
      Alert.alert('Błąd', 'Podaj nazwę kategorii');
      return false;
    }

    if (name.trim().length > 64) {
      Alert.alert('Błąd', 'Nazwa kategorii może mieć maksymalnie 64 znaki');
      return false;
    }

    return true;
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      if (isEditMode && editedCategory) {
        await apiService.updateCategory(editedCategory.idCategory, {
          idCategory: editedCategory.idCategory,
          name: name.trim(),
          description:
            description.trim().length > 0 ? description.trim() : null,
          isActive: editedCategory.isActive ?? true,
        });

        Alert.alert('Sukces', 'Kategoria została zaktualizowana');
      } else {
        await apiService.createCategory({
          name: name.trim(),
          description:
            description.trim().length > 0 ? description.trim() : null,
        });

        Alert.alert('Sukces', 'Kategoria została dodana');
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Błąd', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.appName}>3D Print Shop</Text>

        <Text style={styles.title}>
          {isEditMode ? 'Edytuj kategorię' : 'Dodaj kategorię'}
        </Text>

        <Text style={styles.subtitle}>
          Kategorie pomagają uporządkować produkty sklepu.
        </Text>

        <Text style={styles.label}>Nazwa kategorii</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Np. Drukarki 3D"
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Opis</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Krótki opis kategorii"
          placeholderTextColor="#64748b"
          multiline
        />

        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.disabledButton]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={submitting}>
          <Text style={styles.saveButtonText}>
            {submitting
              ? 'Zapisywanie...'
              : isEditMode
                ? 'Zapisz zmiany'
                : 'Dodaj kategorię'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
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
    fontSize: 26,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },

  label: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 14,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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
});

export default CategoryFormScreen;