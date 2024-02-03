import {react, useState, useEffect} from "react";
import {Text, View, StyleSheet, TextInput, TouchableOpacity} from "react-native"
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from "react-native-vector-icons/Ionicons"
import { EventEmitter } from "../EventEmitter/EventEmitter";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiService} from "../API/ApiService"

function FormOrder(){
    const [basketFull, setBasketFull] = useState([])
    const [clientData,  setClientData] = useState({
        firstname:"",
        lastname: "",
        email:"",
        phone: "",
        address: "",
        method:""
    })

    useEffect(() => {
        const loadBasketItems = async () => {
            try {
                const storedItems = await AsyncStorage.getItem('cartItems');
                if (storedItems !== null) {
                    const items = JSON.parse(storedItems);
                    setBasketFull(items);
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

    console.log("voila ça", basketFull);

    const handleFormChange = (name, value) => {
        setClientData({ ...clientData, [name]: value });
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        try {
            // Vérifier si les données du client sont complètes
            if (!clientData.email || !clientData.firstname || !clientData.lastname) {
                alert('Veuillez remplir tous les champs nécessaires.');
                return;
            }
    
            const orderData = {
                ...clientData,
                cartItems: basketFull
            };

            console.log("envoi des donnée :", orderData);
    
            // Envoi des données de la commande au backend
            const orderResponseData = await apiService.addClientAndOrder(orderData);
    
            // Vérifier la réponse de la commande
            if (orderResponseData.message !== 'Commande ajoutée avec succès.') {
                console.error('Réponse de l\'API commande:', orderResponseData);
                throw new Error('Problème lors de l\'envoi de la commande');
            }

            const emailData = {
                email: clientData.email,
                firstName: clientData.firstname,
                lastName: clientData.lastname
              };
              
              const formBody = Object.keys(emailData)
                .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(emailData[key]))
                .join('&');
    
            // Envoi de l'e-mail de confirmation
            const emailResponse = await fetch('https://back-wok-rosny.onrender.com/services/sendEmail.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody
            });
            
            if (!emailResponse.ok) {
                throw new Error('Problème lors de l\'envoi de l\'e-mail de confirmation');
            }
    
            // Récupérer le corps de la réponse en tant que texte
            const emailResponseBody = await emailResponse.text();
            console.log('Corps de la réponse d\'e-mail:', emailResponseBody);
        
            if (emailResponseBody) {
                console.log('Réponse d\'e-mail:', emailResponseBody);
            } else {
                console.log('La réponse d\'e-mail est vide.');
            }
            // Réinitialiser les données du formulaire et de l'interface utilisateur
            resetFormData();
    
            alert("Votre commande a bien été envoyée ! Un email de confirmation vous a été envoyé.");
            clearCartItems();
        } catch (error) {
            console.error("Erreur lors de l'envoi du formulaire client : ", error);
            alert('Une erreur est survenue lors de l\'envoi du formulaire.');
        }
    };

    function resetFormData() {
        setClientData({
            firstname: "",
            lastname: "",
            email: "",
            phone: "",
            address: "",
            method: ""
        });
    }

    const clearCartItems = async () => {
        try {
            await AsyncStorage.removeItem('cartItems');
            console.log('Les éléments du panier ont été supprimés avec succès.');
        } catch (e) {
            console.error('Erreur lors de la suppression des éléments du panier', e);
        }
    };
    

    return(
        <View style={styles.containerInputForm}>
            <TextInput
            style={styles.inputOrder}
            onChangeText={(value) => handleFormChange('firstname', value)}
            value={clientData.firstname}
            placeholder="Prénom"
            name='firstName'
            />
            <TextInput
            style={styles.inputOrder}
            onChangeText={(value) => handleFormChange('lastname', value)}
            value={clientData.lastname}
            placeholder="Nom"
            name="lastName"
            />
            <TextInput
            style={styles.inputOrder}
            onChangeText={(value) => handleFormChange('email', value)}
            value={clientData.email}
            placeholder="Mail"
            email="email"
            />
            <TextInput
            style={styles.inputOrder}
            onChangeText={(value) => handleFormChange('phone', value)}
            value={clientData.phone}
            placeholder="Téléphone"
            />
            <TextInput
            style={styles.inputOrder}
            onChangeText={(value) => handleFormChange('address', value)}
            value={clientData.address}
            placeholder="Adresse"
            />
            <View style={styles.containerSelect}>
                <RNPickerSelect
                    onValueChange={(value) => handleFormChange("method", value)}
                    items={[
                    { label: 'Livraison', value: 'Livraison' },
                    { label: 'Emporter', value: 'Emporter' },
                    ]}
                    style={{ inputIOS: styles.picker, inputAndroid: styles.picker }} // Appliquez le style ici
                    value={clientData.method}
                    useNativeAndroidPickerStyle={false}
                    Icon={() => {
                        return <Ionicons name="chevron-down" size={24} color="gray" margin={13}/>;
                    }}
                />
            </View>

            <View style={styles.containerButtonOrderForm}>
                <TouchableOpacity onPress={handleSubmitForm} style={styles.buttonOrderForm}><Text style={styles.textButtonFormOrder}>Envoyer</Text></TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerInputForm:{
        width: "100%",
        height: "70%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
    },
    inputOrder :{
        borderWidth: 1,
        borderColor: "#FF9A00",
        height: 50,
        width: "80%",
        borderRadius: 10,
        paddingLeft: 20
    }, 
    containerSelect:{
        width: "80%"
    },
    picker:{
        paddingLeft: 20,
        width:"100%",
        borderWidth:1,
        height:50,
        borderColor: "#ff9a00",
        borderRadius: 10
    },
    containerButtonOrderForm:{
        height: 50,
        width:"100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    buttonOrderForm:{
        borderRadius: 10,
        backgroundColor: "#ff9a00",
        width: "50%",
        height: 50,
        display: "flex",
        justifyContent:"center",
        alignItems: "center"
    },
    textButtonFormOrder:{
        color: "#fff"
    }
})
export default  FormOrder;