import React, {useEffect, useState} from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useColors } from "../components/ColorContext/ColorContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";

function HomeScreen(){
    const { colors } = useColors();
    const [nameUser, setNameUser] = useState('');
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [restaurantId, setRestaurantId] = useState('');
    const [orders, setOrders] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [lastOrderPerson, setLastOrderPerson] = useState({ firstName: '', lastName: '' });
    const styles = useStyles();
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho"
    const [orderStats, setOrderStats] = useState({
        currentMonth: { orderCount: 0, totalRevenue: 0 },
        previousMonth: { orderCount: 0, totalRevenue: 0 },
        changes: { orderPercentage: 0, revenuePercentage: 0 }
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const owner = await AsyncStorage.getItem("owner");
                const ownerData = JSON.parse(owner);                
                setRestaurantId(ownerData.restaurantId);
                setNameUser(ownerData.first_name);
                
            } catch (error) {
                console.error('Erreur lors de la récupération des informations utilisateur:', error);
            }
        };
        fetchUserInfo();
    }, []);

    // Récupère les commandes
    const fetchOrders = async () => {
        try {
            const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/getRestaurantOrders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    restaurant_id: restaurantId
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data.success && data.data) {
                
                // Filtrer les commandes du mois en cours
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();

                const currentMonthOrders = data.data.filter(order => {
                    const orderDate = new Date(order.created_at);
                    return orderDate.getMonth() === currentMonth && 
                           orderDate.getFullYear() === currentYear;
                });

                setOrders(currentMonthOrders);
                calculateTotalPrice(currentMonthOrders);
                findLastOrderedPerson(data.data);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes:', error);
        }
    };

    const fetchOrderStats = async () => {
        try {
            const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/getOrdersStats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    restaurant_id: restaurantId
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data.success && data.data) {
                setOrderStats(data.data);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
        }
    };



    useEffect(() => {
        if (restaurantId) {
            fetchOrders();
            fetchOrderStats(); // Ajoutez cet appel
            const interval = setInterval(() => {
                fetchOrders();
                fetchOrderStats(); // Ajoutez cet appel
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [restaurantId]);

    const calculateTotalPrice = (monthOrders) => {
        const total = monthOrders.reduce((acc, order) => {
            return acc + order.amount_total;
        }, 0);
        
        setTotalPrice(total.toFixed(2));
    };
    
    const findLastOrderedPerson = (allOrders) => {
        if (allOrders && allOrders.length > 0) {
            // Trier les commandes par date de création (la plus récente en premier)
            const sortedOrders = [...allOrders].sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );

            const lastOrder = sortedOrders[0];
            setLastOrderPerson({
                firstName: lastOrder.customers.first_name,
                lastName: lastOrder.customers.last_name
            });
        }
    };

    return(
        <View style={[styles.containerHome, {backgroundColor: colors.colorBackground }]}>
            <ScrollView>
                <Text style={[styles.titleScreen, { color: colors.colorText }]}>{t('titleScreen')}</Text>
                <View style={styles.line}></View>

                <Text style={[styles.textHello, {color: colors.colorText}]}>{t('greeting')} {nameUser} !</Text>

                <View style={[styles.containerStats, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.containerTopStats}>
                        <Text style={[styles.titleStats, {color: colors.colorText}]}>{t('homeStat')}</Text>
                        <View style={[styles.containerPriceStats, {backgroundColor: colors.colorBackground}]}>
                            <Text style={[styles.titleStats, {color: colors.colorText}]}>{totalPrice} €</Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        onPress={() => navigation.navigate('StatOptionScreen')} 
                        style={[styles.containerBtnStats, {backgroundColor: colors.colorAction}]}
                    >
                        <Text style={[styles.textBtnStats, {color: colors.colorText}]}>{t('seeMore')}</Text>
                    </TouchableOpacity>

                    <View style={styles.containerLastOrder}>
                        <Text style={[styles.textLastOrder, {color: colors.colorText}]}>{t('lastOrder')}</Text>
                        <Text style={[styles.textLastOrder, {color: colors.colorDetail}]}>
                            {lastOrderPerson.firstName} {lastOrderPerson.lastName}
                        </Text>
                    </View>
                </View>

                <View style={styles.containerHomeBottom}>
                    <View style={[styles.containerReview, {backgroundColor: colors.colorBorderAndBlock}]}>
                        <Text style={[styles.titleReview, {color: colors.colorText}]}>{t('orders')}</Text>
                        <Text style={[styles.statValue, {color: colors.colorAction}]}>
                            {orderStats.changes.orderPercentage > 0 ? '+' : ''}
                            {orderStats.changes.orderPercentage}%
                        </Text>
                        <Text style={[styles.statDetail, {color: colors.colorText}]}>
                            {t('SinceLastMonth')}
                        </Text>
                    </View>
                    
                    <View style={[styles.containerReview, {backgroundColor: colors.colorBorderAndBlock}]}>
                        <Text style={[styles.titleReview, {color: colors.colorText}]}>{t('revenue')}</Text>
                        <Text style={[styles.statValue, {color: colors.colorAction}]}>
                            {orderStats.changes.revenuePercentage > 0 ? '+' : ''}
                            {orderStats.changes.revenuePercentage}%
                        </Text>
                        <Text style={[styles.statDetail, {color: colors.colorText}]}>
                            {t('SinceLastMonth')}
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

function useStyles(){

    const {width, height} = useWindowDimensions();

    return StyleSheet.create({
        containerHome:{
            height: "100%"
        },
        titleScreen:{
            fontSize: (width > 375) ? 22 : 18,
            textAlign: 'center',
            marginTop: (height > 750) ? 70 : 40,   
        },
        containerStats:{
            marginLeft: 30,
            marginRight: 30,
            height: (width > 375) ? 200 : 150,
            marginTop: (height > 750) ? 50 : 30,
            borderRadius: 15,
            padding: 20, 
            position: "relative"
        },
        containerHomeBottom:{
            flexDirection: "row",
            marginLeft: 30,
            marginRight: 30,
            justifyContent: 'space-between',
            marginTop: (height > 750) ? 50 : 30,
        },
        containerReview:{
            height: (width > 375) ? 150 : 120, 
            width: (width > 375) ? 150 : 120,
            borderRadius: 15,
            padding: 10,
            position: "relative",
            justifyContent: 'center',
            alignItems: "center"
        },
        textHello:{
            marginLeft: 30,
            fontSize: (width > 375) ? 35 : 25,
            fontWeight: "500",
            marginTop: (height > 750) ? 50 : 30,
        },
        line:{
            borderWidth:1,
            marginLeft: 30,
            marginRight:30,
            borderColor: "#232533",
            marginTop: (height > 750) ? 40 : 20,
        },
        titleStats:{
            fontSize: (width > 375) ? 20 : 18,
            fontWeight: "500",
        },
        containerBtnStats:{
            height: (width > 375) ? 40 : 30, 
            width: 'auto',
            paddingHorizontal: 20,
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
            height: (width > 375) ? 50 : 40,
            width: "auto",
            padding: 10,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 15,
        }, 
        containerLastOrder:{
            position: "absolute", 
            bottom: 20,
            left: 20
        }, 
        textLastOrder:{
            fontSize: (width > 375) ? 16 : 13,
        },
        titleReview:{
            position: "absolute",
            top: 10,
            left: 10,
            fontSize: (width > 375) ? 20 : 16,
            fontWeight: "500",
        },
        iconStat:{
            fontSize: (width > 375) ? 70 : 50,
        },
        containerReview:{
            height: (width > 375) ? 150 : 120, 
            width: (width > 375) ? 150 : 120,
            borderRadius: 15,
            padding: 10,
            position: "relative",
            justifyContent: 'space-between', 
            alignItems: "center",
            paddingVertical: 20 
        },
        titleReview:{
            fontSize: (width > 375) ? 18 : 14,
            fontWeight: "500",
        },
        statValue:{
            fontSize: (width > 375) ? 28 : 22,
            fontWeight: "bold",
            marginVertical: 10 
        },
        statDetail:{
            fontSize: (width > 375) ? 14 : 12,
            textAlign: 'center'
        }
    });
}

export default HomeScreen;