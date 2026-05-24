import React, {useState} from 'react';
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
import {useCart} from '../context/CartContext.tsx';
import {useItems} from '../context/ItemsContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';
import type {CartItemModel, CheckoutOrderResponseDto} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

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

function CartScreen({navigation}: Props): React.JSX.Element {
  const {
    cartItems,
    totalQuantity,
    totalValue,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const {refreshItems} = useItems();

  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState<CheckoutOrderResponseDto | null>(
    null,
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

  const validateCheckout = (): string | null => {
    if (cartItems.length === 0) {
      return 'Koszyk jest pusty';
    }

    if (clientName.trim().length === 0) {
      return 'Podaj imię i nazwisko';
    }

    if (clientName.trim().length < 3) {
      return 'Imię i nazwisko powinno mieć minimum 3 znaki';
    }

    if (clientAddress.trim().length === 0) {
      return 'Podaj adres dostawy';
    }

    if (clientAddress.trim().length < 5) {
      return 'Adres dostawy powinien mieć minimum 5 znaków';
    }

    if (clientPhone.trim().length === 0) {
      return 'Podaj numer telefonu';
    }

    if (clientPhone.trim().length < 6) {
      return 'Numer telefonu jest za krótki';
    }

    return null;
  };

  const handleCheckoutPress = (): void => {
    const validationError = validateCheckout();

    if (validationError) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Błąd formularza',
        message: validationError,
        loading: false,
      });

      return;
    }

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Potwierdzenie zamówienia',
      message: `Czy złożyć zamówienie na kwotę ${formatMoney(totalValue)}?`,
      loading: false,
    });
  };

  const submitCheckout = async (): Promise<void> => {
    try {
      setSubmitting(true);

      setDialog(previous => ({
        ...previous,
        loading: true,
      }));

      const result = await apiService.createCheckoutOrder({
        client: {
          name: clientName.trim(),
          address: clientAddress.trim(),
          phoneNumber: clientPhone.trim(),
        },
        items: cartItems.map(cartItem => ({
          idItem: cartItem.item.idItem,
          quantity: cartItem.quantity,
        })),
        notes: notes.trim().length > 0 ? notes.trim() : null,
      });

      clearCart();

      await refreshItems();

      setClientName('');
      setClientAddress('');
      setClientPhone('');
      setNotes('');

      setDialog(previous => ({
        ...previous,
        visible: false,
        loading: false,
      }));

      navigation.navigate('OrderSuccess', {
        idOrder: result.idOrder,
        totalValue: result.totalValue,
        message: result.message,
      });
    } catch (err) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Błąd składania zamówienia',
        message: (err as Error).message,
        loading: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogConfirm = (): void => {
    if (dialog.type === 'confirm') {
      submitCheckout();
      return;
    }

    closeDialog();
  };

  const renderCartItem = (cartItem: CartItemModel): React.JSX.Element => {
    const item = cartItem.item;
    const itemPrice = item.price ?? 0;
    const lineValue = cartItem.quantity * itemPrice;
    const availableQuantity = item.quantity ?? 0;

    return (
      <View key={item.idItem} style={styles.cartCard}>
        <Text style={styles.cartItemName}>{item.name}</Text>

        <Text style={styles.cartItemDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.badgeRow}>
          <Text style={styles.categoryBadge}>
            {item.categoryName ?? 'Brak kategorii'}
          </Text>

          <Text style={styles.codeBadge}>{item.code ?? 'Brak kodu'}</Text>
        </View>

        <Text style={styles.cartItemText}>Cena: {formatMoney(item.price)}</Text>

        <Text style={styles.cartItemText}>
          Dostępne: {availableQuantity} {item.unitName ?? 'szt'}
        </Text>

        <Text style={styles.cartItemValue}>
          Wartość pozycji: {formatMoney(lineValue)}
        </Text>

        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.idItem, cartItem.quantity - 1)}
            activeOpacity={0.8}
            disabled={submitting}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantityValue}>{cartItem.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.idItem, cartItem.quantity + 1)}
            activeOpacity={0.8}
            disabled={submitting || cartItem.quantity >= availableQuantity}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.idItem)}
          activeOpacity={0.8}
          disabled={submitting}>
          <Text style={styles.removeButtonText}>Usuń z koszyka</Text>
        </TouchableOpacity>
      </View>
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
        confirmText={dialog.type === 'confirm' ? 'Złóż zamówienie' : 'OK'}
        cancelText="Anuluj"
        loading={dialog.loading}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.appName}>3D Print Shop</Text>

          <Text style={styles.title}>Koszyk</Text>

          <Text style={styles.subtitle}>
            Sprawdź produkty, uzupełnij dane dostawy i złóż zamówienie.
          </Text>
        </View>

        {lastOrder && (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>
              Ostatnie zamówienie: nr {lastOrder.idOrder}
            </Text>

            <Text style={styles.successText}>
              Wartość: {formatMoney(lastOrder.totalValue)}
            </Text>
          </View>
        )}

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Liczba produktów w koszyku</Text>
          <Text style={styles.summaryValue}>{totalQuantity}</Text>

          <Text style={styles.summaryLabel}>Razem do zapłaty</Text>
          <Text style={styles.summaryMoney}>{formatMoney(totalValue)}</Text>
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Koszyk jest pusty</Text>

            <Text style={styles.emptyText}>
              Przejdź do produktów i dodaj drukarkę 3D, filament albo akcesoria
              do koszyka.
            </Text>

            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Items')}
              activeOpacity={0.8}>
              <Text style={styles.shopButtonText}>Przejdź do sklepu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Produkty w koszyku</Text>

            {cartItems.map(renderCartItem)}

            <TouchableOpacity
              style={styles.clearCartButton}
              onPress={clearCart}
              activeOpacity={0.8}
              disabled={submitting}>
              <Text style={styles.clearCartButtonText}>Wyczyść koszyk</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.sectionTitle}>Dane dostawy</Text>

        <View style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Imię i nazwisko</Text>

            <TextInput
              style={styles.input}
              value={clientName}
              onChangeText={setClientName}
              placeholder="Np. Jan Kowalski"
              placeholderTextColor="#64748b"
              editable={!submitting}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Adres dostawy</Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={clientAddress}
              onChangeText={setClientAddress}
              placeholder="Np. ul. Testowa 1, Warszawa"
              placeholderTextColor="#64748b"
              multiline
              editable={!submitting}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Numer telefonu</Text>

            <TextInput
              style={styles.input}
              value={clientPhone}
              onChangeText={setClientPhone}
              placeholder="Np. 500-111-222"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
              editable={!submitting}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notatka do zamówienia</Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Opcjonalnie"
              placeholderTextColor="#64748b"
              multiline
              editable={!submitting}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (cartItems.length === 0 || submitting) && styles.disabledButton,
          ]}
          onPress={handleCheckoutPress}
          activeOpacity={0.8}
          disabled={cartItems.length === 0 || submitting}>
          <Text style={styles.checkoutButtonText}>
            {submitting ? 'Składanie zamówienia...' : 'Złóż zamówienie'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToShopButton}
          onPress={() => navigation.navigate('Items')}
          activeOpacity={0.8}
          disabled={submitting}>
          <Text style={styles.backToShopButtonText}>Wróć do produktów</Text>
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
    fontSize: 28,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  successBox: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  successTitle: {
    color: '#dcfce7',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },

  successText: {
    color: '#bbf7d0',
    fontSize: 13,
    fontWeight: '700',
  },

  summaryBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  summaryLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },

  summaryValue: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },

  summaryMoney: {
    color: '#f97316',
    fontSize: 26,
    fontWeight: '900',
  },

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
    marginBottom: 12,
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },

  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 14,
  },

  shopButton: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  shopButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  cartCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },

  cartItemName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },

  cartItemDescription: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },

  categoryBadge: {
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
  },

  codeBadge: {
    backgroundColor: '#422006',
    color: '#fed7aa',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
  },

  cartItemText: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 4,
  },

  cartItemValue: {
    color: '#f97316',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 10,
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  quantityButton: {
    backgroundColor: '#f97316',
    width: 38,
    height: 38,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },

  quantityValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    minWidth: 32,
    textAlign: 'center',
  },

  removeButton: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  removeButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  clearCartButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },

  clearCartButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  formCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
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
    minHeight: 78,
    textAlignVertical: 'top',
  },

  checkoutButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  disabledButton: {
    opacity: 0.55,
  },

  backToShopButton: {
    backgroundColor: '#f97316',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },

  backToShopButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default CartScreen;