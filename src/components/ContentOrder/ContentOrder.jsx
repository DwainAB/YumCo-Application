import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "../ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { useLoading } from "../Hooks/useLoading";
import * as Haptics from 'expo-haptics';
import { registerForPushNotificationsAsync } from '../Notifications/NotificationsOrder';
import { useTranslation } from 'react-i18next';

function ContentOrder() {
    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [expoPushToken, setExpoPushToken] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [restaurantId, setRestaurantId] = useState('');
    const [userId, setUserId] = useState('');
    const [lastFetchTime, setLastFetchTime] = useState(0);
    const { t } = useTranslation();

    const navigation = useNavigation();
    const { colors } = useColors();
    const styles = useStyles();
    const { startLoading, stopLoading } = useLoading();
    
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho";

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
                const ownerData = JSON.parse(owner);                
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
        try {
            const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/getRestaurantOrders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}` 
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
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes:', error.message);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
            order.status !== "DELETED"
        );

        if (filter !== 'ALL') {
            filtered = filtered.filter(order => order.type === filter);
        }
        
        setFilteredOrders(filtered);
    };

    useEffect(() => {
        filterOrders(selectedFilter);
    }, [orders, selectedFilter]);

    // Update Notification Token
    const updateNotificationToken = async (token) => {
        try {
            const response = await fetch("https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/updateUser", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                    "apikey": SUPABASE_ANON_KEY
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
            />

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
        }
    });
}

export default ContentOrder;