import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";


function Dashboard (){
    const navigation = useNavigation(); // Obtenez l'objet de navigation


    return(
        <ScrollView style={styles.containerSetting}>

            <View style={styles.containerHeaderSetting}>
                <View style={styles.containerEmpty}></View>
                <Text style={styles.textHeaderSetting}>Paramètre</Text>
                <View style={styles.containerBtnLogout}><Ionicons name="log-out-outline" size={30} color="white"/></View>
            </View>

            <View style={styles.containerMenuSetting}>

                <View style={styles.containerCategorySetting}>
                    <Text style={styles.titleCategorySetting}>Général</Text>
                    <TouchableOpacity style={styles.containerBtnSetting} onPress={() => navigation.navigate('LanguagePage')}><Text style={styles.textBtnSetting}>Langage</Text><View style={styles.langageSelect}><Text style={styles.textLangageSelect}>Français</Text><Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/></View></TouchableOpacity>
                    <TouchableOpacity style={styles.containerBtnSetting} onPress={() => navigation.navigate('Personalization')}><Text style={styles.textBtnSetting}>Personnalisation</Text><Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                </View>

                <View style={styles.containerCategorySetting}>
                    <Text style={styles.titleCategorySetting}>Mon restaurant</Text>
                    <TouchableOpacity style={styles.containerBtnSetting} onPress={() => navigation.navigate('CardOptionScreen')}><Text style={styles.textBtnSetting}>Cartes</Text><Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                    <TouchableOpacity style={styles.containerBtnSetting}><Text style={styles.textBtnSetting}>Utilisateurs</Text><Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                    <TouchableOpacity style={styles.containerBtnSetting}><Text style={styles.textBtnSetting}>Avis</Text><Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                    <TouchableOpacity style={styles.containerBtnSetting}><Text style={styles.textBtnSetting}>Horaires</Text><Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                    <TouchableOpacity style={styles.containerBtnSetting}><Text style={styles.textBtnSetting}>Statistiques</Text><Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                </View>

                <View style={styles.containerCategorySetting}>
                    <Text style={styles.titleCategorySetting}>Sécurité</Text>
                    <TouchableOpacity style={styles.containerBtnSetting}><Text style={styles.textBtnSetting}>Changer le mot de passe</Text><Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                    <TouchableOpacity style={styles.containerBtnSetting}><Text style={styles.textBtnSetting}>Politique de confidentialité</Text><Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                </View>

            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    containerHeaderSetting:{
        justifyContent: "space-between", 
        flexDirection:"row",
        marginTop : 60,
        paddingRight: 35,
        paddingLeft : 35,
        alignItems:'center',
    },
    textHeaderSetting:{
        fontSize: 22,
        color: "white",
    },
    containerBtnLogout:{
        height:45,
        width: 45,
        alignItems: "center",
        borderRadius: 50,
        backgroundColor: "#1E1E2D",
        justifyContent: "center",
        paddingLeft: 5
    },
    containerEmpty:{
        width: "10%",
    },
    containerCategorySetting:{
        marginLeft: 20,
        marginRight: 20,
        marginTop: 30
    },
    titleCategorySetting:{
        color: "#A2A2A7",
        fontSize: 18,
        marginBottom: 0
    },
    containerBtnSetting:{
        borderBottomWidth: 1,
        borderColor: "#232533",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
    },
    textBtnSetting:{
        color: "white",
        fontSize: 18,
        marginBottom: 10,
        marginTop: 20
    },
    langageSelect:{
        flexDirection: "row",
        alignItems: "center"
    },
    textLangageSelect:{
        color: "#A2A2A7",
        fontSize: 18,
        marginBottom: 10,
        marginTop: 20,
        marginRight: 10
    }
})

export default Dashboard;
