import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen';
import BasketScreen from './src/screens/BasketScreen';
import Ionicons from "react-native-vector-icons/Ionicons"
import LoginScreen from './src/screens/LoginScreen';
import AdminPage from './src/screens/AdminPage';

const tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <tab.Navigator
      //ajout d'icon dans la navbar
        screenOptions={({route}) =>({
          tabBarIcon: ({focused,color, size})=>{
            let iconName;

            if(route.name == "Accueil"){
              iconName="home-outline"
            }else if( route.name == "Panier"){
              iconName="cart-outline"
            }else if( route.name == "Connexion"){
              iconName="person-circle-outline"
            }

            return <Ionicons name={iconName} size={30} color={color}/>
          },
          tabBarShowLabel :false, //Supprime le nom et garde juste les icons
          tabBarActiveTintColor: "white", //Permet de choisir la couleurs de l'icon de la page ou nous sommes
          tabBarInactiveTintColor: 'rgba(255,255,255,0.50)',
          tabBarStyle: {
            backgroundColor: "#FF9A00"
          },
          headerShown: false
        })}
      >

        <tab.Screen name="Accueil" component={HomeScreen} />
        <tab.Screen name="Panier" component={BasketScreen} />
        <tab.Screen name="Connexion" component={AdminPage} />
      </tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Vos styles ici
});
