import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface CategoryCardComponentProps {
  title: string;
}

const CategoryCardComponent: React.FC<CategoryCardComponentProps> = ({title}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default CategoryCardComponent;
