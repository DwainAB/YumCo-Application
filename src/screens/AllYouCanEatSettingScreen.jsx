import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, TextInput, Platform, KeyboardAvoidingView, Keyboard, ActivityIndicator } from "react-native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useColors } from "../components/ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import * as Haptics from 'expo-haptics';
import { supabase } from "../lib/supabase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const AllYouCanEatSettingScreen = ({ route, navigation }) => {
    const { restaurantId } = route.params;
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [currentMenu, setCurrentMenu] = useState(null);
    const [menuName, setMenuName] = useState('');
    const [menuPrice, setMenuPrice] = useState('');
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const { t } = useTranslation();
    const { colors } = useColors();
    const styles = useStyles();

    useEffect(() => {
        fetchMenus();

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

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [restaurantId]);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('all_you_can_eat')
                .select('*')
                .eq('restaurant_id', restaurantId);

            if (error) throw error;

            setMenus(data || []);
        } catch (error) {
            console.error('Error fetching menus:', error);
            Alert.alert(t('Error'), t('Unable to load menus'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddMenu = async () => {
        try {
            Haptics.selectionAsync();
            
            // Validation
            if (!menuName.trim()) {
                Alert.alert(t('Error'), t('Please enter a menu name'));
                return;
            }

            const price = parseFloat(menuPrice.replace(',', '.'));
            if (isNaN(price) || price <= 0) {
                Alert.alert(t('Error'), t('Please enter a valid price'));
                return;
            }

            const { data, error } = await supabase
                .from('all_you_can_eat')
                .insert([
                    { 
                        name: menuName.trim(), 
                        price: price, 
                        restaurant_id: restaurantId 
                    }
                ])
                .select();

            if (error) throw error;

            setMenus([...menus, ...data]);
            setMenuName('');
            setMenuPrice('');
            setIsAddModalVisible(false);
            
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
        } catch (error) {
            console.error('Error adding menu:', error);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
            Alert.alert(t('Error'), t('Unable to add menu'));
        }
    };

    const handleUpdateMenu = async () => {
        try {
            Haptics.selectionAsync();
            
            // Validation
            if (!menuName.trim()) {
                Alert.alert(t('Error'), t('Please enter a menu name'));
                return;
            }

            const price = parseFloat(menuPrice.replace(',', '.'));
            if (isNaN(price) || price <= 0) {
                Alert.alert(t('Error'), t('Please enter a valid price'));
                return;
            }

            const { data, error } = await supabase
                .from('all_you_can_eat')
                .update({
                    name: menuName.trim(),
                    price: price
                })
                .eq('id', currentMenu.id)
                .select();

            if (error) throw error;

            // Update the menu in the local state
            setMenus(menus.map(menu => 
                menu.id === currentMenu.id ? data[0] : menu
            ));
            
            setIsEditModalVisible(false);
            setCurrentMenu(null);
            
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
        } catch (error) {
            console.error('Error updating menu:', error);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
            Alert.alert(t('Error'), t('Unable to update menu'));
        }
    };

    const handleDeleteMenu = (menu) => {
        Haptics.selectionAsync();
        
        Alert.alert(
            t('Delete menu'),
            t('Are you sure you want to delete this menu?'),
            [
                {
                    text: t('Cancel'),
                    style: 'cancel',
                },
                {
                    text: t('Delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('all_you_can_eat')
                                .delete()
                                .eq('id', menu.id);

                            if (error) throw error;

                            // Remove the menu from the local state
                            setMenus(menus.filter(m => m.id !== menu.id));
                            
                            Haptics.notificationAsync(
                                Haptics.NotificationFeedbackType.Success
                            );
                        } catch (error) {
                            console.error('Error deleting menu:', error);
                            Haptics.notificationAsync(
                                Haptics.NotificationFeedbackType.Error
                            );
                            Alert.alert(t('Error'), t('Unable to delete menu'));
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (menu) => {
        setCurrentMenu(menu);
        setMenuName(menu.name);
        setMenuPrice(menu.price.toString());
        setIsEditModalVisible(true);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.colorBackground }]}>
            <HeaderSetting 
                color={colors.colorText} 
                name={t('configure_menu_type')} 
                navigateTo="InformationScreen"
            />
            
            <View style={styles.content}>
                <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: colors.colorAction }]}
                    onPress={() => {
                        Haptics.selectionAsync();
                        setMenuName('');
                        setMenuPrice('');
                        setIsAddModalVisible(true);
                    }}
                >
                    <Icon name="plus" size={24} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>{t('new_menu')}</Text>
                </TouchableOpacity>
                
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={colors.colorAction} />
                    </View>
                ) : menus.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.colorDetail }]}>
                            {t('No menus added yet')}
                        </Text>
                        <Text style={[styles.emptySubText, { color: colors.colorDetail }]}>
                            {t('Add your first menu by clicking the button above')}
                        </Text>
                    </View>
                ) : (
                    <ScrollView 
                        style={styles.menuList}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={{ paddingBottom: 30 }} 
                    >
                        {menus.map((menu) => (
                            <View 
                                key={menu.id} 
                                style={[styles.menuCard, { backgroundColor: colors.colorBorderAndBlock }]}
                            >
                                <View style={styles.menuInfo}>
                                    <Text style={[styles.menuName, { color: colors.colorText }]}>
                                        {menu.name}
                                    </Text>
                                    <Text style={[styles.menuPrice, { color: colors.colorDetail }]}>
                                        {menu.price.toFixed(2)} €
                                    </Text>
                                </View>
                                <View style={styles.menuActions}>
                                    <TouchableOpacity 
                                        style={[styles.editButton, { backgroundColor: colors.colorAction }]}
                                        onPress={() => openEditModal(menu)}
                                    >
                                        <Icon name="pencil" size={20} color="#FFFFFF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.deleteButton, { backgroundColor: '#FF3B30' }]}
                                        onPress={() => handleDeleteMenu(menu)}
                                    >
                                        <Icon name="delete" size={20} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Modal pour ajouter un menu */}
            <Modal
                visible={isAddModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsAddModalVisible(false)}
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
                                {t('new_menu')}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setIsAddModalVisible(false)}
                                style={[styles.closeButton, { backgroundColor: colors.colorBorderAndBlock }]}
                            >
                                <Icon name="close" size={24} color={colors.colorText} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.inputLabel, { color: colors.colorText }]}>
                            {t('menu_name')}
                        </Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.colorBorderAndBlock,
                                color: colors.colorText
                            }]}
                            value={menuName}
                            onChangeText={setMenuName}
                            placeholder={t('menu_name')}
                            placeholderTextColor={colors.colorDetail}
                        />

                        <Text style={[styles.inputLabel, { color: colors.colorText }]}>
                            {t('price')}(€)
                        </Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.colorBorderAndBlock,
                                color: colors.colorText
                            }]}
                            value={menuPrice}
                            onChangeText={setMenuPrice}
                            placeholder={t('price')}
                            placeholderTextColor={colors.colorDetail}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity 
                            style={[styles.saveButton, { backgroundColor: colors.colorAction }]}
                            onPress={handleAddMenu}
                        >
                            <Text style={styles.saveButtonText}>{t('add')}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Modal pour éditer un menu */}
            <Modal
                visible={isEditModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsEditModalVisible(false)}
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
                                {t('edit_menu')}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setIsEditModalVisible(false)}
                                style={[styles.closeButton, { backgroundColor: colors.colorBorderAndBlock }]}
                            >
                                <Icon name="close" size={24} color={colors.colorText} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.inputLabel, { color: colors.colorText }]}>
                            {t('menu_name')}
                        </Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.colorBorderAndBlock,
                                color: colors.colorText
                            }]}
                            value={menuName}
                            onChangeText={setMenuName}
                            placeholder={t('menu_name')}
                            placeholderTextColor={colors.colorDetail}
                        />

                        <Text style={[styles.inputLabel, { color: colors.colorText }]}>
                            {t('price')}(€)
                        </Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.colorBorderAndBlock,
                                color: colors.colorText
                            }]}
                            value={menuPrice}
                            onChangeText={setMenuPrice}
                            placeholder={t('price')}
                            placeholderTextColor={colors.colorDetail}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity 
                            style={[styles.saveButton, { backgroundColor: colors.colorAction }]}
                            onPress={handleUpdateMenu}
                        >
                            <Text style={styles.saveButtonText}>{t('updateApp')}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
            flex: 1,
        },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 15,
            borderRadius: 12,
            marginBottom: 20,
        },
        addButtonText: {
            color: '#FFFFFF',
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '600',
            marginLeft: 8,
        },
        loaderContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        emptyText: {
            fontSize: width > 375 ? 18 : 16,
            fontWeight: '600',
            marginBottom: 8,
            textAlign: 'center',
        },
        emptySubText: {
            fontSize: width > 375 ? 14 : 12,
            textAlign: 'center',
        },
        menuList: {
            flex: 1,
        },
        menuCard: {
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        menuInfo: {
            flex: 1,
        },
        menuName: {
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '600',
            marginBottom: 4,
        },
        menuPrice: {
            fontSize: width > 375 ? 14 : 12,
        },
        menuActions: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        editButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
        },
        deleteButton: {
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
        inputLabel: {
            fontSize: width > 375 ? 14 : 12,
            fontWeight: '500',
            marginBottom: 8,
            marginLeft: 4,
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

export default AllYouCanEatSettingScreen;