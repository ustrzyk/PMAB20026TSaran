import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import CounterComponent from './src/components/Counter';
import SimpleFormComponent from './src/components/SimpleForm';

const categories = [
  'Drukarki 3D',
  'Filamenty',
  'Dysze',
  'Stoły robocze',
  'Części',
  'Narzędzia',
];

const products = [
  {
    name: 'Creality Ender 3 V3 SE',
    category: 'Drukarka 3D',
    price: '1 099 zł',
    tag: 'Bestseller',
    description: 'Idealna drukarka 3D na start i do nauki druku FDM.',
  },
  {
    name: 'Bambu Lab A1 Mini',
    category: 'Drukarka 3D',
    price: '1 499 zł',
    tag: 'Nowość',
    description: 'Kompaktowa drukarka 3D z szybkim i stabilnym drukiem.',
  },
  {
    name: 'Filament PLA Black 1kg',
    category: 'Filament',
    price: '79 zł',
    tag: 'Popularne',
    description: 'Uniwersalny filament PLA do codziennych wydruków.',
  },
  {
    name: 'Zestaw dysz 0.4 mm',
    category: 'Akcesoria',
    price: '29 zł',
    tag: 'Akcesoria',
    description: 'Zapasowe dysze do najpopularniejszych głowic drukujących.',
  },
];

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>3D PRINT STORE</Text>
          <Text style={styles.title}>Sklep z drukarkami 3D</Text>
          <Text style={styles.subtitle}>
            Drukarki, filamenty, części zamienne i akcesoria do druku 3D.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchLabel}>Szukaj produktu</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="np. filament PLA, dysza 0.4, Ender 3"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategorie</Text>

          <View style={styles.categoryGrid}>
            {categories.map(category => (
              <View key={category} style={styles.categoryCard}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.promoCard}>
          <View>
            <Text style={styles.promoSmall}>Promocja tygodnia</Text>
            <Text style={styles.promoTitle}>Filamenty PLA -15%</Text>
            <Text style={styles.promoText}>
              Zbuduj zapas materiałów do kolejnych projektów.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Polecane produkty</Text>
            <Text style={styles.sectionLink}>Zobacz wszystko</Text>
          </View>

          {products.map(product => (
            <View key={product.name} style={styles.productCard}>
              <View style={styles.productImagePlaceholder}>
                <Text style={styles.productImageText}>3D</Text>
              </View>

              <View style={styles.productInfo}>
                <View style={styles.productTopRow}>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productTag}>{product.tag}</Text>
                </View>

                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription}>
                  {product.description}
                </Text>

                <View style={styles.productBottomRow}>
                  <Text style={styles.productPrice}>{product.price}</Text>
                  <Text style={styles.addToCart}>Dodaj</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.cartPreview}>
          <Text style={styles.sectionTitle}>Ilość w koszyku</Text>
          <Text style={styles.cartText}>
            Przykładowy licznik z komponentu Counter.
          </Text>
          <CounterComponent />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zapytaj o produkt</Text>
          <SimpleFormComponent />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  header: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },

  logo: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f97316',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },

  searchBox: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },

  searchLabel: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },

  searchInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 14,
  },

  section: {
    marginBottom: 22,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 12,
  },

  sectionLink: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  categoryCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },

  categoryText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },

  promoCard: {
    backgroundColor: '#f97316',
    borderRadius: 18,
    padding: 20,
    marginBottom: 22,
  },

  promoSmall: {
    color: '#431407',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },

  promoTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },

  promoText: {
    color: '#fff7ed',
    fontSize: 14,
    lineHeight: 20,
  },

  productCard: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },

  productImagePlaceholder: {
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

  productImageText: {
    color: '#f97316',
    fontSize: 24,
    fontWeight: '900',
  },

  productInfo: {
    flex: 1,
  },

  productTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  productCategory: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },

  productTag: {
    color: '#ffffff',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '700',
  },

  productName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  productDescription: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },

  productBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  productPrice: {
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

  cartPreview: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#334155',
  },

  cartText: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 12,
  },
});

export default App;