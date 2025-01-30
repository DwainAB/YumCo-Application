import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Animated, Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView, Swipeable, FlatList } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Ionicons from "react-native-vector-icons/Ionicons";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "../components/ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import { supabase } from '../lib/supabase';

const AnimatedListItem = ({ children, index }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(-50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(translateX, {
                toValue: 0,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [index]);

    return (
        <Animated.View
            style={{
                opacity,
                transform: [{ translateX }],
            }}
        >
            {children}
        </Animated.View>
    );
};

const AnimatedFormView = ({ children }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={{
                opacity,
                transform: [{ translateY }],
            }}
        >
            {children}
        </Animated.View>
    );
};

function CategoriesScreen() {
   const [restaurantId, setRestaurantId] = useState('');
   const { colors } = useColors();
   const { t } = useTranslation();
   const styles = useStyles();
   const [listCategories, setListCategories] = useState([]);
   const [refreshing, setRefreshing] = useState(false);
   const [categories, setCategories] = useState({
       name: '',
       restaurant_id: restaurantId
   });

   useEffect(() => {
       fetchCategories();
   }, [restaurantId]);

   useEffect(() => {
       const fetchRestaurantId = async () => {
           try {
               const owner = await AsyncStorage.getItem("owner");
               const ownerData = JSON.parse(owner);                
               setRestaurantId(ownerData.restaurantId);
           } catch (error) {
               console.error('Erreur récupération utilisateur:', error);
           }
       };
       fetchRestaurantId();
   }, []);

   const handleNewCategoriesInputChange = (name, value) => {
       setCategories(prevState => ({ ...prevState, [name]: value }));
   };

   const fetchCategories = async () => {
       if(!restaurantId) return;
       try {
           const { data, error } = await supabase
               .from('categories')
               .select('*')
               .eq('restaurant_id', restaurantId);

           if (error) throw error;
           setListCategories(data);
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
       } catch (error) {
           console.error('Erreur:', error);
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
       }
   };

   const handleAddNewCategories = async () => {
       if (!categories.name.trim()) {
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
           return;
       }

       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
       try {
           const { error } = await supabase
               .from('categories')
               .insert([{
                   name: categories.name,
                   restaurant_id: restaurantId
               }]);

           if (error) throw error;

           setCategories({ name: '', restaurant_id: restaurantId });
           fetchCategories();
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
       } catch (error) {
           console.error(error);
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
       }
   };

   const handleDeleteCategorie = async (categorieId) => {
       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
       try {
           const { error } = await supabase
               .from('categories')
               .delete()
               .eq('id', categorieId);

           if (error) throw error;
           
           fetchCategories();
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
       } catch (error) {
           console.error(error);
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
       }
   };

   const renderRightActions = (progress, dragX, categorieId) => {
       const scale = dragX.interpolate({
           inputRange: [-100, 0],
           outputRange: [1, 0],
           extrapolate: 'clamp',
       });

       return (
           <Animated.View style={[styles.deleteAction, { transform: [{ scale }] }]}>
               <TouchableOpacity 
                   onPress={() => {
                       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                       Alert.alert(
                           t('delete'),
                           t('Êtes-vous sur de vouloir supprimer ?'),
                           [
                               {
                                   text: t('cancel'),
                                   style: 'cancel',
                               },
                               {
                                   text: t('delete'),
                                   style: 'destructive',
                                   onPress: () => handleDeleteCategorie(categorieId),
                               },
                           ]
                       );
                   }}
                   style={[styles.deleteButton, { backgroundColor: colors.colorRed }]}
               >
                   <Ionicons name="trash-outline" size={24} color="white" />
               </TouchableOpacity>
           </Animated.View>
       );
   };

   const renderItem = ({ item: categorie, index }) => (
       <Swipeable
           renderRightActions={(progress, dragX) => 
               renderRightActions(progress, dragX, categorie.id)
           }
           onSwipeableWillOpen={() => Haptics.selectionAsync()}
       >
           <AnimatedListItem index={index}>
               <View style={[styles.categorieContainer, { backgroundColor: colors.colorBackground }]}>
                   <View style={[styles.containerNamecategorie, { borderColor: colors.colorDetail }]}>
                       <Text style={[styles.nameCategorie, { color: colors.colorText }]}>
                           {categorie.name}
                       </Text>
                   </View>
               </View>
           </AnimatedListItem>
       </Swipeable>
   );

   return (
       <GestureHandlerRootView style={styles.container}>
           <View style={[styles.containerCardPage, { backgroundColor: colors.colorBackground }]}>
               <HeaderSetting name={t('category')} navigateTo="CardOptionScreen" />
               
               <AnimatedFormView>
                   <Text style={[styles.titleCard, { color: colors.colorDetail }]}>
                       {t('addCategory')}
                   </Text>
                   
                   <View style={styles.containerAddCategories}>
                       <TextInput
                           style={[styles.categoriesInput, { 
                               borderColor: colors.colorText, 
                               color: colors.colorText 
                           }]}
                           placeholder={t('category')}
                           placeholderTextColor="#343434"
                           value={categories.name}
                           onChangeText={(value) => handleNewCategoriesInputChange('name', value)}
                           onSubmitEditing={handleAddNewCategories}
                           returnKeyType="done"
                       />
                       <TouchableOpacity 
                           onPress={handleAddNewCategories}
                           style={[styles.containerBtnAddCategories, { 
                               backgroundColor: colors.colorAction 
                           }]}
                       >
                           <Ionicons 
                               name="checkmark-outline" 
                               style={{ fontSize: 30, color: colors.colorText }} 
                           />
                       </TouchableOpacity>
                   </View>
               </AnimatedFormView>

               <Text style={[styles.titleCard, { color: colors.colorDetail }]}>
                   {t('listCategory')}
               </Text>

               <FlatList
                   data={listCategories}
                   renderItem={renderItem}
                   keyExtractor={item => item.id.toString()}
                   refreshing={refreshing}
                   onRefresh={async () => {
                       setRefreshing(true);
                       await fetchCategories();
                       setRefreshing(false);
                   }}
                   contentContainerStyle={styles.listContainer}
               />
           </View>
       </GestureHandlerRootView>
   );
}

function useStyles() {
   const {width} = useWindowDimensions();

   return StyleSheet.create({
       container: {
           flex: 1,
       },
       containerCardPage: {
           flex: 1,
       },
       titleCard: {
           marginLeft: 30,
           fontSize: (width > 375) ? 18 : 15,
           marginBottom: (width > 375) ? 30 : 20,
       },
       containerAddCategories: {
           flexDirection: "row",
           marginHorizontal: 30,
           justifyContent: "space-between",
           marginBottom: (width > 375) ? 50 : 30,
       },
       containerBtnAddCategories: {
           height: (width > 375) ? 50 : 40,
           width: (width > 375) ? 50 : 40,
           justifyContent: "center",
           alignItems: "center",
           borderRadius: 15,
           ...Platform.select({
               ios: {
                   shadowColor: '#000',
                   shadowOffset: { width: 0, height: 2 },
                   shadowOpacity: 0.25,
                   shadowRadius: 3.84,
               },
               android: {
                   elevation: 5,
               }
           }),
       },
       categoriesInput: {
           borderWidth: 1,
           height: (width > 375) ? 50 : 40,
           borderRadius: 20,
           paddingHorizontal: 20,
           marginBottom: 20,
           width: (width > 375) ? 250 : 200,
       },
       containerNamecategorie: {
           borderLeftWidth: 2,
           paddingLeft: 10,
           paddingVertical: 10,
           marginBottom: 10,
           flex: 1,
       },
       nameCategorie: {
           fontSize: 16,
           fontWeight: '500',
       },
       deleteAction: {
           alignItems: 'center',
           justifyContent: 'center',
           marginRight: 20,
       },
       deleteButton: {
           width: 50,
           height: 50,
           borderRadius: 25,
           alignItems: 'center',
           justifyContent: 'center',
           ...Platform.select({
               ios: {
                   shadowColor: '#000',
                   shadowOffset: { width: 0, height: 2 },
                   shadowOpacity: 0.25,
                   shadowRadius: 3.84,
               },
               android: {
                   elevation: 5,
               },
           }),
       },
       categorieContainer: {
           flexDirection: 'row',
           alignItems: 'center',
           padding: 15,
           marginBottom: 10,
           borderRadius: 12,
           marginHorizontal: 20,
           ...Platform.select({
               ios: {
                   shadowColor: '#000',
                   shadowOffset: { width: 0, height: 1 },
                   shadowOpacity: 0.22,
                   shadowRadius: 2.22,
               },
               android: {
                   elevation: 3,
               },
           }),
       },
       listContainer: {
           paddingBottom: 90,
       }
   });
}

export default CategoriesScreen;