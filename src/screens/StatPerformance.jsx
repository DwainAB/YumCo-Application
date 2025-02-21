import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useWindowDimensions } from "react-native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useColors } from "../components/ColorContext/ColorContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';

function PerformanceAnalysisScreen() {
    const styles = useStyles();
    const { colors } = useColors();
    const [restaurantId, setRestaurantId] = useState('');
    const [userId, setUserId] = useState('');
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho";
    const [isLoading, setIsLoading] = useState(true);
    const [statPerformance, setStatPerformance] =useState(null)
    const { t } = useTranslation();
    const [theme, setTheme] = useState(''); // Nouveau state pour le thème


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
        const fetchStats = async () => {
            if (!restaurantId) return;

            try {
                setIsLoading(true);
                const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/performance_analysis', {
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
                setStatPerformance(data.data);
                console.log(data.data);
                
            } catch (error) {
                console.error('Erreur lors de la récupération des statistiques:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [restaurantId]);

    if (isLoading || !statPerformance) {
        return (
            <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
                <HeaderSetting color={colors.colorText} name={t('performance')} navigateTo="StatOptionScreen"/>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, {color: colors.colorText}]}>Chargement des données...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
            <HeaderSetting color={colors.colorText} name={t('performance')} navigateTo="StatOptionScreen"/>
            
            <ScrollView style={[styles.scrollView, {backgroundColor: colors.colorBackground}]}>
                {/* Average Preparation Time */}
                <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.sectionHeader}>
                        <Icon name="clock-outline" size={24} color="#4ECDC4" />
                        <Text style={[[styles.sectionTitle, {color : colors.colorText}], {color: colors.colorText}]}>{t('average_preparation_time')}</Text>
                    </View>
                    <View style={styles.timeStats}>
                        <Text style={[styles.bigTime, {color : colors.colorText}]}>{statPerformance.allOrders.currentMonth.averagePreparationTime} min</Text>
                        <View style={[
                            styles.changeTag,
                            { backgroundColor: Number(statPerformance.allOrders.comparison.preparationTimeDifference) <= 0 
                                ? 'rgba(75, 181, 67, 0.1)' 
                                : 'rgba(255, 71, 87, 0.1)'
                            }
                        ]}>
                            <Text style={[
                                styles.changeText,
                                { color: Number(statPerformance.allOrders.comparison.preparationTimeDifference) <= 0 
                                    ? '#4BB543' 
                                    : '#FF4757'
                                }
                            ]}>
                                {Number(statPerformance.allOrders.comparison.preparationTimeDifference) > 0 ? '+' : ''}
                                {Number(statPerformance.allOrders.comparison.preparationTimeDifference)} min {t('vs_last_month')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Preparation Times by Type */}
                <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.sectionHeader}>
                        <Icon name="bike-fast" size={24} color="#FFD93D" />
                        <Text style={[styles.sectionTitle, {color : colors.colorText}]}>{t('time_by_order_type')}</Text>
                    </View>
                    <View style={styles.typesContainer}>
                        <View style={[styles.typeCard, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>

                            <Icon name="bike-fast" size={24} color="#4ECDC4" />
                            <Text style={[styles.typeLabel, {color: colors.colorDetail}]}>{t('delivery')}</Text>
                            <Text style={[styles.typeTime, {color: colors.colorText}]}>{statPerformance.deliveryOrders.currentMonth.averagePreparationTime} min</Text>
                            <Text style={[styles.typeOrders, {color : colors.colorDetail}]}>{statPerformance.deliveryOrders.currentMonth.total} {t('orders')}</Text>
                        </View>
                        <View style={[styles.typeCard, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>
                            <Icon name="shopping-outline" size={24} color="#FFD93D" />
                            <Text style={[styles.typeLabel, {color: colors.colorDetail}]}>{t('takeaway')}</Text>
                            <Text style={[styles.typeTime, {color: colors.colorText}]}>{statPerformance.pickupOrders.currentMonth.averagePreparationTime} min</Text>
                            <Text style={[styles.typeOrders, {color : colors.colorDetail}]}>{statPerformance.pickupOrders.currentMonth.total} {t('orders')}</Text>
                        </View>
                    </View>
                </View>

                {/* Employee Performance */}
                <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.sectionHeader}>
                        <Icon name="account-group" size={24} color="#6C5CE7" />
                        <Text style={[styles.sectionTitle, {color : colors.colorText}]}>{t('employee_performance')}</Text>
                    </View>
                    {statPerformance?.employeePerformance?.currentMonth && 
                    Object.keys(statPerformance.employeePerformance.currentMonth).length > 0 ? (
                        Object.entries(statPerformance.employeePerformance.currentMonth).map(([id, employee], index) => (
                            <View key={id} style={[styles.employeeCard, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>

                                <View style={styles.employeeHeader}>
                                    <Text style={[styles.employeeName, {color : colors.colorText}]}>{employee.name}</Text>
                                    <View style={styles.employeeStats}>
                                        <View style={styles.employeeStat}>
                                            <Icon name="package-variant" size={16} color="#4ECDC4" />
                                            <Text style={[styles.statText, {color: colors.colorDetail}]}>{employee.totalOrders} {t('orders')}</Text>
                                        </View>
                                        <View style={styles.employeeStat}>
                                            <Icon name="clock-outline" size={16} color="#FFD93D" />
                                            <Text style={[styles.statText, {color: colors.colorDetail}]}>{employee.averagePreparationTime} min {t('on_average')}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.noDataText, {color: colors.colorDetail}]}>Aucune donnée employé disponible</Text>
                    )}
                </View>

                {/* Peak Hours */}
                <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.sectionHeader}>
                        <Icon name="chart-timeline-variant" size={24} color="#FF6B6B" />
                        <Text style={[styles.sectionTitle, {color : colors.colorText}]}>{t('peak_hours')}</Text>
                    </View>

                        <View style={styles.peakCard}>
                            <Text style={[styles.peakTime, {color: colors.colorText}]}>12h-14h</Text>
                            <View style={styles.peakStats}>
                                <View style={styles.peakStat}>
                                    <Icon name="package-variant" size={16} color="#4ECDC4" />
                                    <Text style={[styles.peakStatText, {color: colors.colorDetail}]}>{statPerformance.rushHours.currentMonth.lunchTime.total} {t('orders')}</Text>
                                </View>
                                <View style={styles.peakStat}>
                                    <Icon name="clock-outline" size={16} color="#FFD93D" />
                                    <Text style={[styles.peakStatText, {color: colors.colorDetail}]}>{statPerformance.rushHours.currentMonth.lunchTime.averagePreparationTime} min {t('on_average')}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.peakCard}>
                            <Text style={[styles.peakTime, {color: colors.colorText}]}>19h-21h</Text>
                            <View style={styles.peakStats}>
                                <View style={styles.peakStat}>
                                    <Icon name="package-variant" size={16} color="#4ECDC4" />
                                    <Text style={[styles.peakStatText, {color: colors.colorDetail}]}>{statPerformance.rushHours.currentMonth.dinnerTime.total} {t('orders')}</Text>
                                </View>
                                <View style={styles.peakStat}>
                                    <Icon name="clock-outline" size={16} color="#FFD93D" />
                                    <Text style={[styles.peakStatText, {color: colors.colorDetail}]}>{statPerformance.rushHours.currentMonth.dinnerTime.averagePreparationTime} min {t('on_average')}</Text>
                                </View>
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
        },
        scrollView: {
            flex: 1,
            padding: 16
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
        timeStats: {
            alignItems: 'center',
            gap: 12
        },
        bigTime: {
            color: 'white',
            fontSize: 36,
            fontWeight: '600'
        },
        changeTag: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8
        },
        changeText: {
            fontSize: 14,
            fontWeight: '500'
        },
        typesContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 16
        },
        typeCard: {
            flex: 1,
            backgroundColor: 'rgba(162, 162, 167, 0.05)',
            borderRadius: 8,
            padding: 16,
            alignItems: 'center'
        },
        typeLabel: {
            color: '#A2A2A7',
            fontSize: 14,
            marginTop: 8
        },
        typeTime: {
            color: 'white',
            fontSize: 24,
            fontWeight: '600',
            marginTop: 4
        },
        typeOrders: {
            color: '#A2A2A7',
            fontSize: 12,
            marginTop: 4
        },
        employeeCard: {
            backgroundColor: 'rgba(162, 162, 167, 0.05)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 12
        },
        employeeHeader: {
            gap: 12
        },
        employeeName: {
            color: 'white',
            fontSize: 16,
            fontWeight: '500'
        },
        employeeStats: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8
        },
        employeeStat: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6
        },
        statText: {
            color: '#A2A2A7',
            fontSize: 14
        },
        peakCard: {
            backgroundColor: 'rgba(162, 162, 167, 0.05)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 12
        },
        peakTime: {
            color: 'white',
            fontSize: 16,
            fontWeight: '500',
            marginBottom: 8
        },
        peakStats: {
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        peakStat: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6
        },
        peakStatText: {
            color: '#A2A2A7',
            fontSize: 14
        }
    });
}

export default PerformanceAnalysisScreen;