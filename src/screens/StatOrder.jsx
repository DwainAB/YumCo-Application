import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useWindowDimensions } from "react-native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useColors } from "../components/ColorContext/ColorContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import i18n from "../components/i18n/i18n";
import { API_CONFIG } from '../config/constants';

function OrdersAnalysisScreen() {
    const [currentPage, setCurrentPage] = useState(1);
    const styles = useStyles();
    const { colors } = useColors();
    const [restaurantId, setRestaurantId] = useState('');
    const [userId, setUserId] = useState('');
    const [statOrder, setStatOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
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
        const fetchStats = async () => {
            if (!restaurantId) return;

            try {
                setIsLoading(true);
                const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/order_analysis`, {
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
                setStatOrder(data.data);
                console.log(data.data);
                
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
                <HeaderSetting color={colors.colorText} name="Analyse des commandes" navigateTo="StatOptionScreen"/>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, {color: colors.colorText}]}>Chargement des données...</Text>
                </View>
            </View>
        );
    }

    const itemsPerPage = 10;
    const totalPages = Math.ceil(statOrder.products_analysis.length / itemsPerPage);
    const paginatedProducts = statOrder.products_analysis.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatTimeByLanguage = (hour, language) => {
        // Conversion de "9PM" en nombre d'heures (21)
        const parseHour = (timeStr) => {
            const hour = parseInt(timeStr);
            const isPM = timeStr.toLowerCase().includes('pm');
            return isPM ? hour + 12 : hour;
        };
    
        // Pour le japonais, utiliser le format 24h avec le suffixe 時
        if (language === 'ja') {
            const hour24 = parseHour(hour);
            return `${hour24}時`;
        }
    
        // Pour le français, utiliser le format 24h
        if (language === 'fr') {
            const hour24 = parseHour(hour);
            return `${hour24}h`;
        }
    
        // Par défaut, garder le format AM/PM en anglais
        return hour;
    };

    return (
        <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
            <HeaderSetting color={colors.colorText} name={t('order_analysis')} navigateTo="StatOptionScreen"/>
            
            <ScrollView style={styles.scrollView}>
                {/* Top Stats Grid */}
                <View style={styles.statsGrid}>
                    {/* Best Month Block */}
                    <View style={[styles.statBlock, {backgroundColor: colors.colorBorderAndBlock}]}>
                        <View style={styles.statHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
                                <Icon name="calendar-star" size={24} color="#FF6B6B" />
                            </View>
                            <Text style={[styles.statTitle, {color: colors.colorDetail}]}>{t('best_month')}</Text>
                        </View>
                        <Text style={[styles.statValue, {color: colors.colorText, textAlign:"center"}]}>{t(statOrder.most_orders_analysis.month.toLowerCase())} {statOrder.most_orders_analysis.year}</Text>
                        <Text style={[styles.statDetail, {color: colors.colorDetail}]}>{statOrder.most_orders_analysis.total_orders} {t('orders')}</Text>
                    </View>

                    {/* Biggest Order Block */}
                    <View style={[styles.statBlock, {backgroundColor: colors.colorBorderAndBlock}]}>
                        <View style={styles.statHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(78, 205, 196, 0.1)' }]}>
                                <Icon name="cash-multiple" size={24} color="#4ECDC4" />
                            </View>
                            <Text style={[styles.statTitle, {color: colors.colorDetail}]}>{t('largest_order')}</Text>
                        </View>
                        <Text style={[styles.statValue, {color: colors.colorText}]}>{statOrder.highest_order_analysis.amount.toFixed(2)}€</Text>
                        <Text style={[styles.statDetail, {color : colors.colorDetail}]}>{statOrder.highest_order_analysis.date.day} {t(statOrder.highest_order_analysis.date.month.toLowerCase())} {statOrder.highest_order_analysis.date.year}</Text>
                    </View>

                    {/* Average Order Block */}
                    <View style={[styles.statBlock, {backgroundColor: colors.colorBorderAndBlock}]}>
                        <View style={styles.statHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 217, 61, 0.1)' }]}>
                                <Icon name="chart-areaspline" size={24} color="#FFD93D" />
                            </View>
                            <Text style={[styles.statTitle, {color: colors.colorDetail}]}>{t('average_basket')}</Text>
                        </View>
                        <Text style={[styles.statValue, {color: colors.colorText}]}>{statOrder.current_year_analysis.average_order_amount.toFixed(2)}€</Text>
                        <Text style={[styles.statDetail, {color : colors.colorDetail}]}>{statOrder.year_comparison.percentage_change} vs {statOrder.year_comparison.previous_year}</Text>
                    </View>

                    {/* Total Orders Block */}
                    <View style={[styles.statBlock, {backgroundColor: colors.colorBorderAndBlock}]}>
                        <View style={styles.statHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(108, 92, 231, 0.1)' }]}>
                                <Icon name="shopping" size={24} color="#6C5CE7" />
                            </View>
                            <Text style={[styles.statTitle, {color: colors.colorDetail}]}>{t('total_orders')}</Text>
                        </View>
                        <Text style={[styles.statValue, {color: colors.colorText}]}>{statOrder.current_year_analysis.total_orders}</Text>
                        <Text style={[styles.statDetail, {color: colors.colorDetail}]}>{t('this_year')}</Text>
                    </View>
                </View>

                {/* Best Selling Products */}
                <View style={[styles.sectionBlock, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.sectionHeader}>
                        <Icon name="trophy" size={24} color="#FFD93D" />
                        <Text style={[styles.sectionTitle, {color: colors.colorText}]}>{t('best_selling_products')}</Text>
                    </View>
                    {paginatedProducts.map((product, index) => (
                        <View key={index} style={styles.productRow}>
                            <Text style={[styles.productRank, {color: colors.colorDetail}]}>#{(currentPage - 1) * itemsPerPage + index + 1}</Text>
                            <Text style={[styles.productName, {color: colors.colorText}]}>{product.name}</Text>
                            <Text style={[styles.productSales, {color: colors.colorDetail}]}>{product.total_ordered} ventes</Text>
                        </View>
                    ))}
                    {statOrder.products_analysis.length > itemsPerPage && (
                        <View style={styles.pagination}>
                            <TouchableOpacity 
                                onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                            >
                                <Text style={styles.pageButtonText}>{t('previous')}</Text>
                            </TouchableOpacity>
                            <Text style={[styles.pageInfo, {color: colors.colorDetail}]}>{t('page')} {currentPage}/{totalPages}</Text>
                            <TouchableOpacity 
                                onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                            >
                                <Text style={styles.pageButtonText}>{t('next')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Other Statistics */}
                <View style={[styles.sectionBlock, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.sectionHeader}>
                        <Icon name="chart-box" size={24} color="#6C5CE7" />
                        <Text style={[styles.sectionTitle, {color: colors.colorText}]}>{t('other_statistics')}</Text>
                    </View>
                    <View style={styles.otherStatsList}>
                        <View style={styles.otherStatRow}>
                            <Text style={[styles.otherStatLabel, {color: colors.colorDetail}]}>{t('peak_hour')}</Text>
                            <View style={{flexDirection: 'row'}}>
                            <Text style={[styles.otherStatValue, {color: colors.colorText}]}>
                                {formatTimeByLanguage(statOrder.timing_analysis.peak_hours.start, i18n.language)}
                            </Text>
                            <Text style={[styles.otherStatValue, {color: colors.colorText}]}> - </Text>
                            <Text style={[styles.otherStatValue, {color: colors.colorText}]}>
                                {formatTimeByLanguage(statOrder.timing_analysis.peak_hours.end, i18n.language)}
                            </Text>
                        </View>
                        </View>
                        <View style={styles.otherStatRow}>
                            <Text style={[styles.otherStatLabel, {color: colors.colorDetail}]}>{t('most_active_day')}</Text>
                            <Text style={[styles.otherStatValue, {color: colors.colorText}]}>{t(statOrder.timing_analysis.busiest_day.toLowerCase())}</Text>
                        </View>
                        <View style={styles.otherStatRow}>
                            <Text style={[styles.otherStatLabel, {color: colors.colorDetail}]}>{t('preferred_mode')}</Text>
                            <Text style={[styles.otherStatValue, {color: colors.colorText}]}>{t(statOrder.type_analysis.dominant.type.toLowerCase())} ({statOrder.type_analysis.dominant.percentage}%)</Text>
                        </View>
                        <View style={styles.otherStatRow}>
                            <Text style={[styles.otherStatLabel, {color: colors.colorDetail}]}>{t('repurchase_rate')}</Text>
                            <Text style={[styles.otherStatValue, {color: colors.colorText}]}>{statOrder.customer_analysis.repeat_rate}%</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function useStyles() {
    const { width, height } = useWindowDimensions();

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
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 20
        },
        statBlock: {
            width: (width - 48) / 2,
            backgroundColor: '#232533',
            borderRadius: 12,
            padding: 16,
            elevation: 2
        },
        statHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12
        },
        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8
        },
        statTitle: {
            color: '#A2A2A7',
            fontSize: 14,
            flex: 1
        },
        statValue: {
            color: 'white',
            fontSize: 24,
            fontWeight: '600',
            marginBottom: 4
        },
        statDetail: {
            color: '#A2A2A7',
            fontSize: 14
        },
        sectionBlock: {
            backgroundColor: '#232533',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16
        },
        sectionTitle: {
            color: 'white',
            fontSize: 18,
            fontWeight: '600',
            marginLeft: 8
        },
        productRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(162, 162, 167, 0.1)'
        },
        productRank: {
            color: '#A2A2A7',
            width: 40
        },
        productName: {
            color: 'white',
            flex: 1
        },
        productSales: {
            color: '#A2A2A7'
        },
        pagination: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(162, 162, 167, 0.1)'
        },
        pageButton: {
            backgroundColor: 'rgba(108, 92, 231, 0.1)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8
        },
        pageButtonDisabled: {
            opacity: 0.5
        },
        pageButtonText: {
            color: '#6C5CE7'
        },
        pageInfo: {
            color: '#A2A2A7'
        },
        cityRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(162, 162, 167, 0.1)'
        },
        cityName: {
            color: 'white'
        },
        cityOrders: {
            color: '#A2A2A7'
        },
        otherStatsList: {
            marginTop: 8
        },
        otherStatRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(162, 162, 167, 0.1)'
        },
        otherStatLabel: {
            color: '#A2A2A7',
            fontSize: 15
        },
        otherStatValue: {
            color: 'white',
            fontSize: 15,
            fontWeight: '500'
        }
    });
}

export default OrdersAnalysisScreen;