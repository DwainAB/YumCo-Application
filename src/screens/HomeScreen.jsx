import React, {useEffect, useState} from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useColors } from "../components/ColorContext/ColorContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { apiService } from "../components/API/ApiService";

function HomeScreen(){
    const { colors } = useColors()
    const [nameUser, setNameUser] = useState('')
    const navigation = useNavigation(); // Obtenez l'objet de navigation
    const { t } = useTranslation();
    const [nameRestaurant, setNameRestaurant] = useState('');
    const [ordersAndClients, setOrdersAndClients] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    //Récupère le nom du restaurant et le stock dans nameRestaurant
    useEffect(() => {
        const fetchNameUser = async () => {
            try {
                const user = await AsyncStorage.getItem("user");
                const userObject = JSON.parse(user); // Convertir la chaîne JSON en objet JavaScript
                const nameUser = userObject.firstname; // Récupérer la valeur de ref_restaurant
                const nameRestaurant = userObject.ref_restaurant;
                setNameRestaurant(nameRestaurant);
                setNameUser(nameUser);
            } catch (error) {
                console.error('Erreur lors de la récupération de ref_restaurant depuis le stockage:', error);
            }
        };
        fetchNameUser();
    }, []);

    useEffect(() => {
        if (nameRestaurant) {
            fetchOrdersAndClients();

            // Démarrez un intervalle pour rappeler fetchOrdersAndClients toutes les minutes
            const interval = setInterval(fetchOrdersAndClients, 60000); // 60000 millisecondes = 1 minute
            // Nettoyer l'intervalle lors du démontage du composant
            return () => clearInterval(interval);
        }
    }, [nameRestaurant]);

    useEffect(() => {
        if (ordersAndClients.length > 0) {
            calculateTotalPrice();
        }
    }, [ordersAndClients]);

    const fetchOrdersAndClients = async () => {
        try {
            const fetchedUsers = await apiService.getAllOrdersAndClientsData(nameRestaurant);
            setOrdersAndClients(fetchedUsers); 
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error.message);
        }
    };

    const calculateTotalPrice = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // Les mois commencent à partir de 0 dans JavaScript
        const currentYear = currentDate.getFullYear();
    
        const total = ordersAndClients.reduce((acc, orderAndClient) => {
            orderAndClient.orders.forEach(order => {
                const orderDate = new Date(order.order_date);
                const orderMonth = orderDate.getMonth() + 1;
                const orderYear = orderDate.getFullYear();
    
                if (orderMonth === currentMonth && orderYear === currentYear) {
                    acc += order.product_price * order.order_quantity;
                }
            });
            return acc;
        }, 0);
        
        setTotalPrice(total.toFixed(2)); // Arrondi à 2 décimales
    };
    
    const findLastOrderedPerson = () => {
        let maxClientId = -1;
        let lastOrderedPerson = null;
    
        ordersAndClients.forEach(orderAndClient => {
            if (orderAndClient.client_id > maxClientId) {
                maxClientId = orderAndClient.client_id;
                lastOrderedPerson = {
                    firstName: orderAndClient.client_firstname,
                    lastName: orderAndClient.client_lastname
                };
            }
        });
    
        return lastOrderedPerson;
    };
    
    // Appeler la fonction pour obtenir les données du dernier client ayant commandé
    const lastOrderedPerson = findLastOrderedPerson();
    const lastOrderedPersonName = lastOrderedPerson ? `${lastOrderedPerson.firstName} ${lastOrderedPerson.lastName}` : '';
    return(
        <View style={[styles.containerHome, {backgroundColor: colors.colorBackground }]}>
            <ScrollView>
                    <Text style={[styles.titleScreen, { color: colors.colorText }]}>{t('titleScreen')}</Text>
                    <View style={styles.line}></View>


                    <Text style={[styles.textHello, {color: colors.colorText}]}>{t('greeting')} {nameUser} !</Text>

                    <View style={[styles.containerStats, {backgroundColor: colors.colorBorderAndBlock}]}>

                        <View style={styles.containerTopStats}>
                            <Text style={[styles.titleStats, {color: colors.colorText}]}>{t('homeStat')}</Text>
                            <View style={[styles.containerPriceStats, {backgroundColor: colors.colorBackground}]}><Text style={[styles.titleStats, {color: colors.colorText}]}>{totalPrice} €</Text></View>
                        </View>

                        <TouchableOpacity onPress={()=> navigation.navigate('StatOptionScreen')} style={[styles.containerBtnStats, {backgroundColor: colors.colorAction}]}><Text style={[styles.textBtnStats, {color: colors.colorText}]}>{t('seeMore')}</Text></TouchableOpacity>
                        <View style={styles.containerLastOrder}>
                            <Text style={[styles.textLastOrder, {color: colors.colorText}]}>{t('lastOrder')}</Text>
                            <Text style={[styles.textLastOrder, {color: colors.colorDetail}]}>{lastOrderedPersonName}</Text>
                        </View>
                    </View> 



                    <View style={styles.containerHomeBottom}>

                        <View style={[styles.containerReview, {backgroundColor: colors.colorBorderAndBlock}]}>
                            <Text style={[styles.titleReview, {color: colors.colorText}]}>{t('titleReview')}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Review')}><Ionicons name="chatbox-outline" style={{fontSize: 70, color: colors.colorAction}}/></TouchableOpacity>
                        </View>
                        <View style={[styles.containerReview, {backgroundColor: colors.colorBorderAndBlock}]}>
                            <Text style={[styles.titleReview, {color: colors.colorText}]}>{t('updateApp')}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('LanguagePage')}><Ionicons name="alert-circle-outline" style={{fontSize: 70, color: colors.colorAction}}/></TouchableOpacity>
                        </View>

                    </View>

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    containerHome:{
        height: "100%"
    },
    titleScreen:{
        fontSize: 22,
        textAlign: 'center',
        marginTop: 70   
    },
    containerStats:{
        marginLeft: 30,
        marginRight: 30,
        height: 200,
        marginTop: 50,
        borderRadius: 15,
        padding: 20, 
        position: "relative"
    },
    containerHomeBottom:{
        flexDirection: "row",
        marginLeft: 30,
        marginRight: 30,
        justifyContent: 'space-between',
        marginTop: 50
    },
    containerReview:{
        height: 150, 
        width: 150,
        borderRadius: 15,
        padding: 10,
        position: "relative",
        justifyContent: 'center',
        alignItems: "center"
    },
    textHello:{
        marginLeft: 30,
        fontSize: 35,
        fontWeight: "500",
        marginTop: 50
    },
    line:{
        borderWidth:1,
        marginLeft: 30,
        marginRight:30,
        borderColor: "#232533",
        marginTop: 40,
    },
    titleStats:{
        fontSize: 20,
        fontWeight: "500",
    },
    containerBtnStats:{
        height: 40, 
        width: 130,
        justifyContent: "center",
        alignItems: "center", 
        borderRadius: 15, 
        position: "absolute",
        bottom: 20,
        right: 20
    },
    containerTopStats:{
        flexDirection: "row",
        justifyContent: 'space-between'
    },
    containerPriceStats:{
        height: 50,
        width: "auto",
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 15
    }, 
    containerLastOrder:{
        position: "absolute", 
        bottom: 20,
        left: 20
    }, 
    textLastOrder:{
        fontSize: 16
    },
    titleReview:{
        position: "absolute",
        top: 10,
        left: 10,
        fontSize: 20,
        fontWeight: "500",
    }

})


export default HomeScreen