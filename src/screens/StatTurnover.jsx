import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useWindowDimensions } from "react-native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useColors } from "../components/ColorContext/ColorContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';

function RevenueAnalysisScreen() {
    const styles = useStyles();
    const { colors } = useColors();
    const [restaurantId, setRestaurantId] = useState('');
    const [userId, setUserId] = useState('');
    const [theme, setTheme] = useState(''); // Nouveau state pour le thème
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho";
    const [isLoading, setIsLoading] = useState(true);
    const [statTurnover, setStatTurnover] =useState(null)
    const { t } = useTranslation();


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
                const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/turnover_analysis', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${SUPABASE_ANON_KEY}` 
                    },
                    body: JSON.stringify({
                        restaurant_id: restaurantId
                    })
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des statistiques');
                }

                const data = await response.json();
                setStatTurnover(data.data);
                console.log(data.data);
                
            } catch (error) {
                console.error('Erreur lors de la récupération des statistiques:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [restaurantId]);

    if (isLoading || !statTurnover) {
        return (
            <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
                <HeaderSetting color={colors.colorText} name="Analyse des commandes" navigateTo="StatOptionScreen"/>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, {color: colors.colorText}]}>Chargement des données...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
            <HeaderSetting color={colors.colorText} name={t('revenue')} navigateTo="StatOptionScreen"/>
            
            <ScrollView style={styles.scrollView}>
                {/* Revenue Overview Block */}
                <View style={[styles.overviewBlock, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.overviewHeader}>
                        <Text style={[styles.overviewTitle, {color: colors.colorDetail}]}>{t('total_month')}</Text>
                        <View style={[
                            styles.percentageTag,
                            { backgroundColor: statTurnover.comparison.percentage_change >= 0 
                                ? 'rgba(75, 181, 67, 0.1)' 
                                : 'rgba(255, 71, 87, 0.1)' 
                            }
                        ]}>
                            <Text style={[
                                styles.percentageText,
                                { color: statTurnover.comparison.percentage_change >= 0 
                                    ? '#4BB543'
                                    : '#FF4757'
                                }
                            ]}>
                                {statTurnover.comparison.percentage_change >= 0 ? '+' : ''}
                                {statTurnover.comparison.percentage_change}
                            </Text>
                        </View>
                    </View>
                    
                    <Text style={[styles.revenueAmount, {color: colors.colorText}]}>{statTurnover.current_month.total_revenue.toFixed(2)}€</Text>
                    <Text style={[styles.comparisonText, {color: colors.colorDetail}]}>
                        {t('vs_last_month')} ({statTurnover.previous_month.total_revenue.toFixed(2)}€)
                    </Text>

                    <View style={[styles.separator, {backgroundColor: colors.colorText}]} />

                    <Text style={[styles.distributionTitle, {color: colors.colorDetail}]}>{t('distribution_for_the_year')}</Text>
                    <Text style={[styles.distributionPercentage, {color: colors.colorText}]}>
                        {statTurnover.annual_analysis.monthly_breakdown.find(month => month.month === statTurnover.current_month.month).percentage}% {t('annual_revenue')}
                    </Text>
                    <View style={styles.progressBarContainer}>
                        <View 
                            style={[
                                styles.progressBar,
                                { width: `${statTurnover.annual_analysis.monthly_breakdown.find(month => month.month === statTurnover.current_month.month).percentage}%` }
                            ]} 
                        />
                    </View>
                </View>

                {/* Delivery vs Takeaway Block */}
                <View style={[styles.statsBlock, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.blockHeader}>
                        <Icon name="bike-fast" size={24} color="#4ECDC4" />
                        <Text style={[styles.blockTitle, {color: colors.colorText}]}>{t('sales_distribution')} ({t('annual')})</Text>
                    </View>
                    <View style={styles.deliveryStats}>
                        <View style={[styles.deliveryRow, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>
                            <View style={styles.deliveryLeftContent}>
                                <Icon name="bike-fast" size={24} color="#4ECDC4" />
                                <View style={styles.deliveryTextContent}>
                                    <Text style={[styles.deliveryLabel, {color: colors.colorDetail}]}>{t('delivery')}</Text>
                                    <Text style={[styles.deliveryAmount, {color: colors.colorText}]}>{statTurnover.annual_analysis.order_types.delivery.revenue.toFixed(2)}€</Text>
                                </View>
                            </View>
                            <Text style={styles.deliveryPercentage}>{statTurnover.annual_analysis.order_types.delivery.percentage.toFixed(2)}%</Text>
                        </View>
                        <View style={[styles.deliveryRow, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>
                            <View style={styles.deliveryLeftContent}>
                                <Icon name="shopping-outline" size={24} color="#FFD93D" />
                                <View style={styles.deliveryTextContent}>
                                    <Text style={[styles.deliveryLabel, {color: colors.colorDetail}]}>{t('takeaway')}</Text>
                                    <Text style={[styles.deliveryAmount, {color: colors.colorText}]}>{statTurnover.annual_analysis.order_types.pickup.revenue.toFixed(2)}€</Text>
                                </View>
                            </View>
                            <Text style={styles.deliveryPercentage}>{statTurnover.annual_analysis.order_types.pickup.percentage.toFixed(2)}%</Text>
                        </View>
                    </View>
                </View>

                {/* Best Performances Block */}
                <View style={[styles.statsBlock, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.blockHeader}>
                        <Icon name="trophy" size={24} color="#FFD93D" />
                        <Text style={[styles.blockTitle, {color:colors.colorText}]}>{t('best_performance')}</Text>
                    </View>
                    <View style={styles.bestStats}>
                        <View style={[styles.bestStatRow, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>
                            <Icon name="calendar-star" size={40} color="#4ECDC4" style={styles.bestStatIcon} />
                            <View style={styles.bestStatContent}>
                                <Text style={[styles.bestStatLabel, {color: colors.colorDetail}]}>{t('best_month')}</Text>
                                <Text style={[styles.bestStatRevenue, {color: colors.colorText}]}>{statTurnover.historical_best.month.total_revenue.toFixed(2)}€</Text>
                                <Text style={[styles.bestStatDate, {color: colors.colorDetail}]}>{t(statTurnover.historical_best.month.month.toLowerCase())} {statTurnover.historical_best.month.year}</Text>
                            </View>
                        </View>
                        <View style={[styles.bestStatRow, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>
                            <Icon name="star" size={40} color="#FFD93D" style={styles.bestStatIcon} />
                            <View style={styles.bestStatContent}>
                                <Text style={[styles.bestStatLabel, {color: colors.colorDetail}]}>{t('best_day')}</Text>
                                <Text style={[styles.bestStatRevenue, {color: colors.colorText}]}>{statTurnover.historical_best.day.total_revenue.toFixed(2)}€</Text>
                                <Text style={[styles.bestStatDate, {color : colors.colorDetail}]}>{statTurnover.historical_best.day.day} {t(statTurnover.historical_best.day.month.toLowerCase())} {statTurnover.historical_best.day.year}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Monthly Distribution Block */}
                <View style={[styles.statsBlock, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.blockHeader}>
                        <Icon name="calendar-month" size={24} color="#6C5CE7" />
                        <Text style={[styles.blockTitle, {color: colors.colorText}]}>{t('monthly_distribution')} ({statTurnover.annual_analysis.year})</Text>
                    </View>
                    {statTurnover.annual_analysis.monthly_breakdown.map((month, index) => {
                        return (
                            <View key={index} style={[styles.monthRow, {borderBottomColor: colors.colorDetaillight}]}>
                                <Text style={[styles.monthName, {color: colors.colorText}]}>{t(month.month.toLowerCase())}</Text>
                                <View style={styles.monthStats}>
                                    <Text style={[
                                        styles.monthRevenue,
                                        month.total_revenue === 0 && styles.inactiveText,
                                        {color: colors.colorText}
                                    ]}>
                                        {month.total_revenue > 0 ? `${month.total_revenue.toFixed(2)}€` : '-'}
                                    </Text>
                                    <Text style={[
                                        styles.monthPercentage,
                                        month.total_revenue === 0 && styles.inactiveText, 
                                        {color: colors.colorDetail}
                                    ]}>
                                        ({month.percentage}%)
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Other Metrics Block */}
                <View style={[styles.statsBlock, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.blockHeader}>
                        <Icon name="chart-box" size={24} color="#FF6B6B" />
                        <Text style={[styles.blockTitle, {color: colors.colorText}]}>{t('other_metrics')}</Text>
                    </View>
                    <View style={styles.metricsGrid}>
                        <View style={[styles.metricCard, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>
                            <Text style={[styles.metricCardTitle, {color: colors.colorDetail}]}>{t('average_basket_value')}</Text>
                            <Text style={[styles.metricCardValue, {color: colors.colorText}]}>{statTurnover.average_order_analysis.current_month.average.toFixed(2)}€</Text>
                            <Text style={[styles.metricCardComparison, {color: colors.colorDetail}]}>
                                {statTurnover.average_order_analysis.current_month.change_from_previous.formatted} {t('vs_last_month')}
                            </Text>
                        </View>
                        <View style={[styles.metricCard, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>
                            <Text style={[styles.metricCardTitle, {color: colors.colorDetail}]}>{t('annual_growth')}</Text>
                            <Text style={[styles.metricCardValue, {color: colors.colorText}]}>{statTurnover.average_order_analysis.yearly_comparison.change.formatted}</Text>
                            <Text style={[styles.metricCardComparison, {color: colors.colorDetail}]}>
                                {t('vs_last_year')}
                            </Text>
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
        overviewBlock: {
            backgroundColor: '#232533',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16
        },
        overviewHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12
        },
        overviewTitle: {
            color: '#A2A2A7',
            fontSize: 16
        },
        percentageTag: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8
        },
        percentageText: {
            fontSize: 14,
            fontWeight: '600'
        },
        revenueAmount: {
            color: 'white',
            fontSize: 32,
            fontWeight: '600',
            marginBottom: 4
        },
        comparisonText: {
            color: '#A2A2A7',
            fontSize: 14
        },
        separator: {
            height: 1,
            backgroundColor: 'rgba(162, 162, 167, 0.1)',
            marginVertical: 16
        },
        distributionTitle: {
            color: '#A2A2A7',
            fontSize: 16,
            marginBottom: 8
        },
        distributionPercentage: {
            color: 'white',
            fontSize: 15,
            marginBottom: 8
        },
        progressBarContainer: {
            height: 8,
            backgroundColor: 'rgba(162, 162, 167, 0.1)',
            borderRadius: 4,
            overflow: 'hidden'
        },
        progressBar: {
            height: '100%',
            backgroundColor: '#4ECDC4',
            borderRadius: 4
        },
        statsBlock: {
            backgroundColor: '#232533',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16
        },
        blockHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16
        },
        blockTitle: {
            color: 'white',
            fontSize: 18,
            fontWeight: '600',
            marginLeft: 8
        },
        deliveryStats: {
            marginTop: 8,
            gap: 20
        },
        deliveryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(162, 162, 167, 0.05)',
            borderRadius: 12,
            padding: 16
        },
        deliveryLeftContent: {
            flexDirection: 'row',
            alignItems: 'center'
        },
        deliveryTextContent: {
            marginLeft: 12
        },
        deliveryLabel: {
            color: '#A2A2A7',
            fontSize: 14,
            marginBottom: 4
        },
        deliveryAmount: {
            color: 'white',
            fontSize: 18,
            fontWeight: '600'
        },
        deliveryPercentage: {
            color: '#4ECDC4',
            fontSize: 16,
            fontWeight: '500'
        },
        bestStats: {
            marginTop: 8,
            gap: 20
        },
        bestStatRow: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 12,
            padding: 16
        },
        bestStatIcon: {
            marginRight: 16
        },
        bestStatContent: {
            flex: 1
        },
        bestStatLabel: {
            color: '#A2A2A7',
            fontSize: 15,
            marginBottom: 4
        },
        bestStatRevenue: {
            color: 'white',
            fontSize: 20,
            fontWeight: '600',
            marginBottom: 2
        },
        bestStatDate: {
            color: '#A2A2A7',
            fontSize: 14
        },
        monthRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
        },
        monthName: {
            color: 'white',
            fontSize: 15
        },
        monthStats: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
        },
        monthRevenue: {
            color: 'white',
            fontSize: 15,
            fontWeight: '500'
        },
        monthPercentage: {
            color: '#A2A2A7',
            fontSize: 14
        },
        inactiveText: {
            color: '#A2A2A7',
            opacity: 0.5
        },
        metricsGrid: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 16,
            marginTop: 12
        },
        metricCard: {
            flex: 1,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center'
        },
        metricCardTitle: {
            color: '#A2A2A7',
            fontSize: 15,
            marginBottom: 8,
            textAlign: 'center'
        },
        metricCardValue: {
            color: 'white',
            fontSize: 24,
            fontWeight: '600',
            marginBottom: 4
        },
        metricCardComparison: {
            color: '#A2A2A7',
            fontSize: 13,
            textAlign: 'center'
        }
    });
}

export default RevenueAnalysisScreen;