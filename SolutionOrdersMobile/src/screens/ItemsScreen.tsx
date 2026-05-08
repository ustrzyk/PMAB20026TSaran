import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {useItems} from '../context/ItemsContext';

import type {RootStackParamList} from '../navigation/types.ts';
import type {Item} from '../types/models.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Items'>;

function ItemsScreen({}: Props): React.JSX.Element {
  const {items, loading, error, refreshItems, deleteItem} = useItems();

  const handleDelete = (item: Item): void => {
    Alert.alert(
      'Potwierdzenie',
      `Czy na pewno usunąć "${item.name ?? 'produkt'}"?`,
      [
        {
          text: 'Anuluj',
          style: 'cancel',
        },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item.idItem);
              Alert.alert('Sukces', 'Produkt został usunięty');
            } catch (err) {
              Alert.alert('Błąd', (err as Error).message);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({item}: {item: Item}): React.JSX.Element => {
    const price = item.price ?? 0;
    const quantity = item.quantity ?? 0;

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name ?? 'Brak nazwy'}</Text>

          <Text style={styles.itemPrice}>
            Cena: {price.toFixed(2)} zł
          </Text>

          <Text style={styles.itemText}>
            Kategoria: {item.categoryName ?? 'Brak'}
          </Text>

          <Text style={styles.itemText}>
            Ilość: {quantity} {item.unitName ?? 'szt'}
          </Text>

          <Text style={styles.itemText}>
            Kod: {item.code ?? 'Brak'}
          </Text>
        </View>

        <View style={styles.itemActions}>
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
        <Text style={styles.loadingText}>Ładowanie produktów...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Błąd: {error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={refreshItems}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Produkty</Text>
          <Text style={styles.subtitle}>Liczba produktów: {items.length}</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={refreshItems}>
          <Text style={styles.refreshButtonText}>Odśwież</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.idItem.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshItems} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Brak produktów w API</Text>
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

  errorText: {
    color: '#fca5a5',
    fontSize: 16,
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

  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  itemCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
  },

  itemContent: {
    flex: 1,
  },

  itemName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  itemPrice: {
    color: '#22c55e',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },

  itemText: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 2,
  },

  itemActions: {
    justifyContent: 'center',
    marginLeft: 10,
  },

  deleteButton: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});

export default ItemsScreen;