import { registerRootComponent } from 'expo';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InfoLoginScreen from './src/screens/InfoLoginScreen';
import RootNavigatorSetting from './src/components/Navigation/RootNavigatorSetting';
import RootNavigatorOrder from './src/components/Navigation/RootNavigatorOrder';
import RootNavigatorHome from './src/components/Navigation/RootNavigatorHome';
import { ColorProvider } from "./src/components/ColorContext/ColorContext";
import { I18nextProvider } from 'react-i18next';
import i18n from './src/components/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { LanguageProvider } from './src/components/LanguageContext/LanguageContext';
import { useWindowDimensions, View } from "react-native";
import LoadingScreen from './src/screens/LoadingScreen';
import { LoadingProvider, useLoading } from './src/components/Hooks/useLoading';
import { useColors } from './src/components/ColorContext/ColorContext';
import { supabase } from './src/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Suppression de l'import UpdateModal

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <LanguageProvider>
      <I18nextProvider i18n={i18n}>
        <ColorProvider>
          <LoadingProvider>
            <MainNavigator />
          </LoadingProvider>
        </ColorProvider>
      </I18nextProvider>
    </LanguageProvider>
  );
};

const MainNavigator = () => {
  const { loading } = useLoading();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async (userId) => {
      try {
        // Récupération données owner
        const { data: owner, error: ownerError } = await supabase
          .from('owners')
          .select('*')
          .eq('id', userId)
          .single();

        if (ownerError) throw ownerError;

        // Récupération données role
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('*')
          .eq('owner_id', owner.id)
          .single();

        if (roleError) throw roleError;

        // Stockage des données supplémentaires
        await AsyncStorage.setItem('owner', JSON.stringify({
          ...owner,
          restaurantId: role.restaurant_id
        }));
        await AsyncStorage.setItem('role', JSON.stringify(role));

        return true;
      } catch (error) {
        console.error('Erreur chargement données utilisateur:', error);
        return false;
      }
    };

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const userDataLoaded = await loadUserData(session.user.id);
          setIsAuthenticated(userDataLoaded);
        }
      } catch (error) {
        console.error('Erreur vérification session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Écouteur pour les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const userDataLoaded = await loadUserData(session.user.id);
        setIsAuthenticated(userDataLoaded);
      } else {
        setIsAuthenticated(false);
        // Nettoyer les données locales lors de la déconnexion
        await AsyncStorage.multiRemove(['owner', 'role']);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {loading && <LoadingScreen />}
      <Stack.Navigator>
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={MainApp} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="InfoLoginScreen" component={InfoLoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const MainApp = () => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const iconSize = width > 800 ? 32 : width > 500 ? 24 : 20;
  const { colors } = useColors();
  
  // La définition de la version est conservée si vous en avez besoin pour d'autres usages
  const appVersion = "1.0.1";

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
            } else if (route.name === t('dashboard')) {
              iconName = focused ? 'cog' : 'cog-outline';
            }

            return <Ionicons name={iconName} size={iconSize} color={color} />;
          },
          tabBarActiveTintColor: colors.colorAction,
          tabBarInactiveTintColor: colors.colorDetailDark,
          tabBarStyle: {
            backgroundColor: colors.colorBorderAndBlock,
          },
          headerShown: false
        })}
      >
        <Tab.Screen name={t('titleScreen')} component={RootNavigatorHome} />
        <Tab.Screen name={t('titleOrder')} component={RootNavigatorOrder} />
        <Tab.Screen name={t('dashboard')} component={RootNavigatorSetting} />
      </Tab.Navigator>
      
    </View>
  );
};

export default App;
registerRootComponent(App);