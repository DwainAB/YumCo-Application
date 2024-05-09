import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import { apiService } from "../API/ApiService";
import {launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";


function FormAddProduct() {
    const pickerKey = useRef(0); 
    const { colors } = useColors()
    const { t } = useTranslation();
    const [listCategorie, setListCategorie] = useState([])
    const [nameRestaurant, setNameRestaurant] = useState([])
    const [productData, setProductData] = useState({
        title: "",
        description: "",
        price: "",
        imageURI: null,
        category: "",
    });

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

    const fetchCategorie = async () => {
        try {
            const fetchedCategories = await apiService.getAllCategories(nameRestaurant);
            setListCategorie(fetchedCategories); 
            console.log(fetchedCategories);  
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error.message);
        }
    };
    
    useEffect(() => {
        if (nameRestaurant) {
            fetchCategorie();
        }
    }, [nameRestaurant]);


    //Ajout d'un produit

    const handleSubmit = async () => {

        const jsonData = {
            title: productData.title,
            description: productData.description,
            category: productData.category,
            price: productData.price,
            imageURI: {
              base64: productData.imageURI.base64,
              fileName: productData.imageURI.fileName,
              type: productData.imageURI.mimeType
            }
          };
          
        try {
            const formData = new FormData();
            formData.append('title', productData.title);
            formData.append('ref_restaurant', nameRestaurant);
            formData.append('description', productData.description);
            formData.append('category', productData.category);
            formData.append('price', productData.price);
            formData.append('imageURI', JSON.stringify(jsonData) )

            let data = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: formData
            }
            console.log(formData)

            return fetch('http://192.168.1.8/back-website-restaurant-1/api/foods/add', data)
                    .then(response => response.text()    )
                    .then(json => 
                        console.log('result', json),
                        alert('Plat ajouté avec succès!'),
                        resetForm()
                        )
                    .catch((err)=>{console.error("ERROR", err)})
        } catch (error) {
            console.error(error);
            alert('Une erreur est survenue lors de l\'ajout du plat.');
        }
    };


    const resetForm = () => {
        setProductData({
            title: "",
            description: "",
            price: "",
            imageURI: null,
            category: "",
        });
        pickerKey.current += 1; // Incrémentation de la clé pour forcer le RNPickerSelect à se réinitialiser
    };


    const handlePriceChange = (inputValue) => {
        const convertedValue = inputValue.replace(',', '.');
        const regex = /^[0-9]*\.?[0-9]*$/;
    
        if (regex.test(convertedValue) || convertedValue === '') {
            setProductData({ ...productData, price: convertedValue });
        }
    };
    
    //Upload de l'image
    const handleClickUpload = async() =>{

        const {status} = await requestMediaLibraryPermissionsAsync()

        if(status !== 'granted'){
            alert("accès refusé")
            return
        }

        let options={
            mediaType: 'photo',
            includeBase64: true
        }

        let result  = await launchImageLibraryAsync(options)
        console.log('result',result);
        
        if(result.didCancel ==true){
            console.log('user cancel');
        }else if(result.errorCode && parseInt(result.errorCode)) {
            console.log('upload error');
        }else{
            console.log('upload succès');
            uploadImage(result)
        }
    }


    const uploadImage = async(imageData) =>{
        const { uri } = imageData.assets[0];
        try {
        const base64Image = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        imageData.assets[0].base64 = base64Image
        // Utilisez base64Image comme nécessaire pour télécharger ou traiter l'image
        } catch (error) {
            console.error('Erreur lors de la lecture de l\'image:', error);
        }
        setProductData({...productData, imageURI: imageData.assets[0]});
        console.log(imageData);
    }


    
    return (
        <ScrollView style={styles.containerScrollAddProduct}>
            <View style={styles.containerFormAddProduct}>

                <Text style={[styles.label, {color: colors.colorText}]}>{t('productName')}</Text>
                <TextInput
                    style={[styles.inputAddProduct, {color: colors.colorDetail, borderColor: colors.colorText}]}
                    placeholder={t('productName')}
                    placeholderTextColor="#343434"
                    value={productData.title}
                    onChangeText={(text) => setProductData({ ...productData, title: text })}
                />

                <Text style={[styles.label, {color: colors.colorText}]}>{t('description')}</Text>
                <TextInput
                    style={[styles.inputAddProduct, {color: colors.colorDetail, borderColor: colors.colorText}]}
                    placeholder={t('description')}
                    placeholderTextColor="#343434"
                    value={productData.description}
                    onChangeText={(text) => setProductData({ ...productData, description: text })}
                />

                <Text style={[styles.label, {color: colors.colorText}]}>{t('category')}</Text>
                <View style={styles.containerSelectAddForm}>
                    <RNPickerSelect
                        placeholder={{
                            label: t('selectCategory'),
                            value: null,
                        }}
                        items={Array.isArray(listCategorie) && listCategorie.map(category => ({ label: category.name, value: category.name, key: category.id }))}
                        onValueChange={(value) => setProductData({ ...productData, category: value })}
                        style={{
                            inputIOS: [styles.picker, {color: colors.colorText, borderColor: colors.colorText,placeholder:{color: "#343434"}}],
                            inputAndroid: [styles.picker, {color: colors.colorText, borderColor: colors.colorText,placeholder:{color: "#343434"}}],
                            borderColor: colors.colorText,
                            placeholder: {
                                color: '#343434', // Couleur du placeholder
                            }
                        }}
                        useNativeAndroidPickerStyle={false}
                        Icon={() => {
                            return <Ionicons name="chevron-down" style={{marginRight:40, marginTop:10, fontSize:30, color: colors.colorText}} />;
                        }}
                    />
                </View>

                <Text style={[styles.label, {color: colors.colorText}]}>{t('price')}</Text>
                <TextInput
                    style={[styles.inputAddProduct, {color: colors.colorDetail, borderColor: colors.colorText}]}
                    placeholder={t('price')}
                    placeholderTextColor="#343434"
                    value={productData.price}
                    onChangeText={handlePriceChange}
                    keyboardType="numeric"
                />
                <TouchableOpacity style={[styles.buttonImageAddProduct, {borderColor: colors.colorText}]} onPress={() => handleClickUpload() }><Text style={[styles.textAddImage, {color: colors.colorText}]}>{t('textImage')}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.buttonAddProduct, {backgroundColor: colors.colorAction}]} onPress={handleSubmit}><Text style={[styles.textAddProduct, {color: colors.colorText}]}>{t('add')}</Text></TouchableOpacity>
            
            </View>
        
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    containerScrollAddProduct:{
        height: 500,
    },
    inputAddProduct: {
        borderWidth: 1,
        height: 50,
        borderRadius: 15,
        paddingLeft: 20,
        marginBottom: 20,
        marginLeft: 30,
        marginRight: 30,
    },
    picker: {
        paddingLeft: 20,
        borderWidth: 1,
        height: 50,
        borderRadius: 10,
        marginBottom: 20,
        marginLeft: 30,
        marginRight: 30
    },
    buttonImageAddProduct :{
        borderWidth: 1,
        height: 50,
        borderRadius: 10,
        marginBottom: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 30,
        marginRight: 30,
        marginTop: 20
    },
    textAddImage:{
        color: "#CBCBCB",
        fontWeight: "700",
    },
    buttonAddProduct:{
        backgroundColor:"#0066FF",
        height:50,
        borderRadius:10,
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        marginTop: 30,
        marginLeft: 30,
        marginRight: 30
    },
    textAddProduct:{
        color:"white",
        fontWeight: "700",
    },
    label:{
        color:"#cbcbcb",
        marginLeft: 30,
        marginBottom: 10,
        fontSize : 14
    }
})

export default FormAddProduct;