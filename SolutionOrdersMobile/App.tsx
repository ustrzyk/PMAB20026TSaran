import React, {useState} from 'react';

import MainLayoutComponent from './src/components/layout/MainLayoutComponent.tsx';
import {TabKey} from './src/components/layout/NavbarComponent.tsx';
import CartScreen from './src/screens/CartScreen.tsx';
import HomeScreen from './src/screens/HomeScreen.tsx';
import ProductsScreen from './src/screens/ProductsScreen.tsx';

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const handleCategoryPress = (categoryId: number): void => {
    setSelectedCategoryId(categoryId);
    setActiveTab('products');
  };

  const handleTabChange = (tab: TabKey): void => {
    if (tab !== 'products') {
      setSelectedCategoryId(null);
    }

    setActiveTab(tab);
  };

  const handleClearCategory = (): void => {
    setSelectedCategoryId(null);
  };

  const renderScreen = (): React.JSX.Element => {
    if (activeTab === 'products') {
      return (
        <ProductsScreen
          selectedCategoryId={selectedCategoryId}
          onClearCategory={handleClearCategory}
        />
      );
    }

    if (activeTab === 'cart') {
      return <CartScreen />;
    }

    return <HomeScreen onCategoryPress={handleCategoryPress} />;
  };

  return (
    <MainLayoutComponent activeTab={activeTab} onTabChange={handleTabChange}>
      {renderScreen()}
    </MainLayoutComponent>
  );
}

export default App;