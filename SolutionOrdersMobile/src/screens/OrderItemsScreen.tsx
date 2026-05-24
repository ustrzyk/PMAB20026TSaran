import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import apiService from '../api/apiService.ts';
import AppDialog, {AppDialogType} from '../components/AppDialog.tsx';

import type {RootStackParamList} from '../navigation/types.ts';
import type {OrderItemDto} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderItems'>;

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
}

function OrderItemsScreen({navigation, route}: Props): React.JSX.Element {
  const idOrderFromRoute = route.params?.idOrder;
  const orderTitleFromRoute = route.params?.orderTitle;

  const isOrderFiltered = typeof idOrderFromRoute === 'number';

  const [orderItems, setOrderItems] = useState<OrderItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderItem, setSelectedOrderItem] =
    useState<OrderItemDto | null>(null);

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

  const loadOrderItems = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      const data =
        isOrderFiltered && idOrderFromRoute
          ? await apiService.getOrderItemsByOrder(idOrderFromRoute)
          : await apiService.getOrderItems();

      setOrderItems(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nieznany błąd pobierania danych';

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [idOrderFromRoute, isOrderFiltered]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadOrderItems();
    }, [loadOrderItems]),
  );

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadOrderItems();
  };

  const handleDelete = (orderItem: OrderItemDto): void => {
    setSelectedOrderItem(orderItem);

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Usuwanie pozycji',
      message: `Czy na pewno chcesz usunąć pozycję "${
        orderItem.itemName ?? 'produkt'
      }" z zamówienia nr ${orderItem.idOrder}?`,
      loading: false,
    });
  };

  const confirmDelete = async (): Promise<void> => {
    if (!selectedOrderItem) {
      return;
    }

    try {
      setDialog(previous => ({
        ...previous,
        loading: true,
      }));

      await apiService.deleteOrderItem(selectedOrderItem.idOrderItem);

      setOrderItems(previousItems =>
        previousItems.filter(
          item => item.idOrderItem !== selectedOrderItem.idOrderItem,
        ),
      );

      setSelectedOrderItem(null);

      setDialog({
        visible: true,
        type: 'success',
        title: 'Pozycja usunięta',
        message: 'Pozycja zamówienia została poprawnie usunięta.',
        loading: false,
      });
    } catch (err) {
      setDialog({
        visible: true,
        type: 'error',
        title: 'Błąd usuwania',
        message: (err as Error).message,
        loading: false,
      });
    }
  };

  const handleDialogConfirm = (): void => {
    if (dialog.type === 'confirm') {
      confirmDelete();
      return;
    }

    closeDialog();
  };

  const openCreateOrderItem = (): void => {
    if (isOrderFiltered && idOrderFromRoute) {
      navigation.navigate('CreateOrderItem', {
        idOrder: idOrderFromRoute,
      });

      return;
    }

    navigation.navigate('CreateOrderItem');
  };

  const screenTitle = isOrderFiltered
    ? orderTitleFromRoute ?? `Zamówienie nr ${idOrderFromRoute}`
    : 'Pozycje zamówienia';

  const screenSubtitle = isOrderFiltered
    ? `Pozycje tylko dla zamówienia nr ${idOrderFromRoute}`
    : 'Produkty przypisane do wszystkich zamówień wraz z ilością.';

  const renderItem = ({item}: {item: OrderItemDto}): React.JSX.Element => {
    return (
      <View style={styles.orderItemCard}>
        <Text style={styles.orderItemTitle}>
          {item.itemName ?? `Produkt ID ${item.idItem}`}
        </Text>

        <Text style={styles.orderItemText}>
          Kod produktu: {item.itemCode ?? 'Brak kodu'}
        </Text>

        <Text style={styles.orderItemText}>
          Zamówienie nr: {item.idOrder}
        </Text>

        <Text style={styles.orderItemText}>
          ID produktu: {item.idItem}
        </Text>

        <Text style={styles.orderItemQuantity}>
          Ilość: {item.quantity ?? 0}
        </Text>

        <Text style={styles.orderItemId}>
          ID pozycji: {item.idOrderItem}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate('EditOrderItem', {orderItem: item})
            }
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Edytuj</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Usuń</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>
          Ładowanie pozycji zamówienia...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Nie udało się pobrać pozycji zamówienia
        </Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadOrderItems}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.type === 'confirm' ? 'Usuń' : 'OK'}
        cancelText="Anuluj"
        loading={dialog.loading}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />

      <View style={styles.heroBox}>
        <Text style={styles.shopName}>3D Print Shop</Text>
        <Text style={styles.heroTitle}>{screenTitle}</Text>
        <Text style={styles.heroSubtitle}>{screenSubtitle}</Text>
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {isOrderFiltered ? 'Pozycje zamówienia' : 'Pozycje'}
          </Text>
          <Text style={styles.subtitle}>
            Liczba pozycji: {orderItems.length}
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Odśwież</Text>
        </TouchableOpacity>
      </View>

      {isOrderFiltered && (
        <View style={styles.filterBox}>
          <Text style={styles.filterText}>
            Widok filtrowany: zamówienie nr {idOrderFromRoute}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.createButton}
        onPress={openCreateOrderItem}
        activeOpacity={0.8}>
        <Text style={styles.createButtonText}>+ Dodaj pozycję</Text>
      </TouchableOpacity>

      <FlatList
        data={orderItems}
        renderItem={renderItem}
        keyExtractor={item => item.idOrderItem.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isOrderFiltered
              ? 'Brak pozycji dla tego zamówienia'
              : 'Brak pozycji zamówienia w API'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  loadingText: {
    color: '#cbd5e1',
    fontSize: 16,
    marginTop: 12,
  },

  errorTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  heroBox: {
    backgroundColor: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },

  shopName: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  heroTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
  },

  heroSubtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  header: {
    padding: 16,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },

  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },

  refreshButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },

  refreshButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  filterBox: {
    backgroundColor: '#312e81',
    borderWidth: 1,
    borderColor: '#6366f1',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
  },

  filterText: {
    color: '#e0e7ff',
    fontSize: 13,
    fontWeight: '800',
  },

  createButton: {
    backgroundColor: '#16a34a',
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  createButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  orderItemCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  orderItemTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
  },

  orderItemText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 5,
  },

  orderItemQuantity: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },

  orderItemId: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 10,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#7f1d1d',
    paddingVertical: 10,
    borderRadius: 10,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});

export default OrderItemsScreen;