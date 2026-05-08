import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {ProductSortOption} from '../../types/shop.ts';

interface SearchSortComponentProps {
  searchText: string;
  selectedSort: ProductSortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: ProductSortOption) => void;
}

const sortOptions: {label: string; value: ProductSortOption}[] = [
  {label: 'Domyślnie', value: 'default'},
  {label: 'Nazwa A-Z', value: 'name'},
  {label: 'Cena ↑', value: 'priceAsc'},
  {label: 'Cena ↓', value: 'priceDesc'},
];

function SearchSortComponent({
  searchText,
  selectedSort,
  onSearchChange,
  onSortChange,
}: SearchSortComponentProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Szukaj produktu</Text>

      <TextInput
        style={styles.input}
        value={searchText}
        onChangeText={onSearchChange}
        placeholder="np. drukarka, filament, dysza"
        placeholderTextColor="#94a3b8"
      />

      <Text style={styles.label}>Sortowanie</Text>

      <View style={styles.sortRow}>
        {sortOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortButton,
              selectedSort === option.value && styles.activeSortButton,
            ]}
            onPress={() => onSortChange(option.value)}>
            <Text
              style={[
                styles.sortButtonText,
                selectedSort === option.value && styles.activeSortButtonText,
              ]}>
              {option.label}
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

  label: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 14,
    marginBottom: 14,
  },

  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  sortButton: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  activeSortButton: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  sortButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },

  activeSortButtonText: {
    color: '#ffffff',
  },
});

export default SearchSortComponent;