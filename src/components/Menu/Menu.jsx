import {react, useState, useEffect} from "react";
import {View, Text, StyleSheet, Image, TouchableOpacity, ScrollView} from "react-native"
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from "react-native-vector-icons/Ionicons"
import { EventEmitter } from "../EventEmitter/EventEmitter"; 
import {apiService} from "../API/ApiService"
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFonts} from "expo-font"


function Menu(){
    const [filter, setFilter] = useState('Tous')
    const [foods, setFoods] = useState([])
    const [categorys, setCategorys] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('Tous')

    useEffect(() => {
        const fetchFoodsAndCategorys = async () => {
            try {
                const fetchedFoods = await apiService.getFoods();
                setFoods(fetchedFoods);
            } catch (error) {
                console.log("Erreur lors du chargement des produits", error);
            }
    
            try {
                const fetchedCategorys = await apiService.getAllCategories();
                const categoryOptions = [
                    { label: 'Tous', value: 'Tous' }, // Option par défaut
                    ...fetchedCategorys.map(category => ({
                        label: category.name,
                        value: category.name
                    }))
                ];
                setCategorys(categoryOptions);
            } catch (error) {
                console.log("Erreur lors du chargement des catégories", error);
            }
        };
    
        fetchFoodsAndCategorys();
    }, []);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const filteredFoods = foods.filter((food) => {
        return selectedCategory === 'Tous' || food.category === selectedCategory;
    });

    const [loaded] = useFonts({
        Philosopher: require('../../assets/fonts/Philosopher-Regular.ttf'),
        MavenPro: require('../../assets/fonts/MavenPro-VariableFont_wght.ttf'),

    });

    if (!loaded) {
        // Peut-être afficher un indicateur de chargement ici
        return null;
    }

    const addToCart = async (food) => {
        try {
            // Récupérer le panier actuel
            const storedCart = await AsyncStorage.getItem('cartItems');
            let currentCart = storedCart ? JSON.parse(storedCart) : [];
    
            // Vérifier si le produit est déjà dans le panier
            const existingFoodIndex = currentCart.findIndex(item => item.id === food.id);
            if (existingFoodIndex >= 0) {
                // Augmenter la quantité
                currentCart[existingFoodIndex].quantity += 1;
            } else {
                // Ajouter le nouvel article
                currentCart = [...currentCart, { ...food, quantity: 1 }];
            }
    
            // Sauvegarder le panier mis à jour
            await AsyncStorage.setItem('cartItems', JSON.stringify(currentCart));
            EventEmitter.dispatch('cartUpdated', currentCart);

            alert(`Ajouté au panier: ${food.title}`);
        } catch (error) {
            console.error('Erreur lors de l\'ajout au panier', error);
        }
    };

    return(
        <View style={styles.containerMenu}>
            <Text style={styles.titleMenu}>Notre carte</Text>

            <View style={styles.containerFilter}>
                <RNPickerSelect
                    onValueChange={(value) => handleCategoryClick(value)}
                    items={categorys}
                    value={selectedCategory}
                    style={{ inputIOS: styles.picker, inputAndroid: styles.pickerAndroid }} // Appliquez le style ici
                    useNativeAndroidPickerStyle={false}
                    Icon={() => {
                        return <Ionicons name="chevron-down" size={20} color="#FF9A00" margin={11}/>;
                    }}
                />
            </View>

            <ScrollView horizontal={true} style={styles.containerCards}>

                {filteredFoods ? (
                    filteredFoods.map((food) =>(
                        <View key={food.id} style={styles.card}>
                            <Image source={{uri : `https://back-wok-rosny.onrender.com/${food.image}`}} style={styles.imageCard}/>
                            <Text style={styles.textCard}>{food.title}</Text>
                            <View style={styles.containerBottomCard}>
                                <Text style={styles.priceCard}>{food.price}€</Text>
                                <View style={styles.containerButtonCard}>
                                    <TouchableOpacity onPress={()=> addToCart(food)} style={styles.buttonCard}><Text style={styles.textButtonCard}>+</Text></TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text>Chargement...</Text>
                )}
               
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
 containerMenu:{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
 },
 titleMenu :{
    fontSize: 35,
    textAlign:"center",
    marginTop: 50,
    fontFamily: "Philosopher"
 },
 containerFilter:{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "red",
    marginTop: 20,
    width: "30%",
 },
 picker:{
    width: "100%",
    height:40,
    color: "#FF9A00",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FF9A00",
    paddingLeft:10
 }, 
 pickerAndroid:{
    width: 150,
    height:40,
    color: "#FF9A00",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FF9A00",
    paddingLeft:10
 },
 containerCards:{
    width: "100%",
    display: "flex",
    flexDirection: "row",
    marginTop: 30,
    gap: 30,
 },
 card:{
    width: 230,
    backgroundColor : "#dcdcdc",
    borderRadius:20,
    marginLeft:20,

 },
 imageCard:{
    width: "100%",
    height: 150,
    objectFit: "cover",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20
 }, 
 textCard:{
    textAlign: "center",
    fontSize: 18,
    marginBottom:20,
    marginTop: 20,
    height: 50,
    fontFamily : "MavenPro"
 },
 containerBottomCard:{
    display:"flex", 
    flexDirection: "row",  
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop:20,
    paddingBottom : 20
 }, 
 textButtonCard:{
    fontSize: 18,
    color:  "#fff",
 }, 
 priceCard:{
    fontSize:18,
    fontFamily : "MavenPro"

 },
 containerButtonCard:{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor : "#FF9A00",
    width:30,
    height: 30,
    borderRadius: 6
 }
})

export default Menu