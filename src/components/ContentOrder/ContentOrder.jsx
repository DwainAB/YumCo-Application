import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "../API/ApiService";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";
import { registerForPushNotificationsAsync, sendNotification } from '../Notifications/NotificationsOrder';
import { useWindowDimensions } from "react-native";
import { useLoading } from "../Hooks/useLoading";


function BasketScreen() {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [nameRestaurant, setNameRestaurant] = useState('');
    const [ordersAndClients, setOrdersAndClients] = useState([]);
    const [orderMethod, setOrderMehod] = useState('A emporter');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const navigation = useNavigation(); // Obtenez l'objet de navigation
    const { t } = useTranslation();
    const { colors } = useColors();
    const styles = useStyles();
    const [remove, setRemove] = useState(false);
    const { startLoading, stopLoading } = useLoading();

    useEffect(() => {
        if (expoPushToken) {
            updateNotificationToken(expoPushToken);
        }
    }, [expoPushToken]);

        // Fonction pour mettre à jour le token de notification de l'utilisateur
        const updateNotificationToken = async (token) => {
            try {
                const user = await AsyncStorage.getItem("user");
                const userObject = JSON.parse(user);
                const userId = userObject.id;
    
                const formData = new FormData();
                formData.append('id_notification', token);
    
                await apiService.updateUser(userId, formData);
                console.log('Notification token updated successfully');
            } catch (error) {
                console.error('Failed to update notification token:', error);
            }
        };

    const filterOrdersByMethod = (method) => {
        const filtered = ordersAndClients.filter(order => order.client_method === method);
        setFilteredOrders(filtered);
    };

    useEffect(() => {
        registerForPushNotificationsAsync()
            .then(token => {
                console.log('token notification :', token);
                setExpoPushToken(token);
            })
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        filterOrdersByMethod(orderMethod);
    }, [ordersAndClients, orderMethod]);

    useEffect(() => {
        const fetchRefRestaurant = async () => {
            try {
                const user = await AsyncStorage.getItem("user");
                const userObject = JSON.parse(user);
                const nameRestaurant = userObject.ref_restaurant;
                setNameRestaurant(nameRestaurant);
            } catch (error) {
                console.error('Erreur lors de la récupération de ref_restaurant depuis le stockage:', error);
            }
        };
        fetchRefRestaurant();
    }, []);

    useEffect(() => {
        if (nameRestaurant) {
            fetchOrdersAndClients();
        }
    }, [nameRestaurant]);

    const refreshOrder = () => {
        fetchOrdersAndClients();
        alert('Commandes mis à jour');
    };

    const fetchOrdersAndClients = async () => {
        try {
            const fetchedUsers = await apiService.getAllOrdersAndClients(nameRestaurant);
            setOrdersAndClients(fetchedUsers);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error.message);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchOrdersAndClients();
        });
        return unsubscribe;
    }, [nameRestaurant, navigation]);

    const calculateAndFormatTotalPrice = (order) => {
        let totalPrice = 0;
        order.orders.forEach((product) => {
            totalPrice += product.product_price * product.order_quantity;
        });

        if (typeof totalPrice !== 'number' || isNaN(totalPrice)) {
            return 'Prix invalide';
        }

        const roundedPrice = Math.round(totalPrice * 100) / 100;
        return `${roundedPrice.toFixed(2)} €`;
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
            const order = ordersAndClients.find(order => order.client_id === orderId);
            if (order) {
                startLoading();
                try {
                    await apiService.deleteClient(
                        order.client_id,
                        order.client_ref_order,
                        order.client_lastname,
                        order.client_firstname,
                        order.client_email,
                        order.client_method,
                        nameRestaurant
                    );
                    console.log('Deleted order:', orderId);
                } catch (error) {
                    console.error('Failed to delete order:', orderId, error);
                } finally {
                    stopLoading();
                }
            }
        }
        setRemove(false);
        fetchOrdersAndClients();
        setSelectedOrders([]);
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
                ):
                <TouchableOpacity onPress={()=> ModeremoveOrder()} style={styles.containerBtnRemove}>
                    <Text>
                        <Ionicons size={30} color={colors.colorRed} name="trash-outline"/>
                    </Text>
                </TouchableOpacity>
                }

                <Text style={[styles.textHeaderSetting, {color: colors.colorText}]}>{t('titleOrder')}</Text>
                <TouchableOpacity onPress={() => refreshOrder()} style={[styles.containerBtnLogout, , {backgroundColor: colors.colorBorderAndBlock}]}>
                    <Ionicons name="reload-outline" size={25} color={colors.colorText}/>
                </TouchableOpacity>
            </View>
            <View style={[styles.line, {borderColor: colors.colorDetail}]}></View>

            {remove === true ? (<View><TouchableOpacity onPress={removeItems} style={{backgroundColor: colors.colorRed, marginHorizontal: 30, height: 40, borderRadius: 10, justifyContent: "center", alignItems:"center", marginBottom: 30}}><Text style={{color: colors.colorText, fontSize: 18}}>Supprimer</Text></TouchableOpacity></View>) : ''}
            <View style={[styles.containerBtnStyle, {borderColor: colors.colorText}]}>
            <View style={[orderMethod === "A emporter" ? styles.borderBlueLeft : styles.borderBlueRight, {borderColor: colors.colorAction}]}></View>
                <TouchableOpacity style={styles.containerTextClear} onPress={() => setOrderMehod("A emporter")}>
                    <Ionicons style={{fontSize:20, color: orderMethod === "A emporter" ? colors.colorAction : colors.colorText}} name="bag-handle-outline"/>
                    <Text style={[styles.TextClear, {color: orderMethod === "A emporter" ? colors.colorAction : colors.colorText}]}>{t('takeaway')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.containerTextDark} onPress={() => setOrderMehod("Livraison")}>
                    <Ionicons style={{fontSize:20, color: orderMethod === "Livraison" ? colors.colorAction : colors.colorText}} name="bicycle-outline"/>
                    <Text style={[styles.textDark, { color: orderMethod === "Livraison" ? colors.colorAction : colors.colorText }]}>{t('delivery')}</Text>
                </TouchableOpacity>
            </View>

                <ScrollView>
                    <View style={styles.listOrder}>

                    {
                        remove === false ? (
                            Array.isArray(filteredOrders) && filteredOrders.map((order) => {
                                return (
                                    <TouchableOpacity onPress={() => navigation.navigate('OrderSelect', { order })} key={order.client_id} style={styles.containerOrderItem}>
                                        <View style={[styles.containerIconOrderItem, {backgroundColor: colors.colorText}]}>
                                            {order.client_method === "A emporter" ? (
                                                <Ionicons size={28} color={colors.colorAction} name="bag-handle-outline"/>
                                            ) : (
                                                <Ionicons size={28} color={colors.colorAction} name="bicycle-outline"/>
                                            )}
                                        </View>
                                        <View style={styles.containerTextOrderItem}>
                                            <View>
                                                <Text style={[styles.textOrderItem, {color: colors.colorText}]}>{order.client_ref_order}</Text>
                                                <Text style={[styles.textOrderItemName, {color: colors.colorDetail}]}>{order.client_lastname} {order.client_firstname}</Text>
                                            </View>
                                            <View>
                                                <Text style={[styles.textOrderItem, {color: colors.colorText}]}>{calculateAndFormatTotalPrice(order)}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        ) : (
                            Array.isArray(filteredOrders) && filteredOrders.map((order) => {
                                return (
                                    <TouchableOpacity onPress={() => updateSelectedOrders(order.client_id)} key={order.client_id} style={[styles.containerOrderItem, {backgroundColor: selectedOrders.includes(order.client_id) ? colors.colorAction : 'transparent', borderRadius: 30}]}>

                                        <View style={[styles.containerIconOrderItem, {backgroundColor: colors.colorText}]}>
                                            {order.client_method === "A emporter" ? (
                                                <Ionicons size={28} color={colors.colorAction} name="bag-handle-outline"/>
                                            ) : (
                                                <Ionicons size={28} color={colors.colorAction} name="bicycle-outline"/>
                                            )}
                                        </View>
                                        <View style={styles.containerTextOrderItem}>
                                            <View>
                                                <Text style={[styles.textOrderItem, {color: colors.colorText}]}>{order.client_ref_order}</Text>
                                                <Text style={[styles.textOrderItemName, {color: colors.colorDetail}]}>{order.client_lastname} {order.client_firstname}</Text>
                                            </View>
                                            <View>
                                                <Text style={[styles.textOrderItem, {color: colors.colorText}]}>{calculateAndFormatTotalPrice(order)} €</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        )
                    }


                    </View>
                </ScrollView>



        </View>
    )
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


export default BasketScreen