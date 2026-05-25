import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import AdminItemsScreen from '../screens/AdminItemsScreen.tsx';
import AdminPanelScreen from '../screens/AdminPanelScreen.tsx';
import CartScreen from '../screens/CartScreen.tsx';
import CategoriesScreen from '../screens/CategoriesScreen.tsx';
import CategoryFormScreen from '../screens/CategoryFormScreen.tsx';
import ClientFormScreen from '../screens/ClientFormScreen.tsx';
import ClientPanelScreen from '../screens/ClientPanelScreen.tsx';
import ClientsScreen from '../screens/ClientsScreen.tsx';
import DashboardScreen from '../screens/DashboardScreen.tsx';
import HomeScreen from '../screens/HomeScreen.tsx';
import ItemDetailsScreen from '../screens/ItemDetailsScreen.tsx';
import ItemFormScreen from '../screens/ItemFormScreen.tsx';
import ItemsScreen from '../screens/ItemsScreen.tsx';
import LoginScreen from '../screens/LoginScreen.tsx';
import OrderFormScreen from '../screens/OrderFormScreen.tsx';
import OrderItemFormScreen from '../screens/OrderItemFormScreen.tsx';
import OrderItemsScreen from '../screens/OrderItemsScreen.tsx';
import OrdersScreen from '../screens/OrdersScreen.tsx';
import OrderSuccessScreen from '../screens/OrderSuccessScreen.tsx';
import RegisterScreen from '../screens/RegisterScreen.tsx';
import TrackOrderScreen from '../screens/TrackOrderScreen.tsx';
import UnitFormScreen from '../screens/UnitFormScreen.tsx';
import UnitsScreen from '../screens/UnitsScreen.tsx';
import WorkerFormScreen from '../screens/WorkerFormScreen.tsx';
import WorkersScreen from '../screens/WorkersScreen.tsx';

import {useAuth} from '../context/AuthContext.tsx';

import type {RootStackParamList} from './types.ts';

const Stack = createNativeStackNavigator<RootStackParamList>();

type GuardMode = 'employee' | 'admin';

interface AccessGuardProps {
  mode: GuardMode;
  children: React.ReactNode;
}

function AccessGuard({mode, children}: AccessGuardProps): React.JSX.Element {
  const {isAdmin, isWorker} = useAuth();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const hasAccess = mode === 'admin' ? isAdmin : isAdmin || isWorker;

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <View style={styles.accessContainer}>
      <Text style={styles.accessIcon}>🔒</Text>

      <Text style={styles.accessTitle}>Brak dostępu</Text>

      <Text style={styles.accessText}>
        Ten ekran jest dostępny tylko dla pracownika albo administratora.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{name: 'Home'}],
          })
        }
        activeOpacity={0.85}>
        <Text style={styles.primaryButtonText}>Wróć do sklepu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{name: 'AuthLogin'}],
          })
        }
        activeOpacity={0.85}>
        <Text style={styles.secondaryButtonText}>Zaloguj</Text>
      </TouchableOpacity>
    </View>
  );
}

function RootNavigator(): React.JSX.Element {
  const {user, isAdmin, isWorker, isCustomer} = useAuth();

  const navigatorKey = user ? user.role : 'guest';

  let initialRouteName: keyof RootStackParamList = 'Home';

  if (isAdmin || isWorker) {
    initialRouteName = 'AdminPanel';
  }

  if (isCustomer) {
    initialRouteName = 'ClientPanel';
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={navigatorKey}
        initialRouteName={initialRouteName}
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
          name="ItemDetails"
          component={ItemDetailsScreen}
          options={{title: 'Produkt'}}
        />

        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{title: 'Koszyk'}}
        />

        <Stack.Screen
          name="TrackOrder"
          component={TrackOrderScreen}
          options={{title: 'Sprawdź zamówienie'}}
        />

        <Stack.Screen
          name="AuthLogin"
          component={LoginScreen}
          options={{title: 'Logowanie'}}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{title: 'Rejestracja'}}
        />

        <Stack.Screen
          name="OrderSuccess"
          component={OrderSuccessScreen}
          options={{title: 'Potwierdzenie zamówienia'}}
        />

        <Stack.Screen
          name="ClientPanel"
          component={ClientPanelScreen}
          options={{title: 'Moje konto'}}
        />

        <Stack.Screen
          name="AdminPanel"
          component={AdminPanelScreen}
          options={{title: 'Panel pracownika'}}
        />

        <Stack.Screen name="Dashboard" options={{title: 'Dashboard'}}>
          {props => (
            <AccessGuard mode="employee">
              <DashboardScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="AdminItems" options={{title: 'Produkty'}}>
          {props => (
            <AccessGuard mode="employee">
              <AdminItemsScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="CreateItem" options={{title: 'Dodaj produkt'}}>
          {props => (
            <AccessGuard mode="employee">
              <ItemFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="EditItem" options={{title: 'Edytuj produkt'}}>
          {props => (
            <AccessGuard mode="employee">
              <ItemFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="Categories" options={{title: 'Kategorie'}}>
          {props => (
            <AccessGuard mode="employee">
              <CategoriesScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="CreateCategory"
          options={{title: 'Dodaj kategorię'}}>
          {props => (
            <AccessGuard mode="employee">
              <CategoryFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="EditCategory"
          options={{title: 'Edytuj kategorię'}}>
          {props => (
            <AccessGuard mode="employee">
              <CategoryFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="Units" options={{title: 'Jednostki miary'}}>
          {props => (
            <AccessGuard mode="employee">
              <UnitsScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="CreateUnit" options={{title: 'Dodaj jednostkę'}}>
          {props => (
            <AccessGuard mode="employee">
              <UnitFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="EditUnit" options={{title: 'Edytuj jednostkę'}}>
          {props => (
            <AccessGuard mode="employee">
              <UnitFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="Clients" options={{title: 'Klienci'}}>
          {props => (
            <AccessGuard mode="employee">
              <ClientsScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="CreateClient" options={{title: 'Dodaj klienta'}}>
          {props => (
            <AccessGuard mode="employee">
              <ClientFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="EditClient" options={{title: 'Edytuj klienta'}}>
          {props => (
            <AccessGuard mode="employee">
              <ClientFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="Workers" options={{title: 'Pracownicy'}}>
          {props => (
            <AccessGuard mode="admin">
              <WorkersScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="CreateWorker" options={{title: 'Dodaj pracownika'}}>
          {props => (
            <AccessGuard mode="admin">
              <WorkerFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="EditWorker" options={{title: 'Edytuj pracownika'}}>
          {props => (
            <AccessGuard mode="admin">
              <WorkerFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="Orders" options={{title: 'Zamówienia'}}>
          {props => (
            <AccessGuard mode="employee">
              <OrdersScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="CreateOrder" options={{title: 'Dodaj zamówienie'}}>
          {props => (
            <AccessGuard mode="employee">
              <OrderFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="EditOrder" options={{title: 'Edytuj zamówienie'}}>
          {props => (
            <AccessGuard mode="employee">
              <OrderFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="OrderItems"
          options={{title: 'Pozycje zamówienia'}}>
          {props => (
            <AccessGuard mode="employee">
              <OrderItemsScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="CreateOrderItem"
          options={{title: 'Dodaj pozycję'}}>
          {props => (
            <AccessGuard mode="employee">
              <OrderItemFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="EditOrderItem"
          options={{title: 'Edytuj pozycję'}}>
          {props => (
            <AccessGuard mode="employee">
              <OrderItemFormScreen {...props} />
            </AccessGuard>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  accessContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  accessIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  accessTitle: {
    color: '#f8fafc',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  accessText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },

  primaryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 10,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  secondaryButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default RootNavigator;