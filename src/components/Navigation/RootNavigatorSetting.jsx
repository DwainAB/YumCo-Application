import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingPage from '../../screens/SettingPage';
import LanguagePage from '../../screens/LanguageScreen';
import CardOptionScreen from '../../screens/CardOptionScreen';
import AddProductScreen from '../../screens/AddProductScreen';
import UserOptionScreen from '../../screens/UserOptionScreen';
import AddUserScreen from '../../screens/AddUserScreen';
import ResetPassword from '../../screens/ResetPassword';
import InfoLoginScreen from '../../screens/InfoLoginScreen';
import SupportScreen from '../../screens/SupportScreen';
import UpdateUserScreen from '../../screens/UpdateUserScreen';
import CategoriesScreen from '../../screens/categories';
import UpdateProductScreen from '../../screens/UpdateProductScreen';
import PolityPrivacy from '../../screens/PolityPrivacy';
import FormAddMenu from '../../screens/AddMenuScreen'; 
import InformationScreen from '../../screens/InformationScreen';
import EditMenu from '../../screens/EditMenu';

const Stack = createStackNavigator();

const RootNavigatorSetting = () => {

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingPage" component={SettingPage} />
      <Stack.Screen name="LanguagePage" component={LanguagePage} />
      <Stack.Screen name="CardOptionScreen" component={CardOptionScreen} />
      <Stack.Screen name="AddProductScreen" component={AddProductScreen} />
      <Stack.Screen name="UserOptionScreen" component={UserOptionScreen} />
      <Stack.Screen name="AddUserScreen" component={AddUserScreen} />
      <Stack.Screen name="UpdateUserScreen" component={UpdateUserScreen} />
      <Stack.Screen name="SupportScreen" component={SupportScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="InfoLoginScreen" component={InfoLoginScreen} />
      <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} />
      <Stack.Screen name="UpdateProductScreen" component={UpdateProductScreen} />
      <Stack.Screen name="PolityPrivacy" component={PolityPrivacy} />
      <Stack.Screen name="InformationScreen" component={InformationScreen} />
      <Stack.Screen name="AddMenu" component={FormAddMenu} />
      <Stack.Screen name="EditMenu" component={EditMenu} />
    </Stack.Navigator>
  );
};

export default RootNavigatorSetting;
