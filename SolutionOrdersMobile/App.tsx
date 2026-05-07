import React, {useMemo, useState} from 'react';

import MainLayoutComponent from './src/components/layout/MainLayoutComponent.tsx';
import {TabKey} from './src/components/layout/NavbarComponent.tsx';
import {hitProducts, products} from './src/data/shopData.ts';
import CartScreen from './src/screens/CartScreen.tsx';
import HomeScreen from './src/screens/HomeScreen.tsx';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen.tsx';
import ProductsScreen from './src/screens/ProductsScreen.tsx';
import {CartItem, Product} from './src/types/shop.ts';

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  const handleCategoryChange = (categoryId: number | null): void => {
    setSelectedCategoryId(categoryId);
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

  const handleBackToProducts = (): void => {
    setActiveTab('products');
  };

  const handleAddToCart = (product: Product): void => {
    setCartItems(previousItems => {
      const existingItem = previousItems.find(
        item => item.product.id === product.id,
      );

      if (existingItem) {
        return previousItems.map(item =>
          item.product.id === product.id
            ? {...item, quantity: item.quantity + 1}
            : item,
        );
      }

      return [...previousItems, {product, quantity: 1}];
    });

    setActiveTab('cart');
  };

  const handleIncreaseQuantity = (productId: number): void => {
    setCartItems(previousItems =>
      previousItems.map(item =>
        item.product.id === productId
          ? {...item, quantity: item.quantity + 1}
          : item,
      ),
    );
  };

  const handleDecreaseQuantity = (productId: number): void => {
    setCartItems(previousItems =>
      previousItems
        .map(item =>
          item.product.id === productId
            ? {...item, quantity: item.quantity - 1}
            : item,
        )
        .filter(item => item.quantity > 0),
    );
  };

  const handleRemoveFromCart = (productId: number): void => {
    setCartItems(previousItems =>
      previousItems.filter(item => item.product.id !== productId),
    );
  };

  const handleClearCart = (): void => {
    setCartItems([]);
  };

  const renderScreen = (): React.JSX.Element => {
    if (activeTab === 'products') {
      return (
        <ProductsScreen
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={handleCategoryChange}
          onProductPress={handleProductPress}
        />
      );
    }

    if (activeTab === 'cart') {
      return (
        <CartScreen
          cartItems={cartItems}
          onProductPress={handleProductPress}
          onIncreaseQuantity={handleIncreaseQuantity}
          onDecreaseQuantity={handleDecreaseQuantity}
          onRemoveFromCart={handleRemoveFromCart}
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