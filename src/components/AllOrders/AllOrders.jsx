import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';

function AllOrders({ refreshCounter, onRefresh }) {
    const [orders, setOrders] = useState([]);
    const [groupedOrders, setGroupedOrders] = useState({});
    const [selectedMonthOrders, setSelectedMonthOrders] = useState([]);
    const [restaurantId, setRestaurantId] = useState(null)
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMonthLabel, setSelectedMonthLabel] = useState('');
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { colors } = useColors();
    const styles = useStyles();
    const SUPABASE_ANON_KEY = Constants.expoConfig.extra.supabaseAnonKey;;


    useEffect(() => {
        const fetchRestaurantId = async () => {
            try {
                const owner = await AsyncStorage.getItem("owner");
                const ownerData = JSON.parse(owner);                
                setRestaurantId(ownerData.restaurantId);
                
            } catch (error) {
                console.error('Erreur lors de la récupération des informations utilisateur:', error);
            }
        };
        fetchRestaurantId();
    }, []);


    const fetchOrders = async () => {
        try {
            if (!restaurantId) {
                return;
            }
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

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data.success && data.data) {
                setOrders(data.data);
                groupOrdersByMonth(data.data);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [restaurantId]);

    useEffect(() => {
        if (refreshCounter > 0) {
            fetchOrders();
            alert('Commandes mises à jour');
        }
    }, [refreshCounter]);

    const groupOrdersByMonth = (ordersData) => {
        const grouped = ordersData.reduce((acc, order) => {
            const date = new Date(order.created_at);
            const monthKey = `${date.getMonth()}-${date.getFullYear()}`;
            
            // Obtenir le nom du mois en anglais pour la traduction
            const monthNames = [
                'january', 'february', 'march', 'april', 'may', 'june',
                'july', 'august', 'september', 'october', 'november', 'december'
            ];
            const monthLabel = `${t(monthNames[date.getMonth()])} ${date.getFullYear()}`;
            
            if (!acc[monthKey]) {
                acc[monthKey] = {
                    label: monthLabel,
                    orders: []
                };
            }
            acc[monthKey].orders.push(order);
            return acc;
        }, {});
    
        // Trier les mois par date décroissante
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

    const calculateTotalPrice = (order) => {
        return order.amount_total.toFixed(2);
    };

    const formatOrderForDetails = (order) => {
        
        return {
            client_ref_order: order.order_number,
            payment_status: order.payment_status,
            order_id: order.id,
            client_method: order.type === "PICKUP" ? "A emporter" : "Livraison",
            client_payment: order.payment_method,
            client_lastname: order.customers.last_name,
            client_firstname: order.customers.first_name,
            client_phone: order.customers.phone,
            client_email: order.customers.email,
            order_comment: order.comment,
            client_address: `${order.addresses.street}, ${order.addresses.city} ${order.addresses.postal_code}`,
            client_id: order.id,
            amount_total: order.amount_total,
            orders: order.order_items.map(item => ({
                id: item.id,
                comment: item.comment,
                order_quantity: item.quantity,
                product_title: item.name,
                product_price: item.unit_price,
                subtotal: item.subtotal
            }))
        };
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                {Object.entries(groupedOrders).map(([monthKey, { label, orders }]) => (
                    <TouchableOpacity 
                        key={monthKey}
                        style={[styles.monthItem, { backgroundColor: colors.colorBackground }]}
                        onPress={() => handleMonthSelect(monthKey, label)}
                    >
                        <Text style={[styles.monthText, { color: colors.colorText }]}>
                            {t(label.toLowerCase())}
                        </Text>
                        <View style={[styles.orderCount, { backgroundColor: colors.colorBackground }]}>
                            <View>
                                <Text style={[styles.orderCountText, { color: colors.colorDetail }]}>
                                    {orders.length} {orders.length > 1 ? t('orders') : t('order')}
                                </Text>
                                <Text style={[styles.totalPrice, { color: colors.colorDetail }]}>
                                    {orders.reduce((total, order) => total + order.amount_total, 0).toFixed(2)} €
                                </Text>
                            </View>
                            <Ionicons 
                                name="chevron-forward" 
                                size={24} 
                                color={colors.colorText}
                            />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Pressable 
                        style={styles.modalOverlay}
                        onPress={() => setModalVisible(false)}
                    />
                    <View style={[styles.modalContent, { backgroundColor: colors.colorBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.colorText }]}>
                                {selectedMonthLabel}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons 
                                    name="close" 
                                    size={24} 
                                    color={colors.colorText}
                                />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {selectedMonthOrders.map(order => (
                                <TouchableOpacity 
                                    key={order.id}
                                    onPress={() => {
                                        setModalVisible(false);
                                        navigation.navigate('OrderSelectData', { order: formatOrderForDetails(order)});
                                    }}
                                    style={styles.orderItem}
                                >
                                    <View style={[styles.orderIcon, { backgroundColor: colors.colorText }]}>
                                        <Ionicons 
                                            size={28} 
                                            color={colors.colorAction} 
                                            name="bag-handle-outline"
                                        />
                                    </View>
                                    <View style={styles.orderDetails}>
                                        <View>
                                            <Text style={[styles.orderNumber, { color: colors.colorText }]}>
                                                {order.order_number}
                                            </Text>
                                            <Text style={[styles.customerName, { color: colors.colorDetail }]}>
                                                {order.customers.last_name} {order.customers.first_name}
                                            </Text>
                                        </View>
                                        <Text style={[styles.orderPrice, { color: colors.colorText }]}>
                                            {calculateTotalPrice(order)} €
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function useStyles() {
    const { width, height } = useWindowDimensions();
    const { colors } = useColors();

    return StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 15,
            backgroundColor: colors.colorBackground,
        },
        monthItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 15,
            paddingHorizontal: 20,
            marginHorizontal: 20,
            marginVertical: 10,
            borderRadius: 15,
            shadowColor: "#505050",
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.35,
            shadowRadius: 5.84,
            elevation: 8,
        },
        monthText: {
            fontSize: 18,
            fontWeight: '600',
            textTransform: 'capitalize',
        },
        orderCount: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
            shadowColor: "#808080",
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            elevation: 2,
        },
        orderCountText: {
            fontSize: 14,
            fontWeight: '500',
            textAlign: 'right',
        },
        totalPrice: {
            fontSize: 16,
            fontWeight: '600',
            marginTop: 2,
            textAlign: 'right',
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'flex-end',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            minHeight: height * 0.7,
            paddingBottom: 30,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#333',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            textTransform: 'capitalize',
        },
        closeButton: {
            padding: 5,
        },
        modalScroll: {
            padding: 20,
        },
        orderItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        orderIcon: {
            width: width > 375 ? 50 : 40,
            height: width > 375 ? 50 : 40,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 15,
        },
        orderDetails: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        orderNumber: {
            fontSize: width > 375 ? 18 : 15,
        },
        customerName: {
            fontSize: width > 375 ? 14 : 12,
        },
        orderPrice: {
            fontSize: width > 375 ? 18 : 15,
        },
    });
}

export default AllOrders;