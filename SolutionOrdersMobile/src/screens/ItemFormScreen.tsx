import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
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

function normalizeNumber(value: string): string {
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

  return parts.slice(0, 3).join('-').slice(0, 32);
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

  const safeName = name.trim();
  const safeDescription = description.trim();
  const safeCode = code.trim();
  const safeFotoUrl = fotoUrl.trim();

  const parsedPrice = Number(normalizeNumber(price));
  const parsedQuantity = Number(normalizeNumber(quantity));

  const selectedCategory = useMemo(() => {
    return categories.find(category => {
      return category.idCategory === Number(idCategory);
    });
  }, [categories, idCategory]);

  const selectedUnit = useMemo(() => {
    return units.find(unit => {
      return unit.idUnitOfMeasurement === Number(idUnitOfMeasurement);
    });
  }, [idUnitOfMeasurement, units]);

  const nameReady = useMemo(() => {
    return safeName.length >= 3 && safeName.length <= 80;
  }, [safeName]);

  const descriptionReady = useMemo(() => {
    return safeDescription.length >= 5 && safeDescription.length <= 500;
  }, [safeDescription]);

  const codeReady = useMemo(() => {
    return safeCode.length >= 2 && safeCode.length <= 40;
  }, [safeCode]);

  const categoryReady = useMemo(() => {
    return Number(idCategory) > 0;
  }, [idCategory]);

  const unitReady = useMemo(() => {
    return Number(idUnitOfMeasurement) > 0;
  }, [idUnitOfMeasurement]);

  const priceReady = useMemo(() => {
    return !Number.isNaN(parsedPrice) && parsedPrice > 0;
  }, [parsedPrice]);

  const quantityReady = useMemo(() => {
    return !Number.isNaN(parsedQuantity) && parsedQuantity >= 0;
  }, [parsedQuantity]);

  const formReady = useMemo(() => {
    return (
      nameReady &&
      descriptionReady &&
      codeReady &&
      categoryReady &&
      unitReady &&
      priceReady &&
      quantityReady
    );
  }, [
    categoryReady,
    codeReady,
    descriptionReady,
    nameReady,
    priceReady,
    quantityReady,
    unitReady,
  ]);

  const stockValue = useMemo(() => {
    if (!priceReady || !quantityReady) {
      return 0;
    }

    return parsedPrice * parsedQuantity;
  }, [parsedPrice, parsedQuantity, priceReady, quantityReady]);

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

      const visibleCategories = categoriesFromApi.filter(category => {
        if (isEditMode && category.idCategory === editedItem?.idCategory) {
          return true;
        }

        return category.isActive !== false;
      });

      const visibleUnits = unitsFromApi.filter(unit => {
        if (
          isEditMode &&
          unit.idUnitOfMeasurement === editedItem?.idUnitOfMeasurement
        ) {
          return true;
        }

        return unit.isActive !== false;
      });

      setCategories(visibleCategories);
      setUnits(visibleUnits);

      if (!isEditMode) {
        if (visibleCategories.length > 0) {
          setIdCategory(visibleCategories[0].idCategory.toString());
        }

        if (visibleUnits.length > 0) {
          setIdUnitOfMeasurement(
            visibleUnits[0].idUnitOfMeasurement.toString(),
          );
        }
      }
    } catch (err) {
      showDialog(
        'error',
        'Nie udało się pobrać danych',
        (err as Error).message,
      );
    } finally {
      setDictionaryLoading(false);
    }
  }, [editedItem?.idCategory, editedItem?.idUnitOfMeasurement, isEditMode]);

  useEffect(() => {
    loadDictionaries();
  }, [loadDictionaries]);

  const validateForm = (): string | null => {
    if (safeName.length === 0) {
      return 'Podaj nazwę produktu.';
    }

    if (safeName.length < 3) {
      return 'Nazwa produktu powinna mieć minimum 3 znaki.';
    }

    if (safeName.length > 80) {
      return 'Nazwa produktu może mieć maksymalnie 80 znaków.';
    }

    if (safeDescription.length === 0) {
      return 'Podaj opis produktu.';
    }

    if (safeDescription.length < 5) {
      return 'Opis produktu powinien mieć minimum 5 znaków.';
    }

    if (safeDescription.length > 500) {
      return 'Opis produktu może mieć maksymalnie 500 znaków.';
    }

    if (!categoryReady) {
      return 'Wybierz kategorię.';
    }

    if (!unitReady) {
      return 'Wybierz jednostkę.';
    }

    if (!priceReady) {
      return 'Podaj poprawną cenę większą od 0.';
    }

    if (!quantityReady) {
      return 'Podaj poprawną ilość. Ilość nie może być mniejsza od 0.';
    }

    if (safeCode.length === 0) {
      return 'Podaj kod produktu.';
    }

    if (safeCode.length < 2) {
      return 'Kod produktu powinien mieć minimum 2 znaki.';
    }

    if (safeCode.length > 40) {
      return 'Kod produktu może mieć maksymalnie 40 znaków.';
    }

    return null;
  };

  const handleGenerateCode = (): void => {
    if (safeName.length === 0) {
      showDialog('error', 'Brak nazwy', 'Najpierw wpisz nazwę produktu.');
      return;
    }

    setCode(generateCodeFromName(safeName));
  };

  const setQuickPrice = (value: number): void => {
    setPrice(value.toString());
  };

  const setQuickQuantity = (value: number): void => {
    setQuantity(value.toString());
  };

  const increaseQuantity = (): void => {
    setQuantity(previous => {
      const current = Number(normalizeNumber(previous));

      if (Number.isNaN(current)) {
        return '1';
      }

      return (current + 1).toString();
    });
  };

  const decreaseQuantity = (): void => {
    setQuantity(previous => {
      const current = Number(normalizeNumber(previous));

      if (Number.isNaN(current) || current <= 0) {
        return '0';
      }

      return Math.max(current - 1, 0).toString();
    });
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
      title: isEditMode ? 'Zapisać zmiany?' : 'Dodać produkt?',
      message: isEditMode
        ? `Zapisać produkt "${safeName}"?`
        : `Dodać produkt "${safeName}"?`,
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
        description: safeDescription,
        idCategory: Number(idCategory),
        price: Number(normalizeNumber(price)),
        quantity: Number(normalizeNumber(quantity)),
        fotoUrl: safeFotoUrl.length > 0 ? safeFotoUrl : null,
        idUnitOfMeasurement: Number(idUnitOfMeasurement),
        code: safeCode,
        isActive,
      };

      if (isEditMode && editedItem) {
        await updateItem(editedItem.idItem, {
          idItem: editedItem.idItem,
          ...command,
        });

        showDialog('success', 'Zapisano', 'Produkt został zapisany.', true);
      } else {
        await createItem(command);

        showDialog('success', 'Dodano', 'Produkt został dodany.', true);
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

  const renderCategoryButton = (
    category: CategoryDto,
  ): React.JSX.Element => {
    const selected = Number(idCategory) === category.idCategory;

    return (
      <TouchableOpacity
        key={`category-${category.idCategory}`}
        style={[styles.optionButton, selected && styles.optionButtonSelected]}
        onPress={() => setIdCategory(category.idCategory.toString())}
        activeOpacity={0.85}
        disabled={submitting}>
        <View style={styles.optionTopRow}>
          <Text
            style={[
              styles.optionTitle,
              selected && styles.optionTitleSelected,
            ]}
            numberOfLines={1}>
            {category.name}
          </Text>

          {selected ? <Text style={styles.selectedBadge}>Wybrano</Text> : null}
        </View>

        <Text
          style={[styles.optionText, selected && styles.optionTextSelected]}
          numberOfLines={2}>
          {category.description ?? 'Brak opisu'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUnitButton = (
    unit: UnitOfMeasurementDto,
  ): React.JSX.Element => {
    const selected = Number(idUnitOfMeasurement) === unit.idUnitOfMeasurement;

    return (
      <TouchableOpacity
        key={`unit-${unit.idUnitOfMeasurement}`}
        style={[styles.optionButton, selected && styles.optionButtonSelected]}
        onPress={() =>
          setIdUnitOfMeasurement(unit.idUnitOfMeasurement.toString())
        }
        activeOpacity={0.85}
        disabled={submitting}>
        <View style={styles.optionTopRow}>
          <Text
            style={[
              styles.optionTitle,
              selected && styles.optionTitleSelected,
            ]}
            numberOfLines={1}>
            {unit.name}
          </Text>

          {selected ? <Text style={styles.selectedBadge}>Wybrano</Text> : null}
        </View>

        <Text
          style={[styles.optionText, selected && styles.optionTextSelected]}
          numberOfLines={2}>
          {unit.shortcut ?? unit.description ?? 'Jednostka produktu'}
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
            Uzupełnij dane produktu, cenę i stan magazynowy.
          </Text>
        </View>

        <View style={formReady ? styles.readyBox : styles.warningBox}>
          <Text style={formReady ? styles.readyTitle : styles.warningTitle}>
            {formReady ? 'Gotowe do zapisu' : 'Uzupełnij dane'}
          </Text>

          <Text style={formReady ? styles.readyText : styles.warningText}>
            {formReady
              ? 'Możesz zapisać produkt.'
              : 'Wpisz nazwę, opis, kod, cenę, ilość oraz wybierz kategorię i jednostkę.'}
          </Text>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Podgląd</Text>

          <View style={styles.previewHeader}>
            <View style={styles.previewIconBox}>
              <Text style={styles.previewIcon}>🖨️</Text>
            </View>

            <View style={styles.previewTextBox}>
              <Text style={styles.previewName}>
                {safeName.length > 0 ? safeName : 'Nazwa produktu'}
              </Text>

              <Text style={isActive ? styles.currentBadge : styles.archiveBadge}>
                {isActive ? 'Bieżący' : 'Archiwum'}
              </Text>
            </View>
          </View>

          <View style={styles.previewInfoBox}>
            <Text style={styles.previewLabel}>Kod</Text>
            <Text style={styles.previewValue}>
              {safeCode.length > 0 ? safeCode : 'Brak kodu'}
            </Text>
          </View>

          <View style={styles.previewGrid}>
            <View style={styles.previewCell}>
              <Text style={styles.previewLabel}>Cena</Text>
              <Text style={styles.previewMoney}>
                {priceReady ? formatMoney(parsedPrice) : '0.00 zł'}
              </Text>
            </View>

            <View style={styles.previewCell}>
              <Text style={styles.previewLabel}>Ilość</Text>
              <Text style={styles.previewValue}>
                {quantityReady ? parsedQuantity : 0}{' '}
                {selectedUnit?.name ?? 'szt'}
              </Text>
            </View>

            <View style={styles.previewCell}>
              <Text style={styles.previewLabel}>Wartość</Text>
              <Text style={styles.previewMoney}>{formatMoney(stockValue)}</Text>
            </View>
          </View>

          <View style={styles.previewInfoBox}>
            <Text style={styles.previewLabel}>Kategoria</Text>
            <Text style={styles.previewValue}>
              {selectedCategory?.name ?? 'Nie wybrano'}
            </Text>
          </View>
        </View>

        <View style={styles.statusGrid}>
          <View style={nameReady ? styles.readyStatusCard : styles.warningStatusCard}>
            <Text style={styles.statusIcon}>{nameReady ? '✓' : '!'}</Text>
            <Text style={styles.statusTitle}>Nazwa</Text>
            <Text style={styles.statusText}>
              {nameReady ? 'Uzupełniona' : 'Wymagana'}
            </Text>
          </View>

          <View style={priceReady ? styles.readyStatusCard : styles.warningStatusCard}>
            <Text style={styles.statusIcon}>{priceReady ? '✓' : '!'}</Text>
            <Text style={styles.statusTitle}>Cena</Text>
            <Text style={styles.statusText}>
              {priceReady ? 'Poprawna' : 'Wymagana'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dane produktu</Text>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Nazwa</Text>
            <Text style={nameReady ? styles.counterOk : styles.counterWarning}>
              {safeName.length}/80
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Np. Filament PLA biały"
            placeholderTextColor="#64748b"
            editable={!submitting}
            returnKeyType="next"
          />

          <View style={styles.labelRow}>
            <Text style={styles.label}>Opis</Text>
            <Text
              style={
                descriptionReady ? styles.counterOk : styles.counterWarning
              }>
              {safeDescription.length}/500
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
            placeholder="Krótki opis produktu"
            placeholderTextColor="#64748b"
            multiline
            editable={!submitting}
          />

          <View style={styles.labelRow}>
            <Text style={styles.label}>Kod</Text>
            <Text style={codeReady ? styles.counterOk : styles.counterWarning}>
              {safeCode.length}/40
            </Text>
          </View>

          <TextInput
            style={[styles.input, !codeReady && styles.inputWarning]}
            value={code}
            onChangeText={setCode}
            placeholder="Np. PLA-WHITE-1KG"
            placeholderTextColor="#64748b"
            autoCapitalize="characters"
            editable={!submitting}
            returnKeyType="next"
          />

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateCode}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.generateButtonText}>Wygeneruj kod z nazwy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cena i magazyn</Text>

          <Text style={styles.label}>Cena</Text>

          <TextInput
            style={[
              styles.input,
              !priceReady && price.trim().length > 0 && styles.inputWarning,
            ]}
            value={price}
            onChangeText={setPrice}
            placeholder="Np. 79.99"
            placeholderTextColor="#64748b"
            keyboardType="decimal-pad"
            editable={!submitting}
            returnKeyType="next"
          />

          <View style={styles.quickButtons}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickPrice(25)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>25</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickPrice(50)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>50</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickPrice(100)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickPrice(250)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>250</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Ilość</Text>

          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decreaseQuantity}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>

            <TextInput
              style={[
                styles.quantityInput,
                !quantityReady &&
                  quantity.trim().length > 0 &&
                  styles.inputWarning,
              ]}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="0"
              placeholderTextColor="#64748b"
              keyboardType="decimal-pad"
              editable={!submitting}
            />

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={increaseQuantity}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickButtons}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickQuantity(0)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickQuantity(1)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickQuantity(5)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>5</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickQuantity(10)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>10</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stockValueBox}>
            <Text style={styles.stockValueLabel}>Wartość magazynowa</Text>
            <Text style={styles.stockValueText}>{formatMoney(stockValue)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kategoria</Text>

          {dictionaryLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.loadingBoxText}>Ładowanie kategorii...</Text>
            </View>
          ) : categories.length > 0 ? (
            <View style={styles.optionList}>
              {categories.map(renderCategoryButton)}
            </View>
          ) : (
            <Text style={styles.emptyText}>Brak kategorii do wyboru.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Jednostka</Text>

          {dictionaryLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.loadingBoxText}>Ładowanie jednostek...</Text>
            </View>
          ) : units.length > 0 ? (
            <View style={styles.optionList}>{units.map(renderUnitButton)}</View>
          ) : (
            <Text style={styles.emptyText}>Brak jednostek do wyboru.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Zdjęcie</Text>

          <TextInput
            style={styles.input}
            value={fotoUrl}
            onChangeText={setFotoUrl}
            placeholder="Opcjonalny adres URL zdjęcia"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
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
                Bieżący
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
            (!formReady || submitting || dictionaryLoading) &&
              styles.disabledButton,
          ]}
          onPress={handleSavePress}
          activeOpacity={0.85}
          disabled={!formReady || submitting || dictionaryLoading}>
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

export default ItemFormScreen;