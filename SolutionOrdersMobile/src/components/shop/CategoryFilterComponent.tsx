import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {Category} from '../../types/shop.ts';

interface CategoryFilterComponentProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

function CategoryFilterComponent({
  categories,
  selectedCategoryId,
  onCategoryChange,
}: CategoryFilterComponentProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kategorie produktów</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[
            styles.button,
            selectedCategoryId === null && styles.activeButton,
          ]}
          onPress={() => onCategoryChange(null)}>
          <Text
            style={[
              styles.buttonText,
              selectedCategoryId === null && styles.activeButtonText,
            ]}>
            Wszystkie
          </Text>
        </TouchableOpacity>

        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.button,
              selectedCategoryId === category.id && styles.activeButton,
            ]}
            onPress={() => onCategoryChange(category.id)}>
            <Text
              style={[
                styles.buttonText,
                selectedCategoryId === category.id && styles.activeButtonText,
              ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },

  title: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  button: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  activeButton: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  buttonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },

  activeButtonText: {
    color: '#ffffff',
  },
});

export default CategoryFilterComponent;