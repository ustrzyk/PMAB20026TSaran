import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import CounterComponent from './src/components/Counter';
import SimpleFormComponent from './src/components/SimpleForm';

import CategoryCardComponent from './src/components/shop/CategoryCardComponent';
import ProductCardComponent from './src/components/shop/ProductCardComponent';
import PromoCardComponent from './src/components/shop/PromoCardComponent';
import SearchBarComponent from './src/components/shop/SearchBarComponent';

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

        <SearchBarComponent
          label="Szukaj produktu"
          placeholder="np. filament PLA, dysza 0.4, Ender 3"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategorie</Text>

          <View style={styles.categoryGrid}>
            {categories.map(category => (
              <CategoryCardComponent key={category} title={category} />
            ))}
          </View>
        </View>

        <PromoCardComponent
          smallText="Promocja tygodnia"
          title="Filamenty PLA -15%"
          description="Zbuduj zapas materiałów do kolejnych projektów."
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Polecane produkty</Text>
            <Text style={styles.sectionLink}>Zobacz wszystko</Text>
          </View>

          {products.map(product => (
            <ProductCardComponent
              key={product.name}
              name={product.name}
              category={product.category}
              price={product.price}
              tag={product.tag}
              description={product.description}
            />
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
    justifyContent: 'space-between',
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
