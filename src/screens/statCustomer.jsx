import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useWindowDimensions } from "react-native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useColors } from "../components/ColorContext/ColorContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '../config/constants';

function CustomerAnalysisScreen() {
    const styles = useStyles();
    const { colors } = useColors();
    const [restaurantId, setRestaurantId] = useState('');
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [statsCustomers, setStatsCustomers] = useState(null);
    const { t } = useTranslation();
    const [theme, setTheme] = useState(''); // Nouveau state pour le thème


    useEffect(() => {
        const fetchRestaurantId = async () => {
            try {
                const owner = await AsyncStorage.getItem("owner");
                const ownerData = JSON.parse(owner);                
                setRestaurantId(ownerData.restaurantId);
                setUserId(ownerData.id);
                console.log(ownerData.restaurantId);
            } catch (error) {
                console.error('Erreur lors de la récupération des informations utilisateur:', error);
            }
        };
        fetchRestaurantId();
    }, []);

    useEffect(() => {
        const getTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('selectedTheme');
                if (savedTheme) {
                    setTheme(savedTheme);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du thème:', error);
            }
        };
        
        getTheme();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            if (!restaurantId) return;

            try {
                setIsLoading(true);
                const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/customers_analysis`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}` 
                    },
                    body: JSON.stringify({
                        restaurant_id: restaurantId
                    })
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des statistiques');
                }

                const data = await response.json();
                setStatsCustomers(data.data);
                console.log(data.data);
                
            } catch (error) {
                console.error('Erreur lors de la récupération des statistiques:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [restaurantId]);

    if (isLoading || !statsCustomers) {
        return (
            <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
                <HeaderSetting color={colors.colorText} name={t('client_analysis')} navigateTo="StatOptionScreen"/>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, {color: colors.colorText}]}>Chargement des données...</Text>
                </View>
            </View>
        );
    }


    return (
        <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
            <HeaderSetting color={colors.colorText} name={t('client_analysis')} navigateTo="StatOptionScreen"/>
            
            <ScrollView style={styles.scrollView}>
                {/* Overview Stats */}
                <View style={styles.statsGrid}>
                    {/* Total Customers */}
                    <View style={[styles.statCard, {backgroundColor: colors.colorBorderAndBlock}]}>
                        <View style={styles.statHeader}>
                            <Icon name="account-group" size={24} color="#4ECDC4" />
                            <Text style={[styles.statTitle, {color: colors.colorDetail}]}>{t('total_clients')}</Text>
                        </View>
                        <Text style={[styles.statValue, {color: colors.colorText}]}>{statsCustomers.current_month.total_customers}</Text>
                        <View style={[
                            styles.changeTag,
                            { backgroundColor: statsCustomers.current_month.comparison.absolute_change > 0 
                                ? 'rgba(75, 181, 67, 0.1)' 
                                : 'rgba(255, 71, 87, 0.1)'
                            }
                        ]}>
                            <Text style={[
                                styles.changeText,
                                { color: statsCustomers.current_month.comparison.absolute_change > 0 
                                    ? '#4BB543' 
                                    : '#FF4757'
                                }
                            ]}>
                                {statsCustomers.current_month.comparison.percentage_change > 0 ? '+' : ''}
                                {statsCustomers.current_month.comparison.percentage_change} {t('vs_last_month')}
                            </Text>
                        </View>
                    </View>

                    {/* Loyal Customers */}
                    <View style={[styles.statCard, {backgroundColor: colors.colorBorderAndBlock}]}>
                        <View style={styles.statHeader}>
                            <Icon name="heart" size={24} color="#FF6B6B" />
                            <Text style={[styles.statTitle, {color: colors.colorDetail}]}>{t('loyal_clients')}</Text>
                        </View>
                        <Text style={[styles.statValue, {color : colors.colorText}]}>{statsCustomers.current_month.loyal_customers.this_month}</Text>
                        <Text style={styles.percentageText}>
                            {statsCustomers.current_month.loyal_customers.percentage_of_month}% {t('some_clients')}
                        </Text>
                    </View>
                </View>

                {/* Top Customers */}
                <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.sectionHeader}>
                        <Icon name="trophy" size={24} color="#FFD93D" />
                        <Text style={[styles.sectionTitle, {color: colors.colorText}]}>{t('top_clients')}</Text>
                    </View>
                    {statsCustomers.current_month.top_customers.map((customer, index) => (
                        <View key={index} style={[styles.customerCard, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>
                            <View style={styles.customerHeader}>
                                <View style={styles.customerLeft}>
                                    <View style={styles.rankBadge}>
                                        <Text style={styles.rankText}>#{index + 1}</Text>
                                    </View>
                                    <Text style={[styles.customerName, {color: colors.colorText}]}>{customer.first_name} {customer.last_name}</Text>
                                </View>
                                <Text style={[styles.lastOrder, {color: colors.colorDetail}]}>
                                    {new Date(customer.last_order_date).toLocaleDateString('fr-FR')}
                                </Text>
                            </View>
                            <View style={styles.customerStats}>
                                <Text style={[styles.statDetail, {color : colors.colorDetail}]}>
                                    {customer.order_count} {t('orders')}
                                </Text>
                                <Text style={[styles.statDetail, {color: colors.colorDetail}]}>
                                    {customer.total_spent.toFixed(2)}€ {t('spent')}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Monthly New Customers */}
                <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.sectionHeader}>
                        <Icon name="account-multiple-plus" size={24} color="#4ECDC4" />
                        <Text style={[styles.sectionTitle, {color: colors.colorText}]}>{t('new_clients')}</Text>
                    </View>
                    {statsCustomers.current_month.new_customers_analysis.monthly_breakdown.map((month, index) => {

                        return (
                            <View key={index} style={[styles.monthRow, {borderBottomColor: colors.colorDetaillight}]}>
                                <Text style={[styles.monthName, {color: colors.colorText}]}>{t(month.month.toLowerCase())}</Text>
                                <View style={styles.monthStats}>
                                    <Text style={[
                                        styles.monthCount,
                                        month.total_new_customers === 0 && styles.inactiveText,
                                        {color: colors.colorDetail}
                                    ]}>
                                        {month.total_new_customers || '-'}
                                    </Text>
                                    {month.total_new_customers > 0 && (
                                        <Text style={[
                                            styles.monthChange,
                                            { color: parseFloat(month.percentage_change) >= 0 ? '#4BB543' : '#FF4757' }
                                        ]}>
                                            {parseFloat(month.percentage_change) > 0 ? '+' : ''}
                                            {parseFloat(month.percentage_change).toFixed(2)}%
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Other Metrics */}
                <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.sectionHeader}>
                        <Icon name="chart-box" size={24} color="#6C5CE7" />
                        <Text style={[styles.sectionTitle, {color: colors.colorText}]}>{t('client_metrics')}</Text>
                    </View>
                    <View style={styles.metricsGrid}>
                        <View style={[styles.metricCard, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>
                            <Text style={[styles.metricLabel, {color: colors.colorDetail}]}>{t('retention_rate')}</Text>
                            <Text style={[styles.metricValue, {color: colors.colorText}]}>{statsCustomers.current_month.retention_analysis.year_over_year_change ? `${statsCustomers.current_month.retention_analysis.year_over_year_change}%` : '0%'}</Text>
                            <Text style={[styles.metricDetail, {color: colors.colorDetail}]}>{t('vs_last_month')}</Text>
                        </View>
                        <View style={[styles.metricCard, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>
                            <Text style={[styles.metricLabel, {color: colors.colorDetail}]}>{t('average_spending')}</Text>
                            <Text style={[styles.metricValue, {color: colors.colorText}]}>{statsCustomers.current_month.retention_analysis.loyal_customers_average_monthly_spending.toFixed(2)}€</Text>
                            <Text style={[styles.metricDetail, {color: colors.colorDetail}]}>{t('per_client_per_month')}</Text>
                        </View>
                        <View style={[styles.metricCard, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>
                            <Text style={[styles.metricLabel, {color: colors.colorDetail}]}>{t('regular_clients')}</Text>
                            <Text style={[styles.metricValue, {color: colors.colorText}]}>{statsCustomers.current_month.retention_analysis.all_time_stats.loyalty_rate}%</Text>
                            <Text style={[styles.metricDetail, {color: colors.colorDetail}]}>({t('across_all_years')})</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function useStyles() {
    const { width } = useWindowDimensions();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#161622"
        },
        scrollView: {
            flex: 1,
            padding: 16
        },
        statsGrid: {
            flexDirection: 'row',
            gap: 16,
            marginBottom: 16
        },
        statCard: {
            flex: 1,
            backgroundColor: '#232533',
            borderRadius: 12,
            padding: 16
        },
        statHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            gap: 8
        },
        statTitle: {
            color: '#A2A2A7',
            fontSize: 14
        },
        statValue: {
            color: 'white',
            fontSize: 28,
            fontWeight: '600',
            marginBottom: 8
        },
        changeTag: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            alignSelf: 'flex-start'
        },
        changeText: {
            fontSize: 12,
            fontWeight: '500'
        },
        percentageText: {
            color: '#4ECDC4',
            fontSize: 14,
            fontWeight: '500'
        },
        section: {
            backgroundColor: '#232533',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            gap: 8
        },
        sectionTitle: {
            color: 'white',
            fontSize: 18,
            fontWeight: '600'
        },
        customerCard: {
            backgroundColor: 'rgba(162, 162, 167, 0.05)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12
        },
        customerHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8
        },
        customerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        },
        rankBadge: {
            backgroundColor: '#FFD93D',
            width: 24,
            height: 24,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center'
        },
        rankText: {
            color: '#161622',
            fontSize: 12,
            fontWeight: '600'
        },
        customerName: {
            color: 'white',
            fontSize: 16,
            fontWeight: '500'
        },
        lastOrder: {
            color: '#A2A2A7',
            fontSize: 12
        },
        customerStats: {
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        statDetail: {
            color: '#A2A2A7',
            fontSize: 14
        },
        monthRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(162, 162, 167, 0.1)'
        },
        monthName: {
            color: 'white',
            fontSize: 15
        },
        monthStats: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        },
        monthCount: {
            color: 'white',
            fontSize: 15,
            fontWeight: '500'
        },
        monthChange: {
            fontSize: 14,
            fontWeight: '500'
        },
        inactiveText: {
            color: '#A2A2A7',
            opacity: 0.5
        },
        metricsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12
        },
        metricCard: {
            flex: 1,
            minWidth: width > 375 ? (width - 80) / 3 : (width - 64) / 2,
            backgroundColor: 'rgba(162, 162, 167, 0.05)',
            borderRadius: 8,
            padding: 12,
            alignItems: 'center'
        },
        metricLabel: {
            color: '#A2A2A7',
            fontSize: 13,
            marginBottom: 4,
            textAlign: 'center'
        },
        metricValue: {
            color: 'white',
            fontSize: 20,
            fontWeight: '600',
            marginBottom: 2
        },
        metricDetail: {
            color: '#A2A2A7',
            fontSize: 12,
            textAlign: 'center'
        }
    });
}

export default CustomerAnalysisScreen;