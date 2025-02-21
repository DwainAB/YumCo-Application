import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../../screens/HomeScreen';
import StatOptionScreen from '../../screens/StatOptionScreen';
import OrdersAnalysisScreen from "../../screens/StatOrder"
import RevenueAnalysisScreen from '../../screens/StatTurnover';
import CustomerAnalysisScreen from '../../screens/statCustomer';
import PerformanceAnalysisScreen from '../../screens/StatPerformance';

const Stack = createStackNavigator();

const RootNavigatorHome = () => {

    const [defaultScreen, setDefaultScreen] = useState('HomeScreen');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="statCustomer" component={CustomerAnalysisScreen} />
      <Stack.Screen name="StatOptionScreen" component={StatOptionScreen} />
      <Stack.Screen name="OrdersAnalysisScreen" component={OrdersAnalysisScreen} />
      <Stack.Screen name="StatTurnover" component={RevenueAnalysisScreen} />
      <Stack.Screen name="StatPerformance" component={PerformanceAnalysisScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigatorHome;
