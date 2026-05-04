import React from 'react';
import {FlatList as RNFlatList, StyleSheet, Text, View} from 'react-native';

interface User {
  id: string;
  name: string;
  age: number;
}

const users: User[] = [
  {id: '1', name: 'Anna', age: 25},
  {id: '2', name: 'Piotr', age: 30},
  {id: '3', name: 'Kasia', age: 28},
  {id: '4', name: 'Jan', age: 35},
];

const FlatList: React.FC = () => {
  return (
    <View style={styles.container}>
      <RNFlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.age}>Wiek: {item.age}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
  },
  item: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  age: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
});

export default FlatList;
