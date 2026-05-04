import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface ProductCardComponentProps {
  name: string;
  category: string;
  price: string;
  tag: string;
  description: string;
}

const ProductCardComponent: React.FC<ProductCardComponentProps> = ({
  name,
  category,
  price,
  tag,
  description,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>3D</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.category}>{category}</Text>
          <Text style={styles.tag}>{tag}</Text>
        </View>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.addToCart}>Dodaj</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  imagePlaceholder: {
    width: 82,
    height: 82,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#475569',
  },
  imageText: {
    color: '#f97316',
    fontSize: 24,
    fontWeight: '900',
  },
  info: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  category: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  tag: {
    color: '#ffffff',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '700',
  },
  name: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  description: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '900',
  },
  addToCart: {
    color: '#ffffff',
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: '800',
  },
});

export default ProductCardComponent;
