import React, {useState} from 'react';

import MainLayoutComponent from './src/components/layout/MainLayoutComponent';
import {TabKey} from './src/components/layout/NavbarComponent';
import CartScreen from './src/screens/CartScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductsScreen from './src/screens/ProductsScreen';

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const renderScreen = (): React.JSX.Element => {
    if (activeTab === 'products') {
      return <ProductsScreen />;
    }

    if (activeTab === 'cart') {
      return <CartScreen />;
    }

    return <HomeScreen />;
  };

  return (
    <MainLayoutComponent activeTab={activeTab} onTabChange={setActiveTab}>
      {renderScreen()}
    </MainLayoutComponent>
  );
}

export default App;