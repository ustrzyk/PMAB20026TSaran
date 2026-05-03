import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

// TypeScript interface dlaItem
interface Item {
  id: string;
  name: string;
  price: number;
}

const ItemList: React.FC = () => {
  // Dane testowe
  const items: Item[] = [
    { id: '1', name: 'Laptop', price: 3000 },
    { id: '2', name: 'Monitor', price: 800 },
    { id: '3', name: 'Mysz', price: 50 },
    { id: '4', name: 'Klawiatura', price: 150 },
  ];

  // Render pojedynczego wiersza
  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price} zł</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}  // Unikalny klucz
      style={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  itemContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  price: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});

export default ItemList;