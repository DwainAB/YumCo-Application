import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "../ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { useLoading } from "../Hooks/useLoading";
import * as Haptics from 'expo-haptics';
import { registerForPushNotificationsAsync } from '../Notifications/NotificationsOrder';
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '../../config/constants';
import { safeJSONParse } from '../../utils/storage';

function ContentOrder() {
    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [expoPushToken, setExpoPushToken] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [restaurantId, setRestaurantId] = useState('');
    const [userId, setUserId] = useState('');
    const [lastFetchTime, setLastFetchTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    const navigation = useNavigation();
    const { colors } = useColors();
    const styles = useStyles();
    const { startLoading, stopLoading } = useLoading();

    // Notifications et Token Setup
    useEffect(() => {
        if (expoPushToken) {
            updateNotificationToken(expoPushToken);
        }
    }, [expoPushToken]);

    useEffect(() => {
        registerForPushNotificationsAsync()
            .then(token => setExpoPushToken(token))
            .catch(err => console.log(err));
    }, []);

    // Restaurant ID Setup
    useEffect(() => {
        const fetchRestaurantId = async () => {
            try {
                const owner = await AsyncStorage.getItem("owner");
                const ownerData = safeJSONParse(owner);                
                setRestaurantId(ownerData.restaurantId);
                setUserId(ownerData.id);
            } catch (error) {
                console.error('Erreur lors de la récupération des informations utilisateur:', error);
            }
        };
        fetchRestaurantId();
    }, []);

    // Orders Fetching
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/getRestaurantOrders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}` 
                },
                body: JSON.stringify({
                    restaurant_id: restaurantId
                })
            });
            const result = await response.json();
            console.log(result);
            
            if (result.success) {
                setOrders(result.data);
                filterOrders(selectedFilter, result.data);
                
                // Attendre 2 secondes avant de masquer le loader
                setTimeout(() => {
                    setIsLoading(false);
                }, 2000);
            } else {
                // Attendre 2 secondes avant de masquer le loader même en cas d'erreur
                setTimeout(() => {
                    setIsLoading(false);
                }, 2000);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes:', error.message);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            
            // Attendre 2 secondes avant de masquer le loader même en cas d'erreur
            setTimeout(() => {
                setIsLoading(false);
            }, 2000);
        }
    };

    useEffect(() => {
        if (restaurantId) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 60000);
            return () => clearInterval(interval);
        }
    }, [restaurantId]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchOrders);
        return unsubscribe;
    }, [navigation, restaurantId]);

    // Filtering Logic
    const filterOrders = (filter, ordersToFilter = orders) => {
        let filtered = ordersToFilter.filter(order => 
            order.status !== "COMPLETED" && 
            order.status !== "CANCELLED" && 
            order.status !== "DELETED" &&
            order.status !== "IN_PROGRESS"
        );

        if (filter !== 'ALL') {
            filtered = filtered.filter(order => order.type === filter);
        }
        
        setFilteredOrders(filtered);
    };

    useEffect(() => {
        // Ne filtrer que si nous ne sommes pas en train de charger les données
        // Cela évite le clignotement entre "Pas de commandes" et les commandes réelles
        if (!isLoading) {
            filterOrders(selectedFilter);
        }
    }, [orders, selectedFilter, isLoading]);

    // Update Notification Token
    const updateNotificationToken = async (token) => {
        try {
            const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/updateUser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
                    "apikey": API_CONFIG.SUPABASE_ANON_KEY
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

    // UI Helper Functions
    const getDeliveryIcon = (type) => {
        if (type === 'DELIVERY') {
            return {
                name: 'bike-fast',
                color: '#4ECDC4'
            };
        }
        if (type === 'PICKUP') {
            return {
                name: 'shopping-outline',
                color: '#6C5CE7'
            };
        }
        return null;
    };

    const getStatusIcon = (status) => {
        if (status === 'PREPARING') {
            return {
                name: 'progress-clock',
                color: '#FFD93D'
            };
        }
        return null;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const formattedDate = date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        return `${time} ${formattedDate}`;
    };
    
    // Fonction pour préparer les éléments de commande pour OrderSelect
    const prepareOrderItems = (orderItems) => {
        if (!orderItems || !Array.isArray(orderItems)) {
            return [];
        }
        
        // Transformer les items pour l'affichage
        return orderItems.map(item => {
            // Déterminer si c'est un menu (présence de menu_id)
            const isMenu = !!item.menu_id;
            
            return {
                ...item,
                is_menu: isMenu,
                // Si c'est un menu et qu'il a des options, les inclure
                options: item.options || []
            };
        });
    };

    const renderOrderItem = ({ item }) => {
        const deliveryIcon = getDeliveryIcon(item.type);
        const statusIcon = getStatusIcon(item.status);
        
        // Vérifier s'il y a des menus dans cette commande
        const hasMenus = item.order_items && item.order_items.some(orderItem => 
            orderItem.menu_id !== null
        );
        
        // Préparer les éléments de la commande
        const preparedOrderItems = prepareOrderItems(item.order_items);
        
        return (
            <TouchableOpacity 
                style={[styles.orderCard, { backgroundColor: colors.colorBorderAndBlock }]}
                onPress={() => {
                    Haptics.selectionAsync();
                    navigation.navigate('OrderSelect', {
                        order: {
                            client_ref_order: item.order_number,
                            payment_status: item.payment_status,
                            order_id: item.id,
                            client_method: item.type === "PICKUP" ? "A emporter" : "Livraison",
                            client_payment: item.payment_method,
                            client_lastname: item.customers.last_name,
                            client_firstname: item.customers.first_name,
                            client_phone: item.customers.phone,
                            client_email: item.customers.email,
                            order_comment: item.comment,
                            client_address: item.addresses ? `${item.addresses.street}, ${item.addresses.city} ${item.addresses.postal_code}` : '',
                            client_id: item.id,
                            amount_total: item.amount_total,
                            orders: preparedOrderItems,
                            preparing_by: item.preparer ? `${item.preparer.first_name} ${item.preparer.last_name}` : ''
                        }
                    });
                }}
            >
                <View style={styles.orderHeader}>
                    <View style={styles.orderHeaderLeft}>
                        <Text style={[styles.orderRef, { color: colors.colorText }]}>
                            {item.order_number}
                        </Text>
                        <Text style={[styles.orderTime, { color: 'grey' }]}>
                            {formatTime(item.created_at)}
                        </Text>
                    </View>
                    <View style={styles.orderIcons}>
                        {deliveryIcon && (
                            <Icon 
                                name={deliveryIcon.name} 
                                size={24} 
                                color={deliveryIcon.color} 
                            />
                        )}
                        {statusIcon && (
                            <View style={styles.statusIconContainer}>
                                <Icon 
                                    name={statusIcon.name} 
                                    size={24} 
                                    color={statusIcon.color} 
                                />
                            </View>
                        )}
                    </View>
                </View>
                
                <View style={styles.orderContent}>
                    <Text style={[styles.customerName, { color: colors.colorText }]}>
                        {item.customers.first_name} {item.customers.last_name}
                    </Text>
                    <Text style={[styles.orderAmount, { color: colors.colorText }]}>
                        {item.amount_total.toFixed(2)}€
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const FilterButton = ({ title, value }) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                selectedFilter === value && { backgroundColor: colors.colorAction, color: "#fff" }
            ]}
            onPress={() => {
                Haptics.selectionAsync();
                setSelectedFilter(value);
            }}
        >
            <Text style={[
                styles.filterText,
                { color: selectedFilter === value ? "#FFFFFF" : "#808080" }
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.colorBackground }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.colorText }]}>{t('orders')}</Text>
            </View>
            
            <View style={[styles.filterContainer, { backgroundColor: colors.colorBorderAndBlock }]}>
                <FilterButton title={t('all')} value="ALL" />
                <FilterButton title={t('delivery')} value="DELIVERY" />
                <FilterButton title={t('takeaway')} value="PICKUP" />
            </View>

            {isLoading && !refreshing ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.colorAction} />
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.ordersList}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={async () => {
                        setRefreshing(true);
                        await fetchOrders();
                        setRefreshing(false);
                    }}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Icon name="receipt-text-outline" size={50} color={colors.colorBorderAndBlock} />
                            <Text style={[styles.emptyText, { color: colors.colorText }]}>
                                {t('no_orders')}
                            </Text>
                        </View>
                    )}
                />
            )}

            <TouchableOpacity 
                style={[styles.historyButton, { backgroundColor: colors.colorAction }]}
                onPress={() => navigation.navigate('AllOrders')}
            >
                <Text style={[styles.historyButtonText, { color: "#fff" }]}>
                    {t('order_history')}
                </Text>
                <Icon name="chevron-right" size={24} color={"#fff"} />
            </TouchableOpacity>
        </View>
    );
}

function useStyles() {
    const { width, height } = useWindowDimensions();

    return StyleSheet.create({
        container: {
            flex: 1,
        },
        header: {
            marginTop: height > 750 ? 60 : 40,
            marginBottom: 20,
            paddingHorizontal: 20,
        },
        title: {
            fontSize: width > 375 ? 24 : 20,
            fontWeight: '600',
            textAlign: 'center',
        },
        filterContainer: {
            flexDirection: 'row',
            marginHorizontal: 20,
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
        },
        filterButton: {
            flex: 1,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        filterText: {
            fontSize: width > 375 ? 14 : 12,
            fontWeight: '500',
        },
        ordersList: {
            padding: 20,
            paddingBottom: 100,
        },
        orderCard: {
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
        },
        orderHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        orderHeaderLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        orderRef: {
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '600',
        },
        orderTime: {
            fontSize: width > 375 ? 14 : 12,
        },
        orderContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        customerName: {
            fontSize: width > 375 ? 15 : 13,
            fontWeight: '500',
        },
        orderAmount: {
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '600',
        },
        historyButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            borderRadius: 12,
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            gap: 8,
        },
        historyButtonText: {
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '500',
        },
        orderIcons: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
        },
        statusIconContainer: {
            marginLeft: 8
        },
        // Nouvel indicateur de menu
        menuIndicator: {
            backgroundColor: '#E6F0FF',
            borderRadius: 4,
            padding: 4,
            marginRight: 4
        },
        // Styles pour le loader
        loaderContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 80,
        },
        loaderText: {
            marginTop: 12,
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '500',
        },
        // Style pour afficher un message quand il n'y a pas de commandes
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 50,
        },
        emptyText: {
            marginTop: 12,
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '500',
        }
    });
}

export default ContentOrder;