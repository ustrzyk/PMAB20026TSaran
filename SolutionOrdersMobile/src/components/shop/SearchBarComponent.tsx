import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';

interface SearchBarComponentProps {
  label: string;
  placeholder: string;
}

const SearchBarComponent: React.FC<SearchBarComponentProps> = ({
  label,
  placeholder,
}) => {
  return (
    <View style={styles.searchBox}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  label: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
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
  },
});

export default SearchBarComponent;
