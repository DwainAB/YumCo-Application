import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormAddProduct from "../components/FormAddProduct/FormAddProduct";
import MenuAdmin from "../components/MenuAdmin/MenuAdmin";
import { useNavigation } from '@react-navigation/native';
import { EventEmitter } from "../components/EventEmitter/EventEmitter";
import CardOrder from "../components/CardOrder/CardOrder";
import Utilisateur from "../components/Utilisateur/Utilisateur";
import {useFonts} from "expo-font"


function Dashboard (){
    const [selectedValue, setSelectedValue] = useState(null);
    const [userData, setUserData] = useState([]);
    const navigation = useNavigation();

    const handleLogout = async () => {
        try {
          // Effacer les données de l'utilisateur dans AsyncStorage
          await AsyncStorage.multiRemove(['token', 'user']);
      
          // Rediriger l'utilisateur vers la page de connexion ou de chargement initial
          EventEmitter.dispatch("logout");
        } catch (error) {
          console.error('Erreur lors de la déconnexion :', error);
        }
    };
      
    const logStorageContent = async () => {
        try {
          const keys = await AsyncStorage.getAllKeys();
          const values = await AsyncStorage.multiGet(keys);
          const storageContent = values.reduce((content, [key, value]) => {
            content[key] = value;
            return content;
          }, {});
      
          console.log('Contenu du AsyncStorage :', storageContent);
        } catch (error) {
          console.error('Erreur lors de la récupération du contenu du AsyncStorage :', error);
        }
    };

    logStorageContent()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('user');
                if (jsonValue !== null) {
                    const data = JSON.parse(jsonValue);
                    setUserData(data);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur : ', error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        // Écouter l'événement de déconnexion lorsqu'il est monté
        const unsubscribe = EventEmitter.subscribe("logout", () => {
            // Rediriger l'utilisateur vers la page de connexion ou d'accueil
            // Remplacez 'Accueil' par le nom de votre page de connexion ou d'accueil
            navigation.navigate('Accueil');
        });

        // Nettoyer l'écouteur lorsque le composant est démonté
        return () => {
            unsubscribe();
        };
    }, []);

    const renderContent = () => {
        switch (selectedValue) {
          case 'Ajout de produit':
            return <FormAddProduct/>;
          case 'Carte':
            return <MenuAdmin/>;
          case 'Commande':
            return <CardOrder/>;
          case 'Utilisateur':
            return <Utilisateur/>
          default:
            return (
                <View>
                    <Text style={styles.textPresentation}>Bonjour <Text style={styles.colorText}>{userData.firstname}</Text>, vous êtes connecté en tant que <Text style={styles.colorText}>{userData.role}</Text>.{"\n"}
                    Vous vous trouvez sur le dashboard où il vous sera possible de gérer votre <Text style={styles.colorText}>carte</Text>, vos <Text style={styles.colorText}>commandes</Text> et les <Text style={styles.colorText}>utilisateurs.</Text>{'\n'}
                    {'\n'}
                    Pour toutes questions, vous pouvez contacter le support par mail : {"\n"}
                    <Text style={styles.colorText}>dwaincontact@gmail.com</Text>
                    </Text>

                    <View style={styles.ViewButtonLogout}>
                        <TouchableOpacity onPress={handleLogout} style={styles.containerButtonLogout}><Text style={styles.textLogout}>Déconnexion</Text></TouchableOpacity>
                    </View>

                </View>
            )
        }
    };

    const [loaded] = useFonts({
        Philosopher: require('../assets/fonts/Philosopher-Regular.ttf'),
        MavenPro: require('../assets/fonts/MavenPro-VariableFont_wght.ttf'),
    });

    if (!loaded) {
        // Peut-être afficher un indicateur de chargement ici
        return null;
    }

    return(
        <View>
            <Text style={styles.titleDashboard}>Dashboard</Text>

            <View style={styles.containerFilter}>
                <RNPickerSelect
                    items={[
                        { label: 'Ajout de produit', value: 'Ajout de produit' },
                        { label: 'Carte', value: 'Carte' },
                        { label: 'Commande', value: 'Commande' },
                        { label: 'Utilisateur', value: 'Utilisateur' },
                    ]}
                    style={{ inputIOS: styles.picker, inputAndroid: styles.picker }}
                    useNativeAndroidPickerStyle={false}
                    onValueChange={(value) => setSelectedValue(value)}
                    Icon={() => {
                        return <Ionicons name="chevron-down" size={24} color="gray" margin={13} />;
                    }}
                />
            </View>

            <View style={styles.containerContent}>
                {renderContent()}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    titleDashboard: {
        fontSize:  40,
        marginTop: 100,
        marginLeft: 20,
        fontFamily : "Philosopher"
    },
    picker:{
        paddingLeft: 20,
        width:"100%",
        borderWidth:1,
        height:50,
        borderColor: "#ff9a00",
        borderRadius: 10
    },
    containerFilter:{
        width: "50%",
        marginLeft : 20,
        marginTop: 50,
        marginBottom:50
    },
    colorText:{
        color: "#FF9A00",
        fontWeight: "700"
    },
    textPresentation:{
        fontSize: 20,
        marginLeft:20,
        marginRight: 20,
        fontFamily : "MavenPro"
    },
    containerButtonLogout:{
        backgroundColor: "red",
        height: 40,
        borderRadius : 10,
        width: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center", 
        marginTop: 50
    }, 
    textLogout:{
        color:"#fff",
        fontFamily : "MavenPro",
        fontSize: 16
    },
    ViewButtonLogout:{
        display:"flex",
        justifyContent:"center",
        alignItems: "center"
    }
})

export default Dashboard;
