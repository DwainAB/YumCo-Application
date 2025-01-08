import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "../components/ColorContext/ColorContext";
import { apiService } from "../components/API/ApiService";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import { supabase } from '../lib/supabase'; 

function CategoriesScreen() {
    const [restaurantId, setRestaurantId]= useState('')
    const { colors } = useColors();
    const { t } = useTranslation();
    const styles = useStyles();
    const [listCategories, setListCategories] = useState([]);
    const [categories, setCategories] = useState({
        name: '',
        restaurant_id: restaurantId
    });

    useEffect(() => {
        fetchCategories();
    }, [restaurantId]);

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

    const handleNewCategoriesInputChange = (name, value) => {
        setCategories(prevState => ({ ...prevState, [name]: value }));
    };

    const handleAddNewCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([
                    {
                        name: categories.name,
                        restaurant_id: restaurantId
                    }
                ]);

            if (error) throw error;

            setCategories({ name: '', restaurant_id: restaurantId });
            fetchCategories();
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la catégorie:', error.message);
        }
    };

    const fetchCategories = async () => {
        if(!restaurantId){
            return
        }
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('restaurant_id', restaurantId);

            if (error) throw error;
            setListCategories(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error.message);
        }
    };

    const handleDeleteCategorie = async (categorieId) => {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', categorieId);

            if (error) throw error;
            fetchCategories();
            alert('Catégorie supprimée');
        } catch (error) {
            console.error('Erreur lors de la suppression:', error.message);
        }
    };

    return (
        <View style={[styles.containerCardPage, { backgroundColor: colors.colorBackground }]}>
            <HeaderSetting name={t('category')} navigateTo="CardOptionScreen" />
            <Text style={[styles.titleCard, { color: colors.colorDetail }]}>{t('addCategory')}</Text>
            <View style={styles.containerAddCategories}>
                <TextInput
                    style={[styles.categoriesInput, { borderColor: colors.colorText, color: colors.colorText }]}
                    placeholder={t('category')}
                    placeholderTextColor="#343434"
                    value={categories.name}
                    onChangeText={(value) => handleNewCategoriesInputChange('name', value)}
                />
                <TouchableOpacity onPress={handleAddNewCategories} style={[styles.containerBtnAddCategories, { backgroundColor: colors.colorAction }]}>
                    <Ionicons name="checkmark-outline" style={{ fontSize: 30, color: colors.colorText }} />
                </TouchableOpacity>
            </View>
            <Text style={[styles.titleCard, { color: colors.colorDetail }]}>{t('listCategory')}</Text>
            <ScrollView>
                <View style={styles.containerListCategory}>
                    {Array.isArray(listCategories) && listCategories.map((categorie) => (
                        <View style={styles.categorieInfo} key={categorie.id}>
                            <View style={[styles.containerNamecategorie, { borderColor: colors.colorDetail }]}>
                                <Text style={[styles.nameCategorie, { color: colors.colorText }]}>{categorie.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteCategorie(categorie.id)} style={[styles.ContainerDeleteCategorie, { backgroundColor: colors.colorRed }]}>
                                <Text style={[styles.btnDeleteCategorie, { color: colors.colorText }]}>X</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}


function useStyles(){
    const {width, height} = useWindowDimensions();

    return StyleSheet.create({
        containerCardPage:{
            height: "100%",
            backgroundColor: "#161622"
        },
        titleCard:{
            marginLeft: 30,
            fontSize: (width > 375) ? 18 : 15,
            marginBottom: (width > 375) ? 30 : 20,
        },
        containerAddCategories:{
            flexDirection:"row",
            marginLeft:30,
            marginRight:30,
            justifyContent: "space-between",
            marginBottom: (width > 375) ? 50 : 30,
        },
        containerBtnAddCategories:{
            height: (width > 375) ? 50 : 40,
            width:(width > 375) ? 50 : 40, 
            justifyContent: "center", 
            alignItems: "center", 
            borderRadius: 15
        },
        categoriesInput:{
            borderWidth: 1,
            height: (width > 375) ? 50 : 40,
            borderRadius: 20,
            paddingLeft: 20,
            marginBottom: 20,
            width: (width > 375) ? 250 : 200,
        },
        categorieInfo:{
            flexDirection: "row",
            justifyContent: "space-between",
            marginLeft: 30, 
            marginRight: 30
        },
        nameCategorie:{
            marginBottom:10,
            fontSize: 16
        },
        containerNamecategorie:{
            borderLeftWidth:2,
            paddingLeft: 10,
            paddingTop: 10,
            paddingBottom: 10,
            marginBottom: 20
        },
        ContainerDeleteCategorie:{
            height: (width > 375) ? 50 : 40,
            width:(width > 375) ? 50 : 40, 
            justifyContent: "center", 
            alignItems: "center", 
            borderRadius: 15, 
        },
        btnDeleteCategorie:{
            fontSize:(width > 375) ? 20 : 18,
            fontWeight: "bold"
        },
        containerListCategory:{
            marginBottom: 90
        }
    
     
    })
}


export default CategoriesScreen
