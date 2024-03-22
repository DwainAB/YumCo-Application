import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen';
import OrderScreen from './src/screens/OrderScreen';
import Ionicons from "react-native-vector-icons/Ionicons"
import LoginScreen from './src/screens/LoginScreen';
import SettingPage from './src/screens/SettingPage';
import RootNavigator from './src/components/Navigation/RootNavigator';

const tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <tab.Navigator
        screenOptions={({route}) =>({
          tabBarIcon: ({focused,color, size})=>{
            let iconName;

            if(route.name == "Accueil"){
              iconName="home-outline"
            }else if( route.name == "Commande"){
              iconName="layers-outline"
            }else if( route.name == "Paramètre"){
              iconName="cog-outline"
            }

            return (
              <View style={{alignItems: 'center', paddingTop: 19}}>
                <Ionicons name={iconName} size={25} color={color}/>
                <Text style={{color: color, fontSize: 10}}>{route.name}</Text>
              </View>
            );
          },
          tabBarShowLabel :false, //Supprime le nom et garde juste les icons
          tabBarActiveTintColor: "white", //Permet de choisir la couleurs de l'icon de la page ou nous sommes
          tabBarInactiveTintColor: 'rgba(255,255,255,0.50)',
          tabBarStyle: {
            backgroundColor: "#27273A"
          },
          headerShown: false
          
        })}
      >

        <tab.Screen name="Accueil" component={HomeScreen}/>
        <tab.Screen name="Commande" component={OrderScreen} />
        <tab.Screen name="Paramètre" component={RootNavigator} />
      </tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
