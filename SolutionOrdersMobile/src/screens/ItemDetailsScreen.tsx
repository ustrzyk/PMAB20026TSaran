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
import {useAuth} from '../context/AuthContext.tsx';
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
  const {isAdmin, isWorker, isCustomer} = useAuth();

  const availableQuantity = item.quantity ?? 0;
  const isAvailable = availableQuantity > 0 && item.isActive !== false;

  const [selectedQuantity, setSelectedQuantity] = useState(
    isAvailable ? 1 : 0,
  );

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

  const getAccountLabel = (): string => {
    if (isAdmin || isWorker) {
      return 'Panel';
    }

    if (isCustomer) {
      return 'Konto';
    }

    return 'Zaloguj';
  };

  const handleAccountPress = (): void => {
    if (isAdmin || isWorker) {
      navigation.navigate('AdminPanel');
      return;
    }

    if (isCustomer) {
      navigation.navigate('ClientPanel');
      return;
    }

    navigation.navigate('AuthLogin');
  };

  const decreaseQuantity = (): void => {
    setSelectedQuantity(previous => {
      if (previous <= 1) {
        return previous;
      }

      return previous - 1;
    });
  };

  const increaseQuantity = (): void => {
    setSelectedQuantity(previous => {
      if (previous >= availableQuantity) {
        return previous;
      }

      return previous + 1;
    });
  };

  const handleAddToCart = (): void => {
    if (item.isActive === false) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Produkt nieaktywny',
        message: 'Tego produktu nie można aktualnie kupić.',
        loading: false,
      });

      return;
    }

    if (!isAvailable) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Brak produktu',
        message: 'Tego produktu nie ma aktualnie na stanie.',
        loading: false,
      });

      return;
    }

    if (selectedQuantity <= 0) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Niepoprawna ilość',
        message: 'Wybierz ilość większą od 0.',
        loading: false,
      });

      return;
    }

    addToCart(item, selectedQuantity);

    setDialog({
      visible: true,
      type: 'success',
      title: 'Dodano do koszyka',
      message: `Dodano "${item.name}" w ilości ${selectedQuantity}.`,
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

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}>
          <Text style={styles.homeButtonText}>3D Print Shop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accountButton}
          onPress={handleAccountPress}
          activeOpacity={0.8}>
          <Text style={styles.accountButtonText}>{getAccountLabel()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroBox}>
        <Text style={styles.productIcon}>🖨️</Text>

        <Text style={styles.title}>{item.name}</Text>

        <View style={styles.badgeRow}>
          <Text style={styles.categoryBadge}>
            {item.categoryName ?? 'Brak kategorii'}
          </Text>

          <Text style={styles.codeBadge}>{item.code ?? 'Brak kodu'}</Text>

          <Text style={isAvailable ? styles.availableBadge : styles.emptyBadge}>
            {isAvailable ? 'Dostępny' : 'Brak na stanie'}
          </Text>
        </View>
      </View>

      <View style={styles.cartBox}>
        <View>
          <Text style={styles.cartTitle}>Koszyk</Text>
          <Text style={styles.cartText}>
            {totalQuantity} szt. | {formatMoney(totalValue)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.8}>
          <Text style={styles.cartButtonText}>Otwórz</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.priceCard}>
        <View>
          <Text style={styles.priceLabel}>Cena</Text>
          <Text style={styles.priceValue}>{formatMoney(item.price)}</Text>
        </View>

        <View style={styles.stockBox}>
          <Text style={styles.stockLabel}>Dostępne</Text>
          <Text style={styles.stockValue}>
            {availableQuantity} {item.unitName ?? 'szt'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Opis produktu</Text>

        <Text style={styles.description}>
          {item.description ?? 'Brak opisu produktu'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ilość</Text>

        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              selectedQuantity <= 1 && styles.disabledButton,
            ]}
            onPress={decreaseQuantity}
            activeOpacity={0.8}
            disabled={selectedQuantity <= 1 || !isAvailable}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>

          <View style={styles.quantityValueBox}>
            <Text style={styles.quantityValue}>{selectedQuantity}</Text>
            <Text style={styles.quantityUnit}>{item.unitName ?? 'szt'}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.quantityButton,
              selectedQuantity >= availableQuantity && styles.disabledButton,
            ]}
            onPress={increaseQuantity}
            activeOpacity={0.8}
            disabled={selectedQuantity >= availableQuantity || !isAvailable}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.lineValue}>
          Wartość: {formatMoney(selectedQuantity * (item.price ?? 0))}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.addToCartButton,
          !isAvailable && styles.disabledButton,
        ]}
        onPress={handleAddToCart}
        activeOpacity={0.8}
        disabled={!isAvailable}>
        <Text style={styles.addToCartButtonText}>
          {isAvailable ? 'Dodaj do koszyka' : 'Brak na stanie'}
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
        onPress={() => navigation.navigate('Items')}
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
    paddingBottom: 32,
  },

  topBar: {
    backgroundColor: '#111827',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  homeButton: {
    flex: 1,
  },

  homeButtonText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },

  accountButton: {
    backgroundColor: '#f97316',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  accountButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  heroBox: {
    backgroundColor: '#111827',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    marginBottom: 14,
  },

  productIcon: {
    fontSize: 44,
    marginBottom: 8,
  },

  title: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 12,
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryBadge: {
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  codeBadge: {
    backgroundColor: '#422006',
    color: '#fed7aa',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  availableBadge: {
    backgroundColor: '#052e16',
    color: '#bbf7d0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  emptyBadge: {
    backgroundColor: '#7f1d1d',
    color: '#fecaca',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },

  cartBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginHorizontal: 16,
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
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  cartButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  priceCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  priceLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },

  priceValue: {
    color: '#f97316',
    fontSize: 30,
    fontWeight: '900',
  },

  stockBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  stockLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },

  stockValue: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },

  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginHorizontal: 16,
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

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityButton: {
    backgroundColor: '#f97316',
    width: 44,
    height: 44,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },

  quantityValueBox: {
    minWidth: 90,
    alignItems: 'center',
    marginHorizontal: 16,
  },

  quantityValue: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '900',
  },

  quantityUnit: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },

  lineValue: {
    color: '#16a34a',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 12,
  },

  addToCartButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
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
    marginHorizontal: 16,
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
    marginHorizontal: 16,
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