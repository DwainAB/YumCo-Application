import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useColors } from "../components/ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import Modal from 'react-native-modal';
import { supabase } from '../lib/supabase';
import { API_CONFIG } from '../config/constants';
import { useRestaurantId } from '../hooks/useRestaurantId';
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import ConfirmDialog from "../components/ModalAction/ModalAction";

import {
    MenuCard,
    MenuImageUpload,
    MenuBasicFields,
    CategoryItem,
    useMenuHandlers
} from '../components/EditMenu';

export default function EditMenu() {
    const { t } = useTranslation();
    const { colors } = useColors();
    const { restaurantId, ownerData } = useRestaurantId();
    const [menuList, setMenuList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [initialMenuImage, setInitialMenuImage] = useState(null);
    const [editableMenus, setEditableMenus] = useState({});
    const [isPickerFocused, setIsPickerFocused] = useState(false);
    const [userRole, setUserRole] = useState('USER');
    const styles = useStyles();
    const [isDeleting, setIsDeleting] = useState(false);

    const menuHandlers = useMenuHandlers(
        selectedMenu,
        editableMenus,
        setEditableMenus,
        setIsDeleting,
        fetchMenus,
        t
    );

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                if (ownerData?.id && ownerData?.restaurantId) {
                    const { data, error } = await supabase
                        .from('roles')
                        .select('type')
                        .eq('owner_id', ownerData.id)
                        .eq('restaurant_id', ownerData.restaurantId)
                        .single();

                    if (!error && data) {
                        setUserRole(data.type);
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des informations utilisateur:', error);
            }
        };

        if (ownerData) {
            fetchUserRole();
        }
    }, [ownerData]);

    useEffect(() => {
        if (restaurantId) {
            fetchMenus();
        }
    }, [restaurantId]);

    async function fetchMenus() {
        if (!restaurantId) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/get_menu_by_restaurant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${API_CONFIG.SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({
                    restaurant_id: restaurantId
                })
            });

            const data = await response.json();

            if (data.success) {
                setMenuList(data.menus);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des menus:', error);
        } finally {
            setLoading(false);
        }
    }


    const handleMenuPress = useCallback((menu) => {
        if (userRole === 'USER') return;

        setSelectedMenu(menu);
        setIsBottomSheetVisible(true);
        setInitialMenuImage(menu.image_url || null);

        setEditableMenus({
            [menu.id]: {
                name: menu.name,
                description: menu.description,
                price: menu.price.toString(),
                imageURI: menu.image_url ? { uri: menu.image_url } : null,
                is_active: menu.is_active,
                available_online: menu.available_online || false,
                available_onsite: menu.available_onsite || false,
                categories: [...menu.categories]
            }
        });
    }, [userRole]);

    const handleUpdateMenu = async (event) => {
        event.preventDefault();

        console.log('🔧 handleUpdateMenu appelé');
        console.log('📝 selectedMenu:', selectedMenu);
        console.log('📝 editableMenus:', editableMenus);

        if (!selectedMenu) {
            console.log('❌ Pas de menu sélectionné');
            return;
        }

        const menuData = editableMenus[selectedMenu.id];
        console.log('📝 menuData:', menuData);

        if (menuData?.name?.trim() === '') {
            console.log('❌ Nom du menu vide');
            alert(t('menu_name_required'));
            return;
        }

        if (!menuData?.price || menuData.price.trim() === '') {
            console.log('❌ Prix vide');
            alert(t('price_required'));
            return;
        }

        setIsDeleting(true);

        try {
            const updateData = {
                menu_id: selectedMenu.id,
                menu_data: {
                    name: menuData.name,
                    description: menuData.description,
                    price: parseFloat(menuData.price),
                    is_active: menuData.is_active,
                    available_online: menuData.available_online,
                    available_onsite: menuData.available_onsite,
                    image_url: menuData.imageURI ? menuData.imageURI.uri : null
                },
                categories: []
            };

            for (const category of menuData.categories) {
                if (!category) continue;

                if (category._delete) {
                    if (category.id && !category.id.startsWith('temp-')) {
                        updateData.categories.push({
                            id: category.id,
                            _delete: true
                        });
                    }
                    continue;
                }

                const categoryData = {
                    name: category.name,
                    max_options: category.max_options,
                    is_required: category.is_required,
                    display_order: category.display_order,
                    menu_id: selectedMenu.id,
                    options: []
                };

                if (category.id && !category.id.startsWith('temp-')) {
                    categoryData.id = category.id;
                }

                if (category.options && category.options.length > 0) {
                    for (const option of category.options) {
                        if (!option) continue;

                        if (option._delete) {
                            if (option.id && !option.id.startsWith('temp-')) {
                                categoryData.options.push({
                                    id: option.id,
                                    _delete: true
                                });
                            }
                            continue;
                        }

                        const optionData = {
                            name: option.name,
                            additional_price: parseFloat(option.additional_price) || 0,
                            display_order: option.display_order,
                            category_id: category.id
                        };

                        if (option.id && !option.id.startsWith('temp-')) {
                            optionData.id = option.id;
                        }

                        categoryData.options.push(optionData);
                    }
                }

                updateData.categories.push(categoryData);
            }

            console.log('📤 Données envoyées:', JSON.stringify(updateData, null, 2));
            console.log('🔑 SUPABASE_SERVICE_ROLE_KEY:', API_CONFIG.SUPABASE_SERVICE_ROLE_KEY);
            console.log('🔑 Authorization header:', `Bearer ${API_CONFIG.SUPABASE_SERVICE_ROLE_KEY}`);

            const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/update_menu`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${API_CONFIG.SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify(updateData)
            });

            console.log('📡 Response status:', response.status);

            const data = await response.json();
            console.log('📥 Response data:', data);

            if (data.success) {
                console.log('✅ Mise à jour réussie');
                alert(t('update_success'));
                await fetchMenus();
                handleCloseModal();
            } else {
                console.log('❌ Erreur serveur:', data.error);
                alert(t('update_error') + ': ' + (data.error || t('unknown_error')));
            }
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour:', error);
            alert(t('update_error') + ': ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteMenu = async (menuId) => {
        ConfirmDialog({
            title: t('delete_confirmation'),
            message: t('delete_menu_confirmation'),
            onConfirm: async () => {
                setIsDeleting(true);

                try {
                    const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/update_menu`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': `Bearer ${API_CONFIG.SUPABASE_SERVICE_ROLE_KEY}`,
                        },
                        body: JSON.stringify({
                            menu_id: menuId
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        alert(t('delete_success'));
                        await fetchMenus();
                        setIsBottomSheetVisible(false);
                    } else {
                        alert(t('delete_error') + ': ' + (data.error || t('unknown_error')));
                    }
                } catch (error) {
                    console.error('Erreur lors de la suppression:', error.message);
                    alert(t('delete_error') + ': ' + error.message);
                } finally {
                    setIsDeleting(false);
                }
            },
            onCancel: () => {}
        });
    };

    const handleCloseModal = () => {
        setIsBottomSheetVisible(false);
        setEditableMenus({});
        setInitialMenuImage(null);
    };

    const handleClickUpload = async (menuId) => {
        const { status } = await requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert(t('permission_required'));
            return;
        }

        const result = await launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];

            try {
                const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const arrayBuffer = decode(base64);
                const fileName = `menu_${menuId}_${Date.now()}.jpg`;

                const { data, error } = await supabase.storage
                    .from('menus')
                    .upload(fileName, arrayBuffer, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('menus')
                    .getPublicUrl(fileName);

                setEditableMenus(prev => ({
                    ...prev,
                    [menuId]: {
                        ...prev[menuId],
                        imageURI: { uri: publicUrl }
                    }
                }));
            } catch (error) {
                console.error('Erreur lors de la lecture de l\'image:', error);
                alert(t('image_upload_error') + ': ' + error.message);
            }
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.colorBackground }]}>
                <ActivityIndicator size="large" color={colors.colorAction} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.colorBackground }]}>
            <HeaderSetting name={t('edit_menus')} navigateTo="CardOptionScreen"/>

            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.menuGrid}>
                    {menuList.length > 0 ? (
                        menuList.map((menu) => (
                            <MenuCard
                                key={menu.id}
                                menu={menu}
                                onPress={handleMenuPress}
                                userRole={userRole}
                            />
                        ))
                    ) : (
                        <Text style={[styles.noMenusText, { color: colors.colorText }]}>
                            {t('no_menus')}
                        </Text>
                    )}
                </View>
            </ScrollView>

            <Modal
                isVisible={isBottomSheetVisible}
                onSwipeComplete={!isPickerFocused ? handleCloseModal : undefined}
                swipeDirection={!isPickerFocused ? ['down'] : undefined}
                style={styles.bottomSheet}
                onBackdropPress={!isPickerFocused ? handleCloseModal : undefined}
                propagateSwipe={true}
                avoidKeyboard={true}
            >
                <View style={[styles.bottomSheetContent, { backgroundColor: colors.colorBackground }]}>
                    <View style={styles.bottomSheetHandle} />

                    {selectedMenu && (
                        <ScrollView
                            scrollEventThrottle={16}
                            showsVerticalScrollIndicator={true}
                            nestedScrollEnabled={true}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        >
                            <MenuImageUpload
                                imageUri={editableMenus[selectedMenu.id]?.imageURI?.uri || selectedMenu.image_url}
                                onUploadPress={() => handleClickUpload(selectedMenu.id)}
                            />

                            <MenuBasicFields
                                menuData={editableMenus[selectedMenu.id]}
                                onInputChange={(value, field) => menuHandlers.handleInputChange(selectedMenu.id, value, field)}
                            />

                            <View style={styles.categoriesSection}>
                                <View style={styles.categoriesSectionHeader}>
                                    <Text style={[styles.sectionTitle, { color: colors.colorText }]}>
                                        {t('categories')}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={menuHandlers.handleAddCategory}
                                    >
                                        <Ionicons name="add-circle" size={32} color={colors.colorAction} />
                                    </TouchableOpacity>
                                </View>

                                {editableMenus[selectedMenu.id]?.categories?.map((category, categoryIndex) => (
                                    <CategoryItem
                                        key={category.id || categoryIndex}
                                        category={category}
                                        categoryIndex={categoryIndex}
                                        isExpanded={menuHandlers.expandedCategories[category.id]}
                                        isEditing={menuHandlers.editingCategoryId === category.id}
                                        editingData={menuHandlers.editingCategoryData}
                                        onToggleExpand={() => menuHandlers.toggleCategoryExpansion(category.id)}
                                        onStartEdit={() => menuHandlers.startEditingCategory(category)}
                                        onDelete={() => menuHandlers.handleDeleteCategory(categoryIndex)}
                                        onSaveEdit={() => menuHandlers.saveEditingCategory(categoryIndex)}
                                        onCancelEdit={menuHandlers.cancelEditingCategory}
                                        onEditDataChange={(field, value) =>
                                            menuHandlers.setEditingCategoryData(prev => ({ ...prev, [field]: value }))
                                        }
                                        onAddOption={() => menuHandlers.handleAddOption(categoryIndex)}
                                        editingOptionId={menuHandlers.editingOptionId}
                                        editingOptionData={menuHandlers.editingOptionData}
                                        onStartEditOption={menuHandlers.startEditingOption}
                                        onSaveEditOption={(catIdx, optIdx) => menuHandlers.saveEditingOption(catIdx, optIdx)}
                                        onCancelEditOption={menuHandlers.cancelEditingOption}
                                        onEditOptionDataChange={(field, value) =>
                                            menuHandlers.setEditingOptionData(prev => ({ ...prev, [field]: value }))
                                        }
                                        onDeleteOption={(optIdx) => menuHandlers.handleDeleteOption(categoryIndex, optIdx)}
                                    />
                                ))}
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.deleteButton, { backgroundColor: '#FF4444' }]}
                                    onPress={() => handleDeleteMenu(selectedMenu.id)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Ionicons name="trash" size={20} color="white" />
                                            <Text style={styles.deleteButtonText}>{t('delete')}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: colors.colorAction }]}
                                    onPress={handleUpdateMenu}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>{t('save')}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </Modal>
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
            padding: 15,
        },
        menuGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        noMenusText: {
            textAlign: 'center',
            fontSize: width > 500 ? 16 : 14,
            marginTop: 50,
        },
        bottomSheet: {
            justifyContent: 'flex-end',
            margin: 0,
        },
        bottomSheetContent: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingBottom: 20,
            maxHeight: '90%',
        },
        bottomSheetHandle: {
            width: 40,
            height: 5,
            backgroundColor: '#888',
            borderRadius: 3,
            alignSelf: 'center',
            marginVertical: 10,
        },
        categoriesSection: {
            marginTop: 20,
        },
        categoriesSectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15,
        },
        sectionTitle: {
            fontSize: width > 500 ? 18 : 16,
            fontWeight: '600',
        },
        addButton: {
            padding: 4,
        },
        modalActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
            gap: 10,
        },
        deleteButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            borderRadius: 8,
            gap: 8,
        },
        deleteButtonText: {
            color: 'white',
            fontSize: width > 500 ? 16 : 14,
            fontWeight: '600',
        },
        saveButton: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            borderRadius: 8,
        },
        saveButtonText: {
            color: 'white',
            fontSize: width > 500 ? 16 : 14,
            fontWeight: '600',
        },
    });
}