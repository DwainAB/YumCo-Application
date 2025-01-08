import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import { apiService } from "../API/ApiService";
import {launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import { useColors } from "../ColorContext/ColorContext";
import ConfirmDialog from "../ModalAction/ModalAction";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { decode } from "base64-arraybuffer";



function FormUpdate() {
    const { colors } = useColors()
    const [listProduct, setListProduct] = useState([])
    const [categories, setCategories] = useState({});
    const [initialFoodImage, setInitialFoodImage] = useState(null); // Sauvegarde temporaire
    const [editableFoods, setEditableFoods] = useState({});
    const [selectedFood, setSelectedFood] = useState(null);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [restaurantId, setRestaurantId]= useState('')
    const { t } = useTranslation();
    const styles = useStyles()
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [visibleCategories, setVisibleCategories] = useState([]);
    const maxVisibleCategories = 3; // Nombre de catégories visibles avant "voir plus"
    const categoriesWrapperRef = useRef(null);
    const [showViewMore, setShowViewMore] = useState(false);
    const [showAvailableOnly, setShowAvailableOnly] = useState(false); 
    const [isPickerFocused, setIsPickerFocused] = useState(false);
    const pickerRef = useRef(null);
    const [isCategorySelectionModalVisible, setIsCategorySelectionModalVisible] = useState(false);

    // Récupération des produits depuis Supabase
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [restaurantId]);

    const handleFilterByCategory = (categoryId) => {
        setSelectedCategory(Number(categoryId));
        setIsCategoryModalVisible(false);
    };

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

    // Mettre à jour les catégories visibles
    useEffect(() => {
        if (Object.keys(categories).length > 0) {
            setVisibleCategories(Object.entries(categories).slice(0, maxVisibleCategories));
        }
    }, [categories]);

    const filteredProducts = useMemo(() => {
        
        let productsToDisplay = listProduct;

        // Filtrer par catégorie
        if (selectedCategory) {
            productsToDisplay = productsToDisplay.filter(product => product.category_id === selectedCategory);
        }

        // Filtrer par disponibilité
        if (showAvailableOnly) {
            productsToDisplay = productsToDisplay.filter(product => product.is_available === true); // Assurez-vous que c'est un booléen
        }

        return productsToDisplay;
    }, [selectedCategory, listProduct, showAvailableOnly]);

    const fetchProducts = async () => {
        if(!restaurantId){
            return
        }
        try {
            const { data: products, error } = await supabase
                .from('products')
                .select('*')
                .eq('restaurant_id', restaurantId)
                .eq('is_deleted', false);
    
            if (error) throw error;
            setListProduct(products);
        } catch (error) {
            console.error('Erreur lors de la récupération des produits:', error.message);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data: categoriesData, error } = await supabase
                .from('categories')
                .select('id, name');

            if (error) throw error;

            const categoriesMap = {};
            categoriesData.forEach(category => {
                categoriesMap[category.id] = category.name;
            });
            setCategories(categoriesMap);
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error.message);
        }
    };

    const handleInputChange = (foodId, newValue, name) => {
        setEditableFoods((prev) => ({
            ...prev,
            [foodId]: {
                ...prev[foodId],
                [name]: name === 'category_id' ? Number(newValue) : newValue,
            },
        }));
    };
    
      const handleUpdateAllFoods = async (event) => {
        event.preventDefault();
        
        if (!selectedFood) return; // Assurez-vous qu'un produit est sélectionné

        const foodData = editableFoods[selectedFood.id]; // Récupérer les données du produit sélectionné
        const baseFoodData = listProduct.find(product => product.id === selectedFood.id); // Récupérer les données de base

        try {
            const { error } = await supabase
                .from('products')
                .update({
                    name: foodData.title || baseFoodData.name,
                    price: foodData.price !== undefined ? parseFloat(foodData.price) : baseFoodData.price,
                    image_url: foodData.imageURI ? foodData.imageURI.uri : baseFoodData.image_url,
                    is_available: foodData.is_available !== undefined ? foodData.is_available : baseFoodData.is_available,
                    category_id: foodData.category_id !== undefined ? Number(foodData.category_id) : Number(baseFoodData.category_id),
                })
                .eq('id', selectedFood.id); // Mettre à jour uniquement le produit sélectionné

            if (error) throw error;

            alert("Modifications ajoutées avec succès");
            await fetchProducts();
            setEditableFoods({});
            setIsBottomSheetVisible(false);
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error.message);
        }
    };
    
    

    
    const handleClickUpload = async (foodId) => {
        const { status } = await requestMediaLibraryPermissionsAsync()
    
        if (status !== 'granted') {
            alert("accès refusé")
            return
        }
    
        let options = {
            mediaType: 'photo',
            includeBase64: true
        }
    
        let result = await launchImageLibraryAsync(options)
    
        if (result.didCancel == true) {
            console.log('user cancel');
        } else if (result.errorCode && parseInt(result.errorCode)) {
            console.log('upload error');
        } else {
            console.log('upload succès');
            uploadImage(foodId, result);
        }
    };
    

    const uploadImage = async (foodId, imageData) => {
        const { uri } = imageData.assets[0];
        try {
            const base64Image = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            
            // Convertir la base64 en ArrayBuffer
            const arrayBuffer = decode(base64Image);
            
            // Créer un nom de fichier unique
            const fileName = `${Date.now()}-${foodId}.jpg`;
            
            // Upload de l'image vers Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Récupérer l'URL publique de l'image
            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(fileName);

            // Mettre à jour l'état avec l'image
            setEditableFoods(prev => ({
                ...prev,
                [foodId]: {
                    ...prev[foodId],
                    imageURI: { uri: publicUrl } // Utiliser l'URL publique
                }
            }));
        } catch (error) {
            console.error('Erreur lors de la lecture de l\'image:', error);
        }
    };
    


    const handleDeleteFood = async (foodId) => {
        try {
            ConfirmDialog({
                title: 'Confirmation de suppression',
                message: 'Voulez-vous vraiment supprimer ce produit ?',
                onConfirm: async () => {
                    const { error } = await supabase
                        .from('products')
                        .update({ is_deleted: true })
                        .eq('id', foodId);

                    if (error) throw error;
                    
                    alert('Suppression réussie');
                    await fetchProducts();
                    setIsBottomSheetVisible(false);
                },
                onCancel: () => {
                    console.log('Suppression annulée');
                }
            });
        } catch (error) {
            console.error('Erreur lors de la suppression:', error.message);
        }
    };
    
    const handleProductPress = (food) => {
        setSelectedFood(food);
        setIsBottomSheetVisible(true);
        setInitialFoodImage(food.image_url || null);
        
        // Sauvegarder l'état d'origine du produit
        setEditableFoods({
            [food.id]: {
                title: food.name,
                price: food.price,
                imageURI: food.image_url ? { uri: food.image_url } : null,
                is_available: food.is_available,
                category_id: food.category_id,
            }
        });
    };


    const measureCategories = () => {
        if (categoriesWrapperRef.current) {
            categoriesWrapperRef.current.measure((x, y, width, height, pageX, pageY) => {
                const containerWidth = width;
                let totalWidth = 0;
                
                // Calculer la largeur approximative de chaque catégorie
                Object.values(categories).forEach((name) => {
                    // Estimation de la largeur: 24px de padding + 8px de marge + ~10px par caractère
                    totalWidth += 32 + (name.length * 10);
                });

                setShowViewMore(totalWidth > containerWidth);
            });
        }
    };

    useEffect(() => {
        if (Object.keys(categories).length > 0) {
            measureCategories();
        }
    }, [categories]);

    const resetImage = () => {
        if (selectedFood) {
            const initialImage = initialFoodImage; // Récupérer l'image initiale sauvegardée

            setEditableFoods((prev) => ({
                ...prev,
                [selectedFood.id]: {
                    ...prev[selectedFood.id],
                    imageURI: initialImage ? { uri: initialImage } : null, // Réinitialiser ou supprimer
                },
            }));
        }
    };




    const handleSaveImage = async () => {
        // Enregistrer les modifications et réinitialiser l'état temporaire
        setInitialFoodImage(editableFoods[selectedFood.id]?.imageURI?.uri || null);
    };

    const handleCloseModal = () => {
        resetImage(); // Réinitialiser l'image lorsque le modal est fermé
        setIsBottomSheetVisible(false);
        setEditableFoods({}); // Réinitialiser les modifications non enregistrées
    };


    const getCategoryItems = () => {
        return Object.entries(categories).map(([id, name]) => ({
            label: name,
            value: Number(id),
        }));
    };

    const handlePickerPress = () => {
        setIsPickerFocused(true);
        if (pickerRef.current) {
            pickerRef.current.focus();
        }
    };

    const pickerSelectStyles = StyleSheet.create({
        inputIOS: {
            fontSize: 16,
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: '#DEDEDE',
            borderRadius: 8,
            color: colors.colorText,
            paddingRight: 30,
            height: 45, // Hauteur fixe
        },
        inputAndroid: {
            fontSize: 16,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: '#DEDEDE',
            borderRadius: 8,
            color: colors.colorText,
            paddingRight: 30,
            height: 45, // Hauteur fixe
        },
        iconContainer: {
            top: 10,
            right: 12,
        },
        touchableWrapper: {
            marginBottom: 16,
        }
    });

    const handleCategorySelect = (categoryId) => {
        handleInputChange(selectedFood.id, categoryId, 'category_id');
        setIsCategorySelectionModalVisible(false);
    };


    return (
        <View style={styles.container}>
            {/* Barre de catégories */}
            <View style={styles.categoriesBar}>
                <View 
                    ref={categoriesWrapperRef}
                    style={styles.categoriesWrapper}
                >
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                    >
                        <TouchableOpacity 
                            style={[
                                styles.categoryChip,
                                !selectedCategory && styles.selectedCategoryChip
                            ]}
                            onPress={() => setSelectedCategory(null)}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                !selectedCategory && styles.selectedCategoryChipText
                            ]}>
                                {t('viewAll')}
                            </Text>
                        </TouchableOpacity>

                        {Object.entries(categories).slice(0, 3).map(([id, name]) => (
                            <TouchableOpacity 
                                key={id}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === Number(id) && styles.selectedCategoryChip
                                ]}
                                onPress={() => handleFilterByCategory(id)}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    selectedCategory === Number(id) && styles.selectedCategoryChipText
                                ]}>
                                    {name}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        {Object.keys(categories).length > 3 && (
                            <TouchableOpacity 
                                style={styles.categoryChip}
                                onPress={() => setIsCategoryModalVisible(true)}
                            >
                                <Text style={styles.categoryChipText}>{t('seeMore')}</Text>
                            </TouchableOpacity>
                        )}

                    </ScrollView>
                </View>
            </View>

            <View style={[styles.switchContainer, { marginBottom: 50 }]}>
                <Text style={[styles.switchLabel, { color: colors.colorText, paddingLeft: 15 }]}>
                        {t('displayAvailableProducts')}
                </Text>
                <TouchableOpacity
                    style={[
                        styles.switchButton,
                        {
                            backgroundColor: showAvailableOnly ? '#4CAF50' : '#FF4444',
                            marginRight: 20
                        }
                    ]}
                    onPress={() => setShowAvailableOnly(prev => !prev)} 
                >
                    <View style={[
                        styles.switchKnob,
                        {
                            transform: [{
                                translateX: showAvailableOnly ? 20 : 0
                            }]
                        }
                    ]} />
                </TouchableOpacity>
            </View>

            {/* Liste des produits */}
            <ScrollView>
                <View style={styles.productGrid}>
                    {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
                        filteredProducts.map((food) => (
                            <TouchableOpacity 
                                key={food.id} 
                                style={[
                                    styles.productCard, 
                                    { backgroundColor: colors.colorBorderAndBlock }
                                ]}
                                onPress={() => handleProductPress(food)}
                            >
                                {food.image_url && (
                                    <View style={styles.imageIndicator}>
                                        <Ionicons 
                                            name="image" 
                                            size={24} 
                                            color={colors.colorText} 
                                        />
                                    </View>
                                )}
                                <Text style={[styles.productTitle, { color: colors.colorText }]}>
                                    {food.name}
                                </Text>
                                <Text style={[styles.productPrice, { color: colors.colorText }]}>
                                    {food.price.toFixed(2)} €
                                </Text>
                                <View style={[styles.categoryBadge, { alignSelf: 'flex-start', marginLeft: 0 }]}>
                                    <Text style={[styles.categoryText, { color: colors.colorText }]}>
                                        {categories[food.category_id] || 'Sans catégorie'}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.availabilityIndicator,
                                    { backgroundColor: food.is_available ? '#4CAF50' : '#FF4444' }
                                ]} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={[styles.noProductsText, { color: colors.colorText }]}>
                            {t('noProductInCategory')}
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* Modal des catégories */}
            <Modal
                isVisible={isCategoryModalVisible}
                onBackdropPress={() => setIsCategoryModalVisible(false)}
                style={styles.categoryModal}
                propagateSwipe={true}
            >
                <View style={[styles.categoryModalContent, { backgroundColor: colors.colorBackground }]}>
                    <View style={styles.modalHandle} />
                    <ScrollView>
                        <TouchableOpacity 
                            style={styles.categoryModalItem}
                            onPress={() => handleFilterByCategory(null)}
                        >
                            <Text style={[styles.categoryModalText, { color: colors.colorText }]}>
                                {t('viewAll')}
                            </Text>
                        </TouchableOpacity>
                        {Object.entries(categories).map(([id, name]) => (
                            <TouchableOpacity 
                                key={id}
                                style={styles.categoryModalItem}
                                onPress={() => handleFilterByCategory(id)}
                            >
                                <Text style={[styles.categoryModalText, { color: colors.colorText }]}>
                                    {name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>

            <Modal
                isVisible={isBottomSheetVisible}
                onSwipeComplete={!isPickerFocused ? handleCloseModal : undefined}
                swipeDirection={!isPickerFocused ? ['down'] : undefined}
                style={styles.bottomSheet}
                onBackdropPress={!isPickerFocused ? handleCloseModal : undefined}
                propagateSwipe={!isPickerFocused}
            >
                <View style={[styles.bottomSheetContent, { backgroundColor: colors.colorBackground }]}>
                    <View style={styles.bottomSheetHandle} />
                    
                    {selectedFood && (
                        <ScrollView>
                            <View style={styles.imageContainer}>
                                <View style={styles.imageWrapper}>
                                    {editableFoods[selectedFood.id]?.imageURI?.uri || selectedFood.image_url ? (
                                        <Image
                                            source={{ uri: editableFoods[selectedFood.id]?.imageURI?.uri || selectedFood.image_url }}
                                            style={styles.productImage} // Style circulaire
                                        />
                                    ) : (
                                        <View style={styles.noImageContainer}>
                                            <Ionicons name="image" size={40} color={colors.colorText} />
                                        </View>
                                    )}
                                    <TouchableOpacity 
                                        style={styles.editImageButton}
                                        onPress={() => handleClickUpload(selectedFood.id)}
                                    >
                                        <Ionicons name="add" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TextInput
                                style={[styles.input, { color: colors.colorText }]}
                                value={editableFoods[selectedFood.id]?.title || selectedFood.name}
                                onChangeText={(text) => handleInputChange(selectedFood.id, text, 'title')}
                                placeholder="Nom du produit"
                            />
                            
                            <View style={styles.priceInputContainer}>
                                <TextInput
                                    style={[styles.input, { color: colors.colorText, paddingRight: 30 }]}
                                    value={editableFoods[selectedFood.id]?.price?.toString() || selectedFood.price.toString()}
                                    onChangeText={(text) => handleInputChange(selectedFood.id, text, 'price')}
                                    keyboardType="numeric"
                                    placeholder="Prix"
                                />
                                <Text style={styles.euroSymbol}>€</Text>
                            </View>

                            <TextInput
                                style={[styles.input, { color: colors.colorText, height: 100 }]}
                                value={editableFoods[selectedFood.id]?.description || selectedFood.description}
                                onChangeText={(text) => handleInputChange(selectedFood.id, text, 'description')}
                                placeholder="Description du produit"
                                multiline
                                numberOfLines={4}
                            />
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={handlePickerPress}
                                style={pickerSelectStyles.touchableWrapper}
                            >
                                <RNPickerSelect
                                    ref={pickerRef}
                                    onValueChange={(value) => {
                                        handleInputChange(selectedFood.id, value, 'category_id');
                                        setIsPickerFocused(false);
                                    }}
                                    items={getCategoryItems()}
                                    style={pickerSelectStyles}
                                    value={editableFoods[selectedFood.id]?.category_id !== undefined 
                                        ? editableFoods[selectedFood.id]?.category_id 
                                        : selectedFood.category_id}
                                    placeholder={{
                                        label: 'Sélectionnez une catégorie',
                                        value: null,
                                        color: '#9EA0A4',
                                    }}
                                    useNativeAndroidPickerStyle={false}
                                    Icon={() => (
                                        <Ionicons
                                            name="chevron-down"
                                            size={24}
                                            color={colors.colorText}
                                        />
                                    )}
                                    onOpen={() => setIsPickerFocused(true)}
                                    onClose={() => setIsPickerFocused(false)}
                                    doneText="Valider"
                                    fixAndroidTouchableBug={true}
                                />
                            </TouchableOpacity>


                            <View style={styles.switchContainer}>
                                <Text style={[styles.switchLabel, { color: colors.colorText }]}>
                                    {t('productAvailable')}
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.switchButton,
                                        {
                                            backgroundColor: (editableFoods[selectedFood.id]?.is_available ?? selectedFood.is_available)
                                                ? '#4CAF50'
                                                : '#FF4444'
                                        }
                                    ]}
                                    onPress={() => handleInputChange(
                                        selectedFood.id,
                                        !(editableFoods[selectedFood.id]?.is_available ?? selectedFood.is_available),
                                        'is_available'
                                    )}
                                >
                                    <View style={[
                                        styles.switchKnob,
                                        {
                                            transform: [{
                                                translateX: (editableFoods[selectedFood.id]?.is_available ?? selectedFood.is_available)
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
                                    onPress={() => handleDeleteFood(selectedFood.id)}
                                >
                                    <Text style={styles.actionButtonText}>{t('delete')}</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.saveButton]}
                                    onPress={handleUpdateAllFoods}
                                >
                                    <Text style={styles.actionButtonText}>{t('editItems')}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </View>
    );
}

function useStyles(){
    const {width} = useWindowDimensions();
    const {colors} = useColors();

    return StyleSheet.create({
        container: {
            flex: 1,
        },
        productGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingHorizontal: 8,
            gap: 16,
        },
        productCard: {
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
        },
        imageIndicator: {
            position: 'absolute',
            top: 8,
            right: 8,
        },
        productTitle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 8,
        },
        productPrice: {
            fontSize: 14,
            marginBottom: 8,
        },
        categoryBadge: {
            backgroundColor: 'rgba(0,0,0,0.05)',
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: 'flex-start',
        },
        categoryText: {
            fontSize: 12,
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
            maxHeight: '80%',
        },
        bottomSheetHandle: {
            width: 40,
            height: 4,
            backgroundColor: '#DEDEDE',
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 20,
        },
        bottomSheetTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
        },
        input: {
            borderWidth: 1,
            borderColor: '#DEDEDE',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
        },
        uploadButton: {
            backgroundColor: '#DEDEDE',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 16,
        },
        uploadButtonText: {
            fontWeight: '600',
        },
        bottomSheetActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
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
        productImage: {
            width: 120,
            height: 120,
            borderRadius: 60,
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
            color: colors.colorText,
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
        noProductsText: {
            width: '100%',
            textAlign: 'center',
            marginTop: 20,
            fontSize: 16,
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
        
    })
}


export default FormUpdate;