import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SaleScreen from './src/screens/SaleScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Sale: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppWrapper() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Sale" component={SaleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
