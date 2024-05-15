import React, {useState, useEffect} from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "../components/ColorContext/ColorContext";
import { apiService } from "../components/API/ApiService";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";


function CategoriesScreen(){
    const navigation = useNavigation();
    const { colors } = useColors()
    const { t } = useTranslation();
    const styles = useStyles()
    const [nameRestaurant, setNameRestaurant] = useState('')
    const [listCategories, setListCategories] = useState('')
    const [categories, setCategories] = useState({
         name: '',
         ref_restaurant: ''
       });


    useEffect(() => {
        async function fetchRefRestaurant() {
            try {
                const user = await AsyncStorage.getItem("user");
                console.log(user);
                const refRestaurant = JSON.parse(user).ref_restaurant;
                setNameRestaurant(refRestaurant);
                setCategories(prevState => ({ ...prevState, ref_restaurant: refRestaurant }));
            } catch (error) {
                console.error('Erreur lors de la récupération de ref_restaurant depuis le stockage:', error);
            }
        }      
        fetchRefRestaurant();
    }, []);


    const handleNewCategoriesInputChange = (name, value) => {
        setCategories(prevState => ({ ...prevState, [name]: value }));
    };


    const handleAddNewCategories = async (event) => {
        try {
            const formData = new FormData();
            formData.append('name', categories.name);
            formData.append('ref_restaurant', categories.ref_restaurant);
    
            const addCategories = await apiService.addCategory(formData, { timeout: 10000 });
            console.log('Réponse de l\'API:', addCategories);
            if (addCategories.success) {
                console.log('Catégorie ajoutée avec succès', addCategories.message);
                setCategories({ name: '', ref_restaurant: '' });
                fetchCategorie()
            } else {
                console.error('Erreur lors de l\'ajout de la catégorie', addCategories.message);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi à l\'API:', error.message);
        }
    };

    const fetchCategorie = async () => {
        try {
            const fetchedCategories = await apiService.getAllCategories(nameRestaurant);
            setListCategories(fetchedCategories); 
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


    const handleDeleteCategorie = async (categorieId) => {
        try {
            await apiService.deleteCategory(categorieId);
            const fetchCategorie = await apiService.getAllCategories(nameRestaurant); // Ajout de cette ligne pour récupérer la liste mise à jour
            setListCategories(fetchCategorie);
            alert('Catégorie supprimé')
        } catch (error) {
            const fetchCategorie = await apiService.getAllCategories(nameRestaurant); // Ajout de cette ligne pour récupérer la liste mise à jour
            setListCategories(fetchCategorie);
            console.error('Erreur lors de la suppression', error.message);
        }
    };
    

    return(
        <View style={[styles.containerCardPage, {backgroundColor : colors.colorBackground}]}>
            
            <HeaderSetting name="Catégories" navigateTo="CardOptionScreen"/>

            <Text style={[styles.titleCard, {color : colors.colorDetail}]}>{t('addCategory')}</Text>

            <View style={styles.containerAddCategories}>
                <TextInput
                    style={[styles.categoriesInput, {borderColor: colors.colorText, color : colors.colorText}]}
                    placeholder={t('category')}
                    placeholderTextColor="#343434"
                    value={categories.name}
                    name='lastname'
                    onChangeText={(value) => handleNewCategoriesInputChange('name', value)}
                    
                />

                <TouchableOpacity onPress={()=>handleAddNewCategories() } style={[styles.containerBtnAddCategories, {backgroundColor: colors.colorAction }]}><Ionicons name="checkmark-outline" style={{ fontSize: 30, color: colors.colorText}}/></TouchableOpacity>
            </View>

            <Text style={[styles.titleCard, {color: colors.colorDetail}]}>{t('listCategory')}</Text>
            <ScrollView>
                <View style={styles.containerListCategory}>
                    {Array.isArray(listCategories) && listCategories.map((categorie) => {
                        console.log(categorie);
                        return(
                        <View style={styles.categorieInfo} key={categorie.id}>
                            <View style={[styles.containerNamecategorie, {borderColor: colors.colorDetail}]}>
                                <Text style={[styles.nameCategorie, {color: colors.colorText}]}>{categorie.name}</Text>
                            </View>
                            <TouchableOpacity onPress={()=>handleDeleteCategorie(categorie.id)} style={[styles.ContainerDeleteCategorie, {backgroundColor: colors.colorRed}]}>
                                <Text style={[styles.btnDeleteCategorie, {color: colors.colorText}]}>X</Text>
                            </TouchableOpacity>
                        </View>)
                    })}
                </View>
            </ScrollView>
        </View>
    )
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
