import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from '../lib/supabase';

function UserOptionScreen(){
   const navigation = useNavigation();
   const { t } = useTranslation();
   const { colors } = useColors();
   const styles = useStyles();
   const [userRole, setUserRole] = useState('USER');
   const [restaurantId, setRestaurantId] = useState('');
   const [userId, setUserId] = useState('');
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
       const fetchUserRole = async () => {
           try {
               // Récupérer les informations du propriétaire
               const owner = await AsyncStorage.getItem("owner");
               if (!owner) return;
               
               const ownerData = JSON.parse(owner);
               setUserId(ownerData.id);
               setRestaurantId(ownerData.restaurantId);
               
               // Récupérer le rôle de l'utilisateur avec Supabase
               if (ownerData.id && ownerData.restaurantId) {
                   const { data, error } = await supabase
                       .from('roles')
                       .select('type')
                       .eq('owner_id', ownerData.id)
                       .eq('restaurant_id', ownerData.restaurantId)
                       .single();
                   
                   if (error) {
                       console.error('Erreur lors de la récupération du rôle:', error);
                   } else if (data) {
                       setUserRole(data.type);
                   }
               }
           } catch (error) {
               console.error('Erreur récupération infos:', error);
           } finally {
               setIsLoading(false);
           }
       };
       
       fetchUserRole();
   }, []);

   if (isLoading) {
       return (
           <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
               <HeaderSetting name={t('users')} navigateTo="SettingPage"/>
               <Text style={[styles.sectionTitle, {color: colors.colorDetail}]}>
                   Chargement...
               </Text>
           </View>
       );
   }

   return(
       <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
           <HeaderSetting name={t('users')} navigateTo="SettingPage"/>

           <Text style={[styles.sectionTitle, {color: colors.colorDetail}]}>
               {t('userManagement')}
           </Text>

           <View style={styles.menuOptions}>
               {(userRole === 'CHEF' || userRole === 'ADMIN') && (
                   <TouchableOpacity 
                       onPress={() => navigation.navigate('AddUserScreen')} 
                       style={[styles.menuItem, {backgroundColor: colors.colorBorderAndBlock}]}
                   >
                       <View style={styles.menuItemLeft}>
                           <Icon name="account-plus" size={24} color="#4ECDC4" />
                           <Text style={[styles.menuItemText, {color: colors.colorText}]}>
                               {t('addUser')}
                           </Text>
                       </View>
                       <Icon name="chevron-right" size={24} color={colors.colorDetail} />
                   </TouchableOpacity>
               )}

               <TouchableOpacity 
                   onPress={() => navigation.navigate('UpdateUserScreen')} 
                   style={[styles.menuItem, {backgroundColor: colors.colorBorderAndBlock}]}
               >
                   <View style={styles.menuItemLeft}>
                       <Icon name="account-group" size={24} color="#6C5CE7" />
                       <Text style={[styles.menuItemText, {color: colors.colorText}]}>
                           {t('userList')}
                       </Text>
                   </View>
                   <Icon name="chevron-right" size={24} color={colors.colorDetail} />
               </TouchableOpacity>
           </View>
       </View>
   );
}

function useStyles(){
   const {width, height} = useWindowDimensions();

   return StyleSheet.create({
       container: {
           flex: 1,
       },
       sectionTitle: {
           fontSize: width > 375 ? 18 : 16,
           fontWeight: '600',
           marginHorizontal: 20,
           marginBottom: 20,
           marginTop: 10
       },
       menuOptions: {
           paddingHorizontal: 20,
           gap: 12
       },
       menuItem: {
           flexDirection: 'row',
           justifyContent: 'space-between',
           alignItems: 'center',
           padding: 16,
           borderRadius: 12,
       },
       menuItemLeft: {
           flexDirection: 'row',
           alignItems: 'center',
           gap: 12
       },
       menuItemText: {
           fontSize: width > 375 ? 16 : 14,
           fontWeight: '500'
       }
   });
}

export default UserOptionScreen;