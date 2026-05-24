import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
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
import {useItems} from '../context/ItemsContext';

import type {RootStackParamList} from '../navigation/types.ts';
import type {CategoryDto, UnitOfMeasurementDto} from '../types/models.ts';

type CreateProps = NativeStackScreenProps<RootStackParamList, 'CreateItem'>;
type EditProps = NativeStackScreenProps<RootStackParamList, 'EditItem'>;

type Props = CreateProps | EditProps;

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
}

function ItemFormScreen({navigation, route}: Props): React.JSX.Element {
  const {createItem, updateItem} = useItems();

  const isEditMode = route.name === 'EditItem';
  const editedItem = isEditMode ? route.params.item : undefined;

  const [name, setName] = useState(editedItem?.name ?? '');
  const [description, setDescription] = useState(editedItem?.description ?? '');
  const [idCategory, setIdCategory] = useState(
    editedItem?.idCategory?.toString() ?? '1',
  );
  const [price, setPrice] = useState(editedItem?.price?.toString() ?? '');
  const [quantity, setQuantity] = useState(
    editedItem?.quantity?.toString() ?? '',
  );
  const [fotoUrl, setFotoUrl] = useState(editedItem?.fotoUrl ?? '');
  const [idUnitOfMeasurement, setIdUnitOfMeasurement] = useState(
    editedItem?.idUnitOfMeasurement?.toString() ?? '1',
  );
  const [code, setCode] = useState(editedItem?.code ?? '');
  const [isActive, setIsActive] = useState(editedItem?.isActive ?? true);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [units, setUnits] = useState<UnitOfMeasurementDto[]>([]);
  const [dictionaryLoading, setDictionaryLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [goBackAfterDialog, setGoBackAfterDialog] = useState(false);

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

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

  const loadDictionaries = useCallback(async (): Promise<void> => {
    try {
      setDictionaryLoading(true);

      const [categoriesFromApi, unitsFromApi] = await Promise.all([
        apiService.getCategories(),
        apiService.getUnits(),
      ]);

      setCategories(categoriesFromApi);
      setUnits(unitsFromApi);

      if (!isEditMode) {
        if (categoriesFromApi.length > 0) {
          setIdCategory(categoriesFromApi[0].idCategory.toString());
        }

        if (unitsFromApi.length > 0) {
          setIdUnitOfMeasurement(
            unitsFromApi[0].idUnitOfMeasurement.toString(),
          );
        }
      }
    } catch (err) {
      showDialog(
        'error',
        'Błąd pobierania danych',
        (err as Error).message,
      );
    } finally {
      setDictionaryLoading(false);
    }
  }, [isEditMode]);

  useEffect(() => {
    loadDictionaries();
  }, [loadDictionaries]);

  const selectedCategory = categories.find(
    category => category.idCategory === Number(idCategory),
  );

  const selectedUnit = units.find(
    unit => unit.idUnitOfMeasurement === Number(idUnitOfMeasurement),
  );

  const validateForm = (): string | null => {
    const parsedCategoryId = Number(idCategory);
    const parsedUnitId = Number(idUnitOfMeasurement);
    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (name.trim().length === 0) {
      return 'Podaj nazwę produktu';
    }

    if (name.trim().length > 80) {
      return 'Nazwa produktu może mieć maksymalnie 80 znaków';
    }

    if (description.trim().length === 0) {
      return 'Podaj opis produktu';
    }

    if (description.trim().length < 5) {
      return 'Opis produktu powinien mieć minimum 5 znaków';
    }

    if (
      idCategory.trim().length === 0 ||
      Number.isNaN(parsedCategoryId) ||
      parsedCategoryId <= 0
    ) {
      return 'Wybierz kategorię produktu';
    }

    if (
      idUnitOfMeasurement.trim().length === 0 ||
      Number.isNaN(parsedUnitId) ||
      parsedUnitId <= 0
    ) {
      return 'Wybierz jednostkę miary';
    }

    if (price.trim().length === 0 || Number.isNaN(parsedPrice)) {
      return 'Podaj poprawną cenę';
    }

    if (parsedPrice <= 0) {
      return 'Cena musi być większa od 0';
    }

    if (quantity.trim().length === 0 || Number.isNaN(parsedQuantity)) {
      return 'Podaj poprawną ilość';
    }

    if (parsedQuantity < 0) {
      return 'Ilość nie może być mniejsza od 0';
    }

    if (code.trim().length === 0) {
      return 'Podaj kod produktu';
    }

    if (code.trim().length > 40) {
      return 'Kod produktu może mieć maksymalnie 40 znaków';
    }

    return null;
  };

  const handleSavePress = (): void => {
    const validationError = validateForm();

    if (validationError) {
      showDialog('error', 'Błąd formularza', validationError);
      return;
    }

    setDialog({
      visible: true,
      type: 'confirm',
      title: isEditMode ? 'Potwierdzenie edycji' : 'Potwierdzenie dodania',
      message: isEditMode
        ? `Czy zapisać zmiany w produkcie "${name.trim()}"?`
        : `Czy dodać nowy produkt "${name.trim()}"?`,
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

      if (isEditMode && editedItem) {
        await updateItem(editedItem.idItem, {
          idItem: editedItem.idItem,
          name: name.trim(),
          description: description.trim(),
          idCategory: Number(idCategory),
          price: Number(price),
          quantity: Number(quantity),
          fotoUrl: fotoUrl.trim().length > 0 ? fotoUrl.trim() : null,
          idUnitOfMeasurement: Number(idUnitOfMeasurement),
          code: code.trim(),
          isActive,
        });

        showDialog(
          'success',
          'Produkt zaktualizowany',
          'Zmiany produktu zostały zapisane.',
          true,
        );
      } else {
        await createItem({
          name: name.trim(),
          description: description.trim(),
          idCategory: Number(idCategory),
          price: Number(price),
          quantity: Number(quantity),
          fotoUrl: fotoUrl.trim().length > 0 ? fotoUrl.trim() : null,
          idUnitOfMeasurement: Number(idUnitOfMeasurement),
          code: code.trim(),
        });

        showDialog(
          'success',
          'Produkt dodany',
          'Nowy produkt został zapisany w systemie.',
          true,
        );
      }
    } catch (err) {
      showDialog('error', 'Błąd zapisu', (err as Error).message);
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

  const renderCategoryButton = (
    category: CategoryDto,
  ): React.JSX.Element => {
    const isSelected = Number(idCategory) === category.idCategory;

    return (
      <TouchableOpacity
        key={category.idCategory}
        style={[
          styles.optionButton,
          isSelected && styles.optionButtonSelected,
        ]}
        onPress={() => setIdCategory(category.idCategory.toString())}
        activeOpacity={0.8}
        disabled={submitting}>
        <Text
          style={[
            styles.optionButtonText,
            isSelected && styles.optionButtonTextSelected,
          ]}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUnitButton = (
    unit: UnitOfMeasurementDto,
  ): React.JSX.Element => {
    const isSelected =
      Number(idUnitOfMeasurement) === unit.idUnitOfMeasurement;

    return (
      <TouchableOpacity
        key={unit.idUnitOfMeasurement}
        style={[
          styles.optionButton,
          isSelected && styles.optionButtonSelected,
        ]}
        onPress={() =>
          setIdUnitOfMeasurement(unit.idUnitOfMeasurement.toString())
        }
        activeOpacity={0.8}
        disabled={submitting}>
        <Text
          style={[
            styles.optionButtonText,
            isSelected && styles.optionButtonTextSelected,
          ]}>
          {unit.shortcut ? `${unit.name} (${unit.shortcut})` : unit.name}
        </Text>
      </TouchableOpacity>
    );
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
            {isEditMode ? 'Edytuj produkt' : 'Dodaj produkt'}
          </Text>

          <Text style={styles.subtitle}>
            Uzupełnij dane produktu sprzedawanego w sklepie.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane podstawowe</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nazwa produktu</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Np. Filament PLA 1.75 mm"
              placeholderTextColor="#64748b"
              editable={!submitting}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Opis</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Krótki opis produktu"
              placeholderTextColor="#64748b"
              multiline
              editable={!submitting}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kod produktu</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="Np. FIL-PLA-001"
              placeholderTextColor="#64748b"
              autoCapitalize="characters"
              editable={!submitting}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kategoria i jednostka</Text>

          {dictionaryLoading ? (
            <View style={styles.dictionaryLoadingBox}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.dictionaryLoadingText}>
                Ładowanie kategorii i jednostek...
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.label}>Kategoria</Text>

              <Text style={styles.selectedText}>
                Wybrano:{' '}
                {selectedCategory ? selectedCategory.name : 'Brak kategorii'}
              </Text>

              <View style={styles.optionsContainer}>
                {categories.map(renderCategoryButton)}
              </View>

              <Text style={styles.label}>Jednostka miary</Text>

              <Text style={styles.selectedText}>
                Wybrano:{' '}
                {selectedUnit
                  ? `${selectedUnit.name}${
                      selectedUnit.shortcut
                        ? ` (${selectedUnit.shortcut})`
                        : ''
                    }`
                  : 'Brak jednostki'}
              </Text>

              <View style={styles.optionsContainer}>
                {units.map(renderUnitButton)}
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cena i magazyn</Text>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.rowItem]}>
              <Text style={styles.label}>Cena</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="99.99"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                editable={!submitting}
              />
            </View>

            <View style={[styles.formGroup, styles.rowItem]}>
              <Text style={styles.label}>Ilość</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="10"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                editable={!submitting}
              />
            </View>
          </View>
        </View>

        {isEditMode ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Status produktu</Text>

            <View style={styles.statusButtons}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  isActive && styles.statusButtonActive,
                ]}
                onPress={() => setIsActive(true)}
                activeOpacity={0.8}
                disabled={submitting}>
                <Text
                  style={[
                    styles.statusButtonText,
                    isActive && styles.statusButtonTextSelected,
                  ]}>
                  Aktywny
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  !isActive && styles.statusButtonInactive,
                ]}
                onPress={() => setIsActive(false)}
                activeOpacity={0.8}
                disabled={submitting}>
                <Text
                  style={[
                    styles.statusButtonText,
                    !isActive && styles.statusButtonTextSelected,
                  ]}>
                  Nieaktywny
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Zdjęcie</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>URL zdjęcia</Text>
            <TextInput
              style={styles.input}
              value={fotoUrl}
              onChangeText={setFotoUrl}
              placeholder="Opcjonalnie"
              placeholderTextColor="#64748b"
              editable={!submitting}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.disabledButton]}
          onPress={handleSavePress}
          activeOpacity={0.8}
          disabled={submitting || dictionaryLoading}>
          <Text style={styles.saveButtonText}>
            {submitting
              ? 'Zapisywanie...'
              : isEditMode
                ? 'Zapisz zmiany'
                : 'Dodaj produkt'}
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

  heroBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
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
  },

  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
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

  formGroup: {
    marginBottom: 14,
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
  },

  textArea: {
    height: 96,
    textAlignVertical: 'top',
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  rowItem: {
    flex: 1,
  },

  dictionaryLoadingBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  dictionaryLoadingText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },

  selectedText: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 8,
  },

  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },

  optionButton: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  optionButtonSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  optionButtonText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '900',
  },

  optionButtonTextSelected: {
    color: '#ffffff',
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
    paddingVertical: 11,
    alignItems: 'center',
  },

  statusButtonActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },

  statusButtonInactive: {
    backgroundColor: '#7f1d1d',
    borderColor: '#7f1d1d',
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

export default ItemFormScreen;