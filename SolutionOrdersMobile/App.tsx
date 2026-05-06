import React, {useMemo, useState} from 'react';

import MainLayoutComponent from './src/components/layout/MainLayoutComponent';
import {TabKey} from './src/components/layout/NavbarComponent';
import {hitProducts, products} from './src/data/shopData';
import CartScreen from './src/screens/CartScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import {Product} from './src/types/shop';

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [cartProducts, setCartProducts] = useState<Product[]>([]);

  const allProducts = useMemo(() => {
    return [...products, ...hitProducts];
  }, []);

  const selectedProduct = useMemo(() => {
    return allProducts.find(product => product.id === selectedProductId) ?? null;
  }, [allProducts, selectedProductId]);

  const handleCategoryPress = (categoryId: number): void => {
    setSelectedCategoryId(categoryId);
    setActiveTab('products');
  };

  const handleProductPress = (productId: number): void => {
    setSelectedProductId(productId);
    setActiveTab('details');
  };

  const handleTabChange = (tab: TabKey): void => {
    if (tab !== 'products') {
      setSelectedCategoryId(null);
    }

    if (tab !== 'details') {
      setSelectedProductId(null);
    }

    setActiveTab(tab);
  };

  const handleClearCategory = (): void => {
    setSelectedCategoryId(null);
  };

  const handleBackToProducts = (): void => {
    setActiveTab('products');
  };

  const handleAddToCart = (product: Product): void => {
    setCartProducts(previousProducts => [...previousProducts, product]);
    setActiveTab('cart');
  };

  const handleClearCart = (): void => {
    setCartProducts([]);
  };

  const renderScreen = (): React.JSX.Element => {
    if (activeTab === 'products') {
      return (
        <ProductsScreen
          selectedCategoryId={selectedCategoryId}
          onClearCategory={handleClearCategory}
          onProductPress={handleProductPress}
        />
      );
    }

    if (activeTab === 'cart') {
      return (
        <CartScreen
          cartProducts={cartProducts}
          onProductPress={handleProductPress}
          onClearCart={handleClearCart}
        />
      );
    }

    if (activeTab === 'details') {
      return (
        <ProductDetailsScreen
          product={selectedProduct}
          onBack={handleBackToProducts}
          onAddToCart={handleAddToCart}
        />
      );
    }

    return (
      <HomeScreen
        onCategoryPress={handleCategoryPress}
        onProductPress={handleProductPress}
      />
    );
  };

  return (
    <MainLayoutComponent activeTab={activeTab} onTabChange={handleTabChange}>
      {renderScreen()}
    </MainLayoutComponent>
  );
}

export default App;