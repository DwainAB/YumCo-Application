import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "../API/ApiService";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";

function BasketScreen() {
    const [nameRestaurant, setNameRestaurant] = useState('');
    const [ordersAndClients, setOrdersAndClients] = useState([]);
    const navigation = useNavigation(); // Obtenez l'objet de navigation
    const { t } = useTranslation();
    const { colors } = useColors()


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
        alert('Commandes mis à jour')
    }

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
            // Rechargez les commandes chaque fois que l'écran est mis au premier plan
            fetchOrdersAndClients();
        });
        // Retournez une fonction de nettoyage pour annuler l'écouteur
        return unsubscribe;
    }, [nameRestaurant, navigation]); // Écouter les changements de navigation

    // Fonction pour calculer le prix total d'une commande
    const calculateAndFormatTotalPrice = (order) => {
        let totalPrice = 0;
        order.orders.forEach((product) => {
            totalPrice += product.product_price * product.order_quantity;
        });
    
        // Vérifier si le prix est un nombre
        if (typeof totalPrice !== 'number' || isNaN(totalPrice)) {
            return 'Prix invalide';
        }
    
        // Arrondir le prix à deux décimales
        const roundedPrice = Math.round(totalPrice * 100) / 100;
    
        // Formater le prix avec deux décimales et le signe euro
        return roundedPrice.toFixed(2);
    };
    

    return(
        <View style={styles.containerScreenBasket}>
            <View style={styles.containerHeaderSetting}>
                <View style={styles.containerEmpty}></View>
                <Text style={[styles.textHeaderSetting, {color: colors.colorText}]}>{t('titleOrder')}</Text>
                <TouchableOpacity onPress={() => refreshOrder()} style={[styles.containerBtnLogout, , {backgroundColor: colors.colorBorderAndBlock}]}>
                    <Ionicons name="reload-outline" size={25} color={colors.colorText}/>
                </TouchableOpacity>
            </View>
            <View style={[styles.line, {borderColor: colors.colorDetail}]}></View>
                <ScrollView>
                    <View style={styles.listOrder}>

                    {Array.isArray(ordersAndClients) && ordersAndClients.map((order) => {
                        return(
                            <TouchableOpacity onPress={() => navigation.navigate('OrderSelect', { order })} key={order.client_id} style={styles.containerOrderItem}>
                                <View style={[styles.containerIconOrderItem , {backgroundColor: colors.colorText}]}>
                                    <Ionicons size={28} color={colors.colorAction} name="bag-handle-outline"/>
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
                    })}
                    </View>
                </ScrollView>
            
        </View>
    )
}

const styles = StyleSheet.create({
    containerHeaderSetting:{
        justifyContent: "space-between", 
        flexDirection:"row",
        marginTop : 60,
        paddingRight: 35,
        paddingLeft : 35,
        alignItems:'center',
    },
    textHeaderSetting:{
        fontSize: 22,
        color: "white",
    },
    containerBtnLogout:{
        height:45,
        width: 45,
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
        marginTop: 40,
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
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 25,
        marginRight: 20
    },
    textOrderItem:{
        fontSize: 18,
        color:"white"
    },
    textOrderItemName:{
        color:"#A2A2A7",
        fontSize: 14
    },
    listOrder:{
        height: "auto", 
        marginBottom: 300
    }

    
})

export default BasketScreen