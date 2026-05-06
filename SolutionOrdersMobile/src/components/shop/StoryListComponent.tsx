import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {Category} from '../../types/shop.ts';

interface StoryListComponentProps {
  categories: Category[];
  onCategoryPress: (categoryId: number) => void;
}

function StoryListComponent({
  categories,
  onCategoryPress,
}: StoryListComponentProps): React.JSX.Element {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Kategorie</Text>
        <Text style={styles.subtitle}>Wybierz dział sklepu</Text>
      </View>

      <View style={styles.grid}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={styles.card}
            onPress={() => onCategoryPress(category.id)}>
            <Text style={styles.cardTitle}>{category.name}</Text>
            <Text style={styles.cardText}>Zobacz produkty</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 22,
  },

  header: {
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },

  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  cardTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },

  cardText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StoryListComponent;