import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Modal, ScrollView, TextInput, Platform, KeyboardAvoidingView, Keyboard } from "react-native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useColors } from "../components/ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import * as Haptics from 'expo-haptics';
import { supabase } from "../lib/supabase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HoursModal from "../components/Modals/HoursModal"; // Importez le composant modal
import { useNavigation } from '@react-navigation/native';
import { useRestaurantId } from '../hooks/useRestaurantId';

const InformationScreen = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [pickupEnabled, setPickupEnabled] = useState(false);
    const [middayDeliveryEnabled, setMiddayDeliveryEnabled] = useState(false);
    const [eveningDeliveryEnabled, setEveningDeliveryEnabled] = useState(false);
    const [reservationEnabled, setReservationEnabled] = useState(false);
    const [allYouCanEatEnabled, setAllYouCanEatEnabled] = useState(false);
    const [aLaCarteEnabled, setALaCarteEnabled] = useState(false);
    const { restaurantId } = useRestaurantId();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [preparationTime, setPreparationTime] = useState(15);
    const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
    const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
    const [isPrepTimeModalVisible, setIsPrepTimeModalVisible] = useState(false);
    const [isHoursModalVisible, setIsHoursModalVisible] = useState(false); 
    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPreparationTime, setNewPreparationTime] = useState('15');
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [maxDeliveryKm, setMaxDeliveryKm] = useState(5);
    const [isMaxDeliveryKmModalVisible, setIsMaxDeliveryKmModalVisible] = useState(false);
    const [newMaxDeliveryKm, setNewMaxDeliveryKm] = useState('5');
    const [deliveryTiers, setDeliveryTiers] = useState([]);
    const [isDeliveryTiersModalVisible, setIsDeliveryTiersModalVisible] = useState(false);
    const [editingTierIndex, setEditingTierIndex] = useState(null);
    const [currentMinOrder, setCurrentMinOrder] = useState('');
    const [currentMaxDistance, setCurrentMaxDistance] = useState('');
    const { t } = useTranslation();
    const { colors } = useColors();
    const styles = useStyles();
    const navigation = useNavigation();

    useEffect(() => {
        if (restaurantId) {
            fetchRestaurantStatus(restaurantId);
        }

        // Ajout des listeners pour détecter l'apparition et la disparition du clavier
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        // Nettoyage des listeners lors du démontage du composant
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [restaurantId]);

    const fetchRestaurantStatus = async (id) => {
        try {
            const { data, error } = await supabase
                .from('restaurants')
                .select('accept_orders, pickup_option, "midday_delivery", "evening_delivery", reservation_option, phone, email, preparation_time, max_delivery_kilometer, all_you_can_eat_option, a_la_carte, delivery_tiers')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
                setIsEnabled(data.accept_orders);
                setPickupEnabled(data.pickup_option);
                setMiddayDeliveryEnabled(data["midday_delivery"]);
                setEveningDeliveryEnabled(data["evening_delivery"]);
                setReservationEnabled(data.reservation_option || false);
                setAllYouCanEatEnabled(data.all_you_can_eat_option || false); // Initialisation de l'état "All you can eat"
                setALaCarteEnabled(data.a_la_carte || false); // Initialisation de l'état "À la carte"
                setPhoneNumber(data.phone || '');
                setNewPhoneNumber(data.phone || '');
                setEmail(data.email || '');
                setNewEmail(data.email || '');
                setPreparationTime(data.preparation_time || 15);
                setNewPreparationTime(String(data.preparation_time || 15));
                setMaxDeliveryKm(data.max_delivery_kilometer || 5);
                setNewMaxDeliveryKm(String(data.max_delivery_kilometer || 5));
                setDeliveryTiers(data.delivery_tiers || []);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du status:', error);
        }
    };

    const openDeliveryTiersModal = () => {
        Haptics.selectionAsync();
        setIsDeliveryTiersModalVisible(true);
    };
    
    // Fonction pour ajouter un nouveau palier
    const addDeliveryTier = () => {
        const minOrder = parseFloat(currentMinOrder.replace(',', '.'));
        const maxDistance = parseFloat(currentMaxDistance.replace(',', '.'));
        
        if (isNaN(minOrder) || minOrder <= 0 || isNaN(maxDistance) || maxDistance <= 0) {
            Alert.alert(
                t('Invalid values'),
                t('Please enter valid values for minimum order and maximum distance')
            );
            return;
        }
        
        // Vérifier si nous éditons un palier existant ou en ajoutons un nouveau
        if (editingTierIndex !== null) {
            const updatedTiers = [...deliveryTiers];
            updatedTiers[editingTierIndex] = { min_order: minOrder, max_distance: maxDistance };
            setDeliveryTiers(updatedTiers);
            setEditingTierIndex(null);
        } else {
            setDeliveryTiers([...deliveryTiers, { min_order: minOrder, max_distance: maxDistance }]);
        }
        
        // Réinitialiser les champs
        setCurrentMinOrder('');
        setCurrentMaxDistance('');
    };
    
    // Fonction pour éditer un palier existant
    const editTier = (index) => {
        const tier = deliveryTiers[index];
        setCurrentMinOrder(String(tier.min_order));
        setCurrentMaxDistance(String(tier.max_distance));
        setEditingTierIndex(index);
    };
    
    // Fonction pour supprimer un palier
    const deleteTier = (index) => {
        Alert.alert(
            t('Delete tier'),
            t('Are you sure you want to delete this delivery tier?'),
            [
                {
                    text: t('Cancel'),
                    style: 'cancel',
                },
                {
                    text: t('Delete'),
                    style: 'destructive',
                    onPress: () => {
                        const updatedTiers = [...deliveryTiers];
                        updatedTiers.splice(index, 1);
                        setDeliveryTiers(updatedTiers);
                    }
                }
            ]
        );
    };
    
    // Fonction pour sauvegarder les paliers de livraison dans la base de données
    const saveDeliveryTiers = async () => {
        try {
            Haptics.selectionAsync();
            
            // Trier les paliers par distance
            const sortedTiers = [...deliveryTiers].sort((a, b) => a.max_distance - b.max_distance);
            
            const { data, error } = await supabase
                .from('restaurants')
                .update({ delivery_tiers: sortedTiers })
                .eq('id', restaurantId);
    
            if (error) throw error;
    
            setDeliveryTiers(sortedTiers);
            setIsDeliveryTiersModalVisible(false);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
        } catch (error) {
            console.error('Erreur lors de la mise à jour des paliers de livraison:', error);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        }
    };

    const updateMaxDeliveryKm = async () => {
        try {
            Haptics.selectionAsync();
            
            const maxKm = parseFloat(newMaxDeliveryKm.replace(',', '.'));
            if (isNaN(maxKm) || maxKm < 0.1) {
                Alert.alert(
                    t('Invalid distance'),
                    t('Please enter a valid delivery distance')
                );
                return;
            }
            
            const { data, error } = await supabase
                .from('restaurants')
                .update({ max_delivery_kilometer: maxKm })
                .eq('id', restaurantId);
    
            if (error) throw error;
    
            setMaxDeliveryKm(maxKm);
            setIsMaxDeliveryKmModalVisible(false);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la distance de livraison:', error);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        }
    };

    const updateRestaurantOption = async (field, newStatus) => {
        try {
            const { data, error } = await supabase
                .from('restaurants')
                .update({ [field]: newStatus })
                .eq('id', restaurantId);

            if (error) throw error;

            switch(field) {
                case 'accept_orders':
                    setIsEnabled(newStatus);
                    break;
                case 'pickup_option':
                    setPickupEnabled(newStatus);
                    break;
                case 'midday_delivery':
                    setMiddayDeliveryEnabled(newStatus);
                    break;
                case 'evening_delivery':
                    setEveningDeliveryEnabled(newStatus);
                    break;
                case 'reservation_option':
                    setReservationEnabled(newStatus);
                    break;
                case 'all_you_can_eat_option':
                    setAllYouCanEatEnabled(newStatus);
                    break;
                case 'a_la_carte':
                    setALaCarteEnabled(newStatus);
                    break;
            }
            
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        }
    };

    const updatePhoneNumber = async () => {
        try {
            Haptics.selectionAsync();
            
            const { data, error } = await supabase
                .from('restaurants')
                .update({ phone: newPhoneNumber })
                .eq('id', restaurantId);

            if (error) throw error;

            setPhoneNumber(newPhoneNumber);
            setIsPhoneModalVisible(false);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
        } catch (error) {
            console.error('Erreur lors de la mise à jour du numéro:', error);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        }
    };

    const updateEmail = async () => {
        try {
            Haptics.selectionAsync();
            
            const { data, error } = await supabase
                .from('restaurants')
                .update({ email: newEmail })
                .eq('id', restaurantId);

            if (error) throw error;

            setEmail(newEmail);
            setIsEmailModalVisible(false);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'email:', error);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        }
    };

    const updatePreparationTime = async () => {
        try {
            Haptics.selectionAsync();
            
            const prepTime = parseInt(newPreparationTime);
            if (isNaN(prepTime) || prepTime < 1) {
                Alert.alert(
                    t('Invalid time'),
                    t('Please enter a valid preparation time')
                );
                return;
            }
            
            const { data, error } = await supabase
                .from('restaurants')
                .update({ preparation_time: prepTime })
                .eq('id', restaurantId);

            if (error) throw error;

            setPreparationTime(prepTime);
            setIsPrepTimeModalVisible(false);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
        } catch (error) {
            console.error('Erreur lors de la mise à jour du temps de préparation:', error);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        }
    };

    const handleToggle = (type, currentStatus) => {
        Haptics.selectionAsync();
        const newStatus = !currentStatus;
        
        let title, message, field;
        
        switch(type) {
            case 'orders':
                title = newStatus ? t('enable') : t('disable');
                message = newStatus 
                    ? t('Are you sure you want to enable orders?')
                    : t('Are you sure you want to disable orders? This will prevent new orders from coming in.');
                field = 'accept_orders';
                break;
            case 'pickup':
                title = newStatus ? t('enable') : t('disable');
                message = newStatus
                    ? t('Are you sure you want to enable pickup orders?')
                    : t('Are you sure you want to disable pickup orders?');
                field = 'pickup_option';
                break;
            case 'midday_delivery':
                title = newStatus ? t('enable') : t('disable');
                message = newStatus
                    ? t('confirm_enable_lunch_delivery')
                    : t('confirm_disable_lunch_delivery');
                field = 'midday_delivery';
                break;
            case 'evening_delivery':
                title = newStatus ? t('enable') : t('disable');
                message = newStatus
                    ? t('confirm_enable_dinner_delivery')
                    : t('confirm_disable_dinner_delivery');
                field = 'evening_delivery';
                break;
            case 'reservation':
                title = newStatus ? t('enable') : t('disable');
                message = newStatus
                    ? t('Are you sure you want to enable reservations?')
                    : t('Are you sure you want to disable reservations? This will prevent new reservations from coming in.');
                field = 'reservation_option';
                break;
            case 'all_you_can_eat_option':
                title = newStatus ? t('enable') : t('disable');
                message = newStatus
                    ? t('Are you sure you want to enable All You Can Eat service?')
                    : t('Are you sure you want to disable All You Can Eat service?');
                field = 'all_you_can_eat_option';
                break;
            case 'a_la_carte':
                title = newStatus ? t('enable') : t('disable');
                message = newStatus
                    ? t('Are you sure you want to enable À la carte service?')
                    : t('Are you sure you want to disable À la carte service?');
                field = 'a_la_carte';
                break;
        }

        Alert.alert(
            title,
            message,
            [
                {
                    text: t('Cancel'),
                    style: 'cancel',
                },
                {
                    text: t('Confirm'),
                    style: newStatus ? 'default' : 'destructive',
                    onPress: () => updateRestaurantOption(field, newStatus)
                }
            ]
        );
    };

    const SettingRow = ({ title, description, value, onToggle }) => (
        <View style={styles.settingRow}>
            <View>
                <Text style={[styles.settingTitle, { color: colors.colorText }]}>
                    {title}
                </Text>
                <Text style={[styles.settingDescription, { color: colors.colorDetail }]}>
                    {description}
                </Text>
            </View>
            <Switch
                trackColor={{ false: "#767577", true: colors.colorAction }}
                thumbColor={"#ffffff"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={onToggle}
                value={value}
            />
        </View>
    );

    const ContactInfoRow = ({ title, value, onPress }) => (
        <View style={[styles.phoneRow, styles.contactRow]}>
            <View>
                <Text style={[styles.settingTitle, { color: colors.colorText }]}>
                    {title}
                </Text>
                <Text style={[styles.phoneNumber, { color: colors.colorDetail }]}>
                    {value || t('Not specified')}
                </Text>
            </View>
            <TouchableOpacity 
                onPress={onPress}
                style={[styles.editButton, { backgroundColor: colors.colorAction }]}
            >
                <Icon name="pencil" size={20} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.colorBackground }]}>
            <HeaderSetting 
                color={colors.colorText} 
                name={t('Information')} 
                navigateTo="SettingPage"
            />
            
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 30 }} 
            >
                <Text style={[styles.sectionHeader, { color: colors.colorText }]}>
                    {t('Contact')}
                </Text>
                
                <View style={[styles.card, { backgroundColor: colors.colorBorderAndBlock }]}>
                    <View style={[styles.settingContainer, styles.borderBottom]}>
                        <ContactInfoRow
                            title={t('Phone number')}
                            value={phoneNumber}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setIsPhoneModalVisible(true);
                            }}
                        />
                    </View>
                    <View style={styles.settingContainer}>
                        <ContactInfoRow
                            title={t('email')}
                            value={email}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setIsEmailModalVisible(true);
                            }}
                        />
                    </View>
                </View>

                <Text style={[styles.sectionHeader, { color: colors.colorText }]}>
                    {t('schedules')}
                </Text>
                
                <View style={[styles.card, { backgroundColor: colors.colorBorderAndBlock }]}>
                    <TouchableOpacity 
                        onPress={() => {
                            Haptics.selectionAsync();
                            setIsHoursModalVisible(true);
                        }}
                        style={styles.settingContainer}
                    >
                        <View style={styles.phoneRow}>
                            <View>
                                <Text style={[styles.settingTitle, { color: colors.colorText }]}>
                                    {t('opening_hours')}
                                </Text>
                                <Text style={[styles.settingDescription, { color: colors.colorDetail }]}>
                                    {t('set_opening_hours')}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setIsHoursModalVisible(true);
                                }}
                                style={[styles.editButton, { backgroundColor: colors.colorAction }]}
                            >
                                <Icon name="clock-outline" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Nouvelle section: Commande sur place */}
                <Text style={[styles.sectionHeader, { color: colors.colorText }]}>
                    {t('Commande sur place')}
                </Text>
                
                <View style={[styles.card, { backgroundColor: colors.colorBorderAndBlock }]}>
                    <View style={[styles.settingContainer, styles.borderBottom]}>
                        <SettingRow
                            title={t('all_you_can_eat')}
                            description={allYouCanEatEnabled ? t('all_you_can_eat_enabled') : t('all_you_can_eat_disabled')}
                            value={allYouCanEatEnabled}
                            onToggle={() => handleToggle('all_you_can_eat_option', allYouCanEatEnabled)}
                        />
                        {allYouCanEatEnabled && (
                            <TouchableOpacity 
                                style={[styles.manageButton, { backgroundColor: colors.colorAction }]}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    navigation.navigate('allYouCanEatSetting', { restaurantId });
                                }}
                            >
                                <Text style={styles.manageButtonText}>{t('configure_menu_type')}</Text>
                                <Icon name="arrow-right" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.settingContainer}>
                        <SettingRow
                            title={t('a_la_carte')}
                            description={aLaCarteEnabled ? t('a_la_carte_enabled') : t('a_la_carte_disabled')}
                            value={aLaCarteEnabled}
                            onToggle={() => handleToggle('a_la_carte', aLaCarteEnabled)}
                        />
                    </View>
                </View>

                <Text style={[styles.sectionHeader, { color: colors.colorText }]}>
                    {t('reservation')}
                </Text>
                
                <View style={[styles.card, { backgroundColor: colors.colorBorderAndBlock }]}>
                    <View style={styles.settingContainer}>
                        <SettingRow
                            title={t('enable_reservations')}
                            description={reservationEnabled ? t('reservation_enabled') : t('reservation_disabled')}
                            value={reservationEnabled}
                            onToggle={() => handleToggle('reservation', reservationEnabled)}
                        />
                    </View>
                </View>

                <Text style={[styles.sectionHeader, { color: colors.colorText }]}>
                    {t('Delivery')}
                </Text>
                
                <View style={[styles.card, { backgroundColor: colors.colorBorderAndBlock }]}>
                    <View style={[styles.settingContainer, styles.borderBottom]}>
                        <SettingRow
                            title={t('Activate orders')}
                            description={isEnabled ? t('Orders are enabled') : t('Orders are disabled')}
                            value={isEnabled}
                            onToggle={() => handleToggle('orders', isEnabled)}
                        />
                    </View>

                    <View style={[styles.settingContainer, styles.borderBottom]}>
                        <SettingRow
                            title={t('Pickup orders')}
                            description={pickupEnabled ? t('Pickup is enabled') : t('Pickup is disabled')}
                            value={pickupEnabled}
                            onToggle={() => handleToggle('pickup', pickupEnabled)}
                        />
                    </View>

                    <View style={[styles.settingContainer, styles.borderBottom]}>
                        <SettingRow
                            title={t('lunch_delivery_service')}
                            description={middayDeliveryEnabled ? t('enable') : t('disable')}
                            value={middayDeliveryEnabled}
                            onToggle={() => handleToggle('midday_delivery', middayDeliveryEnabled)}
                        />
                    </View>

                    <View style={[styles.settingContainer, styles.borderBottom]}>
                        <SettingRow
                            title={t('dinner_delivery_service')}
                            description={eveningDeliveryEnabled ? t('enable') : t('disable')}
                            value={eveningDeliveryEnabled}
                            onToggle={() => handleToggle('evening_delivery', eveningDeliveryEnabled)}
                        />
                    </View>
                    {(middayDeliveryEnabled || eveningDeliveryEnabled) && (
                        <View style={[styles.settingContainer, styles.borderBottom]}>
                            <View style={styles.phoneRow}>
                                <View>
                                    <Text style={[styles.settingTitle, { color: colors.colorText }]}>
                                        {t('delivery_zones_conditions')}
                                    </Text>
                                    <Text style={[styles.settingDescription, { color: colors.colorDetail }]}>
                                        {deliveryTiers.length > 0 
                                            ? t('configure_zones_conditions', { count: deliveryTiers.length }) 
                                            : t('no_delivery_tiers')}
                                    </Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={openDeliveryTiersModal}
                                    style={[styles.editButton, { backgroundColor: colors.colorAction }]}
                                >
                                    <Icon name="pencil" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.settingContainer}>
                        <View style={styles.phoneRow}>
                            <View>
                                <Text style={[styles.settingTitle, { color: colors.colorText }]}>
                                    {t('average_preparation_time')}
                                </Text>
                                <Text style={[styles.settingDescription, { color: colors.colorDetail }]}>
                                    {preparationTime} {t('minutes')}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setIsPrepTimeModalVisible(true);
                                }}
                                style={[styles.editButton, { backgroundColor: colors.colorAction }]}
                            >
                                <Icon name="pencil" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[styles.settingContainer]}>
                        <View style={styles.phoneRow}>
                            <View>
                                <Text style={[styles.settingTitle, { color: colors.colorText }]}>
                                    {t('max_delivery_distance')}
                                </Text>
                                <Text style={[styles.settingDescription, { color: colors.colorDetail }]}>
                                    {maxDeliveryKm} {t('kilometers')}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setIsMaxDeliveryKmModalVisible(true);
                                }}
                                style={[styles.editButton, { backgroundColor: colors.colorAction }]}
                            >
                                <Icon name="pencil" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Nouveau modal pour les paliers de livraison */}
            <Modal
                visible={isDeliveryTiersModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsDeliveryTiersModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.colorBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.colorText }]}>
                                {t('delivery_zones_conditions')}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setIsDeliveryTiersModalVisible(false)}
                                style={[styles.closeButton, { backgroundColor: colors.colorBorderAndBlock }]}
                            >
                                <Icon name="close" size={24} color={colors.colorText} />
                            </TouchableOpacity>
                        </View>

                        {/* Liste des paliers existants */}
                        {deliveryTiers.length > 0 && (
                            <View style={styles.tiersList}>
                                <Text style={[styles.tiersListHeader, { color: colors.colorText }]}>
                                    {t('current_zones_conditions')}
                                </Text>
                                {deliveryTiers.map((tier, index) => (
                                    <View key={index} style={[styles.tierItem, { backgroundColor: colors.colorBorderAndBlock }]}>
                                        <View style={styles.tierInfo}>
                                            <Text style={[styles.tierText, { color: colors.colorText }]}>
                                                {t('minimum_order')}: {tier.min_order}€
                                            </Text>
                                            <Text style={[styles.tierText, { color: colors.colorText }]}>
                                                {t('maximum_distance')}: {tier.max_distance}km
                                            </Text>
                                        </View>
                                        <View style={styles.tierActions}>
                                            <TouchableOpacity 
                                                onPress={() => editTier(index)}
                                                style={[styles.tierActionButton, { backgroundColor: colors.colorAction }]}
                                            >
                                                <Icon name="pencil" size={16} color="#FFFFFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                onPress={() => deleteTier(index)}
                                                style={[styles.tierActionButton, { backgroundColor: '#FF3B30', marginLeft: 8 }]}
                                            >
                                                <Icon name="delete" size={16} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Formulaire d'ajout/édition de palier */}
                        <Text style={[styles.formLabel, { color: colors.colorText, marginTop: 16 }]}>
                            {editingTierIndex !== null ? t('edit') : t('add_new_zones_conditions')}
                        </Text>
                        
                        <View style={styles.tierForm}>
                            <View style={styles.formRow}>
                                <Text style={[styles.inputLabel, { color: colors.colorDetail }]}>
                                    {t('minimum_order')} (€)
                                </Text>
                                <TextInput
                                    style={[styles.tierInput, { 
                                        backgroundColor: colors.colorBorderAndBlock,
                                        color: colors.colorText
                                    }]}
                                    value={currentMinOrder}
                                    onChangeText={setCurrentMinOrder}
                                    keyboardType="numeric"
                                    placeholder="10"
                                    placeholderTextColor={colors.colorDetail}
                                />
                            </View>
                            
                            <View style={styles.formRow}>
                                <Text style={[styles.inputLabel, { color: colors.colorDetail }]}>
                                    {t('maximum_distance')} (km)
                                </Text>
                                <TextInput
                                    style={[styles.tierInput, { 
                                        backgroundColor: colors.colorBorderAndBlock,
                                        color: colors.colorText
                                    }]}
                                    value={currentMaxDistance}
                                    onChangeText={setCurrentMaxDistance}
                                    keyboardType="numeric"
                                    placeholder="5"
                                    placeholderTextColor={colors.colorDetail}
                                />
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[styles.addButton, { backgroundColor: colors.colorAction }]}
                            onPress={addDeliveryTier}
                        >
                            <Text style={styles.buttonText}>
                                {editingTierIndex !== null ? t('edit') : t('add')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.saveButton, { backgroundColor: colors.colorAction, marginTop: 16 }]}
                            onPress={saveDeliveryTiers}
                        >
                            <Text style={styles.saveButtonText}>{t('Save')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal pour éditer le numéro de téléphone */}
            <Modal
                visible={isPhoneModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsPhoneModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.colorBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.colorText }]}>
                                {t('Edit phone number')}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setIsPhoneModalVisible(false)}
                                style={[styles.closeButton, { backgroundColor: colors.colorBorderAndBlock }]}
                            >
                                <Icon name="close" size={24} color={colors.colorText} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.colorBorderAndBlock,
                                color: colors.colorText
                            }]}
                            value={newPhoneNumber}
                            onChangeText={setNewPhoneNumber}
                            placeholder={t('Enter phone number')}
                            placeholderTextColor={colors.colorDetail}
                            keyboardType="phone-pad"
                        />

                        <TouchableOpacity 
                            style={[styles.saveButton, { backgroundColor: colors.colorAction }]}
                            onPress={updatePhoneNumber}
                        >
                            <Text style={styles.saveButtonText}>{t('confirm')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal pour éditer l'email */}
            <Modal
                visible={isEmailModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsEmailModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.colorBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.colorText }]}>
                                {t('Edit email')}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setIsEmailModalVisible(false)}
                                style={[styles.closeButton, { backgroundColor: colors.colorBorderAndBlock }]}
                            >
                                <Icon name="close" size={24} color={colors.colorText} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.colorBorderAndBlock,
                                color: colors.colorText
                            }]}
                            value={newEmail}
                            onChangeText={setNewEmail}
                            placeholder={t('Enter email')}
                            placeholderTextColor={colors.colorDetail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TouchableOpacity 
                            style={[styles.saveButton, { backgroundColor: colors.colorAction }]}
                            onPress={updateEmail}
                        >
                            <Text style={styles.saveButtonText}>{t('confirm')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal pour le temps de préparation */}
            <Modal
                visible={isPrepTimeModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsPrepTimeModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <View 
                        style={[
                            styles.modalContent, 
                            { 
                                backgroundColor: colors.colorBackground,
                                // Ajustement de la position du modal quand le clavier est visible
                                marginTop: keyboardVisible ? '30%' : 'auto'
                            }
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.colorText }]}>
                                {t('average_preparation_time')}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setIsPrepTimeModalVisible(false)}
                                style={[styles.closeButton, { backgroundColor: colors.colorBorderAndBlock }]}
                            >
                                <Icon name="close" size={24} color={colors.colorText} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.colorBorderAndBlock,
                                color: colors.colorText
                            }]}
                            value={newPreparationTime}
                            onChangeText={setNewPreparationTime}
                            placeholder={t('minutes')}
                            placeholderTextColor={colors.colorDetail}
                            keyboardType="number-pad"
                            autoFocus={true}
                        />

                        <TouchableOpacity 
                            style={[styles.saveButton, { backgroundColor: colors.colorAction }]}
                            onPress={updatePreparationTime}
                        >
                            <Text style={styles.saveButtonText}>{t('confirm')}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Modal pour la distance de livraison */}
            <Modal
                visible={isMaxDeliveryKmModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsMaxDeliveryKmModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <View 
                        style={[
                            styles.modalContent, 
                            { 
                                backgroundColor: colors.colorBackground,
                                marginTop: keyboardVisible ? '30%' : 'auto'
                            }
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.colorText }]}>
                                {t('max_delivery_distance')}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setIsMaxDeliveryKmModalVisible(false)}
                                style={[styles.closeButton, { backgroundColor: colors.colorBorderAndBlock }]}
                            >
                                <Icon name="close" size={24} color={colors.colorText} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.colorBorderAndBlock,
                                color: colors.colorText
                            }]}
                            value={newMaxDeliveryKm}
                            onChangeText={setNewMaxDeliveryKm}
                            placeholder={t('kilometers')}
                            placeholderTextColor={colors.colorDetail}
                            keyboardType="numeric"
                            autoFocus={true}
                        />

                        <TouchableOpacity 
                            style={[styles.saveButton, { backgroundColor: colors.colorAction }]}
                            onPress={updateMaxDeliveryKm}
                        >
                            <Text style={styles.saveButtonText}>{t('confirm')}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Modal pour les horaires */}
            <HoursModal 
                visible={isHoursModalVisible}
                onClose={() => setIsHoursModalVisible(false)}
                restaurantId={restaurantId}
            />
        </View>
    );
};

function useStyles() {
    const { width, height } = useWindowDimensions();

    return StyleSheet.create({
        container: {
            flex: 1,
        },
        content: {
            padding: 20,
        },
        sectionHeader: {
            fontSize: width > 375 ? 22 : 20,
            fontWeight: '600',
            marginBottom: 16,
            marginLeft: 4,
        },
        card: {
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 20,
        },
        settingContainer: {
            padding: 16,
        },
        borderBottom: {
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(162, 162, 167, 0.1)',
        },
        settingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        settingTitle: {
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '600',
            marginBottom: 4,
        },
        settingDescription: {
            fontSize: width > 375 ? 14 : 12,
        },
        phoneRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        contactRow: {
            paddingVertical: 4,
        },
        phoneNumber: {
            fontSize: width > 375 ? 14 : 12,
        },
        editButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingTop: 16,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        },
        modalTitle: {
            fontSize: width > 375 ? 20 : 18,
            fontWeight: '600',
        },
        closeButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        input: {
            borderRadius: 12,
            padding: 16,
            fontSize: width > 375 ? 16 : 14,
            marginBottom: 20,
        },
        saveButton: {
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: Platform.OS === 'ios' ? 20 : 0,
        },
        saveButtonText: {
            color: '#FFFFFF',
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '600',
        },
        manageButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            borderRadius: 10,
            marginTop: 12,
        },
        manageButtonText: {
            color: '#FFFFFF',
            fontSize: width > 375 ? 14 : 12,
            fontWeight: '600',
        },
        modalDescription: {
            fontSize: width > 375 ? 14 : 12,
            marginBottom: 16,
        },
        tiersList: {
            marginBottom: 16,
        },
        tiersListHeader: {
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '600',
            marginBottom: 8,
        },
        tierItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            borderRadius: 8,
            marginBottom: 8,
        },
        tierInfo: {
            flex: 1,
        },
        tierText: {
            fontSize: width > 375 ? 14 : 12,
        },
        tierActions: {
            flexDirection: 'row',
        },
        tierActionButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        formLabel: {
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '600',
            marginBottom: 8,
        },
        tierForm: {
            marginBottom: 16,
        },
        formRow: {
            marginBottom: 12,
        },
        inputLabel: {
            fontSize: width > 375 ? 14 : 12,
            marginBottom: 4,
        },
        tierInput: {
            borderRadius: 8,
            padding: 12,
            fontSize: width > 375 ? 16 : 14,
        },
        addButton: {
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
        },
        buttonText: {
            color: '#FFFFFF',
            fontSize: width > 375 ? 14 : 12,
            fontWeight: '600',
        },
    });
}

export default InformationScreen;