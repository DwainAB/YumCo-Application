import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from "react-native";
import { GestureHandlerRootView, FlatList, Swipeable } from 'react-native-gesture-handler';
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";
import { registerForPushNotificationsAsync } from '../Notifications/NotificationsOrder';
import { useWindowDimensions } from "react-native";
import { useLoading } from "../Hooks/useLoading";
import * as Haptics from 'expo-haptics';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const AnimatedListItem = ({ children, index }) => {
    const translateX = useRef(new Animated.Value(-50)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: 0,
            duration: 500,
            delay: index * 100,
            useNativeDriver: true,
        }).start();

        Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            delay: index * 100,
            useNativeDriver: true,
        }).start();
    }, []);

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

function ContentOrder() {
   const [expoPushToken, setExpoPushToken] = useState('');
   const [orders, setOrders] = useState([]);
   const [orderMethod, setOrderMethod] = useState('PICKUP');
   const [filteredOrders, setFilteredOrders] = useState([]);
   const [refreshing, setRefreshing] = useState(false);
   const navigation = useNavigation(); 
   const { t } = useTranslation();
   const { colors } = useColors();
   const styles = useStyles();
   const [remove, setRemove] = useState(false);
   const { startLoading, stopLoading } = useLoading();
   const [restaurantId, setRestaurantId] = useState('');
   const [userId, setUserId] = useState('');
   const [lastFetchTime, setLastFetchTime] = useState(0);
   
   const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho"

   useEffect(() => {
       if (expoPushToken) {
           updateNotificationToken(expoPushToken);
       }
   }, [expoPushToken]);

   useEffect(() => {
       const fetchRestaurantId = async () => {
           try {
               const owner = await AsyncStorage.getItem("owner");
               const ownerData = JSON.parse(owner);                
               setRestaurantId(ownerData.restaurantId);
               setUserId(ownerData.id);
           } catch (error) {
               console.error('Erreur lors de la récupération des informations utilisateur:', error);
           }
       };
       fetchRestaurantId();
   }, []);

   const updateNotificationToken = async (token) => {
       try {
           const response = await fetch("https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/updateUser", {
               method: "POST",
               headers: { 
                   "Content-Type": "application/json",
                   "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                   "apikey": SUPABASE_ANON_KEY
               },
               body: JSON.stringify({
                   user_id: userId,
                   expo_push_token: token,
               })
           });
           
           if (!response.ok) {
               throw new Error('Erreur lors de la mise à jour');
           }
       } catch (error) {
           console.error('Erreur mise à jour:', error);
       }
   };

   const filterOrdersByMethod = (method) => {
       const filtered = orders.filter(order => 
           order.type === method && 
           order.status !== "COMPLETED" && 
           order.status !== "CANCELLED" && 
           order.status !== "DELETED"
       );
       setFilteredOrders(filtered);
   };

   useEffect(() => {
       registerForPushNotificationsAsync()
           .then(token => {
               setExpoPushToken(token);
           })
           .catch((err) => console.log(err));
   }, []);

   useEffect(() => {
       filterOrdersByMethod(orderMethod);
   }, [orders, orderMethod]);

   const onRefresh = React.useCallback(async () => {
       setRefreshing(true);
       await fetchOrders();
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
       setRefreshing(false);
   }, [restaurantId]);

   const refreshOrders = async () => {
       const now = Date.now();
       if (now - lastFetchTime < 5000) {
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
           return;
       }
       
       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
       await fetchOrders();
       setLastFetchTime(now);
   };

   const fetchOrders = async () => {
       try {
           const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/getRestaurantOrders', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   "Authorization": `Bearer ${SUPABASE_ANON_KEY}` 
               },
               body: JSON.stringify({
                   restaurant_id: restaurantId
               })
           });
           const result = await response.json();
           
           if (result.success) {
               setOrders(result.data);
           }
       } catch (error) {
           console.error('Erreur lors de la récupération des commandes:', error.message);
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
       }
   };

   useEffect(() => {
       if (restaurantId) {
           fetchOrders();
       }
   }, [restaurantId]);

   useEffect(() => {
       const unsubscribe = navigation.addListener('focus', fetchOrders);
       return unsubscribe;
   }, [navigation, restaurantId]);

   const calculateAndFormatTotalPrice = (order) => {
       return `${order.amount_total.toFixed(2)} €`;
   };

   const formatOrderForDetails = (order) => {
       return {
           client_ref_order: order.order_number,
           payment_status: order.payment_status,
           order_id: order.id,
           client_method: order.type === "PICKUP" ? "A emporter" : "Livraison",
           client_payment: order.payment_method,
           client_lastname: order.customers.last_name,
           client_firstname: order.customers.first_name,
           client_phone: order.customers.phone,
           client_email: order.customers.email,
           order_comment: order.comment,
           client_address: `${order.addresses.street}, ${order.addresses.city} ${order.addresses.postal_code}`,
           client_id: order.id,
           amount_total: order.amount_total,
           orders: order.order_items.map(item => ({
               id: item.id,
               comment: item.comment,
               order_quantity: item.quantity,
               product_title: item.name,
               product_price: item.unit_price,
               subtotal: item.subtotal
           }))
       };
   };

   const renderRightActions = (progress, dragX, order) => {
       const scale = dragX.interpolate({
           inputRange: [-100, 0],
           outputRange: [1, 0],
           extrapolate: 'clamp',
       });

       return (
           <View style={styles.rightActionsContainer}>
               <Animated.View style={[styles.rightAction, { transform: [{ scale }] }]}>
                   <TouchableOpacity 
                       onPress={() => {
                           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                           navigation.navigate('OrderSelect', {
                               order: formatOrderForDetails(order)
                           });
                       }}
                       style={[styles.actionButton, {backgroundColor: colors.colorAction}]}
                   >
                       <Ionicons name="eye-outline" size={24} color="white" />
                   </TouchableOpacity>
               </Animated.View>
               <Animated.View style={[styles.rightAction, { transform: [{ scale }] }]}>
                   <TouchableOpacity 
                       onPress={async () => {
                           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                           startLoading();
                           try {
                               const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/updateOrder', {
                                   method: 'POST',
                                   headers: {
                                       'Content-Type': 'application/json',
                                       'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                                   },
                                   body: JSON.stringify({
                                       order_id: order.id,
                                       new_status: 'COMPLETED'
                                   })
                               });
                               if (response.ok) {
                                   await fetchOrders();
                               }
                           } catch (error) {
                               console.error(error);
                           } finally {
                               stopLoading();
                           }
                       }}
                       style={[styles.actionButton, {backgroundColor: colors.colorRed}]}
                   >
                       <Ionicons name="trash-outline" size={24} color="white" />
                   </TouchableOpacity>
               </Animated.View>
           </View>
       );
   };

   const renderOrderItem = ({ item: order, index }) => (
       <Swipeable 
           renderRightActions={(progress, dragX) => 
               renderRightActions(progress, dragX, order)
           }
           overshootRight={false}
           onSwipeableOpen={() => Haptics.impactAsync()}
       >
           <AnimatedListItem index={index}>
               <TouchableOpacity
                   style={[styles.containerOrderItem]}
                   onPress={() => {
                       Haptics.selectionAsync();
                       navigation.navigate('OrderSelect', {
                           order: formatOrderForDetails(order)
                       });
                   }}
               >
                   <View style={[styles.containerIconOrderItem, {
                       backgroundColor: colors.colorText
                   }]}>
                       <Ionicons 
                           size={28} 
                           color={colors.colorAction} 
                           name={order.type === "PICKUP" ? 
                               "bag-handle-outline" : "bicycle-outline"
                           }
                       />
                   </View>
                   <View style={styles.containerTextOrderItem}>
                       <View>
                           <Text style={[styles.textOrderItem, {
                               color: colors.colorText
                           }]}>{order.order_number}</Text>
                           <Text style={[styles.textOrderItemName, {
                               color: colors.colorDetail
                           }]}>
                               {order.customers.last_name} {order.customers.first_name}
                           </Text>
                       </View>
                       <View>
                           <Text style={[styles.textOrderItem, {
                               color: colors.colorText
                           }]}>
                               {calculateAndFormatTotalPrice(order)}
                           </Text>
                       </View>
                   </View>
               </TouchableOpacity>
           </AnimatedListItem>
       </Swipeable>
   );

   return(
       <GestureHandlerRootView style={styles.container}>
           <View style={styles.containerScreenBasket}>
               <View style={styles.containerHeaderSetting}>
                   <View style={styles.containerBtnLogout} />
                   <Text style={[styles.textHeaderSetting, {
                       color: colors.colorText
                   }]}>{t('titleOrder')}</Text>
                   <TouchableOpacity 
                       onPress={refreshOrders} 
                       style={[styles.containerBtnLogout, {
                           backgroundColor: colors.colorBorderAndBlock
                       }]}
                   >
                       <Ionicons 
                           name="reload-outline" 
                           size={25} 
                           color={colors.colorText}
                       />
                   </TouchableOpacity>
               </View>

               <View style={[styles.line, {
                   borderColor: colors.colorDetail
               }]} />

               <SegmentedControl
                   values={[t('takeaway'), t('delivery')]}
                   selectedIndex={orderMethod === 'PICKUP' ? 0 : 1}
                   onChange={(event) => {
                       Haptics.selectionAsync();
                       setOrderMethod(
                           event.nativeEvent.selectedSegmentIndex === 0 
                               ? 'PICKUP' 
                               : 'DELIVERY'
                       );
                   }}
                   style={styles.segmentedControl}
                   tintColor={colors.colorAction}
                   fontStyle={{color: colors.colorText}}
                   activeFontStyle={{color: colors.colorText}}
               />

               <FlatList
                   data={filteredOrders}
                   renderItem={renderOrderItem}
                   keyExtractor={item => item.id}
                   refreshing={refreshing}
                   onRefresh={onRefresh}
                   contentContainerStyle={styles.listContainer}
                   showsVerticalScrollIndicator={false}
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
       containerScreenBasket: {
           flex: 1,
       },
       containerHeaderSetting: {
           justifyContent: "space-between", 
           flexDirection: "row",
           marginTop: (width > 375) ? 60 : 40,
           paddingHorizontal: 35,
           alignItems: 'center',
           width: '100%',
       },
       textHeaderSetting: {
           fontSize: (width > 375) ? 22 : 18,
           flex: 1,
           textAlign: 'center',
       },
       containerBtnLogout: {
           height: (width > 375) ? 45 : 35,
           width: (width > 375) ? 45 : 35,
           alignItems: "center",
           borderRadius: 50,
           justifyContent: "center",
       },
       line: {
           borderWidth: 1,
           marginHorizontal: 30,
           marginTop: (width > 375) ? 40 : 20,
           marginBottom: 40,
       },
       segmentedControl: {
           marginHorizontal: 30,
           marginBottom: 30,
           height: 40,
       },
       listContainer: {
           paddingBottom: 150,
       },
       containerOrderItem: {
           flexDirection: "row",
           marginHorizontal: 30,
           marginBottom: 22,
           backgroundColor: 'transparent',
           ...Platform.select({
               ios: {
                   shadowColor: '#000',
                   shadowOffset: { width: 0, height: 2 },
                   shadowOpacity: 0.1,
                   shadowRadius: 4,
               },
               android: {
                   elevation: 3,
               }
           }),
       },
       containerIconOrderItem: {
           width: (width > 375) ? 50 : 40,
           height: (width > 375) ? 50 : 40,
           alignItems: "center",
           justifyContent: "center",
           borderRadius: 25,
           marginRight: 20,
       },
       containerTextOrderItem: {
           flexDirection: "row",
           justifyContent: "space-between",
           alignItems: "center",
           flex: 1,
       },
       textOrderItem: {
           fontSize: (width > 375) ? 18 : 16,
           fontWeight: '500',
       },
       textOrderItemName: {
           fontSize: (width > 375) ? 14 : 12,
       },
        textOrderItemName:{
            color:"#A2A2A7",
            fontSize: (width > 375) ? 14 : 12,
        },
        listOrder:{
            height: "auto", 
            marginBottom: 300
        },
        containerBtnStyle:{
            borderWidth: 1,
            marginLeft: 30,
            marginRight:30,
            flexDirection : "row",
            borderRadius: 50,
            height: 35,
            marginBottom: 30
        },
        containerTextClear:{
            width: "50%",
            alignItems: "center", 
            flexDirection: "row",
            paddingLeft: 30,
            paddingTop:5,
            paddingBottom:5,
        },
        TextClear:{
            color: "white",
            fontSize: (width > 375) ? 16 : 13,
            marginLeft: 15,
            color: "#0066FF"
        },
        containerTextDark:{
            width: "50%",
            alignItems: "center",
            flexDirection: "row",
            paddingLeft: 30,
            paddingBottom: 5,
            paddingTop:5,
        },
        textDark:{
            color: "white",
            fontSize: (width > 375) ? 16 : 13,
            marginLeft: 15
        },
        borderBlueLeft:{
            position: "absolute",
            height: 36,
            borderWidth: 2,
            width: "50%",
            left: -2,
            top: -2,
            borderRadius: 50
        },
        borderBlueRight:{
            position: "absolute",
            height: 36,
            borderWidth: 2,
            width: "50%",
            right: -2,
            top: -2,
            borderRadius: 50
        },
        rightActionsContainer: {
            flexDirection: 'row',
            marginRight: 30,
        },
        rightAction: {
            marginLeft: 10,
        },
        actionButton: {
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
        }
        
    })
}


export default ContentOrder