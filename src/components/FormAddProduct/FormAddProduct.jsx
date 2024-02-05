import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import { apiService } from "../API/ApiService";
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImageManipulator from 'expo-image-manipulator';


function FormAddProduct() {
    const [productData, setProductData] = useState({
        title: "",
        description: "",
        price: "",
        imageURL: null,
        image: null,
        category: "",
    });

    const [categorys, setCategorys] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await apiService.getAllCategories();
                setCategorys(fetchedCategories);
            } catch (error) {
                console.error('Erreur lors de la récupération des catégories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('title', productData.title);
            formData.append('description', productData.description);
            formData.append('category', productData.category);
            formData.append('price', productData.price);
            formData.append('image', {
                uri: productData.image.uri,
                type: "image/jpg",
                name: `product-image-${Date.now()}.jpg`,
            });

            console.log("uri", productData.image.uri);

            const result = await apiService.addFood(formData);
            alert('Plat ajouté avec succès!');
            resetForm();
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
            imageURL: null,
            image: null,
            category: "",
        });
    };

    const handlePriceChange = (inputValue) => {
        const convertedValue = inputValue.replace(',', '.');
        const regex = /^[0-9]*\.?[0-9]*$/;
    
        if (regex.test(convertedValue) || convertedValue === '') {
            setProductData({ ...productData, price: convertedValue });
        }
    };

    const handleImageChange = async (result) => {
        if (result && result.uri) {
            try {
                const manipulatedUri = await ImageManipulator.manipulateAsync(
                    result.uri,
                    [
                        { resize: { width: 500 } }, // Redimensionner à une largeur de 500 pixels
                    ],
                    { compress: 0.8 } // Compresser à 80% de qualité
                );
                setProductData({ ...productData, image: result, imageURL: manipulatedUri });
                console.log('reussi');
            } catch (error) {
                console.error('Erreur lors de la manipulation de limage:', error);
                setProductData({ ...productData, image: null, imageURL: null });
            }
        } else {
            setProductData({ ...productData, image: null, imageURL: null });
        }
    };
    
    
    

    const pickFile = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permission refusée pour accéder aux fichiers.');
            return;
        }
      
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });
    
        if (!result.cancelled && result.assets.length > 0) {
            handleImageChange(result.assets[0]); // Pass the first asset object
        }
    };
    

    console.log(productData);
    
    return (
        <ScrollView style={styles.containerScrollAddProduct}>
            <View style={styles.containerFormAddProduct}>
                <TextInput
                    style={styles.inputAddProduct}
                    placeholder="Nom du produit"
                    value={productData.title}
                    onChangeText={(text) => setProductData({ ...productData, title: text })}
                />
                <TextInput
                    style={styles.inputAddProduct}
                    placeholder="Description"
                    value={productData.description}
                    onChangeText={(text) => setProductData({ ...productData, description: text })}
                />
                <View style={styles.containerSelectAddForm}>
                    <RNPickerSelect
                        items={categorys.map(category => ({ label: category.name, value: category.name }))}
                        onValueChange={(value) => setProductData({ ...productData, category: value })}
                        style={{ inputIOS: styles.picker, inputAndroid: styles.picker }}
                        useNativeAndroidPickerStyle={false}
                        Icon={() => {
                            return <Ionicons name="chevron-down" margin={11} size={30} color="#FF9A00" />;
                        }}
                    />
                </View>
                <TextInput
                    style={styles.inputAddProduct}
                    placeholder="Prix"
                    value={productData.price}
                    onChangeText={handlePriceChange}
                />
                <TouchableOpacity style={styles.buttonImageAddProduct} onPress={pickFile}><Text style={styles.textAddImage}>Choisir une image</Text></TouchableOpacity>
                <TouchableOpacity style={styles.buttonAddProduct} onPress={handleSubmit}><Text style={styles.textAddProduct}>Ajouter</Text></TouchableOpacity>
            
                <View>
                    <View style={styles.card}>
                        <Image source={{ uri: productData.imageURL }} style={styles.imageCard}/>
                        <Text style={styles.textCard}>{productData.title}</Text>
                        <View style={styles.containerBottomCard}>
                            <Text style={styles.priceCard}>{productData.price} €</Text>
                            <View style={styles.containerButtonCard}>
                                <TouchableOpacity style={styles.buttonCard}><Text style={styles.textButtonCard}>+</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    containerScrollAddProduct:{
        height: 500
    },
    containerFormAddProduct: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputAddProduct: {
        borderWidth: 1,
        borderColor: "#FF9A00",
        height: 50,
        width: "80%",
        borderRadius: 10,
        paddingLeft: 20,
        marginBottom: 10,
    },
    picker: {
        paddingLeft: 20,
        width: "100%",
        borderWidth: 1,
        height: 50,
        borderColor: "#ff9a00",
        borderRadius: 10,
        marginBottom: 10,
    },
    containerSelectAddForm:{
        width: "80%"
    },
    buttonImageAddProduct :{
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
    textAddImage:{
        color: "#ff9a00",
        fontWeight: "700"
    },
    buttonAddProduct:{
        backgroundColor:"#ff9a00",
        width:"50%",
        height:50,
        borderRadius:10,
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        marginTop: 30
    },
    textAddProduct:{
        color:"white",
        fontWeight: "700"
    },
    card:{
        width: 230,
        backgroundColor : "#dcdcdc",
        borderRadius:20,
        marginLeft:20,
        marginTop: 50,
        marginBottom: 50
    
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
        height: 50
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
        color:  "#fff"
     }, 
     priceCard:{
        fontSize:18
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

export default FormAddProduct;
