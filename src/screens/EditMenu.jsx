import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, TouchableWithoutFeedback} from "react-native";
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import { useColors } from "../components/ColorContext/ColorContext";
import ConfirmDialog from "../components/ModalAction/ModalAction";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { decode } from "base64-arraybuffer";
import Modal from 'react-native-modal';
import { supabase } from '../lib/supabase';
import { API_CONFIG } from '../config/constants';
import { useRestaurantId } from '../hooks/useRestaurantId';

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
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [userRole, setUserRole] = useState('USER');
    const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isOptionEditMode, setIsOptionEditMode] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const styles = useStyles();
    const pickerRef = useRef(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingOptionId, setEditingOptionId] = useState(null);
    const [editingCategoryData, setEditingCategoryData] = useState({
        name: '',
        maxOptions: '1',
        isRequired: true
    });
    const [editingOptionData, setEditingOptionData] = useState({
        name: '',
        additionalPrice: '0'
    });

    // Récupération du rôle de l'utilisateur avec Supabase
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

                    if (error) {
                        console.error('Erreur lors de la récupération du rôle:', error);
                    } else if (data) {
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

    // Récupération des menus lorsque le restaurant ID est disponible
    useEffect(() => {
        if (restaurantId) {
            fetchMenus();
        }
    }, [restaurantId]);

    // Récupération des menus depuis Supabase
    const fetchMenus = async () => {
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
            } else {
                console.error('Erreur lors de la récupération des menus:', data.message || 'Erreur inconnue');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des menus:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrer les menus en fonction de leur disponibilité
    const filteredMenus = React.useMemo(() => {
        let menusToDisplay = menuList;

        // Filtrer par disponibilité
        if (showActiveOnly) {
            menusToDisplay = menusToDisplay.filter(menu => menu.is_active === true);
        }

        return menusToDisplay;
    }, [menuList, showActiveOnly]);

    // Gestion du clic sur un menu pour l'éditer
    const handleMenuPress = (menu) => {
        if (userRole === 'USER') {
            // Si c'est un utilisateur normal, ne pas autoriser la modification
            return;
        }
        
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
                available_online: menu.available_online || false, // Ajout du nouveau champ
                available_onsite: menu.available_onsite || false,
                categories: [...menu.categories] // Copie profonde des catégories
            }
        });
    };

    // Gestion des modifications des champs du menu
    const handleInputChange = (menuId, newValue, name) => {
        if (name === 'price') {
            // Remplacer la virgule par un point
            let formattedValue = newValue.replace(',', '.');
            
            // Vérifier si c'est un nombre valide avec maximum 2 décimales
            if (formattedValue !== '' && formattedValue !== '.') {
                // Extraire les parties entière et décimale
                const parts = formattedValue.split('.');
                if (parts[1]?.length > 2) {
                    // Limiter à 2 décimales
                    parts[1] = parts[1].slice(0, 2);
                    formattedValue = parts.join('.');
                }
                
                // Vérifier si c'est un nombre valide
                if (isNaN(parseFloat(formattedValue))) {
                    return; // Ne pas mettre à jour si ce n'est pas un nombre valide
                }
            }
            
            setEditableMenus((prev) => ({
                ...prev,
                [menuId]: {
                    ...prev[menuId],
                    [name]: formattedValue,
                },
            }));
        } else {
            setEditableMenus((prev) => ({
                ...prev,
                [menuId]: {
                    ...prev[menuId],
                    [name]: newValue,
                },
            }));
        }
    };

    // Mise à jour d'une catégorie
    const handleCategoryChange = (categoryIndex, field, value) => {
        if (!selectedMenu) return;
        
        setEditableMenus(prev => {
            const menuData = {...prev[selectedMenu.id]};
            const categories = [...menuData.categories];
            
            // Convertir les valeurs numériques si nécessaire
            if (field === 'max_options') {
                value = parseInt(value) || 0;
            } else if (field === 'is_required') {
                value = value === true || value === 'true';
            }
            
            categories[categoryIndex] = {
                ...categories[categoryIndex],
                [field]: value
            };
            
            return {
                ...prev,
                [selectedMenu.id]: {
                    ...menuData,
                    categories
                }
            };
        });
    };

    // Mise à jour d'une option
    const handleOptionChange = (categoryIndex, optionIndex, field, value) => {
        if (!selectedMenu) return;
        
        setEditableMenus(prev => {
            const menuData = {...prev[selectedMenu.id]};
            const categories = [...menuData.categories];
            const options = [...categories[categoryIndex].options];
            
            // Convertir la valeur numérique si nécessaire
            if (field === 'additional_price') {
                let formattedValue = value.replace(',', '.');
                if (formattedValue !== '' && formattedValue !== '.') {
                    const parts = formattedValue.split('.');
                    if (parts[1]?.length > 2) {
                        parts[1] = parts[1].slice(0, 2);
                        formattedValue = parts.join('.');
                    }
                    
                    if (isNaN(parseFloat(formattedValue))) {
                        return prev;
                    }
                    value = formattedValue;
                }
            }
            
            options[optionIndex] = {
                ...options[optionIndex],
                [field]: value
            };
            
            categories[categoryIndex] = {
                ...categories[categoryIndex],
                options
            };
            
            return {
                ...prev,
                [selectedMenu.id]: {
                    ...menuData,
                    categories
                }
            };
        });
    };

    // Ajouter une nouvelle catégorie
    const handleAddCategory = () => {
        if (!selectedMenu) return;
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; 

        const newCategory = {
            id: tempId, 
            menu_id: selectedMenu.id,
            name: t('new_category'),
            max_options: 1,
            is_required: true,
            display_order: editableMenus[selectedMenu.id].categories.length,
            options: []
        };
        
        setEditableMenus(prev => {
            const menuData = {...prev[selectedMenu.id]};
            return {
                ...prev,
                [selectedMenu.id]: {
                    ...menuData,
                    categories: [...menuData.categories, newCategory]
                }
            };
        });
        
        // Passer en mode édition pour cette nouvelle catégorie
        setSelectedCategory(editableMenus[selectedMenu.id].categories.length);
        setIsCategoryEditMode(true);
    };

    // Ajouter une nouvelle option à une catégorie
    const handleAddOption = (categoryIndex) => {
        if (!selectedMenu) return;
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; 

        const newOption = {
            id: tempId, 
            category_id: editableMenus[selectedMenu.id].categories[categoryIndex].id,
            name: t('new_option'),
            additional_price: 0,
            display_order: editableMenus[selectedMenu.id].categories[categoryIndex].options.length
        };
        
        setEditableMenus(prev => {
            const menuData = {...prev[selectedMenu.id]};
            const categories = [...menuData.categories];
            const category = {...categories[categoryIndex]};
            
            category.options = [...category.options, newOption];
            categories[categoryIndex] = category;
            
            return {
                ...prev,
                [selectedMenu.id]: {
                    ...menuData,
                    categories
                }
            };
        });
        
        // Passer en mode édition pour cette nouvelle option
        setSelectedOption({
            categoryIndex,
            optionIndex: editableMenus[selectedMenu.id].categories[categoryIndex].options.length
        });
        setIsOptionEditMode(true);
    };

    // Supprimer une catégorie
// Supprimer une catégorie
const handleDeleteCategory = (categoryIndex) => {
    if (!selectedMenu) return;
    
    const category = editableMenus[selectedMenu.id].categories[categoryIndex];
    
    ConfirmDialog({
        title: t('delete'),
        message: t('confirm_deletion'),
        onConfirm: async () => {
            // Si la catégorie existe déjà en base de données
            if (category.id && !category.id.startsWith('temp-')) {
                try {
                    // Appel direct à l'API pour supprimer la catégorie
                    const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/update_menu`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': `Bearer ${API_CONFIG.SUPABASE_SERVICE_ROLE_KEY}`,
                        },
                        body: JSON.stringify({
                            menu_id: selectedMenu.id,
                            categories: [
                                {
                                    id: category.id,
                                    _delete: true
                                }
                            ]
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Supprimer la catégorie du state local
                        setEditableMenus(prev => {
                            const menuData = {...prev[selectedMenu.id]};
                            const categories = [...menuData.categories];
                            categories.splice(categoryIndex, 1);
                            
                            return {
                                ...prev,
                                [selectedMenu.id]: {
                                    ...menuData,
                                    categories
                                }
                            };
                        });
                        
                        // Rafraîchir les données du menu
                        await fetchMenus();
                        alert(t('category_deleted_success'));
                    } else {
                        alert(t('delete_error') + ': ' + (data.error || t('unknown_error')));
                    }
                } catch (error) {
                    console.error('Erreur lors de la suppression de la catégorie:', error);
                    alert(t('delete_error') + ': ' + error.message);
                }
            } else {
                // Pour les nouvelles catégories (pas encore en base), supprimer directement du state
                setEditableMenus(prev => {
                    const menuData = {...prev[selectedMenu.id]};
                    const categories = [...menuData.categories];
                    categories.splice(categoryIndex, 1);
                    
                    return {
                        ...prev,
                        [selectedMenu.id]: {
                            ...menuData,
                            categories
                        }
                    };
                });
            }
            
            setIsCategoryEditMode(false);
            setSelectedCategory(null);
        },
        onCancel: () => {}
    });
};

// Supprimer une option
const handleDeleteOption = (categoryIndex, optionIndex) => {
    if (!selectedMenu) return;
    
    const option = editableMenus[selectedMenu.id].categories[categoryIndex].options[optionIndex];
    const categoryId = editableMenus[selectedMenu.id].categories[categoryIndex].id;
    
    ConfirmDialog({
        title: t('delete'),
        message: t('confirm_deletion'),
        onConfirm: async () => {
            // Si l'option existe déjà en base de données
            if (option.id && !option.id.startsWith('temp-')) {
                try {
                    // Appel direct à l'API pour supprimer l'option
                    const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/update_menu`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': `Bearer ${API_CONFIG.SUPABASE_SERVICE_ROLE_KEY}`,
                        },
                        body: JSON.stringify({
                            menu_id: selectedMenu.id,
                            categories: [
                                {
                                    id: categoryId,
                                    options: [
                                        {
                                            id: option.id,
                                            _delete: true
                                        }
                                    ]
                                }
                            ]
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Supprimer l'option du state local
                        setEditableMenus(prev => {
                            const menuData = {...prev[selectedMenu.id]};
                            const categories = [...menuData.categories];
                            const options = [...categories[categoryIndex].options];
                            options.splice(optionIndex, 1);
                            
                            categories[categoryIndex] = {
                                ...categories[categoryIndex],
                                options
                            };
                            
                            return {
                                ...prev,
                                [selectedMenu.id]: {
                                    ...menuData,
                                    categories
                                }
                            };
                        });
                        
                        // Rafraîchir les données du menu
                        await fetchMenus();
                        alert(t('option_deleted_success'));
                    } else {
                        alert(t('delete_error') + ': ' + (data.error || t('unknown_error')));
                    }
                } catch (error) {
                    console.error('Erreur lors de la suppression de l\'option:', error);
                    alert(t('delete_error') + ': ' + error.message);
                }
            } else {
                // Pour les nouvelles options (pas encore en base), supprimer directement du state
                setEditableMenus(prev => {
                    const menuData = {...prev[selectedMenu.id]};
                    const categories = [...menuData.categories];
                    const options = [...categories[categoryIndex].options];
                    options.splice(optionIndex, 1);
                    
                    categories[categoryIndex] = {
                        ...categories[categoryIndex],
                        options
                    };
                    
                    return {
                        ...prev,
                        [selectedMenu.id]: {
                            ...menuData,
                            categories
                        }
                    };
                });
            }
            
            setIsOptionEditMode(false);
            setSelectedOption(null);
        },
        onCancel: () => {}
    });
};

    // Gestion de la mise à jour du menu
    const handleUpdateMenu = async (event) => {
        event.preventDefault();
        
        if (!selectedMenu) return;
    
        const menuData = editableMenus[selectedMenu.id];
        
        if (menuData?.name?.trim() === '') {
            alert(t('menu_name_required'));
            return;
        }
    
        if (!menuData?.price || menuData.price.trim() === '') {
            alert(t('price_required'));
            return;
        }
        setIsDeleting(true);

        try {
            // Préparation des données pour l'API
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

            // Préparation des catégories à mettre à jour/ajouter/supprimer
            for (const category of menuData.categories) {
                // Ignorer les catégories déjà traitées (supprimées du state)
                if (!category) continue;
                
                // Si la catégorie est marquée pour suppression, ajouter uniquement
                // les informations nécessaires pour la suppression
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

                // Si la catégorie a un ID, c'est une mise à jour
                if (category.id && !category.id.startsWith('temp-')) {
                    categoryData.id = category.id;
                }

                // Options de la catégorie
                if (category.options && category.options.length > 0) {
                    for (const option of category.options) {
                        // Ignorer les options déjà traitées (supprimées du state)
                        if (!option) continue;
                        
                        // Si l'option est marquée pour suppression, ajouter uniquement
                        // les informations nécessaires pour la suppression
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
                            display_order: option.display_order
                        };

                        // Si l'option a un ID, c'est une mise à jour
                        if (option.id && !option.id.startsWith('temp-')) {
                            optionData.id = option.id;
                        }

                        categoryData.options.push(optionData);
                    }
                }

                updateData.categories.push(categoryData);
            }
            console.log("Données envoyées à l'API pour les catégories:", JSON.stringify(updateData.categories, null, 2));

            // Appel à l'API pour mettre à jour le menu
            const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/update_menu`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${API_CONFIG.SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            console.log("Réponse complète de l'API:", JSON.stringify(data, null, 2));

            if (data.success) {
                console.log("Catégories ajoutées:", data.results?.categories?.added);
                console.log("Erreurs potentielles:", data.results?.errors);
                alert(t('menu_updated_success'));
                await fetchMenus();
                setEditableMenus({});
                setIsBottomSheetVisible(false);
            } else {
                alert(t('update_error') + ': ' + (data.error || t('unknown_error')));
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error.message);
            alert(t('update_error') + ': ' + error.message);
        }finally {
            setIsDeleting(false);
        }
    
    };

    // Gestion du téléchargement d'une image
    const handleClickUpload = async (menuId) => {
        const { status } = await requestMediaLibraryPermissionsAsync();
    
        if (status !== 'granted') {
            alert(t('access_denied'));
            return;
        }
    
        let options = {
            mediaType: 'photo',
            includeBase64: true
        };
    
        let result = await launchImageLibraryAsync(options);
    
        if (result.canceled) {
            console.log('Utilisateur a annulé');
        } else {
            console.log('Téléchargement réussi');
            uploadImage(menuId, result);
        }
    };

    // Upload de l'image vers Supabase Storage
    const uploadImage = async (menuId, imageData) => {
        const { uri } = imageData.assets[0];
        try {
            const base64Image = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            
            // Convertir la base64 en ArrayBuffer
            const arrayBuffer = decode(base64Image);
            
            // Créer un nom de fichier unique
            const fileName = `menu-${Date.now()}-${menuId}.jpg`;
            
            // Upload de l'image vers Supabase Storage
            const { data, error } = await supabase.storage
                .from('menus')
                .upload(fileName, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true
                });
            
            if (error) throw error;
            
            // Récupérer l'URL publique de l'image
            const { data: { publicUrl } } = supabase.storage
                .from('menus')
                .getPublicUrl(fileName);

            // Mettre à jour l'état avec l'image
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
    };

    // Gestion de la suppression d'un menu
    const handleDeleteMenu = async (menuId) => {
        try {
            ConfirmDialog({
                title: t('delete_confirmation'),
                message: t('delete_menu_confirmation'),
                onConfirm: async () => {
                    // Activer l'indicateur de chargement
                    setIsDeleting(true);
                    
                    try {
                        // Appel à l'API pour supprimer le menu
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
                        // Désactiver l'indicateur de chargement
                        setIsDeleting(false);
                    }
                },
                onCancel: () => {
                    console.log('Suppression annulée');
                }
            });
        } catch (error) {
            console.error('Erreur lors de la suppression:', error.message);
            alert(t('delete_error') + ': ' + error.message);
        }
    };

    // Réinitialiser l'image du menu
    const resetImage = () => {
        if (selectedMenu) {
            setEditableMenus((prev) => ({
                ...prev,
                [selectedMenu.id]: {
                    ...prev[selectedMenu.id],
                    imageURI: initialMenuImage ? { uri: initialMenuImage } : null,
                },
            }));
        }
    };

    // Fermer le modal d'édition
    const handleCloseModal = () => {
        resetImage();
        setIsBottomSheetVisible(false);
        setEditableMenus({});
        setSelectedCategory(null);
        setIsCategoryEditMode(false);
        setSelectedOption(null);
        setIsOptionEditMode(false);
    };

    // Formater le prix d'affichage
    const formatPrice = (price) => {
        return price.toFixed(2) + ' €';
    };

    // Formater la liste d'options pour l'affichage
    const formatOptions = (category) => {
        if (!category.options || category.options.length === 0) return '';
        return category.options.map(option => option.name).join(', ');
    };

    const toggleCategoryExpansion = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };
    
    // Fonction pour commencer l'édition d'une catégorie
    const startEditingCategory = (category) => {
        setEditingCategoryId(category.id);
        setEditingCategoryData({
            name: category.name,
            maxOptions: category.max_options.toString(),
            isRequired: category.is_required
        });
    };
    
    // Fonction pour sauvegarder une catégorie
    const saveEditingCategory = (categoryIndex) => {
        if (!editingCategoryData.maxOptions.trim()) {
            alert(t('max_option_required'));
            return;
        }
        
        // Convertir en nombre pour la sauvegarde
        const maxOptions = parseInt(editingCategoryData.maxOptions) || 1;
        
        setEditableMenus(prev => {
            const menuData = {...prev[selectedMenu.id]};
            const categories = [...menuData.categories];
            
            categories[categoryIndex] = {
                ...categories[categoryIndex],
                name: editingCategoryData.name,
                max_options: maxOptions,
                is_required: editingCategoryData.isRequired
            };
            
            return {
                ...prev,
                [selectedMenu.id]: {
                    ...menuData,
                    categories
                }
            };
        });
        
        setEditingCategoryId(null);
    };
    
    // Fonction pour commencer l'édition d'une option
    const startEditingOption = (option) => {
        setEditingOptionId(option.id);
        setEditingOptionData({
            name: option.name,
            additionalPrice: option.additional_price.toString()
        });
    };
    
    // Fonction pour sauvegarder une option
    const saveEditingOption = (categoryIndex, optionIndex) => {
        setEditableMenus(prev => {
            const menuData = {...prev[selectedMenu.id]};
            const categories = [...menuData.categories];
            const options = [...categories[categoryIndex].options];
            
            // Formater le prix additionnel
            let formattedPrice = editingOptionData.additionalPrice.replace(',', '.');
            if (formattedPrice !== '' && formattedPrice !== '.') {
                const parts = formattedPrice.split('.');
                if (parts[1]?.length > 2) {
                    parts[1] = parts[1].slice(0, 2);
                    formattedPrice = parts.join('.');
                }
                
                if (isNaN(parseFloat(formattedPrice))) {
                    formattedPrice = '0';
                }
            } else {
                formattedPrice = '0';
            }
            
            options[optionIndex] = {
                ...options[optionIndex],
                name: editingOptionData.name,
                additional_price: formattedPrice
            };
            
            categories[categoryIndex] = {
                ...categories[categoryIndex],
                options
            };
            
            return {
                ...prev,
                [selectedMenu.id]: {
                    ...menuData,
                    categories
                }
            };
        });
        
        setEditingOptionId(null);
    };

    const TouchableWrapper = ({ children }) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{ flex: 1 }}
    >
      {children}
    </TouchableOpacity>
  );
};

    return (
        <View style={styles.container}>
            <HeaderSetting name={t('edit_menus')} navigateTo="CardOptionScreen"/>
            
            {/* Switch pour afficher uniquement les menus actifs */}
            <View style={[styles.switchContainer, { marginBottom: 20 }]}>
                <Text style={[styles.switchLabel, { color: colors.colorText, paddingLeft: 15 }]}>
                    {t('available_menu')}
                </Text>
                <TouchableOpacity
                    style={[
                        styles.switchButton,
                        {
                            backgroundColor: showActiveOnly ? '#4CAF50' : '#FF4444',
                            marginRight: 20
                        }
                    ]}
                    onPress={() => setShowActiveOnly(prev => !prev)} 
                >
                    <View style={[
                        styles.switchKnob,
                        {
                            transform: [{
                                translateX: showActiveOnly ? 20 : 0
                            }]
                        }
                    ]} />
                </TouchableOpacity>
            </View>

            {/* Liste des menus */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.colorAction} />
                    <Text style={[styles.loadingText, { color: colors.colorText }]}>{t('loading')}</Text>
                </View>
            ) : (
                <ScrollView>
                    <View style={styles.menuGrid}>
                        {filteredMenus.length > 0 ? (
                            filteredMenus.map((menu) => (
                                <TouchableOpacity 
                                    key={menu.id} 
                                    style={[
                                        styles.menuCard, 
                                        { backgroundColor: colors.colorBorderAndBlock }
                                    ]}
                                    onPress={() => handleMenuPress(menu)}
                                >
                                    {menu.image_url && (
                                        <View style={styles.imageIndicator}>
                                            <Ionicons 
                                                name="image" 
                                                size={24} 
                                                color={colors.colorText} 
                                            />
                                        </View>
                                    )}
                                    <Text style={[styles.menuTitle, { color: colors.colorText }]}>
                                        {menu.name}
                                    </Text>
                                    <Text style={[styles.menuPrice, { color: colors.colorText }]}>
                                        {formatPrice(menu.price)}
                                    </Text>
                                    {menu.description && (
                                        <Text style={[styles.menuDescription, { color: colors.colorText }]} numberOfLines={2}>
                                            {menu.description}
                                        </Text>
                                    )}
                                    {menu.categories && menu.categories.length > 0 && (
                                        <View style={styles.categoryBadge}>
                                            <Text style={[styles.categoryText, { color: colors.colorText }]}>
                                                {menu.categories[0].name}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={[
                                        styles.availabilityIndicator,
                                        { backgroundColor: menu.is_active ? '#4CAF50' : '#FF4444' }
                                    ]} />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={[styles.noMenusText, { color: colors.colorText }]}>
                                {t('no_menus')}
                            </Text>
                        )}
                    </View>
                </ScrollView>
            )}

            {/* Modal d'édition de menu */}
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
                        nestedScrollEnabled={true}  // Ajoute cette propriété importante
                        contentContainerStyle={{ paddingBottom: 20 }}
                        >
                            <View style={styles.imageContainer}>
                                <View style={styles.imageWrapper}>
                                    {editableMenus[selectedMenu.id]?.imageURI?.uri || selectedMenu.image_url ? (
                                        <Image
                                            source={{ uri: editableMenus[selectedMenu.id]?.imageURI?.uri || selectedMenu.image_url }}
                                            style={styles.menuImage}
                                        />
                                    ) : (
                                        <View style={styles.noImageContainer}>
                                            <Ionicons name="image" size={40} color={colors.colorText} />
                                        </View>
                                    )}
                                    <TouchableOpacity 
                                        style={styles.editImageButton}
                                        onPress={() => handleClickUpload(selectedMenu.id)}
                                    >
                                        <Ionicons name="add" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TextInput
                                style={[styles.input, { color: colors.colorText }]}
                                value={editableMenus[selectedMenu.id]?.name ?? ""}
                                onChangeText={(text) => handleInputChange(selectedMenu.id, text, 'name')}
                                placeholder={t('menu_name')}
                                placeholderTextColor="#9EA0A4"
                            />
                            
                            <View style={styles.priceInputContainer}>
                                <TextInput
                                    style={[styles.input, { color: colors.colorText, paddingRight: 30 }]}
                                    value={editableMenus[selectedMenu.id]?.price?.toString() ?? selectedMenu.price.toString()}
                                    onChangeText={(text) => handleInputChange(selectedMenu.id, text, 'price')}
                                    keyboardType="numeric"
                                    placeholder={t('price')}
                                    placeholderTextColor="#9EA0A4"
                                />
                                <Text style={styles.euroSymbol}>€</Text>
                            </View>

                            <TextInput
                                style={[styles.input, { color: colors.colorText, height: 100 }]}
                                value={editableMenus[selectedMenu.id]?.description ?? selectedMenu.description}
                                onChangeText={(text) => handleInputChange(selectedMenu.id, text, 'description')}
                                placeholder={t('menu_details')}
                                placeholderTextColor="#9EA0A4"
                                multiline
                                numberOfLines={4}
                            />

                            {/* Sections des catégories et options */}
                            <View style={styles.categoriesSection}>
    <View style={styles.categoriesSectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.colorText }]}>
            {t('categories')}
        </Text>
        <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddCategory}
        >
            <Ionicons name="add-circle" size={32} color={colors.colorAction} />
        </TouchableOpacity>
    </View>
    
    {editableMenus[selectedMenu.id]?.categories && editableMenus[selectedMenu.id].categories.length > 0 ? (
        editableMenus[selectedMenu.id].categories.map((category, categoryIndex) => (
            <View key={category.id || categoryIndex} style={styles.categoryCollapse}>
                {/* En-tête de la catégorie (toujours visible) */}
                <TouchableOpacity 
                    style={[
                        styles.categoryCollapseHeader,
                        expandedCategories[category.id] && styles.categoryCollapseHeaderActive
                    ]}
                    onPress={() => toggleCategoryExpansion(category.id)}
                >
                    <View style={styles.categoryCollapseTitle}>
                        <Ionicons 
                            name={expandedCategories[category.id] ? "chevron-down" : "chevron-forward"} 
                            size={18} 
                            color={colors.colorText} 
                        />
                        <Text style={[styles.categoryName, { color: colors.colorText }]}>
                            {category.name}
                        </Text>
                    </View>
                    <View style={styles.categoryHeaderActions}>
                        <TouchableOpacity
                            style={styles.categoryActionButton}
                            onPress={() => startEditingCategory(category)}
                        >
                            <Ionicons name="pencil" size={26} color={colors.colorAction} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.categoryActionButton}
                            onPress={() => handleDeleteCategory(categoryIndex)}
                        >
                            <Ionicons name="trash" size={26} color="#FF4444" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>

                {/* Contenu de la catégorie (visible uniquement si développé) */}
                {expandedCategories[category.id] && (
                    <TouchableWithoutFeedback>
                    <View style={styles.categoryCollapseContent}>
                        {/* Mode édition de la catégorie */}
                        {editingCategoryId === category.id ? (
                            <View style={styles.categoryEditForm}>
                                <Text style={[styles.editFormLabel, { color: colors.colorText }]}>
                                    {t('category_name')}:
                                </Text>
                                <TextInput
                                    style={[styles.editFormInput, { color: colors.colorText }]}
                                    value={editingCategoryData.name}
                                    onChangeText={(text) => setEditingCategoryData(prev => ({...prev, name: text}))}
                                    placeholder={t('category_name')}
                                    placeholderTextColor="#9EA0A4"
                                />
                                
                                <Text style={[styles.editFormLabel, { color: colors.colorText }]}>
                                    {t('max_option')}:
                                </Text>
                                <TextInput
                                    style={[styles.editFormInput, { color: colors.colorText }]}
                                    value={editingCategoryData.maxOptions.toString()}
                                    onChangeText={(text) => setEditingCategoryData(prev => ({...prev, maxOptions: text}))}
                                    keyboardType="numeric"
                                    placeholder={t('max_option')}
                                    placeholderTextColor="#9EA0A4"
                                />
                                
                                <View style={styles.switchContainer}>
                                    <Text style={[styles.switchLabel, { color: colors.colorText }]}>
                                        {t('category_required')}
                                    </Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.switchButton,
                                            {
                                                backgroundColor: editingCategoryData.isRequired ? '#4CAF50' : '#FF4444'
                                            }
                                        ]}
                                        onPress={() => setEditingCategoryData(prev => ({
                                            ...prev, 
                                            isRequired: !prev.isRequired
                                        }))}
                                    >
                                        <View style={[
                                            styles.switchKnob,
                                            {
                                                transform: [{
                                                    translateX: editingCategoryData.isRequired ? 20 : 0
                                                }]
                                            }
                                        ]} />
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={styles.editFormActions}>
                                    <TouchableOpacity 
                                        style={[styles.editFormButton, styles.cancelButton]}
                                        onPress={() => setEditingCategoryId(null)}
                                    >
                                        <Text style={styles.editFormButtonText}>{t('cancel')}</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={[styles.editFormButton, styles.saveButton]}
                                        onPress={() => saveEditingCategory(categoryIndex)}
                                    >
                                        <Text style={styles.editFormButtonText}>{t('confirm')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            // Mode affichage normal de la catégorie
                            <View style={styles.categoryDetails}>
                                <View style={styles.categoryDetailRow}>
                                    <Text style={[styles.categoryDetailLabel, { color: colors.colorText }]}>
                                        {t('max_option')}:
                                    </Text>
                                    <Text style={[styles.categoryDetailValue, { color: colors.colorText }]}>
                                        {category.max_options}
                                    </Text>
                                </View>
                                <View style={styles.categoryDetailRow}>
                                    <Text style={[styles.categoryDetailLabel, { color: colors.colorText }]}>
                                        {t('category_required')}:
                                    </Text>
                                    <Text style={[
                                        styles.categoryDetailValue, 
                                        { 
                                            color: category.is_required ? '#4CAF50' : '#FF4444',
                                            fontWeight: '500'
                                        }
                                    ]}>
                                        {category.is_required ? t('yes') : t('no')}
                                    </Text>
                                </View>
                            </View>
                        )}
                        
                        {/* Liste des options */}
                        <View style={styles.optionsContainer}>
                            <View style={styles.optionsHeader}>
                                <Text style={[styles.optionsTitle, { color: colors.colorText }]}>
                                    {t('options')}
                                </Text>
                                <TouchableOpacity 
                                    style={styles.addButton}
                                    onPress={() => handleAddOption(categoryIndex)}
                                >
                                    <Ionicons name="add-circle" size={28} color={colors.colorAction} />
                                </TouchableOpacity>
                            </View>
                            
                            {category.options && category.options.length > 0 ? (
                                category.options.map((option, optionIndex) => (
                                    <View key={option.id || optionIndex} style={styles.optionItem}>
                                        {editingOptionId === option.id ? (
                                            // Mode édition d'option
                                            <View style={styles.optionEditForm}>
                                                <Text style={[styles.editFormLabel, { color: colors.colorText }]}>
                                                    {t('option_name')}:
                                                </Text>
                                                <TextInput
                                                    style={[styles.editFormInput, { color: colors.colorText }]}
                                                    value={editingOptionData.name}
                                                    onChangeText={(text) => setEditingOptionData(prev => ({...prev, name: text}))}
                                                    placeholder={t('option_name')}
                                                    placeholderTextColor="#9EA0A4"
                                                />
                                                
                                                <Text style={[styles.editFormLabel, { color: colors.colorText }]}>
                                                    {t('extra_price')}:
                                                </Text>
                                                <View style={styles.priceInputContainer}>
                                                    <TextInput
                                                        style={[styles.editFormInput, { color: colors.colorText, paddingRight: 30 }]}
                                                        value={editingOptionData.additionalPrice}
                                                        onChangeText={(text) => setEditingOptionData(prev => ({...prev, additionalPrice: text}))}
                                                        keyboardType="numeric"
                                                        placeholder="0.00"
                                                        placeholderTextColor="#9EA0A4"
                                                    />
                                                    <Text style={styles.euroPriceSymbol}>€</Text>
                                                </View>
                                                
                                                <View style={styles.editFormActions}>
                                                    <TouchableOpacity 
                                                        style={[styles.editFormButton, styles.cancelButton]}
                                                        onPress={() => setEditingOptionId(null)}
                                                    >
                                                        <Text style={styles.editFormButtonText}>{t('cancel')}</Text>
                                                    </TouchableOpacity>
                                                    
                                                    <TouchableOpacity 
                                                        style={[styles.editFormButton, styles.saveButton]}
                                                        onPress={() => saveEditingOption(categoryIndex, optionIndex)}
                                                    >
                                                        <Text style={styles.editFormButtonText}>{t('save')}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : (
                                            // Affichage normal de l'option
                                            <View style={styles.optionRow}>
                                                <View style={styles.optionInfo}>
                                                    <Text style={[styles.optionName, { color: colors.colorText }]}>
                                                        {option.name}
                                                    </Text>
                                                    {parseFloat(option.additional_price) > 0 && (
                                                        <Text style={[styles.optionPrice, { color: colors.colorText }]}>
                                                            +{parseFloat(option.additional_price).toFixed(2)} €
                                                        </Text>
                                                    )}
                                                </View>
                                                <View style={styles.optionActions}>
                                                    <TouchableOpacity
                                                        style={styles.optionActionButton}
                                                        onPress={() => startEditingOption(option)}
                                                    >
                                                        <Ionicons name="pencil" size={24} color={colors.colorAction} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.optionActionButton}
                                                        onPress={() => handleDeleteOption(categoryIndex, optionIndex)}
                                                    >
                                                        <Ionicons name="trash" size={24} color="#FF4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <Text style={[styles.noOptions, { color: colors.colorText }]}>
                                    {t('no_option_selected')}
                                </Text>
                            )}
                        </View>
                    </View>
                    </TouchableWithoutFeedback>
                )}
            </View>
        ))
    ) : (
        <Text style={[styles.noCategories, { color: colors.colorText }]}>
            {t('no_category_selected')}
        </Text>
    )}
</View>
                            <View style={styles.switchContainer}>
                                <Text style={[styles.switchLabel, { color: colors.colorText }]}>
                                    {t('available_menu')}
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.switchButton,
                                        {
                                            backgroundColor: (editableMenus[selectedMenu.id]?.is_active ?? selectedMenu.is_active)
                                                ? '#4CAF50'
                                                : '#FF4444'
                                        }
                                    ]}
                                    onPress={() => handleInputChange(
                                        selectedMenu.id,
                                        !(editableMenus[selectedMenu.id]?.is_active ?? selectedMenu.is_active),
                                        'is_active'
                                    )}
                                >
                                    <View style={[
                                        styles.switchKnob,
                                        {
                                            transform: [{
                                                translateX: (editableMenus[selectedMenu.id]?.is_active ?? selectedMenu.is_active)
                                                    ? 20
                                                    : 0
                                            }]
                                        }
                                    ]} />
                                </TouchableOpacity>
                            </View>
                            {/* Toggle pour disponible en ligne */}
                            <View style={styles.switchContainer}>
                                <Text style={[styles.switchLabel, { color: colors.colorText }]}>
                                    {t('show_online')}
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.switchButton,
                                        {
                                            backgroundColor: (editableMenus[selectedMenu.id]?.available_online ?? selectedMenu.available_online)
                                                ? '#4CAF50'
                                                : '#FF4444'
                                        }
                                    ]}
                                    onPress={() => handleInputChange(
                                        selectedMenu.id,
                                        !(editableMenus[selectedMenu.id]?.available_online ?? selectedMenu.available_online),
                                        'available_online'
                                    )}
                                >
                                    <View style={[
                                        styles.switchKnob,
                                        {
                                            transform: [{
                                                translateX: (editableMenus[selectedMenu.id]?.available_online ?? selectedMenu.available_online)
                                                    ? 20
                                                    : 0
                                            }]
                                        }
                                    ]} />
                                </TouchableOpacity>
                            </View>

                            {/* Toggle pour disponible sur place */}
                            <View style={styles.switchContainer}>
                                <Text style={[styles.switchLabel, { color: colors.colorText }]}>
                                    {t('show_on_site')}
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.switchButton,
                                        {
                                            backgroundColor: (editableMenus[selectedMenu.id]?.available_onsite ?? selectedMenu.available_onsite)
                                                ? '#4CAF50'
                                                : '#FF4444'
                                        }
                                    ]}
                                    onPress={() => handleInputChange(
                                        selectedMenu.id,
                                        !(editableMenus[selectedMenu.id]?.available_onsite ?? selectedMenu.available_onsite),
                                        'available_onsite'
                                    )}
                                >
                                    <View style={[
                                        styles.switchKnob,
                                        {
                                            transform: [{
                                                translateX: (editableMenus[selectedMenu.id]?.available_onsite ?? selectedMenu.available_onsite)
                                                    ? 20
                                                    : 0
                                            }]
                                        }
                                    ]} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.bottomSheetActions}>
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => handleDeleteMenu(selectedMenu.id)}
                                >
                                    <Text style={styles.actionButtonText}>{t('delete')}</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.saveButton]}
                                    onPress={handleUpdateMenu}
                                >
                                    <Text style={styles.actionButtonText}>{t('confirm')}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </View>
                {isDeleting && (
                    <View 
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 9999
                        }}
                    >
                        <View 
                            style={{
                                backgroundColor: 'white',
                                padding: 25,
                                borderRadius: 10,
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                elevation: 5,
                            }}
                        >
                            <ActivityIndicator size="large" color={colors.colorAction} />
                            <Text 
                                style={{
                                    marginTop: 15,
                                    fontSize: 16,
                                    fontWeight: '500',
                                    color: colors.colorText
                                }}
                            >
                                {t('in_progress')}...
                            </Text>
                        </View>
                    </View>
                )}
            </Modal>
        </View>
    );
}

function useStyles() {
    const { width } = useWindowDimensions();
    const { colors } = useColors();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.colorBackground,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: 10,
            fontSize: 16,
        },
        menuGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingHorizontal: 8,
            gap: 16,
            paddingBottom: 20,
        },
        menuCard: {
            width: width * 0.45,
            borderRadius: 12,
            padding: 16,
            backgroundColor: colors.colorBorderAndBlock,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            position: 'relative',
            marginBottom: 10,
        },
        imageIndicator: {
            position: 'absolute',
            top: 8,
            right: 8,
        },
        menuTitle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 8,
        },
        menuPrice: {
            fontSize: 14,
            marginBottom: 8,
            fontWeight: '500',
        },
        menuDescription: {
            fontSize: 12,
            marginBottom: 8,
            opacity: 0.7,
        },
        categoryBadge: {
            backgroundColor: 'rgba(0,0,0,0.05)',
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 12,
            alignSelf: 'flex-start',
        },
        categoryText: {
            fontSize: 12,
        },
        availabilityIndicator: {
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 16,
            height: 16,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: colors.colorBackground,
        },
        noMenusText: {
            width: '100%',
            textAlign: 'center',
            marginTop: 20,
            fontSize: 16,
        },
        categoriesBar: {
            backgroundColor: colors.colorBackground,
            marginBottom: 10,
        },
        categoriesWrapper: {
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
        categoryChip: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            backgroundColor: colors.colorBorderAndBlock,
            marginRight: 8,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
        },
        categoryChipText: {
            fontSize: 16,
            color: colors.colorText,
            includeFontPadding: false,
            textAlignVertical: 'center',
        },
        selectedCategoryChip: {
            backgroundColor: colors.colorAction,
        },
        selectedCategoryChipText: {
            color: "#fff",
        },
        switchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        switchLabel: {
            fontSize: 16,
        },
        switchButton: {
            width: 50,
            height: 30,
            borderRadius: 15,
            padding: 5,
        },
        switchKnob: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: 'white',
        },
        categoryModal: {
            justifyContent: 'flex-end',
            margin: 0,
        },
        categoryModalContent: {
            backgroundColor: 'white',
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80%',
        },
        modalHandle: {
            width: 40,
            height: 4,
            backgroundColor: '#DEDEDE',
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 20,
        },
        categoryModalItem: {
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.1)',
        },
        categoryModalText: {
            fontSize: 16,
        },
        bottomSheet: {
            justifyContent: 'flex-end',
            margin: 0,
        },
        bottomSheetContent: {
            backgroundColor: 'white',
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            minHeight: '50%',
            maxHeight: '90%',
        },
        bottomSheetHandle: {
            width: 40,
            height: 4,
            backgroundColor: '#DEDEDE',
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 20,
        },
        imageContainer: {
            alignItems: 'center',
            marginBottom: 30,
            marginTop: 10,
        },
        imageWrapper: {
            position: 'relative',
            width: 120,
            height: 120,
        },
        menuImage: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#f0f0f0',
        },
        editImageButton: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: colors.colorAction,
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: colors.colorBackground,
        },
        noImageContainer: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.colorBorderAndBlock,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'rgba(0,0,0,0.1)',
            borderStyle: 'dashed',
        },
        input: {
            borderWidth: 1,
            borderColor: '#DEDEDE',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
        },
        priceInputContainer: {
            position: 'relative',
            marginBottom: 16,
        },
        euroSymbol: {
            position: 'absolute',
            right: 10,
            top: 12,
            color: colors.colorText,
            fontSize: 16,
        },
        bottomSheetActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
            marginBottom: 10,
        },
        actionButton: {
            flex: 1,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginHorizontal: 8,
        },
        deleteButton: {
            backgroundColor: '#FF4444',
        },
        saveButton: {
            backgroundColor: '#4CAF50',
        },
        actionButtonText: {
            color: 'white',
            fontWeight: '600',
            textAlign: "center"
        },
        categoriesSection: {
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#DEDEDE',
            borderRadius: 8,
            padding: 12,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 12,
        },
        categoryItem: {
            marginBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.1)',
            paddingBottom: 10,
        },
        categoryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        categoryName: {
            fontSize: 16,
            fontWeight: '500',
        },
        categoryRequired: {
            fontSize: 12,
            fontWeight: '500',
        },
        categoryOptions: {
            fontSize: 14,
            marginBottom: 4,
        },
        optionsList: {
            fontSize: 12,
            opacity: 0.7,
        },
        noCategories: {
            textAlign: 'center',
            marginTop: 10,
            marginBottom: 10,
            fontSize: 14,
            opacity: 0.7,
        },
        categoryCollapse: {
            marginBottom: 12,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
            borderRadius: 8,
            overflow: 'hidden',
        },
        categoryCollapseHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            backgroundColor: colors.colorBorderAndBlock,
        },
        categoryCollapseHeaderActive: {
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.1)',
        },
        categoryCollapseTitle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        categoryHeaderActions: {
            flexDirection: 'row',
            gap: 10,
        },
        categoryActionButton: {
            padding: 4,
        },
        categoryCollapseContent: {
            padding: 12,
            backgroundColor: 'rgba(0,0,0,0.02)',
        },
        categoryDetails: {
            marginBottom: 12,
        },
        categoryDetailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 6,
        },
        categoryDetailLabel: {
            fontSize: 14,
            fontWeight: '500',
            marginRight: 8,
        },
        categoryDetailValue: {
            fontSize: 14,
        },
        
        // Styles pour le formulaire d'édition
        categoryEditForm: {
            marginBottom: 16,
            backgroundColor: colors.colorBackground,
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
        },
        optionEditForm: {
            backgroundColor: colors.colorBackground,
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
        },
        editFormLabel: {
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 4,
        },
        editFormInput: {
            borderWidth: 1,
            borderColor: '#DEDEDE',
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
            backgroundColor: colors.colorBackground,
        },
        editFormActions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 8,
            gap: 8,
        },
        editFormButton: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
        },
        editFormButtonText: {
            color: 'white',
            fontWeight: '500',
        },
        cancelButton: {
            backgroundColor: '#666',
        },
        saveButton: {
            backgroundColor: '#4CAF50',
        },
        deleteButton: {
            backgroundColor: '#FF4444',
        },
        
        addButton: {
            padding: 8,
        },
        
        // Styles pour le système de collapse de catégories
        categoryCollapse: {
            marginBottom: 12,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
            borderRadius: 8,
            overflow: 'hidden',
        },
        categoryCollapseHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            backgroundColor: colors.colorBorderAndBlock,
        },
        categoryCollapseHeaderActive: {
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.1)',
        },
        categoryCollapseTitle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        categoryHeaderActions: {
            flexDirection: 'row',
            gap: 10,
        },
        categoryActionButton: {
            padding: 8,
        },
        categoryCollapseContent: {
            padding: 12,
            backgroundColor: 'rgba(0,0,0,0.02)',
        },
        categoryDetails: {
            marginBottom: 12,
        },
        categoryDetailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 6,
        },
        categoryDetailLabel: {
            fontSize: 14,
            fontWeight: '500',
            marginRight: 8,
        },
        categoryDetailValue: {
            fontSize: 14,
        },
        
        // Styles pour le formulaire d'édition
        categoryEditForm: {
            marginBottom: 16,
            backgroundColor: colors.colorBackground,
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
        },
        optionEditForm: {
            backgroundColor: colors.colorBackground,
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
        },
        editFormLabel: {
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 4,
        },
        editFormInput: {
            borderWidth: 1,
            borderColor: '#DEDEDE',
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
            backgroundColor: colors.colorBackground,
        },
        editFormActions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 8,
            gap: 8,
        },
        editFormButton: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
        },
        editFormButtonText: {
            color: 'white',
            fontWeight: '500',
        },
        cancelButton: {
            backgroundColor: '#666',
        },
        saveButton: {
            backgroundColor: '#4CAF50',
        },
        deleteButton: {
            backgroundColor: '#FF4444',
        },
        
        // Styles pour les options
        optionsContainer: {
            marginTop: 8,
        },
        optionsHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        optionsTitle: {
            fontSize: 16,
            fontWeight: '600',
        },
        optionItem: {
            marginBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.05)',
            paddingBottom: 8,
        },
        optionRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        optionInfo: {
            flex: 1,
        },
        optionName: {
            fontSize: 14,
            fontWeight: '500',
        },
        optionPrice: {
            fontSize: 12,
            marginTop: 2,
        },
        optionActions: {
            flexDirection: 'row',
            gap: 10,
        },
        optionActionButton: {
            padding: 8,
        },
        noOptions: {
            textAlign: 'center',
            marginTop: 10,
            marginBottom: 10,
            fontSize: 14,
            opacity: 0.7,
        },
        euroPriceSymbol: {
            position: 'absolute',
            right: 10,
            top: 10,
            color: colors.colorText,
            fontSize: 14,
        },
        categoriesSectionHeader:{
            display: "flex",
            justifyContent: 'space-between',
            flexDirection: "row",
            alignItems: "center"
        },
        loadingModal: {
            justifyContent: 'center',
            alignItems: 'center',
            margin: 0,
        },
        loadingModalContent: {
            backgroundColor: 'white',
            padding: 25,
            borderRadius: 10,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        loadingModalText: {
            marginTop: 15,
            fontSize: 16,
            fontWeight: '500',
        },
    });
}