import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { apiService } from '../API/ApiService';
import {useFonts} from "expo-font"
import {ModalDeleteFood} from "../Modal/Modal"

function MenuAdmin() {
  const [foods, setFoods] = useState([]);
  const [editableFoods, setEditableFoods] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSmallScreen, setIsSmallScreen] = useState(false); // Pas de gestion de la taille de l'écran sur React Native
  const [itemsPerPage, setItemsPerPage] = useState(isSmallScreen ? 6 : 10);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await apiService.getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const fetchedFoods = await apiService.getFoods();
        setFoods(fetchedFoods);
      } catch (error) {
        console.error("Erreur lors de la récupération des plats :", error);
      }
    };

    fetchFoods();
  }, []);

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
    
    let isUpdated = false;

    for (const foodId in editableFoods) {
        const formData = new FormData();
        const foodData = editableFoods[foodId];

        for (const key in foodData) {
            formData.append(key, foodData[key]);
        }

        try {
            const response = await apiService.updateFood(foodId, formData);
            if (response.success) {
                console.log('Mise à jour réussie', response.message);
                isUpdated = true;
            } else {
                console.error('Erreur lors de la mise à jour', response.message);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi à l\'API', error);
        }
    }

    if (isUpdated) {
        alert("Modifications ajoutées avec succès");
        const updatedFoods = await apiService.getFoods();
        setFoods(updatedFoods);
    }

    setEditableFoods({});
};
  

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleDeleteFood = async (foodId) => {
    try {
        const response = await apiService.deleteFood(foodId);
        // Vérifier si la suppression a réussi
        if (response.success) {
            console.log('Suppression réussie');
            const updatedFoods = await apiService.getFoods();
            setFoods(updatedFoods);
            setModalVisible(false);
            alert('Suppression réussi')
        } else {
            console.error('Erreur lors de la suppression:', response);
        }
    } catch (error) {
        // Gérer les erreurs
        console.error('Erreur lors de la suppression:', error.message);
    }
};

  const filteredFoods = foods.filter(food => selectedCategory === 'Tous' || food.category === selectedCategory);

  const [loaded] = useFonts({
    Philosopher: require('../../assets/fonts/Philosopher-Regular.ttf'),
    MavenPro: require('../../assets/fonts/MavenPro-VariableFont_wght.ttf'),
    PhilosopherBold: require('../../assets/fonts/Philosopher-Bold.ttf'),
  });

  if (!loaded) {
    // Peut-être afficher un indicateur de chargement ici
    return null;
  } 

  

  return (
    <View style={styles.container}>
      <ScrollView horizontal={true}  style={styles.containerScroll}>
        <View style={styles.listProduct}>
          {filteredFoods.map((food) => (
            <View style={styles.productInfo} key={food.id}>
              <TouchableOpacity style={styles.fileUploadButton} onPress={() => console.log('Changer l\'image')}>
                <Text style={styles.textUpdateImage}>Changer l'image</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder={food.title}
                value={editableFoods[food.id]?.title !== undefined ? editableFoods[food.id]?.title : food.title}
                onChangeText={(newValue) => handleInputChange(food.id, newValue, 'title')}
              />
              <TextInput
                style={styles.input}
                placeholder="description du plat"
                value={editableFoods[food.id]?.description !== undefined ? editableFoods[food.id]?.description : food.description}
                onChangeText={(newValue) => handleInputChange(food.id, newValue, 'description')}
              />
              <TextInput
                style={styles.input}
                placeholder="prix du plat"
                value={editableFoods[food.id]?.price !== undefined ? editableFoods[food.id]?.price : food.price}
                onChangeText={(newValue) => handleInputChange(food.id, newValue, 'price')}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.deleteButton} onPress={() => { setModalVisible(true); setSelectedFoodId(food.id)}}>
                <Text style={styles.textButtonDelete}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity onPress={handleUpdateAllFoods} style={styles.containerbtnUpdate}><Text style={styles.textButtonUpdate}>Modifier les éléments</Text></TouchableOpacity>
      <ModalDeleteFood isVisible={modalVisible} foodId={selectedFoodId} handleDeleteFood={handleDeleteFood} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
    container:{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
    },
    input:{
        borderWidth: 1,
        borderColor: "#FF9A00",
        height: 50,
        width: "80%",
        borderRadius: 10,
        paddingLeft: 20,
        marginBottom: 10,
    },
    fileUploadButton:{
        width: "80%",
        borderWidth: 1,
        height: 50,
        borderColor: "#ff9a00",
        borderRadius: 10,
        marginBottom: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    }, 
    deleteButton:{
        width: "80%",
        borderWidth: 1,
        height: 50,
        borderColor: "#ff9a00",
        borderRadius: 10,
        marginBottom: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ff9a00",
        marginBottom: 60
    }, 
    textButtonDelete:{
        color: "#fff"
    }, 
    listProduct:{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        height: 400
    },
    productInfo:{
        width: 400,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    }, 
    containerScroll:{
        height: "58%",
        width: "100%"
    },
    containerbtnUpdate:{
        width: "50%",
        borderWidth: 1,
        height: 50,
        borderColor: "#ff9a00",
        borderRadius: 10,
        marginBottom: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ff9a00",
        marginTop: 30
    },
    textButtonUpdate:{
        color:  "#fff",
    },
    textUpdateImage:{
      fontFamily: "MavenPro"
    },
  

})

export default MenuAdmin;
