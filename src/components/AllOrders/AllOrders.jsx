import React, { useState, useEffect }  from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, RefreshControl, Modal, Platform } from "react-native";
import { GestureHandlerRootView, FlatList, Swipeable } from 'react-native-gesture-handler';
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

function AllOrders({ refreshCounter, onRefresh }) {
   const [orders, setOrders] = useState([]);
   const [groupedOrders, setGroupedOrders] = useState({});
   const [selectedMonthOrders, setSelectedMonthOrders] = useState([]);
   const [restaurantId, setRestaurantId] = useState(null)
   const [modalVisible, setModalVisible] = useState(false);
   const [selectedMonthLabel, setSelectedMonthLabel] = useState('');
   const [refreshing, setRefreshing] = useState(false);
   const navigation = useNavigation();
   const { t } = useTranslation();
   const { colors } = useColors();
   const styles = useStyles();
   const route = useRoute();
   const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho"

   useEffect(() => {
       if (route.params?.triggerRefresh) {
           fetchOrders();
       }
   }, [route.params?.triggerRefresh]);

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

   const fetchOrders = async () => {
       try {
           const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/getRestaurantOrders', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
               },
               body: JSON.stringify({
                   restaurant_id: restaurantId
               })
           });

           const data = await response.json();
           if (data.success && data.data) {
               setOrders(data.data);
               groupOrdersByMonth(data.data);
               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
           }
       } catch (error) {
           console.error('Erreur:', error);
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
       }
   };

   useEffect(() => {
       fetchOrders();
   }, [restaurantId]);

   const onRefreshList = async () => {
       setRefreshing(true);
       await fetchOrders();
       setRefreshing(false);
   };

   const groupOrdersByMonth = (ordersData) => {
       const grouped = ordersData.reduce((acc, order) => {
           const date = new Date(order.created_at);
           const monthKey = `${date.getMonth()}-${date.getFullYear()}`;
           const monthNames = [
               'january', 'february', 'march', 'april', 'may', 'june',
               'july', 'august', 'september', 'october', 'november', 'december'
           ];
           const monthLabel = `${t(monthNames[date.getMonth()])} ${date.getFullYear()}`;
           
           if (!acc[monthKey]) {
               acc[monthKey] = { label: monthLabel, orders: [] };
           }
           acc[monthKey].orders.push(order);
           return acc;
       }, {});

       const sortedGrouped = Object.fromEntries(
           Object.entries(grouped).sort(([keyA], [keyB]) => {
               const [monthA, yearA] = keyA.split('-');
               const [monthB, yearB] = keyB.split('-');
               return yearB - yearA || monthB - monthA;
           })
       );

       setGroupedOrders(sortedGrouped);
   };

   const handleMonthSelect = (monthKey, monthLabel) => {
       setSelectedMonthOrders(groupedOrders[monthKey].orders);
       setSelectedMonthLabel(monthLabel);
       setModalVisible(true);
   };

   const calculateTotalPrice = (order) => {
       return order.amount_total.toFixed(2);
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
        <View style={styles.actionsContainer}>
            <Animated.View style={[styles.rightAction, { transform: [{ scale }] }]}>
                <TouchableOpacity
                    onPress={async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        try {
                            const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/updateOrder', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                                },
                                body: JSON.stringify({
                                    order_id: order.id,
                                    new_status: 'COMPLETED'
                                })
                            });
                            if (response.ok) {
                                fetchOrders();
                                setModalVisible(false);
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            }
                        } catch (error) {
                            console.error(error);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        }
                    }}
                    style={[styles.actionButton, { backgroundColor: colors.colorRed }]}
                >
                    <Ionicons name="trash-outline" size={24} color="white" />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

   const renderOrderItem = ({ item: order }) => (
       <Swipeable
           friction={2}
           leftThreshold={80}
           rightThreshold={40}
           renderRightActions={(progress, dragX) => 
               renderRightActions(progress, dragX, order)
           }
           onSwipeableWillOpen={() => Haptics.selectionAsync()}
       >
           <TouchableOpacity 
               onPress={() => {
                   setModalVisible(false);
                   navigation.navigate('OrderSelectData', { 
                       order: formatOrderForDetails(order)
                   });
               }}
               style={[styles.orderItem, {backgroundColor: colors.colorBackground}]}
           >
               <View style={[styles.orderIcon, { backgroundColor: colors.colorText }]}>
                   <Ionicons 
                       size={28} 
                       color={colors.colorAction} 
                       name="bag-handle-outline"
                   />
               </View>
               <View style={styles.orderDetails}>
                   <View>
                       <Text style={[styles.orderNumber, { 
                           color: colors.colorText 
                       }]}>
                           {order.order_number}
                       </Text>
                       <Text style={[styles.customerName, { 
                           color: colors.colorDetail 
                       }]}>
                           {order.customers.last_name} {order.customers.first_name}
                       </Text>
                   </View>
                   <Text style={[styles.orderPrice, { 
                       color: colors.colorText 
                   }]}>
                       {calculateTotalPrice(order)} €
                   </Text>
               </View>
           </TouchableOpacity>
       </Swipeable>
   );

   return (
       <GestureHandlerRootView style={styles.container}>
           <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
               <FlatList
                   data={Object.entries(groupedOrders)}
                   keyExtractor={([key]) => key}
                   renderItem={({item: [monthKey, { label, orders }]}) => (
                       <TouchableOpacity 
                           onPress={() => handleMonthSelect(monthKey, label)}
                           style={[styles.monthItem, { 
                               backgroundColor: colors.colorBackground 
                           }]}
                       >
                           <Text style={[styles.monthText, { 
                               color: colors.colorText 
                           }]}>
                               {t(label.toLowerCase())}
                           </Text>
                           <View style={styles.orderCount}>
                               <Text style={[styles.orderCountText, { 
                                   color: colors.colorDetail 
                               }]}>
                                   {orders.length} {orders.length > 1 ? 
                                       t('orders') : t('order')}
                               </Text>
                               <Text style={[styles.totalPrice, { 
                                   color: colors.colorDetail 
                               }]}>
                                   {orders.reduce((total, order) => 
                                       total + order.amount_total, 0
                                   ).toFixed(2)} €
                               </Text>
                           </View>
                       </TouchableOpacity>
                   )}
                   refreshControl={
                       <RefreshControl
                           refreshing={refreshing}
                           onRefresh={onRefreshList}
                           tintColor={colors.colorAction}
                       />
                   }
                   contentContainerStyle={styles.listContent}
               />

               <Modal
                   animationType="slide"
                   transparent={true}
                   visible={modalVisible}
                   onRequestClose={() => setModalVisible(false)}
               >
                   <View style={styles.modalContainer}>
                       <View style={[styles.modalContent, { 
                           backgroundColor: colors.colorBackground 
                       }]}>
                           <View style={styles.modalHeader}>
                               <Text style={[styles.modalTitle, { 
                                   color: colors.colorText 
                               }]}>
                                   {selectedMonthLabel}
                               </Text>
                               <TouchableOpacity 
                                   onPress={() => setModalVisible(false)}
                                   style={styles.closeButton}
                               >
                                   <Ionicons 
                                       name="close" 
                                       size={24} 
                                       color={colors.colorText}
                                   />
                               </TouchableOpacity>
                           </View>

                           <FlatList
                               data={selectedMonthOrders}
                               renderItem={renderOrderItem}
                               keyExtractor={item => item.id}
                               refreshControl={
                                   <RefreshControl
                                       refreshing={refreshing}
                                       onRefresh={onRefreshList}
                                       tintColor={colors.colorAction}
                                   />
                               }
                               contentContainerStyle={styles.modalScroll}
                           />
                       </View>
                   </View>
               </Modal>
           </View>
       </GestureHandlerRootView>
   );
}

function useStyles() {
   const { width, height } = useWindowDimensions();
   const { colors } = useColors();

   return StyleSheet.create({
       container: {
           flex: 1,
       },
       listContent: {
           paddingTop: 15,
           paddingBottom: 20,
       },
       monthItem: {
           flexDirection: 'row',
           justifyContent: 'space-between',
           alignItems: 'center',
           paddingVertical: 15,
           paddingHorizontal: 20,
           marginHorizontal: 20,
           marginVertical: 10,
           borderRadius: 15,
           ...Platform.select({
               ios: {
                   shadowColor: "#505050",
                   shadowOffset: { width: 0, height: 4 },
                   shadowOpacity: 0.35,
                   shadowRadius: 5.84,
               },
               android: {
                   elevation: 8,
               }
           }),
       },
       monthText: {
           fontSize: 18,
           fontWeight: '600',
           textTransform: 'capitalize',
       },
       orderCount: {
           flexDirection: 'column',
           alignItems: 'center',
           paddingVertical: 8,
           paddingHorizontal: 12,
           borderRadius: 20,
           ...Platform.select({
               ios: {
                   shadowColor: "#808080",
                   shadowOffset: { width: 0, height: 1 },
                   shadowOpacity: 0.2,
                   shadowRadius: 1.41,
               },
               android: {
                   elevation: 2,
               }
           }),
       },orderCountText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 2,
        textAlign: 'right',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: height * 0.7,
        paddingBottom: 30,
        height: 300
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    closeButton: {
        padding: 8,
    },
    modalScroll: {
        padding: 20,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        borderRadius: 12,
    },
    orderIcon: {
        width: width > 375 ? 50 : 40,
        height: width > 375 ? 50 : 40,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    orderDetails: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderNumber: {
        fontSize: width > 375 ? 18 : 15,
    },
    customerName: {
        fontSize: width > 375 ? 14 : 12,
    },
    orderPrice: {
        fontSize: width > 375 ? 18 : 15,
    },
    actionsContainer: {
        width: 70,
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 15,
    },
    actionButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
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
    rightAction: {
        alignItems: 'center',
    }
});
}

export default AllOrders;