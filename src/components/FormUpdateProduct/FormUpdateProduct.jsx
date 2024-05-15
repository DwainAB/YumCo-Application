import React, { useState, useEffect, useRef } from "react";
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


function FormUpdate() {
    const { colors } = useColors()
    const [listCategorie, setListCategorie] = useState([])
    const [editableFoods, setEditableFoods] = useState({});
    const [listProduct, setListProduct] = useState([])
    const [nameRestaurant, setNameRestaurant] = useState('')
    const { t } = useTranslation();
    const styles = useStyles()


    //Récupération des catégories
    useEffect(() => {
        async function fetchRefRestaurant() {
            try {
                const user = await AsyncStorage.getItem("user");
                console.log(user);
                const refRestaurant = JSON.parse(user).ref_restaurant;
                setNameRestaurant(refRestaurant);
            } catch (error) {
                console.error('Erreur lors de la récupération de ref_restaurant depuis le stockage:', error);
            }
        }      
        fetchRefRestaurant();
    }, []);

    
    useEffect(() => {
        if (nameRestaurant) {
            fetchCategorie();
            fetchProduct();
        }
    }, [nameRestaurant]);

    const fetchCategorie = async () => {
        try {
            const fetchedCategories = await apiService.getAllCategories(nameRestaurant);
            setListCategorie(fetchedCategories); 
            console.log(fetchedCategories);  
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error.message);
        }
    };

    const fetchProduct = async () => {
        try {
            if (!nameRestaurant) {
                return; 
            }
            const fetchedFoods = await apiService.getFoods(nameRestaurant);
            setListProduct(fetchedFoods); 
            console.log(fetchedFoods);  
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error.message);
        }
    };

    const handleInputChange = (foodId, newValue, name) => {
        setEditableFoods((prev) => ({
          ...prev,
          [foodId]: {
            ...prev[foodId],
            [name]: newValue === '' ? '' : newValue,
          },
        }));
      };
    
      const handleUpdateAllFoods = async (event) => {
        event.preventDefault();
        
        console.log('test', editableFoods);
        for (const foodId in editableFoods) {
            const formData = new FormData();
            const foodData = editableFoods[foodId];
    
            const jsonData = {};
            // Ajouter les données d'image si elles sont définies
            if (foodData.imageURI) {
                jsonData.imageURI = {
                    base64: foodData.imageURI.base64,
                    fileName: foodData.imageURI.fileName,
                    type: foodData.imageURI.mimeType
                };
            }
            // Ajouter les autres données au formulaire
            for (const key in foodData) {
                // Ignorer 'imageURI' car nous l'avons déjà traité ci-dessus
                if (key !== 'imageURI') {
                    formData.append(key, foodData[key]);
                }
            }
    
            // Ajoutez les données de l'image si 'imageURI' est défini pour ce plat
            if (foodData.imageURI) {
                formData.append('imageURI', JSON.stringify(jsonData));
            }
    
            // Journal des données envoyées à chaque itération de la boucle
            console.log(`Données envoyées pour le plat avec l'id ${foodId}:`, formData);
    
            try {
                const response = await apiService.updateFood(foodId, formData);
                console.log('Réponse brute du serveur :', response);
                if (response.success) {
                    console.log('Mise à jour réussie', response.message);
                    alert("Modifications ajoutées avec succès");
                    const updatedFoods = await apiService.getFoods(nameRestaurant);
                    setListProduct(updatedFoods);
                    setEditableFoods([])
                } else {
                    console.error('Erreur lors de la mise à jour', response.message);
                }
            } catch (error) {
                console.error('Erreur lors de l\'envoi à l\'API', error);
                const status = error.message;
                console.error('Statut de l\'erreur :', status);
                if (error.response) {
                    const textResponse = await error.response.text();
                    console.error('Contenu de la réponse :', textResponse);
                }
            }
        }
    
        setEditableFoods({});
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
        console.log('result', result);
    
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
            imageData.assets[0].base64 = base64Image;
            setEditableFoods(prev => ({
                ...prev,
                [foodId]: {
                    ...prev[foodId],
                    imageURI: imageData.assets[0]
                }
            }));
        } catch (error) {
            console.error('Erreur lors de la lecture de l\'image:', error);
        }
    };
    


    const handleDeleteFood = async (foodId) => {
        try {
          const response = await apiService.deleteFood(foodId);
      
          ConfirmDialog({
            title: 'Confirmation de suppression',
            message: 'Voulez-vous vraiment supprimer ce produit ?',
            onConfirm: async () => {


              if (response.success) {
                console.log('Suppression réussie');
                const updatedFoods = await apiService.getFoods(nameRestaurant);
                setListProduct(updatedFoods);
                alert('Suppression réussie');
              } else {
                console.error('Erreur lors de la suppression:', response);
              } 

              
            },
            onCancel: () => {
              console.log('Suppression annulée');
            }
          });
        } catch (error) {
          // Gérer les erreurs
          console.error('Erreur lors de la suppression:', error.message);
        }
      };
    
    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.containerFormProduct}>
                <ScrollView horizontal={true}  style={styles.containerScroll}>

                <View style={styles.listProduct}>
                    {Array.isArray(listProduct) && listProduct.map((food) => (
                    <View style={styles.productInfo} key={food.id}>

                        <TextInput
                        style={[styles.input, {color: colors.colorText, borderColor: colors.colorText}]}
                        placeholder={food.title}
                        value={editableFoods[food.id]?.title !== undefined ? editableFoods[food.id]?.title : food.title}
                        onChangeText={(newValue) => handleInputChange(food.id, newValue, 'title')}
                        />
                        <TextInput
                        style={[styles.input, {color: colors.colorText, borderColor: colors.colorText}]}
                        placeholder="description du plat"
                        value={editableFoods[food.id]?.description !== undefined ? editableFoods[food.id]?.description : food.description}
                        onChangeText={(newValue) => handleInputChange(food.id, newValue, 'description')}
                        />
                        <TextInput
                        style={[styles.input, {color: colors.colorText, borderColor: colors.colorText}]}
                        placeholder="prix du plat"
                        value={editableFoods[food.id]?.price !== undefined ? editableFoods[food.id]?.price : food.price}
                        onChangeText={(newValue) => handleInputChange(food.id, newValue, 'price')}
                        keyboardType="numeric"
                        />

                        <RNPickerSelect
                            placeholder={{
                                label:t('selectCategory'),
                                value: null,
                            }}
                            value={editableFoods[food.id]?.category !== undefined ? editableFoods[food.id]?.category : food.category}
                            items={Array.isArray(listCategorie) && listCategorie.map(category => ({ label: category.name, value: category.name, key: category.id }))}
                            onValueChange={(value) => handleInputChange(food.id, value, 'category')}
                            style={{
                                inputIOS: [styles.input, {color: colors.colorText, borderColor: colors.colorText}],
                                inputAndroid: [styles.input, {color: colors.colorText, borderColor: colors.colorText}],
                                borderColor: colors.colorText
                            }}
                            useNativeAndroidPickerStyle={false}
                            Icon={() => {
                                return <Ionicons name="chevron-down" style={[styles.iconInput ,{marginRight:20, fontSize:30, color: colors.colorText}]} />;
                            }}
                        />

                        <TouchableOpacity style={[styles.fileUploadButton, {borderColor: colors.colorText}]} onPress={() => handleClickUpload(food.id)}>
                            <Text style={[styles.textUpdateImage, { color: colors.colorText }]}>{t('changeImage')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.deleteButton, {backgroundColor: colors.colorRed}]} onPress={() => { handleDeleteFood(food.id)}}>
                        <Text style={[styles.textButtonDelete, {color: colors.colorText}]}>{t('delete')}</Text>
                        </TouchableOpacity>
                    </View>
                    ))}
                </View>

                </ScrollView>
                <TouchableOpacity onPress={handleUpdateAllFoods} style={[styles.containerbtnUpdate, {backgroundColor: colors.colorAction}]}><Text style={[styles.textButtonUpdate, {color: colors.colorText}]}>{t('editItems')}</Text></TouchableOpacity>
            </View>
        </ScrollView>
      </View>
    )
}

function useStyles(){
    const {width, height} = useWindowDimensions();

    return StyleSheet.create({
        container:{
            marginLeft: 30,
            marginRight: 30,
            justifyContent: "center",
        },
        listProduct:{
            flexDirection: "row",
            gap: 100
        },
        productInfo:{
            justifyContent: "center",
            alignItems: "center", 
            width: 300
        },
        input: {
            borderWidth: 1,
            height: (width > 375) ? 50 : 40,
            borderRadius: 15,
            paddingLeft: 20,
            marginBottom: 20,
            width: 250
        },
        fileUploadButton:{
            borderWidth: 1,
            height: (width > 375) ? 50 : 40,
            borderRadius: 15,
            marginBottom: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 250
        },
        deleteButton:{
            height: (width > 375) ? 50 : 40,
            borderRadius: 15,
            marginBottom: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 250, 
        },
        textButtonDelete:{
            fontWeight: "500"
        },
        containerbtnUpdate:{
            height: (width > 375) ? 50 : 40,
            borderRadius: 15,
            marginBottom: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%", 
            marginTop: (width > 375) ? 30 : 15
        }, 
        textButtonUpdate:{
            fontWeight: "500"
        },
        iconInput:{
            marginTop: (width > 375) ? 10 : 5
        },
        containerFormProduct:{
            marginBottom: 200
        }
    })
}


export default FormUpdate;