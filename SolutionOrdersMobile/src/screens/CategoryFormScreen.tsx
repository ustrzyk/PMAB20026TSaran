import React, {useMemo, useState} from 'react';
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

type CreateProps = NativeStackScreenProps<RootStackParamList, 'CreateCategory'>;
type EditProps = NativeStackScreenProps<RootStackParamList, 'EditCategory'>;

type Props = CreateProps | EditProps;

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
}

function CategoryFormScreen({navigation, route}: Props): React.JSX.Element {
  const isEditMode = route.name === 'EditCategory';
  const editedCategory = isEditMode ? route.params.category : undefined;

  const [name, setName] = useState(editedCategory?.name ?? '');
  const [description, setDescription] = useState(
    editedCategory?.description ?? '',
  );
  const [isActive, setIsActive] = useState(editedCategory?.isActive ?? true);

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

  const nameLength = safeName.length;
  const descriptionLength = safeDescription.length;

  const nameReady = useMemo(() => {
    return safeName.length >= 2 && safeName.length <= 64;
  }, [safeName]);

  const descriptionReady = useMemo(() => {
    return safeDescription.length <= 300;
  }, [safeDescription]);

  const formReady = useMemo(() => {
    return nameReady && descriptionReady;
  }, [descriptionReady, nameReady]);

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
      return 'Podaj nazwę kategorii.';
    }

    if (safeName.length < 2) {
      return 'Nazwa kategorii powinna mieć minimum 2 znaki.';
    }

    if (safeName.length > 64) {
      return 'Nazwa kategorii może mieć maksymalnie 64 znaki.';
    }

    if (safeDescription.length > 300) {
      return 'Opis może mieć maksymalnie 300 znaków.';
    }

    return null;
  };

  const handleSavePress = (): void => {
    const validationError = validateForm();

    if (validationError) {
      showDialog('error', 'Sprawdź formularz', validationError);
      return;
    }

    setDialog({
      visible: true,
      type: 'confirm',
      title: isEditMode ? 'Zapisać zmiany?' : 'Dodać kategorię?',
      message: isEditMode
        ? `Zapisać kategorię "${safeName}"?`
        : `Dodać kategorię "${safeName}"?`,
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

      if (isEditMode && editedCategory) {
        await apiService.updateCategory(editedCategory.idCategory, {
          idCategory: editedCategory.idCategory,
          ...command,
        });

        showDialog('success', 'Zapisano', 'Kategoria została zapisana.', true);
      } else {
        await apiService.createCategory(command);

        showDialog('success', 'Dodano', 'Kategoria została dodana.', true);
      }
    } catch (err) {
      showDialog('error', 'Nie udało się zapisać', (err as Error).message);
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
            {isEditMode ? 'Edytuj kategorię' : 'Dodaj kategorię'}
          </Text>

          <Text style={styles.subtitle}>
            Nazwa kategorii będzie widoczna przy produktach.
          </Text>
        </View>

        <View style={formReady ? styles.readyBox : styles.warningBox}>
          <Text style={formReady ? styles.readyTitle : styles.warningTitle}>
            {formReady ? 'Gotowe do zapisu' : 'Uzupełnij nazwę'}
          </Text>

          <Text style={formReady ? styles.readyText : styles.warningText}>
            {formReady
              ? 'Możesz zapisać kategorię.'
              : 'Wpisz krótką i czytelną nazwę kategorii.'}
          </Text>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Podgląd</Text>

          <View style={styles.previewHeader}>
            <View style={styles.previewIconBox}>
              <Text style={styles.previewIcon}>🏷️</Text>
            </View>

            <View style={styles.previewTextBox}>
              <Text style={styles.previewName}>
                {safeName.length > 0 ? safeName : 'Nazwa kategorii'}
              </Text>

              <Text style={isActive ? styles.currentBadge : styles.archiveBadge}>
                {isActive ? 'Bieżąca' : 'Archiwum'}
              </Text>
            </View>
          </View>

          <Text style={styles.previewDescription}>
            {safeDescription.length > 0
              ? safeDescription
              : 'Opis pojawi się tutaj.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane kategorii</Text>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Nazwa</Text>
            <Text style={nameReady ? styles.counterOk : styles.counterWarning}>
              {nameLength}/64
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Np. Drukarki 3D"
            placeholderTextColor="#64748b"
            editable={!submitting}
            returnKeyType="next"
          />

          <View style={styles.labelRow}>
            <Text style={styles.label}>Opis</Text>
            <Text
              style={
                descriptionReady ? styles.counterMuted : styles.counterWarning
              }>
              {descriptionLength}/300
            </Text>
          </View>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              !descriptionReady && styles.inputWarning,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Opcjonalnie"
            placeholderTextColor="#64748b"
            multiline
            editable={!submitting}
          />
        </View>

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

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!formReady || submitting) && styles.disabledButton,
          ]}
          onPress={handleSavePress}
          activeOpacity={0.85}
          disabled={!formReady || submitting}>
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
          activeOpacity={0.85}
          disabled={submitting}>
          <Text style={styles.cancelButtonText}>Anuluj</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default CategoryFormScreen;