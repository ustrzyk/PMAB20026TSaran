import React, {useState} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {Product} from '../../types/shop';

interface HitProductsCarouselComponentProps {
  products: Product[];
  onProductPress: (productId: number) => void;
}

function HitProductsCarouselComponent({
  products,
  onProductPress,
}: HitProductsCarouselComponentProps): React.JSX.Element {
  const {width} = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = width - 32;

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / cardWidth);

    setActiveIndex(currentIndex);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Hity tygodnia</Text>
        <Text style={styles.subtitle}>Przesuń w bok, aby zobaczyć więcej</Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}>
        {products.map(product => {
          const formattedPrice = `${product.price.toLocaleString('pl-PL')} zł`;

          return (
            <TouchableOpacity
              key={product.id}
              activeOpacity={0.9}
              style={[styles.card, {width: cardWidth}]}
              onPress={() => onProductPress(product.id)}>
              <View style={styles.topRow}>
                <Text style={styles.tag}>{product.tag}</Text>
                <Text style={styles.category}>{product.categoryName}</Text>
              </View>

              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.description}>{product.description}</Text>

              <View style={styles.bottomRow}>
                <Text style={styles.price}>{formattedPrice}</Text>
                <Text style={styles.button}>Sprawdź</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.dots}>
        {products.map((product, index) => (
          <View
            key={product.id}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
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
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },

  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },

  card: {
    backgroundColor: '#f97316',
    borderRadius: 18,
    padding: 20,
    marginRight: 12,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  tag: {
    color: '#431407',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  category: {
    color: '#fff7ed',
    fontSize: 12,
    fontWeight: '700',
  },

  name: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },

  description: {
    color: '#fff7ed',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },

  button: {
    backgroundColor: '#111827',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: '800',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#475569',
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: '#f97316',
    width: 18,
  },
});

export default HitProductsCarouselComponent;