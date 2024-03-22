import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingPage from '../../screens/SettingPage';
import LanguagePage from '../../screens/LanguageScreen';
import Personalization from '../../screens/personalizationScreen';
import CardOptionScreen from '../../screens/CardOptionScreen';
import AddProductScreen from '../../screens/AddProductScreen';
const Stack = createStackNavigator();

const RootNavigator = () => {

    const [defaultScreen, setDefaultScreen] = useState('SettingPage');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingPage" component={SettingPage} />
      <Stack.Screen name="LanguagePage" component={LanguagePage} />
      <Stack.Screen name="Personalization" component={Personalization} />
      <Stack.Screen name="CardOptionScreen" component={CardOptionScreen} />
      <Stack.Screen name="AddProductScreen" component={AddProductScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
