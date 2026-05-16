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

function ItemsScreen({navigation}: Props): React.JSX.Element {
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

          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description ?? 'Brak opisu produktu'}
          </Text>

          <View style={styles.badgeRow}>
            <Text style={styles.categoryBadge}>
              {item.categoryName ?? 'Brak kategorii'}
            </Text>

            <Text style={styles.codeBadge}>{item.code ?? 'Brak kodu'}</Text>
          </View>

          <Text style={styles.itemPrice}>Cena: {price.toFixed(2)} zł</Text>

          <Text style={styles.itemText}>
            Stan magazynu: {quantity} {item.unitName ?? 'szt'}
          </Text>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditItem', {item})}
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
      <View style={styles.heroBox}>
        <Text style={styles.shopName}>3D Print Shop</Text>
        <Text style={styles.heroTitle}>Produkty i akcesoria do druku 3D</Text>
        <Text style={styles.heroSubtitle}>
          Zarządzanie drukarkami 3D, filamentami, częściami zamiennymi i
          akcesoriami sklepu.
        </Text>
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Produkty</Text>
          <Text style={styles.subtitle}>Liczba produktów: {items.length}</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={refreshItems}>
          <Text style={styles.refreshButtonText}>Odśwież</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateItem')}
        activeOpacity={0.8}>
        <Text style={styles.createButtonText}>+ Dodaj produkt</Text>
      </TouchableOpacity>

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

  itemCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  itemContent: {
    marginBottom: 12,
  },

  itemName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },

  itemDescription: {
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
    color: '#ffffff',
    backgroundColor: '#2563eb',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
  },

  codeBadge: {
    color: '#ffffff',
    backgroundColor: '#334155',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
  },

  itemPrice: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },

  itemText: {
    color: '#cbd5e1',
    fontSize: 13,
  },

  itemActions: {
    flexDirection: 'row',
    gap: 10,
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

export default ItemsScreen;