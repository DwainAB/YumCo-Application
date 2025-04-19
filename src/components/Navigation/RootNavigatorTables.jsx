import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Tables from '../../screens/Tables';
import ReservationScreen from '../../screens/ReservationScreen';

const Stack = createStackNavigator();

const RootNavigatorSetting = () => {

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tables" component={Tables} />
      <Stack.Screen name="Reservation" component={ReservationScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigatorSetting;
