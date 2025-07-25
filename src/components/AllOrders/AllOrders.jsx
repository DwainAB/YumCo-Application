import React, { useState, useEffect }  from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, RefreshControl, Modal, Platform, Alert, ScrollView, ActivityIndicator } from "react-native";

import { GestureHandlerRootView, FlatList, Swipeable } from 'react-native-gesture-handler';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { supabase } from "../../lib/supabase";

function AllOrders({ refreshCounter, onRefresh }) {
    const [orders, setOrders] = useState([]);
    const [groupedOrders, setGroupedOrders] = useState({});
    const [selectedMonthOrders, setSelectedMonthOrders] = useState([]);
    const [restaurantId, setRestaurantId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMonthLabel, setSelectedMonthLabel] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [theme, setTheme] = useState(''); // Nouveau state pour le thème
    const [tableInfo, setTableInfo] = useState({});
    const [filterType, setFilterType] = useState(null); // null signifie "tous"
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [onSiteOption, setOnSiteOption] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
        if (orders && orders.length > 0) {
          // Pour chaque commande ON_SITE, récupérer l'info de la table
          orders.forEach(order => {
            if (order.type === 'ON_SITE' && order.table_id) {
              console.log("Récupération d'info pour table_id:", order.table_id);
              console.log("Commande ON_SITE:", order);
              fetchTableInfo(order.table_id);
            }
          });
        }
      }, [orders]);
      
    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                // Récupérer les données du propriétaire
                const owner = await AsyncStorage.getItem("owner");
                const ownerData = JSON.parse(owner);                
                setRestaurantId(ownerData.restaurantId);
                
                // Récupérer les données du restaurant depuis AsyncStorage
                const restaurantData = await AsyncStorage.getItem("restaurant");
                if (restaurantData) {
                    const parsedData = JSON.parse(restaurantData);
                    setOnSiteOption(parsedData.on_site_option);
                } else {
                    // Si les données ne sont pas dans AsyncStorage, les récupérer depuis Supabase
                    const { data, error } = await supabase
                        .from('restaurants')
                        .select('on_site_option')
                        .eq('id', ownerData.restaurantId)
                        .single();
                    
                    if (error) throw error;
                    
                    if (data) {
                        setOnSiteOption(data.on_site_option);
                    }
                }
            } catch (error) {
                console.error('Erreur récupération données restaurant:', error);
            }
        };
        fetchRestaurantData();
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

    const filterOrdersByType = (orders, type) => {
        if (!type) return orders; // Si aucun filtre, retourner toutes les commandes
        return orders.filter(order => order.type === type);
    };
      
    const fetchTableInfo = async (tableId) => {
        if (!tableId) {
          console.log("Pas de tableId fourni");
          return;
        }
        
        if (tableInfo[tableId]) {
          console.log("Info de table déjà en cache pour tableId:", tableId);
          return;
        }
        
        try {
          console.log("Requête Supabase pour tableId:", tableId);
          const { data, error } = await supabase
            .from('tables')
            .select('id, table_number, location')
            .eq('id', tableId)
            .single();
          
          if (error) {
            console.error("Erreur Supabase:", error);
            throw error;
          }
          
          console.log("Données reçues de Supabase:", data);
          
          if (data) {
            // Mettre à jour l'état avec la nouvelle info de table
            setTableInfo(prev => {
              const newState = {
                ...prev,
                [tableId]: {
                  tableNumber: data.table_number,
                  location: data.location
                }
              };
              console.log("Nouveau state tableInfo:", newState);
              return newState;
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des informations de table:', error);
        }
    };

    const fetchOrders = async () => {
        setIsLoading(true);
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
            
            // Attendre 2 secondes avant de masquer le loader
            setTimeout(() => {
                setIsLoading(false);
            }, 2000);
        } catch (error) {
            console.error('Erreur:', error);
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
        const ordersForMonth = groupedOrders[monthKey].orders;
        setSelectedMonthOrders(ordersForMonth);
        setFilteredOrders(filterOrdersByType(ordersForMonth, filterType));
        setSelectedMonthLabel(monthLabel);
        setModalVisible(true);
    };

    const handleFilterChange = (type) => {
        setFilterType(type);
        setFilteredOrders(filterOrdersByType(selectedMonthOrders, type));
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
        if (type === 'ON_SITE') {
            return {
                name: 'silverware-fork-knife',
                color: '#FF9500'
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
        const isOnSite = item.type === 'ON_SITE';
        const tableData = isOnSite && item.table_id ? tableInfo[item.table_id] : null;

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
                                client_method: isOnSite ? "Sur place" : 
                                               item.type === "PICKUP" ? "A emporter" : "Livraison",
                                client_payment: item.payment_method,
                                client_lastname: isOnSite ? "" : item.customers?.last_name || "",
                                client_firstname: isOnSite ? "" : item.customers?.first_name || "",
                                client_phone: isOnSite ? "" : item.customers?.phone || "",
                                client_email: isOnSite ? "" : item.customers?.email || "",
                                order_comment: item.comment,
                                client_address: isOnSite ? "" : 
                                              (item.addresses ? `${item.addresses.street}, ${item.addresses.city} ${item.addresses.postal_code}` : ''),
                                client_id: item.id,
                                amount_total: item.amount_total,
                                orders: item.order_items,
                                preparing_by: item.preparer ? `${item.preparer.first_name} ${item.preparer.last_name}` : '',
                                requested_time: item.requested_time || "",
                                // Ajouter l'information de table si disponible
                                table_number: tableData ? tableData.tableNumber : null,
                                table_location: tableData ? tableData.location : null
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
                            {!isOnSite && item.customers && (

                                <View style={styles.orderHeaderLeft}>
                                    <Text style={[styles.orderNumber, { color: colors.colorText}]}>
                                        {item.order_number}
                                    </Text>
                                    <Text style={[styles.orderTime, { color: colors.colorDetail }]}>
                                        {formatTime(item.created_at)}
                                    </Text>
                                </View>
                               
                                )}
                                
                            {/* Afficher les infos du client seulement si ce n'est pas ON_SITE */}
                            {!isOnSite && item.customers && (
                                <Text style={[styles.customerName, { color: colors.colorDetail }]}>
                                    {item.customers.last_name} {item.customers.first_name}
                                </Text>
                            )}
                            
                            {/* Afficher le numéro de table pour les commandes ON_SITE */}
                            {isOnSite && item.table_id && tableData && (
                                <View style={styles.tableInfoContainer}>
                                    <Text style={[styles.orderNumber, { color: colors.colorText }]}>
                                        Table {tableData.tableNumber} 
                                    </Text>
                                    {tableData.location && (
                                        <Text style={[styles.orderNumber, { color: colors.colorDetail }]}>
                                            ({tableData.location})
                                        </Text>
                                    )}
                                </View>
                            )}
                            
                            {/* Afficher l'heure demandée si disponible */}
                            {isOnSite && item.requested_time && tableData && (
                                <View style={styles.requestedTimeContainer}>
                                    <Icon name="clock-outline" size={14} color={colors.colorDetail} />
                                    <Text style={[styles.requestedTime, { color: colors.colorDetail }]}>
                                        {formatTime(item.requested_time)}
                                    </Text>
                                </View>
                            )}
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
                {isLoading && !refreshing ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={colors.colorAction} />
                    </View>
                ) : (
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
            )}
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

                        {/* Ajout de la barre de filtres qui reste fixe */}
                        <View style={[styles.filterBar, { backgroundColor: colors.colorBackground }]}>
                            <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterScrollContent}
                            >
                            <TouchableOpacity
                                onPress={() => handleFilterChange(null)}
                                style={[
                                styles.filterButton,
                                !filterType ? { backgroundColor: colors.colorAction } : { backgroundColor: colors.colorBorderAndBlock }
                                ]}
                            >
                                <Text style={[
                                styles.filterButtonText, 
                                !filterType ? { color: 'white' } : { color: colors.colorText }
                                ]}>
                                {t('Tous')}
                                </Text>
                            </TouchableOpacity>
                            
                            {onSiteOption && (
                                <TouchableOpacity
                                    onPress={() => handleFilterChange('ON_SITE')}
                                    style={[
                                    styles.filterButton,
                                    filterType === 'ON_SITE' ? { backgroundColor: colors.colorAction } : { backgroundColor: colors.colorBorderAndBlock }
                                    ]}
                                >
                                    <Icon name="silverware-fork-knife" size={14} color={filterType === 'ON_SITE' ? 'white' : '#FF9500'} />
                                    <Text style={[
                                    styles.filterButtonText, 
                                    filterType === 'ON_SITE' ? { color: 'white' } : { color: colors.colorText }
                                    ]}>
                                    {t('Sur place')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity
                                onPress={() => handleFilterChange('PICKUP')}
                                style={[
                                styles.filterButton,
                                filterType === 'PICKUP' ? { backgroundColor: colors.colorAction } : { backgroundColor: colors.colorBorderAndBlock }
                                ]}
                            >
                                <Icon name="shopping-outline" size={14} color={filterType === 'PICKUP' ? 'white' : '#6C5CE7'} />
                                <Text style={[
                                styles.filterButtonText, 
                                filterType === 'PICKUP' ? { color: 'white' } : { color: colors.colorText }
                                ]}>
                                {t('À emporter')}
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={() => handleFilterChange('DELIVERY')}
                                style={[
                                styles.filterButton,
                                filterType === 'DELIVERY' ? { backgroundColor: colors.colorAction } : { backgroundColor: colors.colorBorderAndBlock }
                                ]}
                            >
                                <Icon name="bike-fast" size={14} color={filterType === 'DELIVERY' ? 'white' : '#4ECDC4'} />
                                <Text style={[
                                styles.filterButtonText, 
                                filterType === 'DELIVERY' ? { color: 'white' } : { color: colors.colorText }
                                ]}>
                                {t('Livraison')}
                                </Text>
                            </TouchableOpacity>
                            </ScrollView>
                        </View>

                        <FlatList
                            data={filteredOrders}
                            renderItem={renderOrderItem}
                            keyExtractor={item => item.id}
                            refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefreshList}
                                tintColor={colors.colorAction}
                            />
                            }
                            contentContainerStyle={styles.modalScroll}
                            ListEmptyComponent={() => (
                            <View style={styles.emptyFilterContainer}>
                                <Icon 
                                name={filterType === 'DELIVERY' ? 'bike-fast' : 
                                    filterType === 'PICKUP' ? 'shopping-outline' : 
                                    filterType === 'ON_SITE' ? 'silverware-fork-knife' : 'alert-circle-outline'} 
                                size={60} 
                                color={colors.colorDetail} 
                                />
                                <Text style={[styles.emptyFilterText, { color: colors.colorText }]}>
                                {filterType ? 
                                    `Aucune commande ${filterType === 'DELIVERY' ? 'en livraison' : 
                                                    filterType === 'PICKUP' ? 'à emporter' : 
                                                    'sur place'} pour cette période` :
                                    'Aucune commande pour cette période'}
                                </Text>
                            </View>
                            )}
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
            requestedTimeContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4,
                gap: 4,
            },
            requestedTime: {
                fontSize: width > 375 ? 12 : 10,
                fontStyle: 'italic'
            },
            tableInfoContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4,
                gap: 4,
            },
            tableInfoText: {
                fontSize: width > 375 ? 12 : 10,
                fontWeight: '500',
            },
            filterBar: {
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(162, 162, 167, 0.1)',
                zIndex: 10,
              },
              filterScrollContent: {
                paddingHorizontal: 15,
                gap: 10,
              },
              filterButton: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                gap: 6,
              },
              filterButtonText: {
                fontSize: width > 375 ? 14 : 12,
                fontWeight: '500',
              },
              emptyFilterContainer: {
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 60,
                paddingBottom: 20,
              },
              emptyFilterText: {
                fontSize: 16,
                textAlign: 'center',
                marginTop: 16,
                paddingHorizontal: 20,
              },
            
        });
    }
    
    export default AllOrders;