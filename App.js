import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InfoLoginScreen from './src/screens/InfoLoginScreen';
import HomeScreen from "./src/screens/HomeScreen";
import RootNavigatorSetting from './src/components/Navigation/RootNavigatorSetting';
import RootNavigatorOrder from './src/components/Navigation/RootNavigatorOrder';
import RootNavigatorHome from './src/components/Navigation/RootNavigatorHome';
import { ColorProvider } from "./src/components/ColorContext/ColorContext";
import { I18nextProvider } from 'react-i18next';
import i18n from './src/components/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { LanguageProvider } from './src/components/LanguageContext/LanguageContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <I18nextProvider i18n={i18n}>
        <ColorProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={({ route }) => ({tabBarVisible: route.name !== 'InfoLoginScreen'})}>        
              <Stack.Screen name="InfoLoginScreen" component={InfoLoginScreen} options={{ headerShown: false }}/>
              <Stack.Screen name="MainApp" component={MainApp} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </ColorProvider>
      </I18nextProvider>
    </LanguageProvider>


  );
}

const MainApp = () => {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === t('titleScreen')) {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === t('titleOrder')) {
              iconName = focused ? 'layers' : 'layers-outline';
            } else if (route.name === t('titleSetting')) {
              iconName = focused ? 'cog' : 'cog-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.50)',
          tabBarStyle: {
            backgroundColor: '#27273A',
          },
          headerShown: false
        })}
      >
        <Tab.Screen
          name={t('titleScreen')}
          component={RootNavigatorHome}
        />
        <Tab.Screen
          name={t('titleOrder')}
          component={RootNavigatorOrder}
        />
        <Tab.Screen
          name={t('titleSetting')}
          component={RootNavigatorSetting}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({});
