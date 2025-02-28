import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useColors } from "../components/ColorContext/ColorContext";
import { useNavigation } from "@react-navigation/native";
import { useWindowDimensions } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';

function HomeScreen() {
    const { colors } = useColors();
    const navigation = useNavigation();
    const styles = useStyles();
    const [restaurantId, setRestaurantId] = useState('');
    const [userId, setUserId] = useState('');
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho";
    const [statOrder, setStatOrder] = useState(null);
    const [statRevenue, setStatRevenue] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    // Fixed data
    const currentDate = new Date();
    const dateOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    };
    const formattedDate = currentDate.toLocaleDateString('fr-FR', dateOptions);

    

    useEffect(() => {
        const fetchRestaurantId = async () => {
            try {
                const owner = await AsyncStorage.getItem("owner");
                const ownerData = JSON.parse(owner);                
                setRestaurantId(ownerData.restaurantId);
                setUserId(ownerData);
                console.log('est',ownerData);
            } catch (error) {
                console.error('Erreur lors de la récupération des informations utilisateur:', error);
            }
        };
        fetchRestaurantId();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            if (!restaurantId) return;

            try {
                setIsLoading(true);
                // Appel pour l'analyse des commandes
                const orderResponse = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/order_analysis', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${SUPABASE_ANON_KEY}` 
                    },
                    body: JSON.stringify({
                        restaurant_id: restaurantId
                    })
                });

                if (!orderResponse.ok) {
                    throw new Error('Erreur lors de la récupération des statistiques des commandes');
                }

                const orderData = await orderResponse.json();
                setStatOrder(orderData.data);
                console.log(orderData.data);

                // Appel pour l'analyse du chiffre d'affaires
                const revenueResponse = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/turnover_analysis', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${SUPABASE_ANON_KEY}` 
                    },
                    body: JSON.stringify({
                        restaurant_id: restaurantId
                    })
                });

                if (!revenueResponse.ok) {
                    throw new Error('Erreur lors de la récupération du chiffre d\'affaires');
                }

                const revenueData = await revenueResponse.json();
                setStatRevenue(revenueData.data);
                console.log(revenueData.data);
                
            } catch (error) {
                console.error('Erreur lors de la récupération des statistiques:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [restaurantId]);

    if (isLoading || !statOrder) {
        return (
            <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, {color: colors.colorText}]}>Chargement des données...</Text>
                </View>
            </View>
        );
    }


    return (
        <View style={[styles.container, { backgroundColor: colors.colorBackground }]}>
            <ScrollView style={styles.scrollView}>
                {/* Page Title */}
                <Text style={[styles.pageTitle, { color: colors.colorText }]}>
                    {t('home')}
                </Text>
                <View style={[styles.separator, { backgroundColor: colors.colorText }]} />

                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={[styles.greeting, { color: colors.colorText }]}>
                        {t('hello')} {userId.first_name}
                    </Text>
                    <Text style={[styles.date, { color: colors.colorDetail }]}>
                        {formattedDate}
                    </Text>
                </View>

                {/* Stats Blocks */}
                <View style={styles.statsContainer}>
                    {/* Orders Block */}
                    <View style={[styles.statBlock, { backgroundColor: colors.colorBorderAndBlock }]}>
                        <View style={styles.statHeader}>
                            <Text style={[styles.statTitle, { color: colors.colorText }]}>{t('orders')}</Text>
                            <Icon name="store" size={24} color="#FF6B6B" />
                        </View>
                        <Text style={[styles.percentage, { color: colors.colorText }]}>
                            {statOrder.month_comparison.change.percentage}
                        </Text>
                        <Text style={[styles.comparison, { color: colors.colorDetail }]}>
                            {t('vs_last_month')}
                        </Text>
                    </View>

                    {/* Revenue Block */}
                    <View style={[styles.statBlock, { backgroundColor: colors.colorBorderAndBlock }]}>
                        <View style={styles.statHeader}>
                            <Text style={[styles.statTitle, { color: colors.colorText }]}>{t('revenue')}</Text>
                            <Icon name="currency-eur" size={24} color="#FFD93D" />
                        </View>
                        <Text style={[styles.percentage, { color: colors.colorText }]}>
                            {statRevenue.comparison.percentage_change}
                        </Text>
                        <Text style={[styles.comparison, { color: colors.colorDetail }]}>
                            {t('vs_last_month')}
                        </Text>
                    </View>
                </View>

                {/* Quick Overview Block */}
                <View style={[styles.overviewBlock, { backgroundColor: colors.colorBorderAndBlock }]}>
                    <Text style={[styles.overviewTitle, { color: colors.colorText }]}>
                        {t('quick_overview')}
                    </Text>
                    <View style={styles.overviewContent}>
                        <View style={styles.overviewItem}>
                            <View style={styles.overviewItemContainer}>
                                <Icon name="calendar-check" size={40} color="#4ECDC4" style={styles.overviewIcon} />
                                <View style={styles.overviewItemContent}>
                                    <View style={styles.overviewItemHeader}>
                                        <Text style={[styles.overviewLabel, { color: colors.colorDetail }]}>
                                            {t('monthly_orders')}
                                        </Text>
                                        <Text style={[styles.overviewIncrease, { color:"#4ECDC4" }]}>
                                            {statOrder.month_comparison.change.absolute > 0 ? '+' : '-'}
                                            {Math.abs(statOrder.month_comparison.previous_month.total_orders - statOrder.month_comparison.current_month.total_orders)}
                                        </Text>
                                    </View>
                                    <Text style={[styles.overviewValue, { color: colors.colorText }]}>
                                        {statOrder.month_comparison.current_month.total_orders} {t('orders')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.overviewItem}>
                            <View style={styles.overviewItemContainer}>
                                <Icon name="star" size={40} color="#6C5CE7" style={styles.overviewIcon} />
                                <View style={styles.overviewItemContent}>
                                    <View style={styles.overviewItemHeader}>
                                        <Text style={[styles.overviewLabel, { color: colors.colorDetail }]}>
                                            {t('best_selling')}
                                        </Text>
                                        <Text style={[styles.overviewSales, { color: colors.colorText }]}>
                                            {statOrder.products_analysis[0].total_ordered} {t('sales')}
                                        </Text>
                                    </View>
                                    <Text style={[styles.overviewValue, { color: colors.colorText }]}>
                                        {statOrder.products_analysis[0].name}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* More Analysis Button */}
                <TouchableOpacity 
                    style={[styles.moreButton, { backgroundColor: colors.colorAction }]}
                    onPress={() => navigation.navigate('StatOptionScreen')}
                >
                    <Text style={[styles.moreButtonText, { color: "#fff" }]}>
                        {t('more_analytics')}... →
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function useStyles() {
    const { width, height } = useWindowDimensions();

    return StyleSheet.create({
        container: {
            flex: 1,
        },
        pageTitle: {
            fontSize: width > 375 ? 24 : 20,
            fontWeight: "600",
            textAlign: 'center',
            marginTop: height > 750 ? 40 : 30,
            marginBottom: 15,
        },
        separator: {
            height: 1,
            marginHorizontal: 30,
            marginBottom: 30,
        },
        scrollView: {
            flex: 1,
            padding: 20,
        },
        header: {
            marginTop: height > 750 ? 60 : 40,
            marginBottom: 30,
        },
        greeting: {
            fontSize: width > 375 ? 32 : 28,
            fontWeight: "600",
            marginBottom: 8,
        },
        date: {
            fontSize: width > 375 ? 16 : 14,
        },
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        statBlock: {
            width: '47%',
            padding: 15,
            borderRadius: 12,
            elevation: 2,
        },
        statHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15,
        },
        statTitle: {
            fontSize: width > 375 ? 16 : 14,
            fontWeight: "500",
        },
        percentage: {
            fontSize: width > 375 ? 24 : 20,
            fontWeight: "700",
            marginBottom: 5,
        },
        comparison: {
            fontSize: width > 375 ? 12 : 10,
        },
        overviewBlock: {
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
            elevation: 2,
        },
        overviewTitle: {
            fontSize: width > 375 ? 18 : 16,
            fontWeight: "600",
            marginBottom: 15,
        },
        overviewContent: {
            gap: 15,
        },
        overviewItem: {
            marginBottom: 20,
        },
        overviewItemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        overviewIcon: {
            marginRight: 15,
        },
        overviewItemContent: {
            flex: 1,
        },
        overviewItemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        overviewLabel: {
            fontSize: width > 375 ? 16 : 14,
            fontWeight: "500",
        },
        overviewValue: {
            fontSize: width > 375 ? 15 : 13,
            fontWeight: "400",
        },
        overviewIncrease: {
            fontSize: width > 375 ? 14 : 12,
            fontWeight: "500",
        },
        overviewSales: {
            fontSize: width > 375 ? 14 : 12,
            fontWeight: "500",
        },
        overviewLabel: {
            fontSize: width > 375 ? 14 : 12,
            marginBottom: 5,
        },
        overviewValue: {
            fontSize: width > 375 ? 16 : 14,
            fontWeight: "500",
        },
        moreButton: {
            padding: 15,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 20,
        },
        moreButtonText: {
            fontSize: width > 375 ? 16 : 14,
            fontWeight: "500",
        },
    });
}

export default HomeScreen;