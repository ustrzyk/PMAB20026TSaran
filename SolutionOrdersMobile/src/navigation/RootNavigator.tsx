import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import ItemFormScreen from '../screens/ItemFormScreen.tsx';
import ItemsScreen from '../screens/ItemsScreen.tsx';

import type {RootStackParamList} from './types.ts';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Items"
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
          name="Items"
          component={ItemsScreen}
          options={{title: 'Produkty'}}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;