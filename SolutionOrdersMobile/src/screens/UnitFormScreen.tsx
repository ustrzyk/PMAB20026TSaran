import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import apiService from '../api/apiService.ts';
import AppDialog, {AppDialogType} from '../components/AppDialog.tsx';
import {sharedStyles as styles} from '../components/styles/sharedStyles.ts';

import type {RootStackParamList} from '../navigation/types.ts';

type CreateProps = NativeStackScreenProps<RootStackParamList, 'CreateUnit'>;
type EditProps = NativeStackScreenProps<RootStackParamList, 'EditUnit'>;

type Props = CreateProps | EditProps;

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
}

function UnitFormScreen({navigation, route}: Props): React.JSX.Element {
  const isEditMode = route.name === 'EditUnit';
  const editedUnit = isEditMode ? route.params.unit : undefined;

  const [name, setName] = useState(editedUnit?.name ?? '');
  const [description, setDescription] = useState(
    editedUnit?.description ?? '',
  );
  const [isActive, setIsActive] = useState(editedUnit?.isActive ?? true);

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
  const safeDescription = description.trim();

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
      return 'Podaj nazwę jednostki.';
    }

    if (safeName.length > 32) {
      return 'Nazwa może mieć maksymalnie 32 znaki.';
    }

    if (safeDescription.length > 300) {
      return 'Opis może mieć maksymalnie 300 znaków.';
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
      title: isEditMode ? 'Zapis zmian' : 'Nowa jednostka',
      message: isEditMode ? 'Zapisać zmiany?' : 'Dodać jednostkę?',
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

      const command = {
        name: safeName,
        description: safeDescription.length > 0 ? safeDescription : null,
        isActive,
      };

      if (isEditMode && editedUnit) {
        await apiService.updateUnit(editedUnit.idUnitOfMeasurement, {
          idUnitOfMeasurement: editedUnit.idUnitOfMeasurement,
          ...command,
        });

        showDialog('success', 'Zapisano', 'Jednostka została zaktualizowana.', true);
      } else {
        await apiService.createUnit(command);

        showDialog('success', 'Zapisano', 'Jednostka została dodana.', true);
      }
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={
          dialog.type === 'confirm'
            ? isEditMode
              ? 'Zapisz'
              : 'Dodaj'
            : 'OK'
        }
        cancelText="Anuluj"
        loading={dialog.loading}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.appName}>3D Print Shop</Text>

          <Text style={styles.title}>
            {isEditMode ? 'Edytuj jednostkę' : 'Dodaj jednostkę'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane jednostki</Text>

          <Text style={styles.label}>Nazwa</Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Np. szt, kg, rolka"
            placeholderTextColor="#64748b"
            editable={!submitting}
            returnKeyType="next"
          />

          <Text style={styles.label}>Opis</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Opcjonalnie"
            placeholderTextColor="#64748b"
            multiline
            editable={!submitting}
          />
        </View>

        {isEditMode ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Widoczność</Text>

            <View style={styles.statusButtons}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  isActive && styles.statusButtonActive,
                ]}
                onPress={() => setIsActive(true)}
                activeOpacity={0.85}
                disabled={submitting}>
                <Text
                  style={[
                    styles.statusButtonText,
                    isActive && styles.statusButtonTextSelected,
                  ]}>
                  Bieżąca
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  !isActive && styles.statusButtonArchive,
                ]}
                onPress={() => setIsActive(false)}
                activeOpacity={0.85}
                disabled={submitting}>
                <Text
                  style={[
                    styles.statusButtonText,
                    !isActive && styles.statusButtonTextSelected,
                  ]}>
                  Archiwum
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.disabledButton]}
          onPress={handleSavePress}
          activeOpacity={0.85}
          disabled={submitting}>
          <Text style={styles.saveButtonText}>
            {submitting
              ? 'Zapisywanie...'
              : isEditMode
                ? 'Zapisz'
                : 'Dodaj'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          disabled={submitting}>
          <Text style={styles.cancelButtonText}>Anuluj</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default UnitFormScreen;