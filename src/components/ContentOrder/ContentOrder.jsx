import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";
import { registerForPushNotificationsAsync } from '../Notifications/NotificationsOrder';
import { useWindowDimensions } from "react-native";
import { useLoading } from "../Hooks/useLoading";
import Constants from 'expo-constants';


function ContentOrder() {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [orders, setOrders] = useState([]);
    const [orderMethod, setOrderMethod] = useState('PICKUP');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const navigation = useNavigation(); 
    const { t } = useTranslation();
    const { colors } = useColors();
    const styles = useStyles();
    const [remove, setRemove] = useState(false);
    const { startLoading, stopLoading } = useLoading();
    const [restaurantId, setRestaurantId] = useState('');
    const [userId, setUserId] = useState('')
    const SUPABASE_ANON_KEY = Constants.expoConfig.extra.supabaseAnonKey;;


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
                setUserId(ownerData.id)
                
                
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
            order.type === method && order.status !== "COMPLETED"
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

    const refreshOrders = () => {
        fetchOrders();
        alert('Commandes mises à jour');
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
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [restaurantId]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchOrders();
        });
        return unsubscribe;
    }, [navigation]);

    const calculateAndFormatTotalPrice = (order) => {
        return `${order.amount_total.toFixed(2)} €`;
    };

    const [selectedOrders, setSelectedOrders] = useState([]);

    const updateSelectedOrders = (id) => {
        setSelectedOrders((prevSelectedOrders) => {
            if (prevSelectedOrders.includes(id)) {
                return prevSelectedOrders.filter(orderId => orderId !== id);
            } else {
                return [...prevSelectedOrders, id];
            }
        });
    };

    const ModeremoveOrder = () => {
        setRemove(!remove);
    };

    const removeItems = async () => {
        for (let orderId of selectedOrders) {
            startLoading();
            try {
                // Implement your delete logic here for the new API
                console.log('Deleted order:', orderId);
            } catch (error) {
                console.error('Failed to delete order:', orderId, error);
            } finally {
                stopLoading();
            }
        }
        setRemove(false);
        fetchOrders();
        setSelectedOrders([]);
    };

    const formatOrderForDetails = (order) => {
        console.log(order.payment_method);
        
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

    return(
        <View style={styles.containerScreenBasket}>
            <View style={styles.containerHeaderSetting}>
                {remove === false ? (
                    <TouchableOpacity onPress={()=> ModeremoveOrder()} style={styles.containerBtnRemove}>
                        <Text>
                            <Ionicons size={30} color={colors.colorText} name="trash-outline"/>
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={()=> ModeremoveOrder()} style={styles.containerBtnRemove}>
                        <Text>
                            <Ionicons size={30} color={colors.colorRed} name="trash-outline"/>
                        </Text>
                    </TouchableOpacity>
                )}

                <Text style={[styles.textHeaderSetting, {color: colors.colorText}]}>{t('titleOrder')}</Text>
                <TouchableOpacity onPress={() => refreshOrders()} style={[styles.containerBtnLogout, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <Ionicons name="reload-outline" size={25} color={colors.colorText}/>
                </TouchableOpacity>
            </View>
            <View style={[styles.line, {borderColor: colors.colorDetail}]}></View>

            {remove === true ? (
                <View>
                    <TouchableOpacity onPress={removeItems} style={{backgroundColor: colors.colorRed, marginHorizontal: 30, height: 40, borderRadius: 10, justifyContent: "center", alignItems:"center", marginBottom: 30}}>
                        <Text style={{color: colors.colorText, fontSize: 18}}>Supprimer</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            <View style={[styles.containerBtnStyle, {borderColor: colors.colorText}]}>
                <View style={[orderMethod === "PICKUP" ? styles.borderBlueLeft : styles.borderBlueRight, {borderColor: colors.colorAction}]}></View>
                <TouchableOpacity style={styles.containerTextClear} onPress={() => setOrderMethod("PICKUP")}>
                    <Ionicons style={{fontSize:20, color: orderMethod === "PICKUP" ? colors.colorAction : colors.colorText}} name="bag-handle-outline"/>
                    <Text style={[styles.TextClear, {color: orderMethod === "PICKUP" ? colors.colorAction : colors.colorText}]}>{t('takeaway')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.containerTextDark} onPress={() => setOrderMethod("DELIVERY")}>
                    <Ionicons style={{fontSize:20, color: orderMethod === "DELIVERY" ? colors.colorAction : colors.colorText}} name="bicycle-outline"/>
                    <Text style={[styles.textDark, { color: orderMethod === "DELIVERY" ? colors.colorAction : colors.colorText }]}>{t('delivery')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView>
                <View style={styles.listOrder}>
                    {remove === false ? (
                        Array.isArray(filteredOrders) && filteredOrders.map((order) => (
                            <TouchableOpacity     onPress={() => navigation.navigate('OrderSelect', { order: formatOrderForDetails(order)})}  key={order.id} style={styles.containerOrderItem}>
                                <View style={[styles.containerIconOrderItem, {backgroundColor: colors.colorText}]}>
                                    {order.type === "PICKUP" ? (
                                        <Ionicons size={28} color={colors.colorAction} name="bag-handle-outline"/>
                                    ) : (
                                        <Ionicons size={28} color={colors.colorAction} name="bicycle-outline"/>
                                    )}
                                </View>
                                <View style={styles.containerTextOrderItem}>
                                    <View>
                                        <Text style={[styles.textOrderItem, {color: colors.colorText}]}>{order.order_number}</Text>
                                        <Text style={[styles.textOrderItemName, {color: colors.colorDetail}]}>
                                            {order.customers.last_name} {order.customers.first_name}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.textOrderItem, {color: colors.colorText}]}>
                                            {calculateAndFormatTotalPrice(order)}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        Array.isArray(filteredOrders) && filteredOrders.map((order) => (
                            <TouchableOpacity onPress={() => updateSelectedOrders(order.id)} key={order.id} 
                                style={[styles.containerOrderItem, {
                                    backgroundColor: selectedOrders.includes(order.id) ? colors.colorAction : 'transparent',
                                    borderRadius: 30
                                }]}>
                                <View style={[styles.containerIconOrderItem, {backgroundColor: colors.colorText}]}>
                                    {order.type === "PICKUP" ? (
                                        <Ionicons size={28} color={colors.colorAction} name="bag-handle-outline"/>
                                    ) : (
                                        <Ionicons size={28} color={colors.colorAction} name="bicycle-outline"/>
                                    )}
                                </View>
                                <View style={styles.containerTextOrderItem}>
                                    <View>
                                        <Text style={[styles.textOrderItem, {color: colors.colorText}]}>{order.order_number}</Text>
                                        <Text style={[styles.textOrderItemName, {color: colors.colorDetail}]}>
                                            {order.customers.last_name} {order.customers.first_name}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.textOrderItem, {color: colors.colorText}]}>
                                            {calculateAndFormatTotalPrice(order)}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}


function useStyles(){
    const {width, height} = useWindowDimensions();

    return StyleSheet.create({
        containerHeaderSetting:{
            justifyContent: "space-between", 
            flexDirection:"row",
            marginTop : (width > 375) ? 60 : 40,
            paddingRight: 35,
            paddingLeft : 35,
            alignItems:'center',
        },
        containerBtnRemove:{

            height:(width > 375) ? 55 : 35,
            width: (width > 375) ? 55 : 35,
            alignItems: "center",
            borderRadius: 50,
            backgroundColor: "#1E1E2D",
            justifyContent: "center",
        },
        textHeaderSetting:{
            fontSize: (width > 375) ? 22 : 18,
            color: "white",
        },
        containerBtnLogout:{
            height:(width > 375) ? 45 : 35,
            width: (width > 375) ? 45 : 35,
            alignItems: "center",
            borderRadius: 50,
            backgroundColor: "#1E1E2D",
            justifyContent: "center",
            paddingLeft: 5
        },
        containerEmpty:{
            width: "10%",
        },
        line:{
            borderWidth:1,
            marginLeft: 30,
            marginRight:30,
            marginTop: (width > 375) ? 40 : 20,
            marginBottom: 40
        },
        containerOrderItem:{
            flexDirection: "row",
            marginRight: 30,
            marginLeft: 30,
            marginBottom:22
        },
        containerTextOrderItem:{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center" ,
            width: "80%"
        },
        containerIconOrderItem:{
            backgroundColor: "white",
            width: (width > 375) ? 50 : 40,
            height: (width > 375) ? 50 : 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 25,
            marginRight: 20
        },
        textOrderItem:{
            fontSize: (width > 375) ? 18 : 16,
            color:"white"
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
    
        
    })
}


export default ContentOrder