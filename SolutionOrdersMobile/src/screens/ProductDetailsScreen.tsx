import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {Product} from '../types/shop';

interface ProductDetailsScreenProps {
  product: Product | null;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
}

function ProductDetailsScreen({
  product,
  onBack,
  onAddToCart,
}: ProductDetailsScreenProps): React.JSX.Element {
  if (!product) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nie znaleziono produktu</Text>

        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Wróć do produktów</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formattedPrice = `${product.price.toLocaleString('pl-PL')} zł`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Wróć do produktów</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>3D</Text>
        </View>

        <View style={styles.topRow}>
          <Text style={styles.category}>{product.categoryName}</Text>
          <Text style={styles.tag}>{product.tag}</Text>
        </View>

        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Cena</Text>
          <Text style={styles.price}>{formattedPrice}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Opis techniczny</Text>
          <Text style={styles.infoText}>
            Szczegółowe dane techniczne produktu będą później pobierane z API.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => onAddToCart(product)}>
          <Text style={styles.primaryButtonText}>Dodaj do koszyka</Text>
        </TouchableOpacity>
      </View>
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

  emptyContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },

  emptyTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },

  backButton: {
    marginBottom: 14,
  },

  backButtonText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '800',
  },

  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },

  imagePlaceholder: {
    height: 160,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },

  imageText: {
    color: '#f97316',
    fontSize: 42,
    fontWeight: '900',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  category: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },

  tag: {
    color: '#ffffff',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
  },

  name: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10,
  },

  description: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },

  infoBox: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },

  infoLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },

  price: {
    color: '#22c55e',
    fontSize: 24,
    fontWeight: '900',
  },

  infoText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: '#f97316',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  secondaryButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ProductDetailsScreen;