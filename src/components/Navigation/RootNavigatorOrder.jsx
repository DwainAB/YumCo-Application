import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OrderSelect from '../../screens/OrderSelect';
import BasketScreen from '../../screens/OrderScreen';
import AllOrders from '../AllOrders/AllOrders';
import OrderSelectData from '../../screens/OrderSelectData';

const Stack = createStackNavigator();

const RootNavigatorOrder = () => {

    const [defaultScreen, setDefaultScreen] = useState('BasketScreen');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BasketScreen" component={BasketScreen} />
      <Stack.Screen name="OrderSelect" component={OrderSelect} />
      <Stack.Screen name="AllOrders" component={AllOrders} />
      <Stack.Screen name="OrderSelectData" component={OrderSelectData} />
    </Stack.Navigator>
  );
};

export default RootNavigatorOrder;
