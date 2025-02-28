import React, { useState, useEffect }  from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, RefreshControl, Modal, Platform, Alert } from "react-native";
import { GestureHandlerRootView, FlatList, Swipeable } from 'react-native-gesture-handler';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

function AllOrders({ refreshCounter, onRefresh }) {
    const [orders, setOrders] = useState([]);
    const [groupedOrders, setGroupedOrders] = useState({});
    const [selectedMonthOrders, setSelectedMonthOrders] = useState([]);
    const [restaurantId, setRestaurantId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMonthLabel, setSelectedMonthLabel] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [theme, setTheme] = useState(''); // Nouveau state pour le thème

    const navigation = useNavigation();
    const { t } = useTranslation();
    const { colors } = useColors();
    const styles = useStyles();
    const route = useRoute();
    
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho"

    useEffect(() => {
        if (route.params?.triggerRefresh) {
            fetchOrders();
        }
    }, [route.params?.triggerRefresh]);

    useEffect(() => {
        const fetchRestaurantId = async () => {
            try {
                const owner = await AsyncStorage.getItem("owner");
                const ownerData = JSON.parse(owner);                
                setRestaurantId(ownerData.restaurantId);
            } catch (error) {
                console.error('Erreur récupération utilisateur:', error);
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

    const fetchOrders = async () => {
        try {
            const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/getRestaurantOrders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    restaurant_id: restaurantId
                })
            });

            const data = await response.json();
            if (data.success && data.data) {
                const completedOrders = data.data.filter(order => order.status === "COMPLETED");
                setOrders(completedOrders);
                groupOrdersByMonth(completedOrders);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error('Erreur:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    useEffect(() => {
        if (restaurantId) {
            fetchOrders();
        }
    }, [restaurantId]);

    const onRefreshList = async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    };

    const groupOrdersByMonth = (ordersData) => {
        const grouped = ordersData.reduce((acc, order) => {
            const date = new Date(order.created_at);
            const monthKey = `${date.getMonth()}-${date.getFullYear()}`;
            const monthNames = [
                'january', 'february', 'march', 'april', 'may', 'june',
                'july', 'august', 'september', 'october', 'november', 'december'
            ];
            const monthLabel = `${t(monthNames[date.getMonth()])} ${date.getFullYear()}`;
            
            if (!acc[monthKey]) {
                acc[monthKey] = { label: monthLabel, orders: [] };
            }
            acc[monthKey].orders.push(order);
            return acc;
        }, {});

        const sortedGrouped = Object.fromEntries(
            Object.entries(grouped).sort(([keyA], [keyB]) => {
                const [monthA, yearA] = keyA.split('-');
                const [monthB, yearB] = keyB.split('-');
                return yearB - yearA || monthB - monthA;
            })
        );

        setGroupedOrders(sortedGrouped);
    };

    const handleMonthSelect = (monthKey, monthLabel) => {
        setSelectedMonthOrders(groupedOrders[monthKey].orders);
        setSelectedMonthLabel(monthLabel);
        setModalVisible(true);
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


    const renderRightActions = (progress, dragX, order) => {
        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });
    
        return (
            <View style={styles.actionsContainer}>
                <Animated.View style={[styles.rightAction, { transform: [{ scale }] }]}>
                    <TouchableOpacity
                        onPress={async () => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                            // Ajout de l'alerte de confirmation
                            Alert.alert(
                                t('Confirmer la supression'),  // "Confirmer la suppression"
                                t('Êtes-vous sûr de vouloir supprimer cette commande ?'),  // "Êtes-vous sûr de vouloir supprimer cette commande ?"
                                [
                                    {
                                        text: t('Annulet'),  // "Annuler"
                                        style: 'cancel'
                                    },
                                    {
                                        text: t('Confirmer'),  // "Confirmer"
                                        style: 'destructive',
                                        onPress: async () => {
                                            try {
                                                const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/updateOrder', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                                                    },
                                                    body: JSON.stringify({
                                                        order_id: order.id,
                                                        new_status: 'DELETED'  // Changé de 'COMPLETED' à 'DELETED'
                                                    })
                                                });
                                                if (response.ok) {
                                                    fetchOrders();
                                                    setModalVisible(false);
                                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                                }
                                            } catch (error) {
                                                console.error(error);
                                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                                            }
                                        }
                                    }
                                ]
                            );
                        }}
                        style={[styles.actionButton, { backgroundColor: colors.colorRed }]}
                    >
                        <Icon name="trash-can-outline" size={24} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    };

    const renderOrderItem = ({ item }) => {
        const deliveryIcon = getDeliveryIcon(item.type);
        
        return (
            <Swipeable
                friction={2}
                leftThreshold={80}
                rightThreshold={40}
                renderRightActions={(progress, dragX) => 
                    renderRightActions(progress, dragX, item)
                }
                onSwipeableWillOpen={() => Haptics.selectionAsync()}
            >
                <TouchableOpacity 
                    onPress={() => {
                        setModalVisible(false);
                        navigation.navigate('OrderSelectData', { 
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
                                orders: item.order_items,
                                preparing_by : item.preparing_by
                            }
                        });
                    }}
                    style={[styles.orderItem, { backgroundColor: colors.colorBorderAndBlock }]}
                >
                    <View style={[styles.orderIcon, {backgroundColor: theme === 'dark' ? "rgba(162, 162, 167, 0.05)" : colors.colorDetaillight}]}>

                        <View style={styles.orderIcons}>
                            {deliveryIcon && (
                                <Icon 
                                    name={deliveryIcon.name} 
                                    size={24} 
                                    color={deliveryIcon.color} 
                                />
                            )}
                        </View>
                    </View>
                    <View style={styles.orderDetails}>
                        <View>
                            <View style={styles.orderHeaderLeft}>
                                <Text style={[styles.orderNumber, { color: colors.colorText}]}>
                                    {item.order_number}
                                </Text>
                                <Text style={[styles.orderTime, { color: colors.colorDetail }]}>
                                    {formatTime(item.created_at)}
                                </Text>
                            </View>
                            <Text style={[styles.customerName, { color: colors.colorDetail }]}>
                                {item.customers.last_name} {item.customers.first_name}
                            </Text>
                        </View>
                        <Text style={[styles.orderPrice, { color: colors.colorText }]}>
                            {item.amount_total.toFixed(2)}€
                        </Text>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.colorText }]}>{t('history')}</Text>
                </View>

                <FlatList
                    data={Object.entries(groupedOrders)}
                    keyExtractor={([key]) => key}
                    renderItem={({item: [monthKey, { label, orders }]}) => (
                        <TouchableOpacity 
                            onPress={() => handleMonthSelect(monthKey, label)}
                            style={[styles.monthItem, { 
                                backgroundColor: colors.colorBorderAndBlock 
                            }]}
                        >
                            <Text style={[styles.monthText, { 
                                color: colors.colorText 
                            }]}>
                                {t(label.toLowerCase())}
                            </Text>
                            <View style={styles.orderStats}>
                                <View style={styles.orderCount}>
                                    <Text style={[styles.orderCountText, { 
                                        color: colors.colorDetail 
                                    }]}>
                                        {orders.length} {orders.length > 1 ? 
                                            t('orders') : t('order')}
                                    </Text>
                                    <Text style={[styles.totalPrice, { 
                                        color: colors.colorText
                                    }]}>
                                        {orders.reduce((total, order) => 
                                            total + order.amount_total, 0
                                        ).toFixed(2)} €
                                    </Text>
                                </View>
                                <Icon name="chevron-right" size={24} color={colors.colorDetail} />
                            </View>
                        </TouchableOpacity>
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefreshList}
                            tintColor={colors.colorAction}
                        />
                    }
                    contentContainerStyle={styles.listContent}
                />

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={[styles.modalContent, { 
                            backgroundColor: colors.colorBackground 
                        }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { 
                                    color: colors.colorText 
                                }]}>
                                    {selectedMonthLabel}
                                </Text>
                                <TouchableOpacity 
                                    onPress={() => setModalVisible(false)}
                                    style={[styles.closeButton, {
                                        backgroundColor: colors.colorBorderAndBlock
                                    }]}
                                >
                                    <Icon 
                                        name="close" 
                                        size={24} 
                                        color={colors.colorText}
                                    />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={selectedMonthOrders}
                                renderItem={renderOrderItem}
                                keyExtractor={item => item.id}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefreshList}
                                        tintColor={colors.colorAction}
                                    />
                                }contentContainerStyle={styles.modalScroll}
                                />
                            </View>
                        </View>
                    </Modal>
                </View>
            </GestureHandlerRootView>
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
            listContent: {
                padding: 20,
                paddingBottom: Platform.OS === 'ios' ? 40 : 20,
            },
            monthItem: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                marginBottom: 12,
                borderRadius: 12,
            },
            monthText: {
                fontSize: width > 375 ? 16 : 14,
                fontWeight: '600',
            },
            orderStats: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
            },
            orderCount: {
                alignItems: 'flex-end',
            },
            orderCountText: {
                fontSize: width > 375 ? 14 : 12,
                marginBottom: 4,
            },
            totalPrice: {
                fontSize: width > 375 ? 16 : 14,
                fontWeight: '500',
            },
            modalContainer: {
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
            modalContent: {
                flex: 1,
                marginTop: 60,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
            },
            modalHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(162, 162, 167, 0.1)',
            },
            modalTitle: {
                fontSize: width > 375 ? 20 : 18,
                fontWeight: '600',
                textTransform: 'capitalize',
            },
            closeButton: {
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
            },
            modalScroll: {
                padding: 20,
                paddingBottom: Platform.OS === 'ios' ? 40 : 20,
            },
            orderItem: {
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                marginBottom: 12,
                borderRadius: 12,
            },
            orderIcon: {
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
            },
            orderIcons: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4
            },
            orderDetails: {
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            },
            orderNumber: {
                fontSize: width > 375 ? 16 : 14,
                fontWeight: '600',
                marginBottom: 4,
            },
            customerName: {
                fontSize: width > 375 ? 14 : 12,
            },
            orderPrice: {
                fontSize: width > 375 ? 16 : 14,
                fontWeight: '600',
            },
            actionsContainer: {
                width: 70,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
            },
            actionButton: {
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
            },
            rightAction: {
                alignItems: 'center',
            },
            orderHeaderLeft: {
                flexDirection: 'row',
                gap: 12,
                marginBottom: 4,
            },
            orderTime: {
                fontSize: width > 375 ? 14 : 12,
            },
        });
    }
    
    export default AllOrders;