import React, {useCallback, useMemo, useState} from 'react';
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
import {useAuth} from '../context/AuthContext.tsx';

import type {RootStackParamList} from '../navigation/types.ts';
import type {OrderDto} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerOrders'>;

function formatMoney(value?: number | null): string {
  const safeValue = value ?? 0;

  return `${safeValue.toFixed(2)} zł`;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return 'Brak daty';
  }

  return value.substring(0, 10);
}

function CustomerOrdersScreen({navigation}: Props): React.JSX.Element {
  const {user, isCustomer} = useAuth();

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customerOrders = useMemo(() => {
    if (!user?.id) {
      return [];
    }

    return orders
      .filter(order => {
        return order.isActive !== false && order.idClient === user.id;
      })
      .sort((a, b) => {
        const firstDate = a.dataOrder ? new Date(a.dataOrder).getTime() : 0;
        const secondDate = b.dataOrder ? new Date(b.dataOrder).getTime() : 0;

        return secondDate - firstDate;
      });
  }, [orders, user]);

  const totalOrdersValue = useMemo(() => {
    return customerOrders.reduce((sum, order) => {
      return sum + (order.totalValue ?? 0);
    }, 0);
  }, [customerOrders]);

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

  const renderOrder = ({item}: {item: OrderDto}): React.JSX.Element => {
    return (
      <View style={styles.orderCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleBox}>
            <Text style={styles.orderTitle}>Zamówienie #{item.idOrder}</Text>
            <Text style={styles.orderDate}>
              Data: {formatDate(item.dataOrder)}
            </Text>
          </View>

          <Text style={styles.activeBadge}>Aktywne</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Wartość produktów</Text>
          <Text style={styles.orderValue}>{formatMoney(item.totalValue)}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Liczba pozycji</Text>
          <Text style={styles.infoValue}>{item.orderItemsCount}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Data dostawy</Text>
          <Text style={styles.infoValue}>{formatDate(item.deliveryDate)}</Text>
        </View>

        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.infoLabel}>Informacje</Text>
            <Text style={styles.notesText} numberOfLines={5}>
              {item.notes}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            navigation.navigate('TrackOrder', {
              idOrder: item.idOrder,
            })
          }
          activeOpacity={0.85}>
          <Text style={styles.detailsButtonText}>Sprawdź szczegóły</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!isCustomer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.accessTitle}>Brak dostępu</Text>
        <Text style={styles.accessText}>
          Lista zamówień jest dostępna tylko po zalogowaniu jako klient.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: 'AuthLogin'}],
            })
          }
          activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Zaloguj</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: 'Home'}],
            })
          }
          activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>Wróć do sklepu</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

        <TouchableOpacity style={styles.primaryButton} onPress={loadOrders}>
          <Text style={styles.primaryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={customerOrders}
        renderItem={renderOrder}
        keyExtractor={item => item.idOrder.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.heroBox}>
              <Text style={styles.appName}>3D Print Shop</Text>
              <Text style={styles.title}>Moje zamówienia</Text>
              <Text style={styles.subtitle}>
                Historia zamówień przypisana do Twojego konta klienta.
              </Text>
            </View>

            <View style={styles.summaryBox}>
              <View style={styles.summaryColumn}>
                <Text style={styles.summaryLabel}>Zamówienia</Text>
                <Text style={styles.summaryValue}>
                  {customerOrders.length}
                </Text>
              </View>

              <View style={styles.summaryColumn}>
                <Text style={styles.summaryLabel}>Łączna wartość</Text>
                <Text style={styles.summaryMoney}>
                  {formatMoney(totalOrdersValue)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              activeOpacity={0.85}>
              <Text style={styles.refreshButtonText}>Odśwież</Text>
            </TouchableOpacity>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Brak zamówień</Text>
            <Text style={styles.emptyText}>
              Złóż pierwsze zamówienie w sklepie, a pojawi się na tej liście.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Items')}
              activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Przejdź do sklepu</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('ClientPanel')}
            activeOpacity={0.85}>
            <Text style={styles.backButtonText}>Wróć do konta</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  listContent: {
    padding: 16,
    paddingBottom: 32,
  },

  lockIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  accessTitle: {
    color: '#f8fafc',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  accessText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
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
    fontSize: 25,
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
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
  },

  summaryColumn: {
    flex: 1,
  },

  summaryLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  summaryValue: {
    color: '#38bdf8',
    fontSize: 24,
    fontWeight: '900',
  },

  summaryMoney: {
    color: '#16a34a',
    fontSize: 20,
    fontWeight: '900',
  },

  refreshButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 4,
  },

  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 12,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  cardTitleBox: {
    flex: 1,
  },

  orderTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },

  orderDate: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },

  activeBadge: {
    backgroundColor: '#052e16',
    color: '#bbf7d0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },

  infoBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
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

  orderValue: {
    color: '#f97316',
    fontSize: 18,
    fontWeight: '900',
  },

  notesBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },

  notesText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
  },

  detailsButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },

  detailsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    marginTop: 14,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 8,
  },

  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },

  emptyText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 14,
  },

  primaryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 10,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  secondaryButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  backButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },

  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default CustomerOrdersScreen;