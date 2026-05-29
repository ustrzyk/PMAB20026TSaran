import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {useItems} from '../context/ItemsContext.tsx';

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

function formatMoney(value?: number | null): string {
  const safeValue = value ?? 0;

  return `${safeValue.toFixed(2)} zł`;
}

function normalizePrice(value: string): string {
  return value.replace(',', '.');
}

function generateCodeFromName(name: string): string {
  const parts = name
    .trim()
    .toUpperCase()
    .replace(/Ą/g, 'A')
    .replace(/Ć/g, 'C')
    .replace(/Ę/g, 'E')
    .replace(/Ł/g, 'L')
    .replace(/Ń/g, 'N')
    .replace(/Ó/g, 'O')
    .replace(/Ś/g, 'S')
    .replace(/Ź/g, 'Z')
    .replace(/Ż/g, 'Z')
    .split(/[^A-Z0-9]+/)
    .filter(part => part.length > 0);

  if (parts.length === 0) {
    return `PROD-${Date.now().toString().slice(-4)}`;
  }

  return parts.slice(0, 3).join('-').slice(0, 24);
}

function ItemFormScreen({navigation, route}: Props): React.JSX.Element {
  const {createItem, updateItem} = useItems();

  const isEditMode = route.name === 'EditItem';
  const editedItem = isEditMode ? route.params.item : undefined;

  const [name, setName] = useState(editedItem?.name ?? '');
  const [description, setDescription] = useState(editedItem?.description ?? '');

  const [idCategory, setIdCategory] = useState(
    editedItem?.idCategory?.toString() ?? '',
  );

  const [price, setPrice] = useState(editedItem?.price?.toString() ?? '');

  const [quantity, setQuantity] = useState(
    editedItem?.quantity?.toString() ?? '',
  );

  const [fotoUrl, setFotoUrl] = useState(editedItem?.fotoUrl ?? '');

  const [idUnitOfMeasurement, setIdUnitOfMeasurement] = useState(
    editedItem?.idUnitOfMeasurement?.toString() ?? '',
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

  const parsedPrice = Number(normalizePrice(price));
  const parsedQuantity = Number(quantity);

  const selectedCategory = categories.find(category => {
    return category.idCategory === Number(idCategory);
  });

  const selectedUnit = units.find(unit => {
    return unit.idUnitOfMeasurement === Number(idUnitOfMeasurement);
  });

  const stockValue = useMemo(() => {
    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedQuantity)) {
      return 0;
    }

    return Math.max(parsedPrice, 0) * Math.max(parsedQuantity, 0);
  }, [parsedPrice, parsedQuantity]);

  const formProgress = useMemo(() => {
    let result = 0;

    if (name.trim().length >= 3) {
      result += 1;
    }

    if (description.trim().length >= 5) {
      result += 1;
    }

    if (code.trim().length > 0) {
      result += 1;
    }

    if (Number(idCategory) > 0) {
      result += 1;
    }

    if (Number(idUnitOfMeasurement) > 0) {
      result += 1;
    }

    if (!Number.isNaN(parsedPrice) && parsedPrice > 0) {
      result += 1;
    }

    if (!Number.isNaN(parsedQuantity) && parsedQuantity >= 0) {
      result += 1;
    }

    return result;
  }, [
    code,
    description,
    idCategory,
    idUnitOfMeasurement,
    name,
    parsedPrice,
    parsedQuantity,
  ]);

  const formProgressText = `${formProgress}/7`;

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

      const activeCategories = categoriesFromApi.filter(category => {
        return category.isActive !== false;
      });

      const activeUnits = unitsFromApi.filter(unit => {
        return unit.isActive !== false;
      });

      setCategories(activeCategories);
      setUnits(activeUnits);

      if (!isEditMode) {
        if (activeCategories.length > 0) {
          setIdCategory(activeCategories[0].idCategory.toString());
        }

        if (activeUnits.length > 0) {
          setIdUnitOfMeasurement(activeUnits[0].idUnitOfMeasurement.toString());
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

  const validateForm = (): string | null => {
    const safePrice = Number(normalizePrice(price));
    const safeQuantity = Number(quantity);
    const parsedCategoryId = Number(idCategory);
    const parsedUnitId = Number(idUnitOfMeasurement);

    if (name.trim().length === 0) {
      return 'Podaj nazwę produktu';
    }

    if (name.trim().length < 3) {
      return 'Nazwa produktu powinna mieć minimum 3 znaki';
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

    if (price.trim().length === 0 || Number.isNaN(safePrice)) {
      return 'Podaj poprawną cenę produktu';
    }

    if (safePrice <= 0) {
      return 'Cena produktu musi być większa od 0';
    }

    if (quantity.trim().length === 0 || Number.isNaN(safeQuantity)) {
      return 'Podaj poprawną ilość produktu';
    }

    if (safeQuantity < 0) {
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

  const handleGenerateCode = (): void => {
    if (name.trim().length === 0) {
      showDialog(
        'error',
        'Brak nazwy',
        'Najpierw wpisz nazwę produktu, a potem wygeneruj kod.',
      );

      return;
    }

    setCode(generateCodeFromName(name));
  };

  const handleQuickPrice = (value: number): void => {
    setPrice(value.toString());
  };

  const handleQuickQuantity = (value: number): void => {
    setQuantity(value.toString());
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

      const command = {
        name: name.trim(),
        description: description.trim(),
        idCategory: Number(idCategory),
        price: Number(normalizePrice(price)),
        quantity: Number(quantity),
        fotoUrl: fotoUrl.trim().length > 0 ? fotoUrl.trim() : null,
        idUnitOfMeasurement: Number(idUnitOfMeasurement),
        code: code.trim(),
        isActive,
      };

      if (isEditMode && editedItem) {
        await updateItem(editedItem.idItem, {
          idItem: editedItem.idItem,
          ...command,
        });

        showDialog(
          'success',
          'Produkt zaktualizowany',
          'Zmiany produktu zostały zapisane.',
          true,
        );
      } else {
        await createItem(command);

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
        key={`category-${category.idCategory}`}
        style={[
          styles.optionButton,
          isSelected && styles.optionButtonSelected,
        ]}
        onPress={() => setIdCategory(category.idCategory.toString())}
        activeOpacity={0.85}
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
        key={`unit-${unit.idUnitOfMeasurement}`}
        style={[
          styles.optionButton,
          isSelected && styles.optionButtonSelected,
        ]}
        onPress={() =>
          setIdUnitOfMeasurement(unit.idUnitOfMeasurement.toString())
        }
        activeOpacity={0.85}
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
            Uzupełnij dane produktu, kategorię, cenę, stan magazynowy oraz kod.
          </Text>
        </View>

        <View style={styles.progressBox}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Postęp formularza</Text>
              <Text style={styles.progressText}>
                Uzupełnione pola: {formProgressText}
              </Text>
            </View>

            <Text style={styles.progressBadge}>{formProgressText}</Text>
          </View>

          <Text style={styles.progressHint}>
            Produkt powinien mieć nazwę, opis, kod, kategorię, jednostkę, cenę i
            ilość.
          </Text>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Podgląd produktu</Text>

          <View style={styles.previewRow}>
            <View style={styles.previewIconBox}>
              <Text style={styles.previewIcon}>🖨️</Text>
            </View>

            <View style={styles.previewTextBox}>
              <Text style={styles.previewName}>
                {name.trim().length > 0 ? name.trim() : 'Nazwa produktu'}
              </Text>

              <Text style={styles.previewDescription} numberOfLines={3}>
                {description.trim().length > 0
                  ? description.trim()
                  : 'Opis produktu pojawi się tutaj.'}
              </Text>
            </View>
          </View>

          <View style={styles.previewBadges}>
            <Text style={styles.previewBadge}>
              {selectedCategory?.name ?? 'Brak kategorii'}
            </Text>

            <Text style={styles.previewBadge}>
              {code.trim().length > 0 ? code.trim() : 'Brak kodu'}
            </Text>

            <Text style={isActive ? styles.previewActiveBadge : styles.previewInactiveBadge}>
              {isActive ? 'Aktywny' : 'Nieaktywny'}
            </Text>
          </View>

          <View style={styles.previewStats}>
            <View style={styles.previewStat}>
              <Text style={styles.previewStatLabel}>Cena</Text>
              <Text style={styles.previewStatValue}>
                {Number.isNaN(parsedPrice)
                  ? '0.00 zł'
                  : formatMoney(parsedPrice)}
              </Text>
            </View>

            <View style={styles.previewStat}>
              <Text style={styles.previewStatLabel}>Stan</Text>
              <Text style={styles.previewStatValue}>
                {Number.isNaN(parsedQuantity) ? 0 : parsedQuantity}{' '}
                {selectedUnit?.shortcut ?? selectedUnit?.name ?? 'szt'}
              </Text>
            </View>

            <View style={styles.previewStat}>
              <Text style={styles.previewStatLabel}>Wartość</Text>
              <Text style={styles.previewStatValue}>{formatMoney(stockValue)}</Text>
            </View>
          </View>
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
            <View style={styles.labelRow}>
              <Text style={styles.label}>Kod produktu</Text>

              <TouchableOpacity
                style={styles.smallActionButton}
                onPress={handleGenerateCode}
                activeOpacity={0.85}
                disabled={submitting}>
                <Text style={styles.smallActionButtonText}>Generuj</Text>
              </TouchableOpacity>
            </View>

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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Adres zdjęcia / URL</Text>

            <TextInput
              style={styles.input}
              value={fotoUrl}
              onChangeText={setFotoUrl}
              placeholder="Opcjonalnie"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              editable={!submitting}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kategoria</Text>

          {dictionaryLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.loadingTextSmall}>Ładowanie kategorii...</Text>
            </View>
          ) : (
            <View style={styles.optionList}>
              {categories.length > 0 ? (
                categories.map(renderCategoryButton)
              ) : (
                <Text style={styles.emptyDictionaryText}>
                  Brak aktywnych kategorii.
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Jednostka miary</Text>

          {dictionaryLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.loadingTextSmall}>Ładowanie jednostek...</Text>
            </View>
          ) : (
            <View style={styles.optionList}>
              {units.length > 0 ? (
                units.map(renderUnitButton)
              ) : (
                <Text style={styles.emptyDictionaryText}>
                  Brak aktywnych jednostek miary.
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cena i stan magazynowy</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cena</Text>

            <TextInput
              style={styles.input}
              value={price}
              onChangeText={value => setPrice(normalizePrice(value))}
              placeholder="Np. 99.99"
              placeholderTextColor="#64748b"
              keyboardType="decimal-pad"
              editable={!submitting}
            />

            <View style={styles.quickButtons}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickPrice(19.99)}
                activeOpacity={0.85}
                disabled={submitting}>
                <Text style={styles.quickButtonText}>19.99</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickPrice(49.99)}
                activeOpacity={0.85}
                disabled={submitting}>
                <Text style={styles.quickButtonText}>49.99</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickPrice(99.99)}
                activeOpacity={0.85}
                disabled={submitting}>
                <Text style={styles.quickButtonText}>99.99</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ilość</Text>

            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Np. 10"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              editable={!submitting}
            />

            <View style={styles.quickButtons}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickQuantity(0)}
                activeOpacity={0.85}
                disabled={submitting}>
                <Text style={styles.quickButtonText}>0</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickQuantity(5)}
                activeOpacity={0.85}
                disabled={submitting}>
                <Text style={styles.quickButtonText}>5</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickQuantity(10)}
                activeOpacity={0.85}
                disabled={submitting}>
                <Text style={styles.quickButtonText}>10</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickQuantity(20)}
                activeOpacity={0.85}
                disabled={submitting}>
                <Text style={styles.quickButtonText}>20</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.stockInfoBox}>
            <Text style={styles.stockInfoTitle}>Wartość magazynowa</Text>

            <Text style={styles.stockInfoValue}>{formatMoney(stockValue)}</Text>

            <Text style={styles.stockInfoText}>
              Wartość = cena produktu × ilość na stanie.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Aktywność produktu</Text>

          <TouchableOpacity
            style={isActive ? styles.activeSwitch : styles.inactiveSwitch}
            onPress={() => setIsActive(previous => !previous)}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.switchText}>
              {isActive ? 'Produkt aktywny' : 'Produkt nieaktywny'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.switchHint}>
            Produkt aktywny jest widoczny dla klienta. Produkt nieaktywny można
            zostawić w bazie, ale nie powinien być sprzedawany.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.disabledButton]}
          onPress={handleSavePress}
          activeOpacity={0.85}
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
    fontSize: 27,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  progressBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 14,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },

  progressTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
  },

  progressText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },

  progressBadge: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: '900',
    overflow: 'hidden',
  },

  progressHint: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 9,
  },

  previewCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginBottom: 14,
  },

  previewRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },

  previewIconBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewIcon: {
    fontSize: 30,
  },

  previewTextBox: {
    flex: 1,
  },

  previewName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 5,
  },

  previewDescription: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },

  previewBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },

  previewBadge: {
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  previewActiveBadge: {
    backgroundColor: '#052e16',
    color: '#bbf7d0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  previewInactiveBadge: {
    backgroundColor: '#7f1d1d',
    color: '#fecaca',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  previewStats: {
    flexDirection: 'row',
    gap: 8,
  },

  previewStat: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 9,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  previewStatLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },

  previewStatValue: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '900',
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
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },

  formGroup: {
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
    minHeight: 92,
    textAlignVertical: 'top',
  },

  smallActionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  smallActionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
  },

  loadingTextSmall: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },

  optionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  optionButton: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  optionButtonSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  optionButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },

  optionButtonTextSelected: {
    color: '#ffffff',
  },

  emptyDictionaryText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },

  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 9,
  },

  quickButton: {
    backgroundColor: '#1e293b',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#334155',
  },

  quickButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '900',
  },

  stockInfoBox: {
    backgroundColor: '#052e16',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#16a34a',
  },

  stockInfoTitle: {
    color: '#bbf7d0',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 4,
  },

  stockInfoValue: {
    color: '#bbf7d0',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },

  stockInfoText: {
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  activeSwitch: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 9,
  },

  inactiveSwitch: {
    backgroundColor: '#7f1d1d',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 9,
  },

  switchText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  switchHint: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
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
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default ItemFormScreen;