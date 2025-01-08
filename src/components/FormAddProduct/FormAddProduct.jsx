import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import {launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from "react-native-vector-icons/Ionicons";
import * as FileSystem from 'expo-file-system';
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { supabase } from '../../lib/supabase'; 
import { decode } from "base64-arraybuffer";
import AsyncStorage from "@react-native-async-storage/async-storage";

function FormAddProduct() {
    const pickerKey = useRef(0); 
    const { colors } = useColors()
    const { t } = useTranslation();
    const styles = useStyles()
    const [listCategorie, setListCategorie] = useState([])
    const [restaurantId, setRestaurantId]= useState('');
    const [productData, setProductData] = useState({
        title: "",
        description: "",
        price: "",
        imageURI: null,
        category: "",
        is_available: true,
        is_deleted: false,
    });

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
    
    
    const fetchCategories = async () => {
        if(!restaurantId){
            return
        }
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('restaurant_id', restaurantId);
            
            if (error) {
                throw error;
            }

            setListCategorie(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error.message);
        }
    };
    
    useEffect(() => {
        fetchCategories();
    }, [restaurantId]);

    const handleSubmit = async () => {
        try {
            // 1. Upload de l'image vers Supabase Storage
            let imageUrl = null;
            if (productData.imageURI?.base64) {
                const fileName = `${Date.now()}-${productData.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
                
                // Convertir la base64 en ArrayBuffer
                const arrayBuffer = decode(productData.imageURI.base64);
    
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(fileName, arrayBuffer, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });
    
                if (uploadError) throw uploadError;
    
                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName);
    
                imageUrl = publicUrl;
            }
    
            // 2. Insertion du produit dans la base de données
            const { data, error } = await supabase
                .from('products')
                .insert([{
                    name: productData.title,
                    description: productData.description,
                    price: parseFloat(productData.price),
                    image_url: imageUrl,
                    category_id: productData.category,
                    restaurant_id: restaurantId,
                    is_available: productData.is_available,
                    is_deleted: productData.is_deleted
                }])
                .select();
    
            if (error) throw error;
    
            alert('Produit ajouté avec succès!');
            resetForm();
        } catch (error) {
            console.error("Erreur lors de l'ajout du produit:", error);
            alert("Une erreur est survenue lors de l'ajout du produit.");
        }
    };
    

    const resetForm = () => {
        setProductData({
            title: "",
            description: "",
            price: "",
            imageURI: null,
            category: "",
            is_available: true,
            is_deleted: false,
        });
        pickerKey.current += 1;
    };

    const handlePriceChange = (inputValue) => {
        const convertedValue = inputValue.replace(',', '.');
        const regex = /^[0-9]*\.?[0-9]*$/;
    
        if (regex.test(convertedValue) || convertedValue === '') {
            setProductData({ ...productData, price: convertedValue });
        }
    };
    
    //Upload de l'image
    const handleClickUpload = async() => {
        const { status } = await requestMediaLibraryPermissionsAsync();

        if(status !== 'granted'){
            alert("Accès refusé");
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
            setProductData({...productData, imageURI: imageData.assets[0]});
        } catch (error) {
            console.error('Erreur lors de la lecture de l\'image:', error);
        }
    };
    
    return (
        <ScrollView style={styles.containerScrollAddProduct}>
            <View style={styles.containerFormAddProduct}>
                <View style={styles.imagePickerContainer}>
                    <View style={styles.imageContainer}>
                        {productData.imageURI ? (
                            <Image
                                source={{ uri: productData.imageURI.uri }}
                                style={styles.previewImage}
                            />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons name="image-outline" size={40} color={colors.colorText} />
                            </View>
                        )}
                        <TouchableOpacity 
                            style={[styles.addImageButton, {backgroundColor: colors.colorAction}]}
                            onPress={handleClickUpload}
                        >
                            <Ionicons name="add" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

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
                        items={listCategorie.map(category => ({
                            label: category.name,
                            value: category.id,
                            key: category.id
                        }))}
                        onValueChange={(value) => setProductData({ ...productData, category: value })}
                        style={{
                            inputIOS: [styles.picker, {color: colors.colorText, borderColor: colors.colorText}],
                            inputAndroid: [styles.picker, {color: colors.colorText, borderColor: colors.colorText}],
                            placeholder: {
                                color: '#343434',
                            }
                        }}
                        useNativeAndroidPickerStyle={false}
                        Icon={() => {
                            return <Ionicons name="chevron-down" style={[styles.iconInput, {marginRight:40, fontSize:30, color: colors.colorText}]} />;
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

                <TouchableOpacity 
                    style={[styles.buttonAddProduct, {backgroundColor: colors.colorAction}]} 
                    onPress={handleSubmit}
                >
                    <Text style={[styles.textAddProduct, {color: colors.colorText}]}>{t('add')}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// Les styles restent identiques à votre code original
function useStyles(){
    const {width} = useWindowDimensions();

    return StyleSheet.create({
        containerScrollAddProduct:{
            height: 500,
        },
        inputAddProduct: {
            borderWidth: 1,
            height: (width > 375) ? 50 : 40,
            borderRadius: 15,
            paddingLeft: 20,
            marginBottom: 20,
            marginLeft: 30,
            marginRight: 30,
        },
        picker: {
            paddingLeft: 20,
            borderWidth: 1,
            height: (width > 375) ? 50 : 40,
            borderRadius: 10,
            marginBottom: 20,
            marginLeft: 30,
            marginRight: 30
        },
        buttonImageAddProduct :{
            borderWidth: 1,
            height: (width > 375) ? 50 : 40,
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
            height:(width > 375) ? 50 : 40,
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
        },
        containerFormAddProduct:{
            marginBottom: 80
        },
        iconInput: {
            marginTop: (width > 375) ? 10 : 5,
        },
        imagePickerContainer: {
            alignItems: 'center',
            marginVertical: 20,
        },
        imageContainer: {
            position: 'relative',
            width: 150,
            height: 150,
        },
        previewImage: {
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: '#f0f0f0',
        },
        placeholderImage: {
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: '#f0f0f0',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ccc',
            borderStyle: 'dashed',
        },
        addImageButton: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#0066FF',
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
    });
}

export default FormAddProduct;