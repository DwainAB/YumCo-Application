import {react, useState, useEffect} from "react";
import {Text, View, StyleSheet, TouchableOpacity, ScrollView} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from "../EventEmitter/EventEmitter";


function ContentBasket(){
    const [basketFull, setBasketFull] = useState([])
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const loadBasketItems = async () => {
            try {
                const storedItems = await AsyncStorage.getItem('cartItems');
                if (storedItems !== null) {
                    const items = JSON.parse(storedItems);
                    setBasketFull(items);
                    calculateTotal(items);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des articles du panier', error);
            }
        };

        loadBasketItems();

        // Souscrire à l'événement 'cartUpdated'
        const handleCartUpdate = (updatedCart) => {
            setBasketFull(updatedCart);
            calculateTotal(updatedCart);
        };

        EventEmitter.subscribe('cartUpdated', handleCartUpdate);

        // Nettoyer l'abonnement lors du démontage du composant
        return () => {
            EventEmitter.events.cartUpdated = EventEmitter.events.cartUpdated.filter(event => event !== handleCartUpdate);
        };
    }, []);

    const calculateTotal = (items) => {
        const total = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        setTotalAmount(total);
    };

      const increaseQuantity = async (index) => {
        let newBasket = [...basketFull];
        newBasket[index].quantity += 1;
        setBasketFull(newBasket);
        calculateTotal(newBasket);
        await AsyncStorage.setItem('cartItems', JSON.stringify(newBasket));
        EventEmitter.dispatch('quantityChanged', newBasket);
    };

    const decreaseQuantity = async (index) => {
        let newBasket = [...basketFull];
        if (newBasket[index].quantity > 1) {
            newBasket[index].quantity -= 1;
        } else {
            newBasket.splice(index, 1);
        }
        setBasketFull(newBasket);
        calculateTotal(newBasket);
        await AsyncStorage.setItem('cartItems', JSON.stringify(newBasket));
        EventEmitter.dispatch('quantityChanged', newBasket);
    }; 

    return(
        <View style={styles.containerContentBasket}>
            {basketFull.length > 0 ? (
                <>
                <ScrollView style={styles.containerContentFull}>
                    {basketFull.map((item, index) =>(
                    <View key={index} style={styles.containerProductBasket}>
                        <Text style={styles.titleProductBasket}>x{item.quantity} {item.title}</Text>
                        <View style={styles.containerButtonStepper}>
                            <TouchableOpacity onPress={() => increaseQuantity(index)} style={styles.buttonStepper}><Text style={styles.textStepper}>+</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => decreaseQuantity(index)} style={styles.buttonStepper}><Text style={styles.textStepper}>-</Text></TouchableOpacity>
                        </View>
                    </View>
                    ))}
                </ScrollView>
                <Text style={styles.textTotal}>Total : {totalAmount.toFixed(2)} €</Text>
                </>
            ):(
                <View style={styles.containerContentEmpty}>
                    <Ionicons name="basket-outline" size={100} color={"lightgrey"}/>
                    <Text>Votre panier est actuellement vide ! </Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    containerContentBasket: {
        height:"70%",
        width:"100%",
    },
    containerContentEmpty:{
        display:"flex",
        flexDirection:"column", 
        alignItems:"center",
        justifyContent:"center",
        height:"100%",
    },
    containerProductBasket:{
        display:"flex",
        flexDirection:"row",  
        paddingLeft: 20,
        paddingRight:20,
        paddingTop:20,
        justifyContent: "space-between",
        alignItems: "center"
    },
    titleProductBasket :{
        fontSize: 20
    },
    containerButtonStepper:{
        display: "flex",
        flexDirection: "row",
        gap:20
    },
    buttonStepper:{
        display:"flex",
        justifyContent:"center",
        alignItems: "center",
        backgroundColor: "#FF9A00",
        height: 30,
        width: 30,
        borderRadius: 8
    }, 
    textStepper:{
        color:"#fff",
        fontSize:20
    },
    textTotal:{
        fontSize:20,
        textAlign: "right",
        paddingRight:20,
        paddingTop:10
    }
})

export default ContentBasket