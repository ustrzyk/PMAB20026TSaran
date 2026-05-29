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

import apiService from '../api/apiService.ts';
import AppDialog, {AppDialogType} from '../components/AppDialog.tsx';

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

  const nameLength = name.trim().length;
  const descriptionLength = description.trim().length;

  const nameReady = useMemo(() => {
    return name.trim().length >= 1 && name.trim().length <= 32;
  }, [name]);

  const formReady = useMemo(() => {
    return nameReady;
  }, [nameReady]);

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
    if (name.trim().length === 0) {
      return 'Podaj nazwę jednostki.';
    }

    if (name.trim().length > 32) {
      return 'Nazwa jednostki może mieć maksymalnie 32 znaki.';
    }

    if (description.trim().length > 300) {
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
      title: isEditMode ? 'Zapisać zmiany?' : 'Dodać jednostkę?',
      message: isEditMode
        ? `Zapisać jednostkę "${name.trim()}"?`
        : `Dodać jednostkę "${name.trim()}"?`,
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
        name: name.trim(),
        description:
          description.trim().length > 0 ? description.trim() : null,
        isActive,
      };

      if (isEditMode && editedUnit) {
        await apiService.updateUnit(editedUnit.idUnitOfMeasurement, {
          idUnitOfMeasurement: editedUnit.idUnitOfMeasurement,
          ...command,
        });

        showDialog('success', 'Zapisano', 'Jednostka została zapisana.', true);
      } else {
        await apiService.createUnit(command);

        showDialog('success', 'Dodano', 'Jednostka została dodana.', true);
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
            {isEditMode ? 'Edytuj jednostkę' : 'Dodaj jednostkę'}
          </Text>

          <Text style={styles.subtitle}>
            Jednostka pojawi się przy ilości produktu.
          </Text>
        </View>

        <View style={formReady ? styles.readyBox : styles.warningBox}>
          <Text style={formReady ? styles.readyTitle : styles.warningTitle}>
            {formReady ? 'Gotowe do zapisu' : 'Uzupełnij nazwę'}
          </Text>

          <Text style={formReady ? styles.readyText : styles.warningText}>
            {formReady
              ? 'Możesz zapisać jednostkę.'
              : 'Wpisz krótką nazwę jednostki, np. szt albo rolka.'}
          </Text>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Podgląd</Text>

          <View style={styles.previewHeader}>
            <View style={styles.previewIconBox}>
              <Text style={styles.previewIcon}>📏</Text>
            </View>

            <View style={styles.previewTextBox}>
              <Text style={styles.previewName}>
                {name.trim().length > 0 ? name.trim() : 'Nazwa jednostki'}
              </Text>

              <Text style={isActive ? styles.currentBadge : styles.archiveBadge}>
                {isActive ? 'Bieżąca' : 'Archiwum'}
              </Text>
            </View>
          </View>

          <Text style={styles.previewDescription}>
            {description.trim().length > 0
              ? description.trim()
              : 'Opis pojawi się tutaj.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane jednostki</Text>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Nazwa</Text>
            <Text style={nameReady ? styles.counterOk : styles.counterWarning}>
              {nameLength}/32
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Np. szt, kg, rolka"
            placeholderTextColor="#64748b"
            editable={!submitting}
            returnKeyType="next"
          />

          <View style={styles.labelRow}>
            <Text style={styles.label}>Opis</Text>
            <Text style={styles.counterMuted}>{descriptionLength}/300</Text>
          </View>

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
                : 'Dodaj jednostkę'}
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
    fontSize: 27,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontWeight: '700',
  },

  readyBox: {
    backgroundColor: '#052e16',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 14,
  },

  warningBox: {
    backgroundColor: '#431407',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 14,
  },

  readyTitle: {
    color: '#bbf7d0',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },

  warningTitle: {
    color: '#fed7aa',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },

  readyText: {
    color: '#bbf7d0',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  warningText: {
    color: '#fed7aa',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  previewCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginBottom: 14,
  },

  previewHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  previewIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewIcon: {
    fontSize: 28,
  },

  previewTextBox: {
    flex: 1,
  },

  previewName: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },

  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  archiveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#334155',
    color: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  previewDescription: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
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

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    marginBottom: 6,
  },

  label: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '800',
  },

  counterOk: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '900',
  },

  counterWarning: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '900',
  },

  counterMuted: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '900',
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
    marginBottom: 14,
  },

  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },

  statusButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  statusButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  statusButtonActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  statusButtonArchive: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },

  statusButtonText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '900',
  },

  statusButtonTextSelected: {
    color: '#ffffff',
  },

  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
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

export default UnitFormScreen;