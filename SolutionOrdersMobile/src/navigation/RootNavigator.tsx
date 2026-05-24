import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import AdminItemsScreen from '../screens/AdminItemsScreen.tsx';
import AdminPanelScreen from '../screens/AdminPanelScreen.tsx';
import CartScreen from '../screens/CartScreen.tsx';
import CategoriesScreen from '../screens/CategoriesScreen.tsx';
import CategoryFormScreen from '../screens/CategoryFormScreen.tsx';
import ClientFormScreen from '../screens/ClientFormScreen.tsx';
import ClientsScreen from '../screens/ClientsScreen.tsx';
import DashboardScreen from '../screens/DashboardScreen.tsx';
import HomeScreen from '../screens/HomeScreen.tsx';
import ItemDetailsScreen from '../screens/ItemDetailsScreen.tsx';
import ItemFormScreen from '../screens/ItemFormScreen.tsx';
import ItemsScreen from '../screens/ItemsScreen.tsx';
import OrderFormScreen from '../screens/OrderFormScreen.tsx';
import OrderItemFormScreen from '../screens/OrderItemFormScreen.tsx';
import OrderItemsScreen from '../screens/OrderItemsScreen.tsx';
import OrdersScreen from '../screens/OrdersScreen.tsx';
import OrderSuccessScreen from '../screens/OrderSuccessScreen.tsx';
import UnitFormScreen from '../screens/UnitFormScreen.tsx';
import UnitsScreen from '../screens/UnitsScreen.tsx';
import WorkerFormScreen from '../screens/WorkerFormScreen.tsx';
import WorkersScreen from '../screens/WorkersScreen.tsx';

import type {RootStackParamList} from './types.ts';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f97316',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#0f172a',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: '3D Print Shop'}}
        />

        <Stack.Screen
          name="Items"
          component={ItemsScreen}
          options={{title: 'Sklep'}}
        />

        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{title: 'Koszyk'}}
        />

        <Stack.Screen
          name="OrderSuccess"
          component={OrderSuccessScreen}
          options={{title: 'Potwierdzenie zamówienia'}}
        />

        <Stack.Screen
          name="ItemDetails"
          component={ItemDetailsScreen}
          options={{title: 'Szczegóły produktu'}}
        />

        <Stack.Screen
          name="AdminPanel"
          component={AdminPanelScreen}
          options={{title: 'Panel administracyjny'}}
        />

        <Stack.Screen
          name="AdminItems"
          component={AdminItemsScreen}
          options={{title: 'Produkty - administracja'}}
        />

        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{title: 'Dashboard'}}
        />

        <Stack.Screen
          name="CreateItem"
          component={ItemFormScreen}
          options={{title: 'Dodaj produkt'}}
        />

        <Stack.Screen
          name="EditItem"
          component={ItemFormScreen}
          options={{title: 'Edytuj produkt'}}
        />

        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{title: 'Kategorie'}}
        />

        <Stack.Screen
          name="CreateCategory"
          component={CategoryFormScreen}
          options={{title: 'Dodaj kategorię'}}
        />

        <Stack.Screen
          name="EditCategory"
          component={CategoryFormScreen}
          options={{title: 'Edytuj kategorię'}}
        />

        <Stack.Screen
          name="Units"
          component={UnitsScreen}
          options={{title: 'Jednostki miary'}}
        />

        <Stack.Screen
          name="CreateUnit"
          component={UnitFormScreen}
          options={{title: 'Dodaj jednostkę'}}
        />

        <Stack.Screen
          name="EditUnit"
          component={UnitFormScreen}
          options={{title: 'Edytuj jednostkę'}}
        />

        <Stack.Screen
          name="Clients"
          component={ClientsScreen}
          options={{title: 'Klienci'}}
        />

        <Stack.Screen
          name="CreateClient"
          component={ClientFormScreen}
          options={{title: 'Dodaj klienta'}}
        />

        <Stack.Screen
          name="EditClient"
          component={ClientFormScreen}
          options={{title: 'Edytuj klienta'}}
        />

        <Stack.Screen
          name="Workers"
          component={WorkersScreen}
          options={{title: 'Pracownicy'}}
        />

        <Stack.Screen
          name="CreateWorker"
          component={WorkerFormScreen}
          options={{title: 'Dodaj pracownika'}}
        />

        <Stack.Screen
          name="EditWorker"
          component={WorkerFormScreen}
          options={{title: 'Edytuj pracownika'}}
        />

        <Stack.Screen
          name="Orders"
          component={OrdersScreen}
          options={{title: 'Zamówienia'}}
        />

        <Stack.Screen
          name="CreateOrder"
          component={OrderFormScreen}
          options={{title: 'Dodaj zamówienie'}}
        />

        <Stack.Screen
          name="EditOrder"
          component={OrderFormScreen}
          options={{title: 'Edytuj zamówienie'}}
        />

        <Stack.Screen
          name="OrderItems"
          component={OrderItemsScreen}
          options={{title: 'Pozycje zamówienia'}}
        />

        <Stack.Screen
          name="CreateOrderItem"
          component={OrderItemFormScreen}
          options={{title: 'Dodaj pozycję'}}
        />

        <Stack.Screen
          name="EditOrderItem"
          component={OrderItemFormScreen}
          options={{title: 'Edytuj pozycję'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;