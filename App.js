import { registerRootComponent } from 'expo';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InfoLoginScreen from './src/screens/InfoLoginScreen';
import RootNavigatorSetting from './src/components/Navigation/RootNavigatorSetting';
import RootNavigatorOrder from './src/components/Navigation/RootNavigatorOrder';
import RootNavigatorHome from './src/components/Navigation/RootNavigatorHome';
import RootNavigatorTables from './src/components/Navigation/RootNavigatorTables';
import { ColorProvider } from "./src/components/ColorContext/ColorContext";
import { I18nextProvider } from 'react-i18next';
import i18n from './src/components/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { LanguageProvider } from './src/components/LanguageContext/LanguageContext';
import { useWindowDimensions, View, AppState, DevSettings } from "react-native";
import LoadingScreen from './src/screens/LoadingScreen';
import { LoadingProvider, useLoading } from './src/components/Hooks/useLoading';
import { useColors } from './src/components/ColorContext/ColorContext';
import { supabase } from './src/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

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
  const { loading, setLoading } = useLoading();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const lastActiveTimestamp = useRef(Date.now());
  const navigationRef = useRef(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Temps maximum d'inactivité en millisecondes (ici 2 minutes)
  const MAX_INACTIVE_TIME = 2 * 60 * 1000;

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
      
      // Récupération données restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', role.restaurant_id)
        .single();
        
      if (restaurantError) throw restaurantError;

      // Stockage des données supplémentaires
      await AsyncStorage.setItem('owner', JSON.stringify({
        ...owner,
        restaurantId: role.restaurant_id
      }));
      await AsyncStorage.setItem('role', JSON.stringify(role));
      await AsyncStorage.setItem('restaurant', JSON.stringify(restaurant));

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
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erreur vérification session:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction simplifiée de rechargement direct
  const refreshApp = () => {
    console.log("rechargement de l'app");
    Updates.reloadAsync();
  };

  // Vérifier la session au démarrage
  useEffect(() => {
    checkSession();

    // Écouteur pour les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const userDataLoaded = await loadUserData(session.user.id);
        setIsAuthenticated(userDataLoaded);
      } else {
        setIsAuthenticated(false);
        // Nettoyer les données locales lors de la déconnexion
        await AsyncStorage.multiRemove(['owner', 'role', 'restaurant']);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Écouter les changements d'état de l'application
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Quand l'app revient au premier plan depuis l'arrière-plan
      if (
        appState.current.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        const now = Date.now();
        const timeInactive = now - lastActiveTimestamp.current;
        
        console.log(`App inactive pendant ${timeInactive / 1000} secondes`);
        
        // Si l'app était inactive trop longtemps, actualiser les données
        if (timeInactive > MAX_INACTIVE_TIME) {
          refreshApp();
        }
      } 
      // Quand l'app passe en arrière-plan
      else if (
        appState.current === 'active' && 
        nextAppState.match(/inactive|background/)
      ) {
        lastActiveTimestamp.current = Date.now();
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [refreshApp]);

  // Afficher l'écran de chargement pendant le chargement initial
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef} key={`nav-container-${reloadTrigger}`}>
      {loading && <LoadingScreen />}
      <Stack.Navigator>
        {isAuthenticated ? (
          <Stack.Screen 
            name="MainApp" 
            options={{ headerShown: false }}
          >
            {props => <MainApp {...props} reloadTrigger={reloadTrigger} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="InfoLoginScreen" component={InfoLoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const MainApp = ({ reloadTrigger }) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const iconSize = width > 800 ? 32 : width > 500 ? 24 : 20;
  const { colors } = useColors();
  const [restaurantId, setRestaurantId] = useState();
  const [onSiteOption, setOnSiteOption] = useState(false);
  
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        // Récupération des données du restaurant depuis AsyncStorage
        const restaurantData = await AsyncStorage.getItem("restaurant");
        if (restaurantData) {
          const parsedData = JSON.parse(restaurantData);
          setOnSiteOption(parsedData.on_site_option);
        } else {
          // Si les données ne sont pas dans AsyncStorage, les récupérer depuis Supabase
          const owner = await AsyncStorage.getItem("owner");
          if (owner) {
            const ownerData = JSON.parse(owner);
            setRestaurantId(ownerData.restaurantId);
            
            // Récupération de l'option on_site_option depuis la base de données
            const { data, error } = await supabase
              .from('restaurants')
              .select('on_site_option')
              .eq('id', ownerData.restaurantId)
              .single();
            
            if (error) throw error;
            
            if (data) {
              setOnSiteOption(data.on_site_option);
              // Stocker la valeur pour éviter de refaire la requête
              const restaurantJson = await AsyncStorage.getItem("restaurant");
              if (restaurantJson) {
                const restaurant = JSON.parse(restaurantJson);
                await AsyncStorage.setItem("restaurant", JSON.stringify({
                  ...restaurant,
                  on_site_option: data.on_site_option
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur récupération données restaurant:', error);
      }
    };
    
    fetchRestaurantData();
  }, []);

  // La définition de la version est conservée si vous en avez besoin pour d'autres usages
  const appVersion = "1.0.1";

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator 
        key={`tab-navigator-${reloadTrigger}`}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === t('titleScreen')) {
              iconName = focused ? 'home' : 'home-outline';
            }else if (route.name === t('tables')) {
              iconName = focused ? 'create' : 'create-outline';
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
        <Tab.Screen 
          name={t('titleScreen')} 
          options={{ unmountOnBlur: true }}
        >
          {props => <RootNavigatorHome {...props} />}
        </Tab.Screen>
        
        {onSiteOption && (
          <Tab.Screen 
            name={t('tables')} 
            options={{ unmountOnBlur: true }}
          >
            {props => <RootNavigatorTables {...props} />}
          </Tab.Screen>
        )}
        
        <Tab.Screen 
          name={t('titleOrder')} 
          options={{ unmountOnBlur: true }}
        >
          {props => <RootNavigatorOrder {...props} />}
        </Tab.Screen>
        <Tab.Screen 
          name={t('dashboard')} 
          options={{ unmountOnBlur: true }}
        >
          {props => <RootNavigatorSetting {...props} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

export default App;
registerRootComponent(App);