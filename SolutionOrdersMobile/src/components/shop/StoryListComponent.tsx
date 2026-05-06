import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {Category} from '../../types/shop';

interface StoryListComponentProps {
  categories: Category[];
}

function StoryListComponent({
  categories,
}: StoryListComponentProps): React.JSX.Element {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Kategorie</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {categories.map(category => (
          <View key={category.id} style={styles.card}>
            <Text style={styles.cardText}>{category.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 12,
  },

  scrollContent: {
    paddingRight: 8,
  },

  card: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 10,
  },

  cardText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default StoryListComponent;