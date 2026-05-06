import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import HitProductsCarouselComponent from '../components/shop/HitProductsCarouselComponent';
import StoryListComponent from '../components/shop/StoryListComponent';
import {categories, hitProducts} from '../data/shopData';

interface HomeScreenProps {
  onCategoryPress: (categoryId: number) => void;
  onProductPress: (productId: number) => void;
}

function HomeScreen({
  onCategoryPress,
  onProductPress,
}: HomeScreenProps): React.JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Witaj w sklepie 3D</Text>
        <Text style={styles.infoText}>
          Znajdziesz tutaj drukarki 3D, filamenty, części zamienne i akcesoria
          potrzebne do rozpoczęcia pracy z drukiem 3D.
        </Text>
      </View>

      <HitProductsCarouselComponent
        products={hitProducts}
        onProductPress={onProductPress}
      />

      <StoryListComponent
        categories={categories}
        onCategoryPress={onCategoryPress}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 24,
  },

  infoBox: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },

  infoTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },

  infoText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HomeScreen;