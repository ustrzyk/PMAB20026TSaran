import React, {useCallback, useEffect, useState} from 'react';
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

import type {RootStackParamList} from '../navigation/types.ts';
import type {Item, OrderDto} from '../types/models.ts';

type CreateProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateOrderItem'
>;
type EditProps = NativeStackScreenProps<RootStackParamList, 'EditOrderItem'>;

type Props = CreateProps | EditProps;

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
}

function parseQuantity(value: string): number {
  const normalizedValue = value.replace(',', '.');

  return Number(normalizedValue);
}

function formatDate(value?: string | null): string {
  if (!value) {
    return 'brak daty';
  }

  return value.substring(0, 10);
}

function OrderItemFormScreen({navigation, route}: Props): React.JSX.Element {
  const isEditMode = route.name === 'EditOrderItem';
  const editedOrderItem = isEditMode ? route.params.orderItem : undefined;

  const idOrderFromRoute =
    route.name === 'CreateOrderItem' ? route.params?.idOrder : undefined;

  const [idOrder, setIdOrder] = useState(
    editedOrderItem?.idOrder?.toString() ?? idOrderFromRoute?.toString() ?? '',
  );
  const [idItem, setIdItem] = useState(
    editedOrderItem?.idItem?.toString() ?? '',
  );
  const [quantity, setQuantity] = useState(
    editedOrderItem?.quantity?.toString() ?? '1',
  );
  const [isActive, setIsActive] = useState(editedOrderItem?.isActive ?? true);

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [items, setItems] = useState<Item[]>([]);
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

      const [ordersFromApi, itemsFromApi] = await Promise.all([
        apiService.getOrders(),
        apiService.getItems(),
      ]);

      const visibleItems = isEditMode
        ? itemsFromApi.filter(item => {
            return (
              item.isActive !== false || item.idItem === editedOrderItem?.idItem
            );
          })
        : itemsFromApi.filter(item => item.isActive !== false);

      setOrders(ordersFromApi);
      setItems(visibleItems);

      if (!isEditMode) {
        if (idOrderFromRoute) {
          const orderExists = ordersFromApi.some(
            order => order.idOrder === idOrderFromRoute,
          );

          if (orderExists) {
            setIdOrder(idOrderFromRoute.toString());
          } else if (ordersFromApi.length > 0) {
            setIdOrder(ordersFromApi[0].idOrder.toString());
          }
        } else if (ordersFromApi.length > 0) {
          setIdOrder(ordersFromApi[0].idOrder.toString());
        }

        const activeItems = itemsFromApi.filter(item => item.isActive !== false);

        if (activeItems.length > 0) {
          setIdItem(activeItems[0].idItem.toString());
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
  }, [editedOrderItem?.idItem, idOrderFromRoute, isEditMode]);

  useEffect(() => {
    loadDictionaries();
  }, [loadDictionaries]);

  const selectedOrder = orders.find(
    order => order.idOrder === Number(idOrder),
  );

  const selectedItem = items.find(item => item.idItem === Number(idItem));

  const orderSelectionLocked =
    !isEditMode && typeof idOrderFromRoute === 'number' && !!selectedOrder;

  const validateForm = (): string | null => {
    if (!idOrder || Number.isNaN(Number(idOrder)) || Number(idOrder) <= 0) {
      return 'Wybierz zamówienie';
    }

    if (!idItem || Number.isNaN(Number(idItem)) || Number(idItem) <= 0) {
      return 'Wybierz produkt';
    }

    const parsedQuantity = parseQuantity(quantity);

    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return 'Ilość musi być większa od 0';
    }

    return null;
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
        ? `Czy zapisać zmiany pozycji nr ${editedOrderItem?.idOrderItem}?`
        : `Czy dodać nową pozycję do zamówienia nr ${idOrder}?`,
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

      if (isEditMode && editedOrderItem) {
        await apiService.updateOrderItem(editedOrderItem.idOrderItem, {
          idOrderItem: editedOrderItem.idOrderItem,
          idOrder: Number(idOrder),
          idItem: Number(idItem),
          quantity: parseQuantity(quantity),
          isActive,
        });

        showDialog(
          'success',
          'Pozycja zaktualizowana',
          'Zmiany pozycji zamówienia zostały zapisane.',
          true,
        );
      } else {
        await apiService.createOrderItem({
          idOrder: Number(idOrder),
          idItem: Number(idItem),
          quantity: parseQuantity(quantity),
        });

        showDialog(
          'success',
          'Pozycja dodana',
          'Nowa pozycja zamówienia została zapisana.',
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

  const renderOrderButton = (order: OrderDto): React.JSX.Element => {
    const isSelected = Number(idOrder) === order.idOrder;

    return (
      <TouchableOpacity
        key={order.idOrder}
        style={[
          styles.optionButton,
          isSelected && styles.optionButtonSelected,
          orderSelectionLocked && !isSelected && styles.optionButtonDisabled,
        ]}
        onPress={() => setIdOrder(order.idOrder.toString())}
        activeOpacity={0.8}
        disabled={submitting || orderSelectionLocked}>
        <Text
          style={[
            styles.optionButtonText,
            isSelected && styles.optionButtonTextSelected,
          ]}>
          Zamówienie nr {order.idOrder}
        </Text>

        <Text
          style={[
            styles.optionButtonSubtext,
            isSelected && styles.optionButtonSubtextSelected,
          ]}>
          {order.clientName ?? 'Brak klienta'} | {formatDate(order.dataOrder)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItemButton = (item: Item): React.JSX.Element => {
    const isSelected = Number(idItem) === item.idItem;
    const isItemActive = item.isActive !== false;

    return (
      <TouchableOpacity
        key={item.idItem}
        style={[
          styles.optionButton,
          isSelected && styles.optionButtonSelected,
          !isItemActive && styles.inactiveOptionButton,
        ]}
        onPress={() => setIdItem(item.idItem.toString())}
        activeOpacity={0.8}
        disabled={submitting}>
        <Text
          style={[
            styles.optionButtonText,
            isSelected && styles.optionButtonTextSelected,
          ]}>
          {item.name}
        </Text>

        <Text
          style={[
            styles.optionButtonSubtext,
            isSelected && styles.optionButtonSubtextSelected,
          ]}>
          Kod: {item.code ?? 'brak kodu'}
          {!isItemActive ? ' | produkt nieaktywny' : ''}
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
            {isEditMode ? 'Edytuj pozycję' : 'Dodaj pozycję'}
          </Text>

          <Text style={styles.subtitle}>
            Wybierz zamówienie, produkt oraz podaj ilość.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Powiązania</Text>

          {dictionaryLoading ? (
            <View style={styles.dictionaryLoadingBox}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.dictionaryLoadingText}>
                Ładowanie zamówień i produktów...
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.label}>Zamówienie</Text>

              {orderSelectionLocked && (
                <View style={styles.lockedBox}>
                  <Text style={styles.lockedText}>
                    Zamówienie zostało wybrane automatycznie z poprzedniego
                    ekranu.
                  </Text>
                </View>
              )}

              <Text style={styles.selectedText}>
                Wybrano:{' '}
                {selectedOrder
                  ? `zamówienie nr ${selectedOrder.idOrder}`
                  : `ID ${idOrder || '-'}`}
              </Text>

              <View style={styles.optionsContainer}>
                {orders.map(renderOrderButton)}
              </View>

              <Text style={styles.label}>Produkt</Text>
              <Text style={styles.selectedText}>
                Wybrano:{' '}
                {selectedItem ? selectedItem.name : `ID ${idItem || '-'}`}
              </Text>

              <View style={styles.optionsContainer}>
                {items.map(renderItemButton)}
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ilość</Text>

          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Np. 2"
            placeholderTextColor="#64748b"
            keyboardType="decimal-pad"
            editable={!submitting}
          />
        </View>

        {isEditMode ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Status pozycji</Text>

            <View style={styles.statusButtons}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  isActive && styles.statusButtonActive,
                ]}
                onPress={() => setIsActive(true)}
                activeOpacity={0.8}
                disabled={submitting}>
                <Text
                  style={[
                    styles.statusButtonText,
                    isActive && styles.statusButtonTextSelected,
                  ]}>
                  Aktywna
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  !isActive && styles.statusButtonInactive,
                ]}
                onPress={() => setIsActive(false)}
                activeOpacity={0.8}
                disabled={submitting}>
                <Text
                  style={[
                    styles.statusButtonText,
                    !isActive && styles.statusButtonTextSelected,
                  ]}>
                  Nieaktywna
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.disabledButton]}
          onPress={handleSavePress}
          activeOpacity={0.8}
          disabled={submitting || dictionaryLoading}>
          <Text style={styles.saveButtonText}>
            {submitting
              ? 'Zapisywanie...'
              : isEditMode
                ? 'Zapisz zmiany'
                : 'Dodaj pozycję'}
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

  dictionaryLoadingBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  dictionaryLoadingText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },

  lockedBox: {
    backgroundColor: '#312e81',
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },

  lockedText: {
    color: '#e0e7ff',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },

  selectedText: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 8,
  },

  optionsContainer: {
    gap: 8,
    marginBottom: 16,
  },

  optionButton: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  optionButtonSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  optionButtonDisabled: {
    opacity: 0.45,
  },

  inactiveOptionButton: {
    borderColor: '#7f1d1d',
  },

  optionButtonText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '900',
  },

  optionButtonTextSelected: {
    color: '#ffffff',
  },

  optionButtonSubtext: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },

  optionButtonSubtextSelected: {
    color: '#ffffff',
  },

  statusButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  statusButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },

  statusButtonActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },

  statusButtonInactive: {
    backgroundColor: '#7f1d1d',
    borderColor: '#7f1d1d',
  },

  statusButtonText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '900',
  },

  statusButtonTextSelected: {
    color: '#ffffff',
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

export default OrderItemFormScreen;