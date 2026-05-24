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
import type {OrderDto} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

interface DialogState {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  loading: boolean;
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

function OrdersScreen({navigation}: Props): React.JSX.Element {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

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

  const loadOrders = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      const data = await apiService.getOrders();

      setOrders(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nieznany błąd pobierania danych';

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadOrders();
    }, [loadOrders]),
  );

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadOrders();
  };

  const handleDelete = (order: OrderDto): void => {
    setSelectedOrder(order);

    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Usuwanie zamówienia',
      message: `Czy na pewno chcesz usunąć zamówienie nr ${order.idOrder}?`,
      loading: false,
    });
  };

  const confirmDelete = async (): Promise<void> => {
    if (!selectedOrder) {
      return;
    }

    try {
      setDialog(previous => ({
        ...previous,
        loading: true,
      }));

      await apiService.deleteOrder(selectedOrder.idOrder);

      setOrders(previousOrders =>
        previousOrders.filter(item => item.idOrder !== selectedOrder.idOrder),
      );

      setSelectedOrder(null);

      setDialog({
        visible: true,
        type: 'success',
        title: 'Zamówienie usunięte',
        message: 'Zamówienie zostało poprawnie usunięte z listy.',
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

  const openOrderItems = (order: OrderDto): void => {
    navigation.navigate('OrderItems', {
      idOrder: order.idOrder,
      orderTitle: `Zamówienie nr ${order.idOrder}`,
    });
  };

  const renderItem = ({item}: {item: OrderDto}): React.JSX.Element => {
    return (
      <View style={styles.orderCard}>
        <Text style={styles.orderTitle}>Zamówienie nr {item.idOrder}</Text>

        <Text style={styles.orderText}>
          Klient: {item.clientName ?? `ID ${item.idClient ?? '-'}`}
        </Text>

        <Text style={styles.orderText}>
          Pracownik: {item.workerName ?? `ID ${item.idWorker ?? '-'}`}
        </Text>

        <Text style={styles.orderText}>
          Data zamówienia: {formatDate(item.dataOrder)}
        </Text>

        <Text style={styles.orderText}>
          Data dostawy: {formatDate(item.deliveryDate)}
        </Text>

        <Text style={styles.orderText}>
          Pozycje: {item.orderItemsCount}
        </Text>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Wartość zamówienia</Text>
          <Text style={styles.totalValue}>{formatMoney(item.totalValue)}</Text>
        </View>

        <Text style={styles.orderNotes}>
          {item.notes ?? 'Brak notatek'}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.itemsButton}
            onPress={() => openOrderItems(item)}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Pozycje</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditOrder', {order: item})}
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
        <Text style={styles.loadingText}>Ładowanie zamówień...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Nie udało się pobrać zamówień</Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
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
        <Text style={styles.heroTitle}>Zamówienia</Text>
        <Text style={styles.heroSubtitle}>
          Zamówienia klientów z przypisanym klientem, pracownikiem i wartością.
        </Text>
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Zamówienia</Text>
          <Text style={styles.subtitle}>
            Liczba zamówień: {orders.length}
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Odśwież</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateOrder')}
        activeOpacity={0.8}>
        <Text style={styles.createButtonText}>+ Dodaj zamówienie</Text>
      </TouchableOpacity>

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={item => item.idOrder.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Brak zamówień w API</Text>
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

  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  orderTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
  },

  orderText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 5,
  },

  totalBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    marginBottom: 8,
  },

  totalLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  totalValue: {
    color: '#f97316',
    fontSize: 18,
    fontWeight: '900',
  },

  orderNotes: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  itemsButton: {
    flex: 1,
    backgroundColor: '#9333ea',
    paddingVertical: 10,
    borderRadius: 10,
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
    fontSize: 12,
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

export default OrdersScreen;