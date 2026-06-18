import React, {useEffect, useMemo, useState} from 'react';
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
import {useAuth} from '../context/AuthContext.tsx';
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
    return 'Karta';
  }

  if (method === 'transfer') {
    return 'Przelew';
  }

  return 'Przy odbiorze';
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

  const {user, isCustomer, isAdmin, isWorker} = useAuth();
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

  const unavailableItems = useMemo(() => {
    return cartItems.filter(cartItem => {
      const availableQuantity = cartItem.item.quantity ?? 0;

      return (
        cartItem.item.isActive === false ||
        availableQuantity <= 0 ||
        cartItem.quantity > availableQuantity
      );
    });
  }, [cartItems]);

  const hasCartWarnings = unavailableItems.length > 0;

  useEffect(() => {
    if (!isCustomer || !user) {
      return;
    }

    if (user.name && clientName.trim().length === 0) {
      setClientName(user.name);
    }

    if (user.adress && clientAddress.trim().length === 0) {
      setClientAddress(user.adress);
    }

    if (user.phoneNumber && clientPhone.trim().length === 0) {
      setClientPhone(user.phoneNumber);
    }
  }, [
    clientAddress,
    clientName,
    clientPhone,
    isCustomer,
    user,
  ]);

  const closeDialog = (): void => {
    setDialog(previous => ({
      ...previous,
      visible: false,
      loading: false,
    }));
  };

  const validateCheckout = (): string | null => {
    if (cartItems.length === 0) {
      return 'Koszyk jest pusty.';
    }

    if (hasCartWarnings) {
      return 'Popraw produkty w koszyku.';
    }

    if (clientName.trim().length < 3) {
      return 'Podaj imię i nazwisko.';
    }

    if (clientAddress.trim().length < 5) {
      return 'Podaj adres dostawy.';
    }

    if (clientPhone.trim().length < 6) {
      return 'Podaj numer telefonu.';
    }

    return null;
  };

  const buildCheckoutNotes = (): string => {
    const userNotes = notes.trim();

    const noteParts = [
      user
        ? `Zamówienie z konta: ${user.name} (${user.login})`
        : 'Zamówienie jako gość',
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
        title: 'Błąd',
        message: validationError,
        loading: false,
      });

      return;
    }

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Złożyć zamówienie?',
      message: `Razem: ${formatMoney(finalValue)}`,
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
          idClient: isCustomer ? user?.id ?? null : null,
          name: clientName.trim(),
          address: clientAddress.trim(),
          phoneNumber: clientPhone.trim(),
          email: isCustomer ? user?.login ?? null : null,
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
        title: 'Błąd',
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

  const goToAccount = (): void => {
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

  const renderDeliveryOption = (
    method: DeliveryMethod,
    title: string,
  ): React.JSX.Element => {
    const selected = deliveryMethod === method;

    return (
      <TouchableOpacity
        key={method}
        style={[styles.optionButton, selected && styles.optionButtonSelected]}
        onPress={() => setDeliveryMethod(method)}
        activeOpacity={0.85}
        disabled={submitting}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionPrice}>
          {formatMoney(getDeliveryPrice(method))}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPaymentOption = (
    method: PaymentMethod,
    title: string,
  ): React.JSX.Element => {
    const selected = paymentMethod === method;

    return (
      <TouchableOpacity
        key={method}
        style={[styles.optionButton, selected && styles.optionButtonSelected]}
        onPress={() => setPaymentMethod(method)}
        activeOpacity={0.85}
        disabled={submitting}>
        <Text style={styles.optionTitle}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const renderCartItem = (cartItem: CartItemModel): React.JSX.Element => {
    const item = cartItem.item;
    const itemPrice = item.price ?? 0;
    const lineValue = cartItem.quantity * itemPrice;
    const availableQuantity = item.quantity ?? 0;
    const isItemAvailable = item.isActive !== false && availableQuantity > 0;
    const isQuantityTooHigh = cartItem.quantity > availableQuantity;
    const hasWarning = !isItemAvailable || isQuantityTooHigh;

    return (
      <View key={item.idItem} style={styles.cartCard}>
        <View style={styles.cartItemHeader}>
          <View style={styles.cartItemTitleBox}>
            <Text style={styles.cartItemName}>{item.name}</Text>
            <Text style={styles.cartItemCode}>{item.code ?? 'Brak kodu'}</Text>
          </View>

          {hasWarning ? (
            <Text style={styles.warningBadge}>Sprawdź</Text>
          ) : null}
        </View>

        <View style={styles.cartInfoRow}>
          <View style={styles.cartInfoBox}>
            <Text style={styles.cartInfoLabel}>Cena</Text>
            <Text style={styles.cartInfoValue}>{formatMoney(item.price)}</Text>
          </View>

          <View style={styles.cartInfoBox}>
            <Text style={styles.cartInfoLabel}>Dostępne</Text>
            <Text style={styles.cartInfoValue}>
              {availableQuantity} {item.unitName ?? 'szt'}
            </Text>
          </View>
        </View>

        {isQuantityTooHigh ? (
          <View style={styles.itemWarningBox}>
            <Text style={styles.itemWarningText}>
              Dostępne: {availableQuantity}
            </Text>
          </View>
        ) : null}

        {!isItemAvailable ? (
          <View style={styles.itemWarningBox}>
            <Text style={styles.itemWarningText}>Produkt niedostępny</Text>
          </View>
        ) : null}

        <View style={styles.lineValueBox}>
          <Text style={styles.lineValueLabel}>Wartość</Text>
          <Text style={styles.lineValueText}>{formatMoney(lineValue)}</Text>
        </View>

        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.idItem, cartItem.quantity - 1)}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantityValue}>{cartItem.quantity}</Text>

          <TouchableOpacity
            style={[
              styles.quantityButton,
              (submitting || cartItem.quantity >= availableQuantity) &&
                styles.quantityButtonDisabled,
            ]}
            onPress={() => updateQuantity(item.idItem, cartItem.quantity + 1)}
            activeOpacity={0.85}
            disabled={submitting || cartItem.quantity >= availableQuantity}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.idItem)}
          activeOpacity={0.85}
          disabled={submitting}>
          <Text style={styles.removeButtonText}>Usuń</Text>
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
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryTopTextBox}>
              <Text style={styles.summaryLabel}>Klient</Text>
              <Text style={styles.customerModeText}>
                {user ? user.name : 'Gość'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.accountButton}
              onPress={goToAccount}
              activeOpacity={0.85}>
              <Text style={styles.accountButtonText}>
                {user ? 'Konto' : 'Zaloguj'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>Produkty</Text>
              <Text style={styles.summaryValue}>{totalQuantity}</Text>
            </View>

            <View style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>Wartość</Text>
              <Text style={styles.summaryMoney}>{formatMoney(totalValue)}</Text>
            </View>

            <View style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>Dostawa</Text>
              <Text style={styles.summaryDelivery}>
                {formatMoney(deliveryPrice)}
              </Text>
            </View>

            <View style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>Razem</Text>
              <Text style={styles.summaryFinal}>{formatMoney(finalValue)}</Text>
            </View>
          </View>
        </View>

        {hasCartWarnings ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>Sprawdź produkty w koszyku.</Text>
          </View>
        ) : null}

        {cartItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Koszyk jest pusty</Text>

            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Items')}
              activeOpacity={0.85}>
              <Text style={styles.shopButtonText}>Produkty</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Produkty</Text>

            {cartItems.map(renderCartItem)}

            <TouchableOpacity
              style={styles.clearCartButton}
              onPress={clearCart}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.clearCartButtonText}>Wyczyść koszyk</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Dostawa</Text>

            <View style={styles.formCard}>
              <View style={styles.optionsGrid}>
                {renderDeliveryOption('courier', 'Kurier')}
                {renderDeliveryOption('parcelLocker', 'Paczkomat')}
                {renderDeliveryOption('pickup', 'Odbiór')}
              </View>

              <Text style={styles.deliveryDateText}>
                Data: {formatDate(estimatedDeliveryDate)}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Płatność</Text>

            <View style={styles.formCard}>
              <View style={styles.optionsGrid}>
                {renderPaymentOption('blik', 'BLIK')}
                {renderPaymentOption('card', 'Karta')}
                {renderPaymentOption('transfer', 'Przelew')}
                {renderPaymentOption('cashOnDelivery', 'Przy odbiorze')}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Dane dostawy</Text>

            <View style={styles.formCard}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Imię i nazwisko</Text>

                <TextInput
                  style={styles.input}
                  value={clientName}
                  onChangeText={setClientName}
                  placeholder="Imię i nazwisko"
                  placeholderTextColor="#64748b"
                  editable={!submitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Adres</Text>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={clientAddress}
                  onChangeText={setClientAddress}
                  placeholder="Adres"
                  placeholderTextColor="#64748b"
                  multiline
                  editable={!submitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Telefon</Text>

                <TextInput
                  style={styles.input}
                  value={clientPhone}
                  onChangeText={setClientPhone}
                  placeholder="Telefon"
                  placeholderTextColor="#64748b"
                  keyboardType="phone-pad"
                  editable={!submitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Notatka</Text>

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

            <View style={styles.finalBox}>
              <Text style={styles.finalText}>
                Produkty: {formatMoney(totalValue)}
              </Text>

              <Text style={styles.finalText}>
                Dostawa: {formatMoney(deliveryPrice)}
              </Text>

              <Text style={styles.finalTotal}>
                Razem: {formatMoney(finalValue)}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.checkoutButton,
                (submitting || hasCartWarnings) && styles.disabledButton,
              ]}
              onPress={handleCheckoutPress}
              activeOpacity={0.85}
              disabled={submitting || hasCartWarnings}>
              <Text style={styles.checkoutButtonText}>
                {submitting ? 'Składanie...' : 'Złóż zamówienie'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.backToShopButton}
          onPress={() => navigation.navigate('Items')}
          activeOpacity={0.85}
          disabled={submitting}>
          <Text style={styles.backToShopButtonText}>Produkty</Text>
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

  summaryBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  summaryTopTextBox: {
    flex: 1,
  },

  accountButton: {
    backgroundColor: '#2563eb',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  accountButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  summaryCell: {
    width: '47.8%',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  summaryLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  customerModeText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '900',
  },

  summaryValue: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
  },

  summaryMoney: {
    color: '#f97316',
    fontSize: 20,
    fontWeight: '900',
  },

  summaryDelivery: {
    color: '#38bdf8',
    fontSize: 20,
    fontWeight: '900',
  },

  summaryFinal: {
    color: '#16a34a',
    fontSize: 22,
    fontWeight: '900',
  },

  warningBox: {
    backgroundColor: '#431407',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 14,
  },

  warningText: {
    color: '#fed7aa',
    fontSize: 13,
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
    marginBottom: 12,
    textAlign: 'center',
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

  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  cartItemTitleBox: {
    flex: 1,
  },

  cartItemName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
  },

  cartItemCode: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },

  warningBadge: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  cartInfoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  cartInfoBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  cartInfoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  cartInfoValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
  },

  itemWarningBox: {
    backgroundColor: '#431407',
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 10,
  },

  itemWarningText: {
    color: '#fed7aa',
    fontSize: 12,
    fontWeight: '900',
  },

  lineValueBox: {
    backgroundColor: '#052e16',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 10,
  },

  lineValueLabel: {
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },

  lineValueText: {
    color: '#bbf7d0',
    fontSize: 17,
    fontWeight: '900',
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 10,
  },

  quantityButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityButtonDisabled: {
    opacity: 0.45,
  },

  quantityButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },

  quantityValue: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
    minWidth: 36,
    textAlign: 'center',
  },

  removeButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },

  removeButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  clearCartButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
  },

  clearCartButtonText: {
    color: '#ffffff',
    fontSize: 13,
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

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  optionButton: {
    width: '47.8%',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 10,
    minHeight: 74,
    justifyContent: 'center',
  },

  optionButtonSelected: {
    borderColor: '#f97316',
    backgroundColor: '#1f2937',
  },

  optionTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 5,
  },

  optionPrice: {
    color: '#16a34a',
    fontSize: 13,
    fontWeight: '900',
  },

  deliveryDateText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
  },

  formGroup: {
    marginBottom: 10,
  },

  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },

  textArea: {
    minHeight: 82,
    textAlignVertical: 'top',
  },

  finalBox: {
    backgroundColor: '#052e16',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 14,
  },

  finalText: {
    color: '#bbf7d0',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },

  finalTotal: {
    color: '#bbf7d0',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },

  checkoutButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  disabledButton: {
    opacity: 0.5,
  },

  backToShopButton: {
    backgroundColor: '#334155',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  backToShopButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default CartScreen;