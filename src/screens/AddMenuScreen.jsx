import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Alert,
  Animated,
  ActivityIndicator,   
  Modal,
  Switch
} from "react-native";
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import Ionicons from "react-native-vector-icons/Ionicons";
import * as FileSystem from 'expo-file-system';
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { supabase } from '../lib/supabase';
import { decode } from "base64-arraybuffer";
import { useRestaurantId } from '../hooks/useRestaurantId';
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";

function FormAddMenu() {
  const { colors } = useColors();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const styles = useStyles(colors, width);
  const { restaurantId } = useRestaurantId();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [menuData, setMenuData] = useState({
    name: "",
    description: "",
    price: "",
    imageURI: null,
    is_active: true,
    available_online: false, 
    available_onsite: false, 
    categories: []
  });

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, []);

  // Gérer le changement de prix
  const handlePriceChange = (inputValue) => {
    const convertedValue = inputValue.replace(',', '.');
    const regex = /^[0-9]*\.?[0-9]*$/;

    if (regex.test(convertedValue) || convertedValue === '') {
      setMenuData({ ...menuData, price: convertedValue });
    }
  };

  // Ajout d'une nouvelle catégorie
  const addCategory = () => {
    setMenuData({
      ...menuData,
      categories: [
        ...menuData.categories,
        {
          name: "",
          max_options: "1",
          is_required: true,
          display_order: menuData.categories.length,
          options: []
        }
      ]
    });
  };

  const toggleAvailableOnline = () => {
    setMenuData({ ...menuData, available_online: !menuData.available_online });
  };
  
  const toggleAvailableOnsite = () => {
    setMenuData({ ...menuData, available_onsite: !menuData.available_onsite });
  };

  // Suppression d'une catégorie
  const removeCategory = (categoryIndex) => {
    const updatedCategories = [...menuData.categories];
    updatedCategories.splice(categoryIndex, 1);
    setMenuData({ ...menuData, categories: updatedCategories });
  };

  // Mise à jour des données d'une catégorie
  const updateCategory = (index, field, value) => {
    const updatedCategories = [...menuData.categories];
    updatedCategories[index][field] = value;
    setMenuData({ ...menuData, categories: updatedCategories });
  };

  // Ajout d'une option à une catégorie
  const addOption = (categoryIndex) => {
    const updatedCategories = [...menuData.categories];
    updatedCategories[categoryIndex].options.push({
      name: "",
      additional_price: "0"
    });
    setMenuData({ ...menuData, categories: updatedCategories });
  };

  // Suppression d'une option
  const removeOption = (categoryIndex, optionIndex) => {
    const updatedCategories = [...menuData.categories];
    updatedCategories[categoryIndex].options.splice(optionIndex, 1);
    setMenuData({ ...menuData, categories: updatedCategories });
  };

  // Mise à jour des données d'une option
  const updateOption = (categoryIndex, optionIndex, field, value) => {
    const updatedCategories = [...menuData.categories];
    updatedCategories[categoryIndex].options[optionIndex][field] = value;
    setMenuData({ ...menuData, categories: updatedCategories });
  };

  // Gestion de l'upload d'image
  const handleClickUpload = async() => {
    const { status } = await requestMediaLibraryPermissionsAsync();

    if(status !== 'granted'){
      Alert.alert("Permission refusée", "Nous avons besoin d'accéder à votre galerie pour importer des images.");
      return;
    }

    let options = {
      mediaType: 'photo',
      includeBase64: true
    };

    let result = await launchImageLibraryAsync(options);
    
    if(!result.canceled) {
      uploadImage(result);
    }
  };

  const uploadImage = async(imageData) => {
    const { uri } = imageData.assets[0];
    try {
      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      imageData.assets[0].base64 = base64Image;
      setMenuData({...menuData, imageURI: imageData.assets[0]});
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'image:', error);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    // Validation du formulaire
    if (!menuData.name.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom pour le menu");
      return;
    }

    if (!menuData.price || isNaN(parseFloat(menuData.price))) {
      Alert.alert("Erreur", "Veuillez entrer un prix valide");
      return;
    }

    if (menuData.categories.length === 0) {
      Alert.alert("Erreur", "Veuillez ajouter au moins une catégorie");
      return;
    }

    // Validation des catégories et options
    for (let i = 0; i < menuData.categories.length; i++) {
      const category = menuData.categories[i];
      
      if (!category.name.trim()) {
        Alert.alert("Erreur", `Veuillez entrer un nom pour la catégorie ${i+1}`);
        return;
      }

      if (!category.max_options || parseInt(category.max_options) < 1) {
        Alert.alert("Erreur", `Veuillez entrer un nombre maximum d'options valide pour la catégorie ${i+1}`);
        return;
      }

      if (category.options.length === 0) {
        Alert.alert("Erreur", `Veuillez ajouter au moins une option à la catégorie ${category.name}`);
        return;
      }

      for (let j = 0; j < category.options.length; j++) {
        const option = category.options[j];
        
        if (!option.name.trim()) {
          Alert.alert("Erreur", `Veuillez entrer un nom pour l'option ${j+1} de la catégorie ${category.name}`);
          return;
        }
      }
    }
    setIsLoading(true);

    try {
      // 1. Upload de l'image vers Supabase Storage
      let imageUrl = null;
      if (menuData.imageURI?.base64) {
        const fileName = `menu-${Date.now()}-${Math.random().toString(36).substring(2, 10)}.jpg`;
        
        // Convertir la base64 en ArrayBuffer
        const arrayBuffer = decode(menuData.imageURI.base64);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('menus')
          .upload(fileName, arrayBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('menus')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // 2. Insertion du menu dans la base de données
      const { data: menuInsertData, error: menuError } = await supabase
        .from('menus')
        .insert([{
          restaurant_id: restaurantId,
          name: menuData.name,
          description: menuData.description,
          price: parseFloat(menuData.price),
          image_url: imageUrl,
          is_active: menuData.is_active,
          available_online: menuData.available_online,
          available_onsite: menuData.available_onsite,
        }])
        .select();

      if (menuError) throw menuError;

      const menuId = menuInsertData[0].id;

      // 3. Insertion des catégories
      for (let i = 0; i < menuData.categories.length; i++) {
        const category = menuData.categories[i];
        const { data: categoryData, error: categoryError } = await supabase
          .from('menu_categories')
          .insert([{
            menu_id: menuId,
            name: category.name,
            max_options: parseInt(category.max_options),
            is_required: category.is_required,
            display_order: i
          }])
          .select();
      
        if (categoryError) throw categoryError;
        const categoryId = categoryData[0].id;

        // 4. Insertion des options pour chaque catégorie
        for (let j = 0; j < category.options.length; j++) {
            const option = category.options[j];
            const { error: optionError } = await supabase
              .from('menu_options')
              .insert([{
                category_id: categoryId,
                name: option.name,
                additional_price: parseFloat(option.additional_price) || 0,
                display_order: j
              }]);
          
            if (optionError) throw optionError;
          }
      }
      setIsLoading(false);
      Alert.alert("Succès", "Menu ajouté avec succès!");
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'ajout du menu:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'ajout du menu.");
    }
  };

  const LoadingModal = () => (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isLoading}
      onRequestClose={() => {}}
    >
      <View style={styles.modalBackground}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.colorAction} />
          <Text style={styles.loadingText}>{t('adding_menu_in_progress')}</Text>
        </View>
      </View>
    </Modal>
  );

  // Réinitialisation du formulaire
  const resetForm = () => {
    setMenuData({
      name: "",
      description: "",
      price: "",
      imageURI: null,
      is_active: true,
      available_online: false,
      available_onsite: false,
      categories: []
    });
  };

  return (
    <View style={{backgroundColor: colors.colorBackground, flex: 1}}>
      <HeaderSetting name={t('Menu')} navigateTo="CardOptionScreen"/>
      <ScrollView style={styles.containerScrollAddMenu}>
        <Animated.View style={[styles.containerFormAddMenu, {opacity: fadeAnim}]}>
          {/* Section principale */}
          <View style={styles.mainSection}>
            {/* Section image */}
            <View style={styles.imagePickerContainer}>
              <View style={styles.imageContainer}>
                {menuData.imageURI ? (
                  <Image
                    source={{ uri: menuData.imageURI.uri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="restaurant-outline" size={50} color={colors.colorAction} />
                    <Text style={[styles.uploadText, {color: colors.colorText}]}>{t('add_image')}</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={[styles.addImageButton, {backgroundColor: colors.colorAction}]}
                  onPress={handleClickUpload}
                >
                  <Ionicons name="camera" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Informations de base du menu */}
            <View style={[styles.formSection, {backgroundColor: colors.colorBorderAndBlock}]}>
              <Text style={[styles.sectionHeader, {color: colors.colorText}]}>{t('menu_details')}</Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, {color: colors.colorText}]}>{t('menu_name')}</Text>
                <TextInput
                  style={[styles.input, {color: colors.colorText, borderColor: colors.colorText}]}
                  placeholder={t('menu_name')}
                  placeholderTextColor="#777"
                  value={menuData.name}
                  onChangeText={(text) => setMenuData({ ...menuData, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, {color: colors.colorText}]}>{t('description')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea, {color: colors.colorText, borderColor: colors.colorText}]}
                  placeholder={t('description')}
                  placeholderTextColor="#777"
                  value={menuData.description}
                  onChangeText={(text) => setMenuData({ ...menuData, description: text })}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, {color: colors.colorText}]}>{t('price')}</Text>
                <View style={styles.priceInputContainer}>
                  <TextInput
                    style={[styles.input, {color: colors.colorText, borderColor: colors.colorText}]}
                    placeholder="0.00"
                    placeholderTextColor="#777"
                    value={menuData.price}
                    onChangeText={handlePriceChange}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.priceSuffix, {color: colors.colorText}]}>€</Text>
                </View>
              </View>
              
              {/* Section disponibilité */}
              <View style={styles.availabilitySection}>
                <Text style={[styles.subSectionHeader, {color: colors.colorText}]}>{t('availability')}</Text>
                
                {/* Toggle pour disponible en ligne */}
                <View style={styles.switchContainer}>
                  <Text style={[styles.switchLabel, {color: colors.colorText}]}>{t('show_online')}</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: colors.colorAction }}
                    thumbColor={menuData.available_online ? "#ffffff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleAvailableOnline}
                    value={menuData.available_online}
                  />
                </View>
                
                {/* Toggle pour disponible sur place */}
                <View style={styles.switchContainer}>
                  <Text style={[styles.switchLabel, {color: colors.colorText}]}>{t('show_on_site')}</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: colors.colorAction }}
                    thumbColor={menuData.available_onsite ? "#ffffff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleAvailableOnsite}
                    value={menuData.available_onsite}
                  />
                </View>
                
                {/* Toggle pour disponibilité générale */}
                <View style={styles.switchContainer}>
                  <Text style={[styles.switchLabel, {color: colors.colorText}]}>{t('is_available')}</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: colors.colorAction }}
                    thumbColor={menuData.is_active ? "#ffffff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(value) => setMenuData({ ...menuData, is_active: value })}
                    value={menuData.is_active}
                  />
                </View>
              </View>
            </View>

            {/* Section des catégories */}
            <View style={styles.categoriesSection}>
              <View style={styles.sectionHeaderContainer}>
                <Text style={[styles.sectionHeader, {color: colors.colorText}]}>{t('categories')}</Text>
              </View>

              {menuData.categories.length === 0 ? (
                <View style={[styles.emptyContainer, {backgroundColor: colors.colorBorderAndBlock}]}>
                  <Ionicons name="list-outline" size={40} color={colors.colorAction} />
                  <Text style={[styles.emptyText, {color: colors.colorText}]}>{t('no_category_selected')}</Text>
                  <Text style={styles.emptySubtext}>{t('description')}</Text>
                  
                  <TouchableOpacity 
                    style={[styles.addButton, styles.emptyAddButton, {backgroundColor: colors.colorAction}]}
                    onPress={addCategory}
                  >
                    <Ionicons name="add-circle" size={20} color="white" />
                    <Text style={styles.addButtonText}>{t('add_category')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                menuData.categories.map((category, categoryIndex) => (
                  <View key={categoryIndex} style={[styles.categoryCard, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <View style={styles.categoryHeader}>
                      <Text style={[styles.categoryTitle, {color: colors.colorText}]}>
                        {t('category')} {categoryIndex + 1}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => removeCategory(categoryIndex)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.colorAction} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, {color: colors.colorText}]}>{t('category_name')}</Text>
                      <TextInput
                        style={[styles.categoryInput, {color: colors.colorText, borderColor: colors.colorText}]}
                        placeholder={t('category_name')}
                        placeholderTextColor="#777"
                        value={category.name}
                        onChangeText={(text) => updateCategory(categoryIndex, 'name', text)}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, {color: colors.colorText}]}>{t('max_option')}</Text>
                      <TextInput
                        style={[styles.categoryInput, {color: colors.colorText, borderColor: colors.colorText}]}
                        placeholder="1"
                        placeholderTextColor="#777"
                        value={category.max_options}
                        onChangeText={(text) => {
                          if (/^\d*$/.test(text)) {
                            updateCategory(categoryIndex, 'max_options', text)
                          }
                        }}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.checkboxContainer}>
                      <TouchableOpacity
                        style={[
                          styles.checkbox, 
                          {borderColor: colors.colorAction},
                          category.is_required ? {backgroundColor: colors.colorAction} : {}
                        ]}
                        onPress={() => updateCategory(categoryIndex, 'is_required', !category.is_required)}
                      >
                        {category.is_required && <Ionicons name="checkmark" size={16} color="white" />}
                      </TouchableOpacity>
                      <Text style={[styles.checkboxLabel, {color: colors.colorText}]}>{t('category_required')}</Text>
                    </View>

                    {/* Options de la catégorie */}
                    <View style={[styles.optionsSection, {backgroundColor: colors.colorBackground}]}>
                      <View style={styles.optionsHeader}>
                        <Text style={[styles.optionsTitle, {color: colors.colorText}]}>{t('options')}</Text>
                      </View>

                      {category.options.length === 0 ? (
                        <View style={[styles.emptyOptionsContainer, {backgroundColor: colors.colorBorderAndBlock, borderColor: colors.colorText}]}>
                          <Text style={[styles.emptyOptionsText, {color: colors.colorText}]}>{t('no_option_selected')}</Text>
                          <TouchableOpacity 
                            style={[styles.addOptionButton, styles.emptyAddOptionButton, {backgroundColor: colors.colorAction}]}
                            onPress={() => addOption(categoryIndex)}
                          >
                            <Ionicons name="add" size={18} color="white" />
                            <Text style={styles.addButtonText}>{t('add_option')}</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        category.options.map((option, optionIndex) => (
                          <View key={optionIndex} style={[styles.optionCard, {backgroundColor: colors.colorBorderAndBlock}]}>
                            <View style={styles.optionHeader}>
                              <Text style={[styles.optionTitle, {color: colors.colorText}]}>
                                {t('option')} {optionIndex + 1}
                              </Text>
                              <TouchableOpacity 
                                onPress={() => removeOption(categoryIndex, optionIndex)}
                                style={styles.removeOptionButton}
                              >
                                <Ionicons name="close-circle" size={20} color={colors.colorAction} />
                              </TouchableOpacity>
                            </View>

                            <View style={styles.optionInputGroup}>
                              <Text style={[styles.optionLabel, {color: colors.colorText}]}>{t('option_name')}</Text>
                              <TextInput
                                style={[styles.optionInput, {color: colors.colorText, borderColor: colors.colorText}]}
                                placeholder={t('optien_name')}
                                placeholderTextColor="#777"
                                value={option.name}
                                onChangeText={(text) => updateOption(categoryIndex, optionIndex, 'name', text)}
                              />
                            </View>

                            <View style={styles.optionInputGroup}>
                              <Text style={[styles.optionLabel, {color: colors.colorText}]}>{t('extra_price')}</Text>
                              <View style={styles.optionPriceContainer}>
                                <TextInput
                                  style={[styles.optionInput, {color: colors.colorText, borderColor: colors.colorText}]}
                                  placeholder="0.00"
                                  placeholderTextColor="#777"
                                  value={option.additional_price}
                                  onChangeText={(text) => {
                                    const convertedValue = text.replace(',', '.');
                                    const regex = /^[0-9]*\.?[0-9]*$/;
                                    
                                    if (regex.test(convertedValue) || convertedValue === '') {
                                      updateOption(categoryIndex, optionIndex, 'additional_price', convertedValue);
                                    }
                                  }}
                                  keyboardType="numeric"
                                />
                                <Text style={[styles.optionPriceSuffix, {color: colors.colorText}]}>€</Text>
                              </View>
                              <Text style={[styles.priceHint, {color: colors.colorText}]}>0 = {t('included_in_menu')}</Text>
                            </View>
                          </View>
                        ))
                      )}
                      
                      {/* Bouton d'ajout d'option en bas */}
                      {category.options.length > 0 && (
                        <TouchableOpacity 
                          style={[styles.addOptionButton, styles.bottomAddButton, {backgroundColor: colors.colorAction}]}
                          onPress={() => addOption(categoryIndex)}
                        >
                          <Ionicons name="add" size={18} color="white" />
                          <Text style={styles.addButtonText}>{t('add_option')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}
              
              {/* Bouton d'ajout de catégorie en bas */}
              {menuData.categories.length > 0 && (
                <TouchableOpacity 
                  style={[styles.addButton, styles.bottomAddCategoryButton, {backgroundColor: colors.colorAction}]}
                  onPress={addCategory}
                >
                  <Ionicons name="add-circle" size={20} color="white" />
                  <Text style={styles.addButtonText}>{t('add_category')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Bouton de soumission */}
            <TouchableOpacity 
              style={[styles.submitButton, {backgroundColor: colors.colorAction}]} 
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>{t('add_menu')}</Text>
              <Ionicons name="checkmark-circle" size={20} color="white" style={styles.submitIcon} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      <LoadingModal />
    </View>
  );
}

function useStyles(colors, width) {
  return StyleSheet.create({
    containerScrollAddMenu: {
      flex: 1,
    },
    containerFormAddMenu: {
      paddingBottom: 80,
    },
    mainSection: {
      marginHorizontal: 16,
      marginTop: 10,
    },
    imagePickerContainer: {
      alignItems: 'center',
      marginVertical: 25,
    },
    imageContainer: {
      position: 'relative',
      width: 160,
      height: 160,
    },
    previewImage: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.colorBackground,
      borderWidth: 3,
      borderColor: colors.colorAction,
    },
    placeholderImage: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.colorBackground,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.colorText,
      borderStyle: 'dashed',
    },
    uploadText: {
      color: colors.colorText,
      marginTop: 8,
      fontSize: 12,
      textAlign: 'center',
      width: '80%',
    },
    addImageButton: {
      position: 'absolute',
      bottom: 5,
      right: 5,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.colorAction,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    formSection: {
      backgroundColor: colors.colorBorderAndBlock,
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.colorText,
      marginBottom: 20,
    },
    subSectionHeader: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.colorText,
      marginBottom: 15,
    },
    sectionHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      paddingHorizontal: 5,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.colorText,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.colorText,
      height: (width > 375) ? 50 : 45,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 15,
      color: colors.colorText,
      backgroundColor: colors.colorBackground,
    },
    textArea: {
      height: 100,
      paddingTop: 12,
      paddingBottom: 12,
      textAlignVertical: 'top',
    },
    priceInputContainer: {
      position: 'relative',
    },
    priceSuffix: {
      position: 'absolute',
      right: 18,
      top: (width > 375) ? 14 : 12,
      fontSize: 16,
      color: colors.colorText,
      fontWeight: '500',
    },
    availabilitySection: {
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.colorText,
      paddingTop: 15,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      paddingHorizontal: 5,
    },
    switchLabel: {
      fontSize: 15,
      color: colors.colorText,
      fontWeight: '500',
    },
    categoriesSection: {
      marginBottom: 30,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.colorAction,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 25,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    addButtonText: {
      color: 'white',
      marginLeft: 5,
      fontSize: 13,
      fontWeight: '600',
    },
    emptyContainer: {
      backgroundColor: colors.colorBorderAndBlock,
      borderRadius: 15,
      padding: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.colorText,
      marginTop: 10,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.colorDetail || '#888',
      textAlign: 'center',
    },
    categoryCard: {
      backgroundColor: colors.colorBorderAndBlock,
      borderRadius: 15,
      padding: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.colorText,
      paddingBottom: 10,
    },
    categoryTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.colorText,
    },
    removeButton: {
      padding: 5,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.colorText,
      marginBottom: 8,
    },
    categoryInput: {
      borderWidth: 1,
      borderColor: colors.colorText,
      height: 45,
      borderRadius: 10,
      paddingHorizontal: 15,
      color: colors.colorText,
      backgroundColor: colors.colorBackground,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 5,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderWidth: 2,
      borderColor: colors.colorAction,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    checkboxLabel: {
      fontSize: 14,
      color: colors.colorText,
    },
    optionsSection: {
      marginTop: 5,
      backgroundColor: colors.colorBackground,
      borderRadius: 12,
      padding: 15,
    },
    optionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    optionsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.colorText,
    },
    addOptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.colorAction,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    emptyOptionsContainer: {
      backgroundColor: colors.colorBorderAndBlock,
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.colorText,
      borderStyle: 'dashed',
    },
    emptyOptionsText: {
      fontSize: 14,
      color: colors.colorText,
      marginBottom: 15,
    },
    emptyAddButton: {
      marginTop: 20,
    },
    emptyAddOptionButton: {
      marginTop: 5,
    },
    bottomAddButton: {
      alignSelf: 'center',
      marginTop: 15,
    },
    bottomAddCategoryButton: {
      alignSelf: 'center',
      marginTop: 5,
      marginBottom: 15,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    optionCard: {
      backgroundColor: colors.colorBorderAndBlock,
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    optionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    optionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.colorText,
    },
    removeOptionButton: {
      padding: 3,
    },
    optionInputGroup: {
      marginBottom: 12,
    },
    optionLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.colorText,
      marginBottom: 6,
    },
    optionInput: {
      borderWidth: 1,
      borderColor: colors.colorText,
      height: 40,
      borderRadius: 8,
      paddingHorizontal: 12,
      color: colors.colorText,
      backgroundColor: colors.colorBackground,
    },
    optionPriceContainer: {
      position: 'relative',
    },
    optionPriceSuffix: {
      position: 'absolute',
      right: 14,
      top: 10,
      fontSize: 15,
      color: colors.colorText,
    },
    priceHint: {
      fontSize: 12,
      color: colors.colorDetail || '#777',
      marginTop: 4,
    },
    submitButton: {
      flexDirection: 'row',
      backgroundColor: colors.colorAction,
      height: 55,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    submitButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 17,
    },
    submitIcon: {
      marginLeft: 10,
    },
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      backgroundColor: colors.colorBackground,
      padding: 25,
      borderRadius: 15,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    loadingText: {
      marginTop: 15,
      fontSize: 16,
      color: colors.colorText,
      fontWeight: '500',
    },
    placeholderColor: '#aaa',
    dangerColor: '#ff4d4f'
  });
}

export default FormAddMenu