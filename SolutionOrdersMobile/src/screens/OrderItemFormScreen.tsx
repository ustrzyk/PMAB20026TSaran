import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
    return 'Brak daty';
  }

  return value.substring(0, 10);
}

function formatMoney(value?: number | null): string {
  const safeValue = value ?? 0;

  return `${safeValue.toFixed(2)} zł`;
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

  const selectedOrder = useMemo(() => {
    return orders.find(order => order.idOrder === Number(idOrder));
  }, [idOrder, orders]);

  const selectedItem = useMemo(() => {
    return items.find(item => item.idItem === Number(idItem));
  }, [idItem, items]);

  const parsedQuantity = useMemo(() => {
    return parseQuantity(quantity);
  }, [quantity]);

  const orderSelectionLocked =
    !isEditMode && typeof idOrderFromRoute === 'number' && !!selectedOrder;

  const currentItemStock = selectedItem?.quantity ?? 0;

  const editQuantityBonus =
    isEditMode && editedOrderItem?.idItem === selectedItem?.idItem
      ? editedOrderItem.quantity ?? 0
      : 0;

  const maxQuantity = currentItemStock + editQuantityBonus;

  const lineValue = useMemo(() => {
    if (!selectedItem || Number.isNaN(parsedQuantity)) {
      return 0;
    }

    return (selectedItem.price ?? 0) * parsedQuantity;
  }, [parsedQuantity, selectedItem]);

  const formReady = useMemo(() => {
    return (
      Number(idOrder) > 0 &&
      Number(idItem) > 0 &&
      !Number.isNaN(parsedQuantity) &&
      parsedQuantity > 0 &&
      parsedQuantity <= Math.max(maxQuantity, 0)
    );
  }, [idItem, idOrder, maxQuantity, parsedQuantity]);

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

      const visibleOrders = ordersFromApi.filter(order => {
        if (isEditMode && order.idOrder === editedOrderItem?.idOrder) {
          return true;
        }

        return order.isActive !== false;
      });

      const visibleItems = itemsFromApi.filter(item => {
        if (isEditMode && item.idItem === editedOrderItem?.idItem) {
          return true;
        }

        return item.isActive !== false;
      });

      setOrders(visibleOrders);
      setItems(visibleItems);

      if (!isEditMode) {
        if (idOrderFromRoute) {
          const orderExists = visibleOrders.some(order => {
            return order.idOrder === idOrderFromRoute;
          });

          if (orderExists) {
            setIdOrder(idOrderFromRoute.toString());
          } else if (visibleOrders.length > 0) {
            setIdOrder(visibleOrders[0].idOrder.toString());
          }
        } else if (visibleOrders.length > 0) {
          setIdOrder(visibleOrders[0].idOrder.toString());
        }

        const availableItems = visibleItems.filter(item => {
          return (item.quantity ?? 0) > 0;
        });

        if (availableItems.length > 0) {
          setIdItem(availableItems[0].idItem.toString());
        } else if (visibleItems.length > 0) {
          setIdItem(visibleItems[0].idItem.toString());
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
  }, [
    editedOrderItem?.idItem,
    editedOrderItem?.idOrder,
    idOrderFromRoute,
    isEditMode,
  ]);

  useEffect(() => {
    loadDictionaries();
  }, [loadDictionaries]);

  const validateForm = (): string | null => {
    if (!idOrder || Number.isNaN(Number(idOrder)) || Number(idOrder) <= 0) {
      return 'Wybierz zamówienie.';
    }

    if (!idItem || Number.isNaN(Number(idItem)) || Number(idItem) <= 0) {
      return 'Wybierz produkt.';
    }

    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return 'Ilość musi być większa od 0.';
    }

    if (maxQuantity <= 0) {
      return 'Ten produkt nie ma dostępnej ilości.';
    }

    if (parsedQuantity > maxQuantity) {
      return `Maksymalna dostępna ilość to ${maxQuantity}.`;
    }

    return null;
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
      title: isEditMode ? 'Zapisać zmiany?' : 'Dodać pozycję?',
      message: isEditMode
        ? `Zapisać zmiany pozycji "${selectedItem?.name ?? 'produkt'}"?`
        : `Dodać "${selectedItem?.name ?? 'produkt'}" do zamówienia #${idOrder}?`,
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
          quantity: parsedQuantity,
          isActive,
        });

        showDialog(
          'success',
          'Zapisano',
          'Zmiany pozycji zostały zapisane.',
          true,
        );
      } else {
        await apiService.createOrderItem({
          idOrder: Number(idOrder),
          idItem: Number(idItem),
          quantity: parsedQuantity,
        });

        showDialog(
          'success',
          'Dodano',
          'Pozycja została dodana do zamówienia.',
          true,
        );
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

  const setQuickQuantity = (value: number): void => {
    if (value <= 0) {
      return;
    }

    setQuantity(Math.min(value, Math.max(maxQuantity, 1)).toString());
  };

  const increaseQuantity = (): void => {
    setQuantity(previous => {
      const current = parseQuantity(previous);

      if (Number.isNaN(current)) {
        return '1';
      }

      return Math.min(current + 1, Math.max(maxQuantity, 1)).toString();
    });
  };

  const decreaseQuantity = (): void => {
    setQuantity(previous => {
      const current = parseQuantity(previous);

      if (Number.isNaN(current) || current <= 1) {
        return '1';
      }

      return Math.max(current - 1, 1).toString();
    });
  };

  const renderOrderButton = (order: OrderDto): React.JSX.Element => {
    const selected = Number(idOrder) === order.idOrder;

    return (
      <TouchableOpacity
        key={`order-${order.idOrder}`}
        style={[
          styles.optionButton,
          selected && styles.optionButtonSelected,
          orderSelectionLocked && !selected && styles.optionButtonDisabled,
        ]}
        onPress={() => setIdOrder(order.idOrder.toString())}
        activeOpacity={0.85}
        disabled={submitting || orderSelectionLocked}>
        <View style={styles.optionTopRow}>
          <Text
            style={[
              styles.optionTitle,
              selected && styles.optionTitleSelected,
            ]}>
            Zamówienie #{order.idOrder}
          </Text>

          {selected ? (
            <Text style={styles.selectedBadge}>Wybrano</Text>
          ) : null}
        </View>

        <Text
          style={[
            styles.optionText,
            selected && styles.optionTextSelected,
          ]}
          numberOfLines={2}>
          {order.clientName ?? 'Brak klienta'} | {formatDate(order.dataOrder)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItemButton = (item: Item): React.JSX.Element => {
    const selected = Number(idItem) === item.idItem;
    const availableQuantity = item.quantity ?? 0;
    const available = item.isActive !== false && availableQuantity > 0;

    return (
      <TouchableOpacity
        key={`item-${item.idItem}`}
        style={[
          styles.optionButton,
          selected && styles.optionButtonSelected,
          !available && styles.optionButtonMuted,
        ]}
        onPress={() => setIdItem(item.idItem.toString())}
        activeOpacity={0.85}
        disabled={submitting}>
        <View style={styles.optionTopRow}>
          <Text
            style={[
              styles.optionTitle,
              selected && styles.optionTitleSelected,
            ]}
            numberOfLines={1}>
            {item.name}
          </Text>

          {selected ? (
            <Text style={styles.selectedBadge}>Wybrano</Text>
          ) : null}
        </View>

        <Text
          style={[
            styles.optionText,
            selected && styles.optionTextSelected,
          ]}
          numberOfLines={2}>
          {formatMoney(item.price)} | stan: {availableQuantity}{' '}
          {item.unitName ?? 'szt'} | {item.code ?? 'brak kodu'}
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
            Wybierz zamówienie, produkt i ilość.
          </Text>
        </View>

        <View style={formReady ? styles.readyBox : styles.warningBox}>
          <Text style={formReady ? styles.readyTitle : styles.warningTitle}>
            {formReady ? 'Pozycja gotowa' : 'Uzupełnij pozycję'}
          </Text>

          <Text style={formReady ? styles.readyText : styles.warningText}>
            {formReady
              ? 'Możesz zapisać pozycję zamówienia.'
              : 'Wybierz zamówienie, produkt i poprawną ilość.'}
          </Text>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Podgląd</Text>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Zamówienie</Text>
            <Text style={styles.previewValue}>
              {selectedOrder ? `#${selectedOrder.idOrder}` : 'Nie wybrano'}
            </Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Produkt</Text>
            <Text style={styles.previewValue}>
              {selectedItem?.name ?? 'Nie wybrano'}
            </Text>
          </View>

          <View style={styles.previewGrid}>
            <View style={styles.previewCell}>
              <Text style={styles.previewLabel}>Ilość</Text>
              <Text style={styles.previewValue}>
                {Number.isNaN(parsedQuantity) ? 0 : parsedQuantity}
              </Text>
            </View>

            <View style={styles.previewCell}>
              <Text style={styles.previewLabel}>Cena</Text>
              <Text style={styles.previewValue}>
                {formatMoney(selectedItem?.price)}
              </Text>
            </View>

            <View style={styles.previewCell}>
              <Text style={styles.previewLabel}>Wartość</Text>
              <Text style={styles.previewMoney}>{formatMoney(lineValue)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Zamówienie</Text>

          {orderSelectionLocked ? (
            <View style={styles.lockedBox}>
              <Text style={styles.lockedTitle}>Wybrane zamówienie</Text>
              <Text style={styles.lockedText}>
                Dodajesz produkt do zamówienia #{selectedOrder?.idOrder}.
              </Text>
            </View>
          ) : null}

          {dictionaryLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.loadingText}>Ładowanie zamówień...</Text>
            </View>
          ) : orders.length > 0 ? (
            <View style={styles.optionList}>
              {orders.map(renderOrderButton)}
            </View>
          ) : (
            <Text style={styles.emptyText}>Brak zamówień do wyboru.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Produkt</Text>

          {dictionaryLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.loadingText}>Ładowanie produktów...</Text>
            </View>
          ) : items.length > 0 ? (
            <View style={styles.optionList}>
              {items.map(renderItemButton)}
            </View>
          ) : (
            <Text style={styles.emptyText}>Brak produktów do wyboru.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ilość</Text>

          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decreaseQuantity}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
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
              onPress={() => setQuickQuantity(1)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickQuantity(2)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.quickButtonText}>2</Text>
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

          <View style={styles.stockBox}>
            <Text style={styles.stockTitle}>Dostępna ilość</Text>

            <Text style={styles.stockValue}>
              {maxQuantity} {selectedItem?.unitName ?? 'szt'}
            </Text>
          </View>
        </View>

        {isEditMode ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Widoczność</Text>

            <TouchableOpacity
              style={isActive ? styles.visibleSwitch : styles.archiveSwitch}
              onPress={() => setIsActive(previous => !previous)}
              activeOpacity={0.85}
              disabled={submitting}>
              <Text style={styles.switchText}>
                {isActive ? 'Widoczne na liście' : 'W archiwum'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!formReady || submitting || dictionaryLoading) && styles.disabledButton,
          ]}
          onPress={handleSavePress}
          activeOpacity={0.85}
          disabled={!formReady || submitting || dictionaryLoading}>
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
          activeOpacity={0.85}
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
    borderRadius: 22,
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
    marginBottom: 7,
  },

  title: {
    color: '#f8fafc',
    fontSize: 27,
    fontWeight: '900',
  },

  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontWeight: '700',
  },

  readyBox: {
    backgroundColor: '#052e16',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 14,
  },

  warningBox: {
    backgroundColor: '#431407',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f97316',
    marginBottom: 14,
  },

  readyTitle: {
    color: '#bbf7d0',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },

  warningTitle: {
    color: '#fed7aa',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },

  readyText: {
    color: '#bbf7d0',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  warningText: {
    color: '#fed7aa',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  previewCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginBottom: 14,
  },

  previewRow: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 8,
  },

  previewGrid: {
    flexDirection: 'row',
    gap: 8,
  },

  previewCell: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  previewLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  previewValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
  },

  previewMoney: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '900',
  },

  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },

  lockedBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginBottom: 12,
  },

  lockedTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 4,
  },

  lockedText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
  },

  loadingText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },

  optionList: {
    gap: 10,
  },

  optionButton: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  optionButtonSelected: {
    backgroundColor: '#1e293b',
    borderColor: '#f97316',
  },

  optionButtonDisabled: {
    opacity: 0.45,
  },

  optionButtonMuted: {
    opacity: 0.65,
  },

  optionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    marginBottom: 4,
  },

  optionTitle: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
  },

  optionTitleSelected: {
    color: '#ffffff',
  },

  optionText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  optionTextSelected: {
    color: '#cbd5e1',
  },

  selectedBadge: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  emptyText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },

  quantityRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
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
    fontSize: 22,
    fontWeight: '900',
  },

  quantityInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },

  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },

  quickButton: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  quickButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '900',
  },

  stockBox: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 12,
    padding: 10,
  },

  stockTitle: {
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },

  stockValue: {
    color: '#bbf7d0',
    fontSize: 17,
    fontWeight: '900',
  },

  visibleSwitch: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  archiveSwitch: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  switchText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  saveButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
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
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default OrderItemFormScreen;