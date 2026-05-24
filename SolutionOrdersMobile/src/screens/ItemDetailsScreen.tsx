import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import AppDialog, {AppDialogType} from '../components/AppDialog.tsx';
import {useCart} from '../context/CartContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemDetails'>;

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

function ItemDetailsScreen({navigation, route}: Props): React.JSX.Element {
  const {item} = route.params;
  const {addToCart, totalQuantity, totalValue} = useCart();

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const closeDialog = (): void => {
    setDialog(previous => ({
      ...previous,
      visible: false,
      loading: false,
    }));
  };

  const handleAddToCart = (): void => {
    const quantity = item.quantity ?? 0;

    if (quantity <= 0) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Brak produktu',
        message: 'Tego produktu nie ma aktualnie na stanie.',
        loading: false,
      });

      return;
    }

    addToCart(item, 1);

    setDialog({
      visible: true,
      type: 'success',
      title: 'Dodano do koszyka',
      message: `Produkt "${item.name}" został dodany do koszyka.`,
      loading: false,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText="OK"
        cancelText="Anuluj"
        loading={dialog.loading}
        onConfirm={closeDialog}
        onCancel={closeDialog}
      />

      <View style={styles.heroBox}>
        <Text style={styles.appName}>3D Print Shop</Text>

        <Text style={styles.title}>{item.name}</Text>

        <Text style={styles.subtitle}>
          Szczegóły produktu dostępnego w sklepie z drukarkami 3D.
        </Text>
      </View>

      <View style={styles.cartBox}>
        <View>
          <Text style={styles.cartTitle}>Koszyk</Text>
          <Text style={styles.cartText}>
            Produkty: {totalQuantity} | Wartość: {formatMoney(totalValue)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.8}>
          <Text style={styles.cartButtonText}>Koszyk</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Opis produktu</Text>

        <Text style={styles.description}>
          {item.description ?? 'Brak opisu produktu'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dane produktu</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kod</Text>
          <Text style={styles.infoValue}>{item.code ?? 'Brak kodu'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kategoria</Text>
          <Text style={styles.infoValue}>
            {item.categoryName ?? 'Brak kategorii'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jednostka</Text>
          <Text style={styles.infoValue}>
            {item.unitName ?? 'Brak jednostki'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Stan magazynu</Text>
          <Text style={styles.infoValue}>
            {item.quantity ?? 0} {item.unitName ?? 'szt'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cena</Text>
          <Text style={styles.priceValue}>{formatMoney(item.price)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informacje techniczne</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID produktu</Text>
          <Text style={styles.infoValue}>{item.idItem}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID kategorii</Text>
          <Text style={styles.infoValue}>{item.idCategory}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID jednostki</Text>
          <Text style={styles.infoValue}>{item.idUnitOfMeasurement}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Aktywny</Text>
          <Text style={styles.infoValue}>{item.isActive ? 'Tak' : 'Nie'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.addToCartButton,
          (item.quantity ?? 0) <= 0 && styles.disabledButton,
        ]}
        onPress={handleAddToCart}
        activeOpacity={0.8}
        disabled={(item.quantity ?? 0) <= 0}>
        <Text style={styles.addToCartButtonText}>
          {(item.quantity ?? 0) > 0 ? 'Dodaj do koszyka' : 'Brak na stanie'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.goToCartButton}
        onPress={() => navigation.navigate('Cart')}
        activeOpacity={0.8}>
        <Text style={styles.goToCartButtonText}>Przejdź do koszyka</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}>
        <Text style={styles.backButtonText}>Wróć do produktów</Text>
      </TouchableOpacity>
    </ScrollView>
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

  cartBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  cartTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },

  cartText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },

  cartButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  cartButtonText: {
    color: '#ffffff',
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
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 10,
  },

  description: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },

  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingVertical: 9,
  },

  infoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  infoValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
  },

  priceValue: {
    color: '#f97316',
    fontSize: 18,
    fontWeight: '900',
  },

  addToCartButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  addToCartButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  goToCartButton: {
    backgroundColor: '#f97316',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  goToCartButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  backButton: {
    backgroundColor: '#334155',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  backButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  disabledButton: {
    opacity: 0.55,
  },
});

export default ItemDetailsScreen;