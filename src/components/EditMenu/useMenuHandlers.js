import { useState } from 'react';
import { API_CONFIG } from '../../config/constants';
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../lib/supabase';
import ConfirmDialog from '../ModalAction/ModalAction';

export const useMenuHandlers = (
    selectedMenu,
    editableMenus,
    setEditableMenus,
    setIsDeleting,
    fetchMenus,
    t
) => {
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

    const handleInputChange = (menuId, newValue, name) => {
        console.log('🖊️ handleInputChange:', { menuId, name, newValue });

        if (name === 'price') {
            let formattedValue = newValue.replace(',', '.');

            if (formattedValue !== '' && formattedValue !== '.') {
                const parts = formattedValue.split('.');
                if (parts[1]?.length > 2) {
                    parts[1] = parts[1].slice(0, 2);
                    formattedValue = parts.join('.');
                }

                if (isNaN(parseFloat(formattedValue))) {
                    return;
                }
            }

            setEditableMenus((prev) => {
                console.log('💾 Mise à jour prix:', formattedValue);
                return {
                    ...prev,
                    [menuId]: {
                        ...prev[menuId],
                        [name]: formattedValue,
                    },
                };
            });
        } else {
            setEditableMenus((prev) => {
                console.log('💾 Mise à jour champ:', name, newValue);
                return {
                    ...prev,
                    [menuId]: {
                        ...prev[menuId],
                        [name]: newValue,
                    },
                };
            });
        }
    };

    const handleCategoryChange = (categoryIndex, field, value) => {
        if (!selectedMenu) return;

        setEditableMenus(prev => {
            const menuData = {...prev[selectedMenu.id]};
            const categories = [...menuData.categories];

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

    const handleOptionChange = (categoryIndex, optionIndex, field, value) => {
        if (!selectedMenu) return;

        setEditableMenus(prev => {
            const menuData = {...prev[selectedMenu.id]};
            const categories = [...menuData.categories];
            const options = [...categories[categoryIndex].options];

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
    };

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
    };

    const handleDeleteCategory = (categoryIndex) => {
        if (!selectedMenu) return;

        const category = editableMenus[selectedMenu.id].categories[categoryIndex];

        ConfirmDialog({
            title: t('delete'),
            message: t('confirm_deletion'),
            onConfirm: async () => {
                if (category.id && !category.id.startsWith('temp-')) {
                    try {
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

                            await fetchMenus();
                            alert(t('category_deleted_success'));
                        } else {
                            alert(t('delete_error') + ': ' + (data.error || t('unknown_error')));
                        }
                    } catch (error) {
                        alert(t('delete_error') + ': ' + error.message);
                    }
                } else {
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
            },
            onCancel: () => {}
        });
    };

    const handleDeleteOption = (categoryIndex, optionIndex) => {
        if (!selectedMenu) return;

        const option = editableMenus[selectedMenu.id].categories[categoryIndex].options[optionIndex];

        ConfirmDialog({
            title: t('delete'),
            message: t('confirm_deletion'),
            onConfirm: () => {
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
            },
            onCancel: () => {}
        });
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
            setEditableMenus((prev) => ({
                ...prev,
                [menuId]: {
                    ...prev[menuId],
                    imageURI: { uri: asset.uri },
                },
            }));
        }
    };

    const toggleCategoryExpansion = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const startEditingCategory = (category) => {
        setEditingCategoryId(category.id);
        setEditingCategoryData({
            name: category.name,
            maxOptions: category.max_options.toString(),
            isRequired: category.is_required
        });
    };

    const saveEditingCategory = (categoryIndex) => {
        handleCategoryChange(categoryIndex, 'name', editingCategoryData.name);
        handleCategoryChange(categoryIndex, 'max_options', parseInt(editingCategoryData.maxOptions) || 0);
        handleCategoryChange(categoryIndex, 'is_required', editingCategoryData.isRequired);
        setEditingCategoryId(null);
    };

    const cancelEditingCategory = () => {
        setEditingCategoryId(null);
        setEditingCategoryData({
            name: '',
            maxOptions: '1',
            isRequired: true
        });
    };

    const startEditingOption = (option) => {
        setEditingOptionId(option.id);
        setEditingOptionData({
            name: option.name,
            additionalPrice: option.additional_price.toString()
        });
    };

    const saveEditingOption = (categoryIndex, optionIndex) => {
        handleOptionChange(categoryIndex, optionIndex, 'name', editingOptionData.name);
        handleOptionChange(categoryIndex, optionIndex, 'additional_price', editingOptionData.additionalPrice);
        setEditingOptionId(null);
    };

    const cancelEditingOption = () => {
        setEditingOptionId(null);
        setEditingOptionData({
            name: '',
            additionalPrice: '0'
        });
    };

    return {
        expandedCategories,
        editingCategoryId,
        editingOptionId,
        editingCategoryData,
        editingOptionData,
        setEditingCategoryData,
        setEditingOptionData,
        handleInputChange,
        handleCategoryChange,
        handleOptionChange,
        handleAddCategory,
        handleAddOption,
        handleDeleteCategory,
        handleDeleteOption,
        handleClickUpload,
        toggleCategoryExpansion,
        startEditingCategory,
        saveEditingCategory,
        cancelEditingCategory,
        startEditingOption,
        saveEditingOption,
        cancelEditingOption,
    };
};