import React, {useMemo, useState} from 'react';
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

  const {
    addToCart,
    cartItems,
    totalQuantity,
    totalValue,
  } = useCart();

  const {isAdmin, isWorker, isCustomer} = useAuth();

  const availableQuantity = item.quantity ?? 0;
  const isAvailable = availableQuantity > 0 && item.isActive !== false;

  const cartItem = useMemo(() => {
    return cartItems.find(currentItem => {
      return currentItem.item.idItem === item.idItem;
    });
  }, [cartItems, item.idItem]);

  const quantityAlreadyInCart = cartItem?.quantity ?? 0;
  const maxCanAddNow = Math.max(availableQuantity - quantityAlreadyInCart, 0);

  const [selectedQuantity, setSelectedQuantity] = useState(
    isAvailable && maxCanAddNow > 0 ? 1 : 0,
  );

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const selectedLineValue = selectedQuantity * (item.price ?? 0);

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
      if (previous >= maxCanAddNow) {
        return previous;
      }

      return previous + 1;
    });
  };

  const setQuickQuantity = (quantity: number): void => {
    if (!isAvailable || maxCanAddNow <= 0) {
      return;
    }

    setSelectedQuantity(Math.min(quantity, maxCanAddNow));
  };

  const handleAddToCart = (): void => {
    if (item.isActive === false) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Produkt',
        message: 'Produkt jest niedostępny.',
        loading: false,
      });

      return;
    }

    if (!isAvailable) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Produkt',
        message: 'Brak produktu na stanie.',
        loading: false,
      });

      return;
    }

    if (maxCanAddNow <= 0) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Koszyk',
        message: 'Maksymalna ilość jest już w koszyku.',
        loading: false,
      });

      return;
    }

    if (selectedQuantity <= 0) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Ilość',
        message: 'Wybierz ilość.',
        loading: false,
      });

      return;
    }

    addToCart(item, selectedQuantity);

    setDialog({
      visible: true,
      type: 'success',
      title: 'Koszyk',
      message: 'Dodano produkt.',
      loading: false,
    });

    const newMax = maxCanAddNow - selectedQuantity;

    if (newMax <= 0) {
      setSelectedQuantity(0);
    } else {
      setSelectedQuantity(Math.min(selectedQuantity, newMax));
    }
  };

  const renderQuickQuantityButton = (quantity: number): React.JSX.Element => {
    const disabled = !isAvailable || maxCanAddNow <= 0;
    const selected = selectedQuantity === quantity;

    return (
      <TouchableOpacity
        key={`quick-quantity-${quantity}`}
        style={[
          styles.quickQuantityButton,
          selected && styles.quickQuantityButtonSelected,
          disabled && styles.disabledButton,
        ]}
        onPress={() => setQuickQuantity(quantity)}
        activeOpacity={0.85}
        disabled={disabled}>
        <Text
          style={[
            styles.quickQuantityText,
            selected && styles.quickQuantityTextSelected,
          ]}>
          {quantity}
        </Text>
      </TouchableOpacity>
    );
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
          activeOpacity={0.85}>
          <Text style={styles.homeButtonText}>3D Print Shop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accountButton}
          onPress={handleAccountPress}
          activeOpacity={0.85}>
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
            {isAvailable ? 'Dostępny' : 'Brak'}
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
          activeOpacity={0.85}>
          <Text style={styles.cartButtonText}>Otwórz</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.priceCard}>
        <View style={styles.priceBox}>
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

      {quantityAlreadyInCart > 0 ? (
        <View style={styles.smallInfoBox}>
          <Text style={styles.smallInfoText}>
            W koszyku: {quantityAlreadyInCart} {item.unitName ?? 'szt'}
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Opis</Text>

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
              (selectedQuantity <= 1 || !isAvailable) && styles.disabledButton,
            ]}
            onPress={decreaseQuantity}
            activeOpacity={0.85}
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
              (selectedQuantity >= maxCanAddNow || !isAvailable) &&
                styles.disabledButton,
            ]}
            onPress={increaseQuantity}
            activeOpacity={0.85}
            disabled={selectedQuantity >= maxCanAddNow || !isAvailable}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickQuantityRow}>
          {renderQuickQuantityButton(1)}
          {renderQuickQuantityButton(2)}
          {renderQuickQuantityButton(3)}
          {renderQuickQuantityButton(5)}
        </View>

        <View style={styles.lineValueBox}>
          <Text style={styles.lineValueLabel}>Razem</Text>
          <Text style={styles.lineValue}>{formatMoney(selectedLineValue)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.addToCartButton,
          (!isAvailable || maxCanAddNow <= 0) && styles.disabledButton,
        ]}
        onPress={handleAddToCart}
        activeOpacity={0.85}
        disabled={!isAvailable || maxCanAddNow <= 0}>
        <Text style={styles.addToCartButtonText}>
          {isAvailable && maxCanAddNow > 0 ? 'Dodaj do koszyka' : 'Niedostępny'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Items')}
        activeOpacity={0.85}>
        <Text style={styles.secondaryButtonText}>Produkty</Text>
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

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 14,
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
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  accountButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  heroBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  productIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  title: {
    color: '#f8fafc',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
    marginBottom: 12,
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryBadge: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  codeBadge: {
    backgroundColor: '#334155',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  availableBadge: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  emptyBadge: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  cartBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },

  cartTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  cartText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
  },

  cartButton: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  cartButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  priceCard: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  priceBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
  },

  stockBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },

  priceLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 5,
  },

  stockLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 5,
  },

  priceValue: {
    color: '#f97316',
    fontSize: 24,
    fontWeight: '900',
  },

  stockValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },

  smallInfoBox: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginBottom: 14,
  },

  smallInfoText: {
    color: '#38bdf8',
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
    marginBottom: 10,
  },

  description: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 12,
  },

  quantityButton: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityButtonText: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '900',
  },

  quantityValueBox: {
    minWidth: 74,
    alignItems: 'center',
  },

  quantityValue: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '900',
  },

  quantityUnit: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
  },

  quickQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },

  quickQuantityButton: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    width: 44,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickQuantityButtonSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  quickQuantityText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '900',
  },

  quickQuantityTextSelected: {
    color: '#ffffff',
  },

  lineValueBox: {
    backgroundColor: '#052e16',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#16a34a',
  },

  lineValueLabel: {
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },

  lineValue: {
    color: '#bbf7d0',
    fontSize: 20,
    fontWeight: '900',
  },

  addToCartButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },

  addToCartButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  secondaryButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  disabledButton: {
    opacity: 0.5,
  },
});

export default ItemDetailsScreen;