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
import type {CartItemModel} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

type DeliveryMethod = 'courier' | 'parcelLocker' | 'pickup';
type PaymentMethod = 'blik' | 'card' | 'transfer' | 'cashOnDelivery';

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

function getDeliveryMethodLabel(method: DeliveryMethod): string {
  if (method === 'courier') {
    return 'Kurier';
  }

  if (method === 'parcelLocker') {
    return 'Paczkomat';
  }

  return 'Odbiór osobisty';
}

function getPaymentMethodLabel(method: PaymentMethod): string {
  if (method === 'blik') {
    return 'BLIK';
  }

  if (method === 'card') {
    return 'Karta płatnicza';
  }

  if (method === 'transfer') {
    return 'Przelew bankowy';
  }

  return 'Płatność przy odbiorze';
}

function getDeliveryPrice(method: DeliveryMethod): number {
  if (method === 'courier') {
    return 19.99;
  }

  if (method === 'parcelLocker') {
    return 14.99;
  }

  return 0;
}

function getEstimatedDeliveryDate(method: DeliveryMethod): string {
  const date = new Date();

  if (method === 'pickup') {
    date.setDate(date.getDate() + 1);
  } else if (method === 'parcelLocker') {
    date.setDate(date.getDate() + 2);
  } else {
    date.setDate(date.getDate() + 3);
  }

  return date.toISOString();
}

function formatDate(value: string): string {
  return value.substring(0, 10);
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

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>('courier');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('blik');

  const [submitting, setSubmitting] = useState(false);

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    loading: false,
  });

  const deliveryPrice = getDeliveryPrice(deliveryMethod);
  const finalValue = totalValue + deliveryPrice;
  const estimatedDeliveryDate = getEstimatedDeliveryDate(deliveryMethod);

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

  const buildCheckoutNotes = (): string => {
    const userNotes = notes.trim();

    const noteParts = [
      `Metoda dostawy: ${getDeliveryMethodLabel(deliveryMethod)}`,
      `Koszt dostawy: ${formatMoney(deliveryPrice)}`,
      `Metoda płatności: ${getPaymentMethodLabel(paymentMethod)}`,
      `Przewidywana data dostawy: ${formatDate(estimatedDeliveryDate)}`,
      userNotes.length > 0 ? `Notatka klienta: ${userNotes}` : null,
    ];

    return noteParts.filter(Boolean).join('\n');
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
      message: `Czy złożyć zamówienie na kwotę ${formatMoney(finalValue)}?`,
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
        notes: buildCheckoutNotes(),
        deliveryDate: estimatedDeliveryDate,
      });

      clearCart();

      await refreshItems();

      setClientName('');
      setClientAddress('');
      setClientPhone('');
      setNotes('');
      setDeliveryMethod('courier');
      setPaymentMethod('blik');

      setDialog(previous => ({
        ...previous,
        visible: false,
        loading: false,
      }));

      navigation.navigate('OrderSuccess', {
        idOrder: result.idOrder,
        totalValue: result.totalValue,
        message: result.message,
        deliveryPrice,
        finalValue,
        deliveryMethod: getDeliveryMethodLabel(deliveryMethod),
        paymentMethod: getPaymentMethodLabel(paymentMethod),
        deliveryDate: estimatedDeliveryDate,
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

  const renderDeliveryOption = (
    method: DeliveryMethod,
    title: string,
    description: string,
  ): React.JSX.Element => {
    const selected = deliveryMethod === method;

    return (
      <TouchableOpacity
        style={[styles.optionButton, selected && styles.optionButtonSelected]}
        onPress={() => setDeliveryMethod(method)}
        activeOpacity={0.8}
        disabled={submitting}>
        <View style={styles.optionHeader}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionPrice}>
            {formatMoney(getDeliveryPrice(method))}
          </Text>
        </View>

        <Text style={styles.optionDescription}>{description}</Text>
      </TouchableOpacity>
    );
  };

  const renderPaymentOption = (
    method: PaymentMethod,
    title: string,
    description: string,
  ): React.JSX.Element => {
    const selected = paymentMethod === method;

    return (
      <TouchableOpacity
        style={[styles.optionButton, selected && styles.optionButtonSelected]}
        onPress={() => setPaymentMethod(method)}
        activeOpacity={0.8}
        disabled={submitting}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </TouchableOpacity>
    );
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
            Sprawdź produkty, wybierz dostawę, płatność i złóż zamówienie.
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Liczba produktów w koszyku</Text>
          <Text style={styles.summaryValue}>{totalQuantity}</Text>

          <Text style={styles.summaryLabel}>Produkty</Text>
          <Text style={styles.summaryMoney}>{formatMoney(totalValue)}</Text>

          <Text style={styles.summaryLabel}>Dostawa</Text>
          <Text style={styles.summaryDelivery}>{formatMoney(deliveryPrice)}</Text>

          <Text style={styles.summaryLabel}>Razem do zapłaty</Text>
          <Text style={styles.summaryFinal}>{formatMoney(finalValue)}</Text>
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

        <Text style={styles.sectionTitle}>Metoda dostawy</Text>

        <View style={styles.formCard}>
          {renderDeliveryOption(
            'courier',
            'Kurier',
            'Dostawa pod wskazany adres. Przewidywany czas: 2-3 dni.',
          )}

          {renderDeliveryOption(
            'parcelLocker',
            'Paczkomat',
            'Dostawa do paczkomatu. Przewidywany czas: 1-2 dni.',
          )}

          {renderDeliveryOption(
            'pickup',
            'Odbiór osobisty',
            'Odbiór w punkcie sklepu. Bez kosztu dostawy.',
          )}

          <Text style={styles.deliveryDateText}>
            Przewidywana data dostawy: {formatDate(estimatedDeliveryDate)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Metoda płatności</Text>

        <View style={styles.formCard}>
          {renderPaymentOption(
            'blik',
            'BLIK',
            'Szybka płatność kodem BLIK.',
          )}

          {renderPaymentOption(
            'card',
            'Karta płatnicza',
            'Płatność kartą online.',
          )}

          {renderPaymentOption(
            'transfer',
            'Przelew bankowy',
            'Dane do przelewu zostaną przekazane po złożeniu zamówienia.',
          )}

          {renderPaymentOption(
            'cashOnDelivery',
            'Płatność przy odbiorze',
            'Płatność kurierowi albo przy odbiorze osobistym.',
          )}
        </View>

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
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },

  summaryDelivery: {
    color: '#38bdf8',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },

  summaryFinal: {
    color: '#16a34a',
    fontSize: 28,
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

  optionButton: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },

  optionButtonSelected: {
    borderColor: '#f97316',
    backgroundColor: '#1e293b',
  },

  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },

  optionTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
  },

  optionPrice: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '900',
  },

  optionDescription: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  deliveryDateText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
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