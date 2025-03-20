import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Modal, TextInput, Platform, KeyboardAvoidingView, Keyboard } from "react-native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useColors } from "../components/ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWindowDimensions } from "react-native";
import * as Haptics from 'expo-haptics';
import { supabase } from "../lib/supabase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const InformationScreen = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [pickupEnabled, setPickupEnabled] = useState(false);
    const [deliveryEnabled, setDeliveryEnabled] = useState(false);
    const [restaurantId, setRestaurantId] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [preparationTime, setPreparationTime] = useState(15);
    const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
    const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
    const [isPrepTimeModalVisible, setIsPrepTimeModalVisible] = useState(false);
    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPreparationTime, setNewPreparationTime] = useState('15');
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    
    const { t } = useTranslation();
    const { colors } = useColors();
    const styles = useStyles();

    useEffect(() => {
        const fetchRestaurantId = async () => {
            try {
                const owner = await AsyncStorage.getItem("owner");
                const ownerData = JSON.parse(owner);                
                setRestaurantId(ownerData.restaurantId);
                fetchRestaurantStatus(ownerData.restaurantId);
            } catch (error) {
                console.error('Erreur récupération utilisateur:', error);
            }
        };
        fetchRestaurantId();

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
    }, []);

    const fetchRestaurantStatus = async (id) => {
        try {
            const { data, error } = await supabase
                .from('restaurants')
                .select('accept_orders, pickup_option, delivery_option, phone, email, preparation_time')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
                setIsEnabled(data.accept_orders);
                setPickupEnabled(data.pickup_option);
                setDeliveryEnabled(data.delivery_option);
                setPhoneNumber(data.phone || '');
                setNewPhoneNumber(data.phone || '');
                setEmail(data.email || '');
                setNewEmail(data.email || '');
                setPreparationTime(data.preparation_time || 15);
                setNewPreparationTime(String(data.preparation_time || 15));
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du status:', error);
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
                case 'delivery_option':
                    setDeliveryEnabled(newStatus);
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
                title = newStatus ? t('Enable orders') : t('Disable orders');
                message = newStatus 
                    ? t('Are you sure you want to enable orders?')
                    : t('Are you sure you want to disable orders? This will prevent new orders from coming in.');
                field = 'accept_orders';
                break;
            case 'pickup':
                title = newStatus ? t('Enable pickup') : t('Disable pickup');
                message = newStatus
                    ? t('Are you sure you want to enable pickup orders?')
                    : t('Are you sure you want to disable pickup orders?');
                field = 'pickup_option';
                break;
            case 'delivery':
                title = newStatus ? t('Enable delivery') : t('Disable delivery');
                message = newStatus
                    ? t('Are you sure you want to enable delivery orders?')
                    : t('Are you sure you want to disable delivery orders?');
                field = 'delivery_option';
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
            
            <View style={styles.content}>
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
                            title={t('Email')}
                            value={email}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setIsEmailModalVisible(true);
                            }}
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
                            title={t('Delivery orders')}
                            description={deliveryEnabled ? t('Delivery is enabled') : t('Delivery is disabled')}
                            value={deliveryEnabled}
                            onToggle={() => handleToggle('delivery', deliveryEnabled)}
                        />
                    </View>

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
                </View>

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
                                <Text style={styles.saveButtonText}>{t('Save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

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
                                <Text style={styles.saveButtonText}>{t('Save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

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
                                <Text style={styles.saveButtonText}>{t('Save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
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
    });
}

export default InformationScreen;