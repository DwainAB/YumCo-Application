import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";

function CardOptionScreen(){
   const navigation = useNavigation();
   const { t } = useTranslation();
   const { colors } = useColors()
   const styles = useStyles()

   return(
       <View style={[styles.container, {backgroundColor:colors.colorBackground}]}>
           <HeaderSetting name={t('cards')} navigateTo="SettingPage"/>

           <Text style={[styles.sectionTitle, {color: colors.colorDetail}]}>
               {t('menuManagement')}
           </Text>

           <View style={styles.menuOptions}>
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

               <TouchableOpacity 
                   onPress={() => navigation.navigate('UpdateProductScreen')} 
                   style={[styles.menuItem, {backgroundColor: colors.colorBorderAndBlock}]}
               >
                   <View style={styles.menuItemLeft}>
                       <Icon name="pencil" size={24} color="#FF6B6B" />
                       <Text style={[styles.menuItemText, {color: colors.colorText}]}>
                           {t('editProduct')}
                       </Text>
                   </View>
                   <Icon name="chevron-right" size={24} color={colors.colorDetail} />
               </TouchableOpacity>

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
           </View>
       </View>
   )
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
   })
}

export default CardOptionScreen;