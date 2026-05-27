import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {AuthProvider} from './src/context/AuthContext.tsx';
import {CartProvider, useCart} from './src/context/CartContext.tsx';
import {ItemsProvider, useItems} from './src/context/ItemsContext.tsx';
import RootNavigator from './src/navigation/RootNavigator.tsx';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <AuthProvider>
        <ItemsProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ItemsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppContent(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <CartSynchronizer />
      <RootNavigator />
    </View>
  );
}

function CartSynchronizer(): null {
  const {items} = useItems();
  const {syncCartWithItems} = useCart();

  useEffect(() => {
    syncCartWithItems(items);
  }, [items, syncCartWithItems]);

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});

export default App;