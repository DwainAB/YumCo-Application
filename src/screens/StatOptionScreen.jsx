import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";

function StatOptionScreen(){
    const navigation = useNavigation();

    return(
        <View style={styles.containerStatPage}>
            
            <HeaderSetting name="Statistique" navigateTo="HomeScreen"/>

            <Text style={styles.titleStat}>Liste des statistiques</Text>

            <TouchableOpacity onPress={() => navigation.navigate('AllOrdersScreen')} style={styles.containerOptionStat}>
                <Text style={styles.textOptionStat}>Toutes les commandes</Text>
                <Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.containerOptionStat}>
                <Text style={styles.textOptionStat}>Visiteur du site internet</Text>
                <Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    containerStatPage:{
        height: "100%",
        backgroundColor: "#161622"
    },
    titleStat:{
        marginLeft: 30,
        color: "#A2A2A7",
        fontSize: 18,
        marginBottom: 30
    },
    containerOptionStat:{
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
    textOptionStat:{
        color: "white",
        fontSize: 18
    }
 
})

export default StatOptionScreen
