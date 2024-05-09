import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Review from "../../screens/ReviewScreen"
import HomeScreen from '../../screens/HomeScreen';
import StatOptionScreen from '../../screens/StatOptionScreen';
import AllOrdersScreen from '../../screens/AllOrdersScreen';
import OrderSelectData from '../../screens/OrderSelectData';

const Stack = createStackNavigator();

const RootNavigatorHome = () => {

    const [defaultScreen, setDefaultScreen] = useState('HomeScreen');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Review" component={Review} />
      <Stack.Screen name="StatOptionScreen" component={StatOptionScreen} />
      <Stack.Screen name="AllOrdersScreen" component={AllOrdersScreen} />
      <Stack.Screen name="OrderSelectData" component={OrderSelectData} />
    </Stack.Navigator>
  );
};

export default RootNavigatorHome;
