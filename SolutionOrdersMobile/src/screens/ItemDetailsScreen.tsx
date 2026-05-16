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
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {useItems} from '../context/ItemsContext';

import type {RootStackParamList} from '../navigation/types.ts';

type CreateProps = NativeStackScreenProps<RootStackParamList, 'CreateItem'>;
type EditProps = NativeStackScreenProps<RootStackParamList, 'EditItem'>;

type Props = CreateProps | EditProps;

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
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const parsedCategoryId = Number(idCategory);
    const parsedUnitId = Number(idUnitOfMeasurement);
    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (name.trim().length === 0) {
      Alert.alert('Błąd', 'Podaj nazwę produktu');
      return false;
    }

    if (name.trim().length > 80) {
      Alert.alert('Błąd', 'Nazwa produktu może mieć maksymalnie 80 znaków');
      return false;
    }

    if (description.trim().length === 0) {
      Alert.alert('Błąd', 'Podaj opis produktu');
      return false;
    }

    if (description.trim().length < 5) {
      Alert.alert('Błąd', 'Opis produktu powinien mieć minimum 5 znaków');
      return false;
    }

    if (
      idCategory.trim().length === 0 ||
      Number.isNaN(parsedCategoryId) ||
      parsedCategoryId <= 0
    ) {
      Alert.alert('Błąd', 'Podaj poprawne ID kategorii większe od 0');
      return false;
    }

    if (
      idUnitOfMeasurement.trim().length === 0 ||
      Number.isNaN(parsedUnitId) ||
      parsedUnitId <= 0
    ) {
      Alert.alert('Błąd', 'Podaj poprawne ID jednostki większe od 0');
      return false;
    }

    if (price.trim().length === 0 || Number.isNaN(parsedPrice)) {
      Alert.alert('Błąd', 'Podaj poprawną cenę');
      return false;
    }

    if (parsedPrice <= 0) {
      Alert.alert('Błąd', 'Cena musi być większa od 0');
      return false;
    }

    if (quantity.trim().length === 0 || Number.isNaN(parsedQuantity)) {
      Alert.alert('Błąd', 'Podaj poprawną ilość');
      return false;
    }

    if (parsedQuantity < 0) {
      Alert.alert('Błąd', 'Ilość nie może być mniejsza od 0');
      return false;
    }

    if (code.trim().length === 0) {
      Alert.alert('Błąd', 'Podaj kod produktu');
      return false;
    }

    if (code.trim().length > 40) {
      Alert.alert('Błąd', 'Kod produktu może mieć maksymalnie 40 znaków');
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
          isActive: editedItem.isActive,
        });

        Alert.alert('Sukces', 'Produkt został zaktualizowany');
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

        Alert.alert('Sukces', 'Produkt został dodany');
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
        <View style={styles.heroBox}>
          <Text style={styles.appName}>3D Print Shop</Text>

          <Text style={styles.title}>
            {isEditMode ? 'Edytuj produkt' : 'Dodaj produkt'}
          </Text>

          <Text style={styles.subtitle}>
            Uzupełnij dane produktu sprzedawanego w sklepie z drukarkami 3D.
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
          <Text style={styles.sectionTitle}>Powiązania</Text>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.rowItem]}>
              <Text style={styles.label}>ID kategorii</Text>
              <TextInput
                style={styles.input}
                value={idCategory}
                onChangeText={setIdCategory}
                placeholder="1"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                editable={!submitting}
              />
            </View>

            <View style={[styles.formGroup, styles.rowItem]}>
              <Text style={styles.label}>ID jednostki</Text>
              <TextInput
                style={styles.input}
                value={idUnitOfMeasurement}
                onChangeText={setIdUnitOfMeasurement}
                placeholder="1"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                editable={!submitting}
              />
            </View>
          </View>

          <Text style={styles.hintText}>
            ID kategorii i jednostki muszą istnieć po stronie backendu.
          </Text>
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
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={submitting}>
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

  hintText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
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