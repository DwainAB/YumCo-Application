import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { supabase } from '../lib/supabase';
import { useRestaurantId } from '../hooks/useRestaurantId';

function CardOptionScreen(){
   const navigation = useNavigation();
   const { t } = useTranslation();
   const { colors } = useColors();
   const styles = useStyles();
   const [userRole, setUserRole] = useState('USER');
   const { restaurantId, ownerData } = useRestaurantId();
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
       const fetchUserRole = async () => {
           try {
               // Récupérer le rôle de l'utilisateur avec Supabase
               if (ownerData?.id && restaurantId) {
                   const { data, error } = await supabase
                       .from('roles')
                       .select('type')
                       .eq('owner_id', ownerData.id)
                       .eq('restaurant_id', restaurantId)
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
   }, [ownerData, restaurantId]);

   if (isLoading) {
       return (
           <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
               <HeaderSetting name={t('cards')} navigateTo="SettingPage"/>
               <Text style={[styles.sectionTitle, {color: colors.colorDetail}]}>
                   Chargement...
               </Text>
           </View>
       );
   }

   return(
       <View style={[styles.container, {backgroundColor:colors.colorBackground}]}>
           <HeaderSetting name={t('cards')} navigateTo="SettingPage"/>

           <Text style={[styles.sectionTitle, {color: colors.colorDetail}]}>
               {t('menuManagement')}
           </Text>

           <View style={styles.menuOptions}>
               {(userRole === 'CHEF' || userRole === 'ADMIN') && (
                   <TouchableOpacity 
                       onPress={() => navigation.navigate('AddProductScreen')} 
                       style={[styles.menuItem, {backgroundColor: colors.colorBorderAndBlock}]}
                   >
                       <View style={styles.menuItemLeft}>
                           <Icon name="plus-circle" size={24} color="#4ECDC4" />
                           <Text style={[styles.menuItemText, {color: colors.colorText}]}>
                               {t('addProduct')}
                           </Text>
                       </View>
                       <Icon name="chevron-right" size={24} color={colors.colorDetail} />
                   </TouchableOpacity>
               )}

               <TouchableOpacity 
                   onPress={() => navigation.navigate('UpdateProductScreen')} 
                   style={[styles.menuItem, {backgroundColor: colors.colorBorderAndBlock}]}
               >
                   <View style={styles.menuItemLeft}>
                   <Icon name={userRole === 'USER' ? "format-list-bulleted" : "pencil"}  size={24} color="#FF6B6B" />
                   <Text style={[styles.menuItemText, {color: colors.colorText}]}>
                            {userRole === 'USER' ? t('cards') : t('editProduct')}                       
                        </Text>
                   </View>
                   <Icon name="chevron-right" size={24} color={colors.colorDetail} />
               </TouchableOpacity>

               {(userRole === 'CHEF' || userRole === 'ADMIN') && (
                <TouchableOpacity 
                    onPress={() => navigation.navigate('AddMenu')} 
                    style={[styles.menuItem, {backgroundColor: colors.colorBorderAndBlock}]}
                >
                    <View style={styles.menuItemLeft}>
                            <Icon name="plus-circle" size={24} color="#4ECDC4" />
                            <Text style={[styles.menuItemText, {color: colors.colorText}]}>
                                {userRole === 'USER' ? t('Menu') : t('add_a_menu')}                       
                            </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color={colors.colorDetail} />
                </TouchableOpacity>
               )}

               <TouchableOpacity 
                   onPress={() => navigation.navigate('EditMenu')} 
                   style={[styles.menuItem, {backgroundColor: colors.colorBorderAndBlock}]}
               >
                   <View style={styles.menuItemLeft}>
                        <Icon name={userRole === 'USER' ? "format-list-bulleted" : "pencil"}  size={24} color="#FF6B6B" />
                        <Text style={[styles.menuItemText, {color: colors.colorText}]}>
                            {userRole === 'USER' ? t('menu') : t('edit_menus')}                       
                        </Text>
                   </View>
                   <Icon name="chevron-right" size={24} color={colors.colorDetail} />
               </TouchableOpacity>

               {(userRole === 'CHEF' || userRole === 'ADMIN') && (
                   <TouchableOpacity 
                       onPress={() => navigation.navigate('CategoriesScreen')} 
                       style={[styles.menuItem, {backgroundColor: colors.colorBorderAndBlock}]}
                   >
                       <View style={styles.menuItemLeft}>
                           <Icon name="shape" size={24} color="#6C5CE7" />
                           <Text style={[styles.menuItemText, {color: colors.colorText}]}>
                               {t('categories')}
                           </Text>
                       </View>
                       <Icon name="chevron-right" size={24} color={colors.colorDetail} />
                   </TouchableOpacity>
               )}
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

export default CardOptionScreen;