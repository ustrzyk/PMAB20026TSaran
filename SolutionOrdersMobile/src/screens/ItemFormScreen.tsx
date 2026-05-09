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

  const validateForm = (): boolean => {
    if (name.trim().length === 0) {
      Alert.alert('Błąd', 'Podaj nazwę produktu');
      return false;
    }

    if (description.trim().length === 0) {
      Alert.alert('Błąd', 'Podaj opis produktu');
      return false;
    }

    if (idCategory.trim().length === 0 || isNaN(Number(idCategory))) {
      Alert.alert('Błąd', 'Podaj poprawne ID kategorii');
      return false;
    }

    if (price.trim().length === 0 || isNaN(Number(price))) {
      Alert.alert('Błąd', 'Podaj poprawną cenę');
      return false;
    }

    if (quantity.trim().length === 0 || isNaN(Number(quantity))) {
      Alert.alert('Błąd', 'Podaj poprawną ilość');
      return false;
    }

    if (
      idUnitOfMeasurement.trim().length === 0 ||
      isNaN(Number(idUnitOfMeasurement))
    ) {
      Alert.alert('Błąd', 'Podaj poprawne ID jednostki miary');
      return false;
    }

    if (code.trim().length === 0) {
      Alert.alert('Błąd', 'Podaj kod produktu');
      return false;
    }

    return true;
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    try {
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
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isEditMode ? 'Edytuj produkt' : 'Dodaj produkt'}
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nazwa</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Np. Filament PLA"
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Opis</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Opis produktu"
            placeholderTextColor="#64748b"
            multiline
          />
        </View>

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
            />
          </View>
        </View>

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
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Kod</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Np. FIL001"
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>URL zdjęcia</Text>
          <TextInput
            style={styles.input}
            value={fotoUrl}
            onChangeText={setFotoUrl}
            placeholder="Opcjonalnie"
            placeholderTextColor="#64748b"
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>
            {isEditMode ? 'Zapisz zmiany' : 'Dodaj produkt'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
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

  title: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 20,
  },

  formGroup: {
    marginBottom: 14,
  },

  label: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
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
  },

  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  rowItem: {
    flex: 1,
  },

  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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