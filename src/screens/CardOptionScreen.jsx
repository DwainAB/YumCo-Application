import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";

function CardOptionScreen(){
    const navigation = useNavigation();

    return(
        <View style={styles.containerCardPage}>
            
            <HeaderSetting name="Carte" navigateTo="SettingPage"/>

            <Text style={styles.titleCard}>Gestion de la carte</Text>

            <TouchableOpacity onPress={() => navigation.navigate('AddProductScreen')} style={styles.containerOptionCard}>
                <Text style={styles.textOptionCard}>Ajouter un produit</Text>
                <Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.containerOptionCard}>
                <Text style={styles.textOptionCard}>Modifier mes produits</Text>
                <Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    containerCardPage:{
        height: "100%",
        backgroundColor: "#161622"
    },
    titleCard:{
        marginLeft: 30,
        color: "#A2A2A7",
        fontSize: 18,
        marginBottom: 30
    },
    containerOptionCard:{
        marginLeft: 30,
        marginRight: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#232533",
        paddingBottom: 10,
        marginBottom: 22
    },
    textOptionCard:{
        color: "white",
        fontSize: 18
    }
 
})

export default CardOptionScreen
