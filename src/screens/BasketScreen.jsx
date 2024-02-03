import {react, useState, useEffect} from "react";
import { View, Text, StyleSheet, TouchableOpacity} from "react-native";
import ContentBasket from "../components/ContentBasket/ContentBasket";
import FormOrder from "../components/FormOrder/FormOrder";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from "../components/EventEmitter/EventEmitter";


function BasketScreen(){
    const [showForm, setShowForm] = useState(true);
    const [cartItems, setCartItems] = useState([]); // Renommé pour refléter qu'il s'agit d'une liste d'éléments

    useEffect(() => {
        const loadBasketItems = async () => {
            try {
                const storedItems = await AsyncStorage.getItem('cartItems');
                if (storedItems !== null) {
                    const items = JSON.parse(storedItems);
                    setCartItems(items);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des articles du panier', error);
            }
        };
    
        loadBasketItems();
    
        // Souscrire à l'événement 'cartUpdated'
        const unsubscribeCartUpdate = EventEmitter.subscribe('cartUpdated', (updatedCart) => {
            setCartItems([...updatedCart]);
        });
    
        // Souscrire à l'événement 'quantityChanged'
        const unsubscribeQuantityChange = EventEmitter.subscribe('quantityChanged', (updatedCart) => {
            setCartItems([...updatedCart])
        });
    
        // Nettoyer l'abonnement lors du démontage du composant
        return () => {
            unsubscribeCartUpdate();
            unsubscribeQuantityChange();
        };
    }, []);
    

    function activeForm() {
        setShowForm(!showForm);
    }

    return(
        <View style={styles.containerScreenBasket}>

            <View style={styles.containerTitleBasket}>
                <Text style={styles.titleBasket}>Panier</Text>
            </View>

            {showForm ? (
                <ContentBasket/>
            ):(
                <FormOrder/>
            )}

            <View style={styles.containerButtonBasket}>
                {showForm ? (
                    <TouchableOpacity style={cartItems.length > 0 ? styles.buttonBasket : styles.disabledButton} disabled={cartItems.length > 0 ? false : true} onPress={activeForm}>
                        <Text style={cartItems.length > 0 ? styles.textButtonBasket : styles.disabledText}>Suivant</Text>
                    </TouchableOpacity>
                ):(
                    <TouchableOpacity style={styles.buttonBasket} onPress={activeForm}>
                        <Text style={styles.textButtonBasket}>Retour</Text>
                    </TouchableOpacity>
                )}

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerTitleBasket: {
        marginTop: 50,
        borderBottomWidth: 1,
        borderColor: "#FF9A00",
        width: "100%",
        paddingBottom: 20
    },
    titleBasket:{
        textAlign: "center",
        fontSize: 40,
    },
    containerButtonBasket :{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        marginTop:40,
        borderTopWidth: 1,
        paddingTop:20,
        borderColor: "#ff9a00"
    },
    buttonBasket :{
        backgroundColor:"#FF9A00",
        height: 50,
        width: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius:20
    },
    textButtonBasket: {
        color: "#fff"
    },
    disabledButton:{
        backgroundColor : "#dcdcdc",
        height: 50,
        width: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius:20
    },
    disabledText:{
        color:'grey'
    }

    
})

export default BasketScreen