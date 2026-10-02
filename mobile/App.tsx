import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SaleScreen from './src/screens/SaleScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import AddEditProductScreen from './src/screens/AddEditProductScreen';
import PrescriptionsScreen from './src/screens/PrescriptionsScreen';
import type { Product } from './src/types';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Sale: undefined;
  Products: undefined;
  Reports: undefined;
  Prescriptions: undefined;
  AddProduct: { product?: Product } | undefined;
  EditProduct: { product: Product };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppWrapper() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Sale" component={SaleScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} />
        <Stack.Screen name="AddProduct" component={AddEditProductScreen} />
        <Stack.Screen name="EditProduct" component={AddEditProductScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
