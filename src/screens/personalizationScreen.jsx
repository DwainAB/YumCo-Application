import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";

function Personalization(){
    const navigation = useNavigation(); 


    return(
        <View style={styles.containerPersonalization}>

            <HeaderSetting name="Personnalisation" navigateTo="SettingPage"/>

            <Text style={styles.titleInterface}>Interface</Text>

            <View style={styles.containerBtnStyle}>
                <View style={styles.borderBlue}></View>
                <TouchableOpacity style={styles.containerTextClear} onPress={() => handlePress("clair")}>
                    <Ionicons color={"#0066FF"} size={20} name="sunny-outline"/>
                    <Text style={styles.TextClear}>Clair</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.containerTextDark} onPress={() => handlePress("sombre")}>
                    <Ionicons color={"white"} size={20} name="moon-outline"/>
                    <Text style={styles.textDark}>Sombre</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.titleTheme}>Thèmes</Text>

        </View>
    )
}

const styles = StyleSheet.create({
    containerPersonalization:{
        height: "100%",
        backgroundColor:"#161622"
    },
    containerHeader:{
        justifyContent: "space-between", 
        flexDirection:"row",
        marginTop : 60,
        paddingRight: 35,
        paddingLeft : 35,
        alignItems:'center',
    },
    textHeader:{
        fontSize: 22,
        color: "white",
    },
    containerBtnBack:{
        height:45,
        width: 45,
        alignItems: "center",
        borderRadius: 50,
        backgroundColor: "#1E1E2D",
        justifyContent: "center",
    },
    containerEmpty:{
        width: "10%",
    },
    line:{
        borderWidth:1,
        marginLeft: 30,
        marginRight:30,
        borderColor: "#232533",
        marginTop: 40,
        marginBottom: 30
    },
    containerBtnStyle:{
        borderWidth: 1,
        borderColor: "white",
        marginLeft: 30,
        marginRight:30,
        flexDirection : "row",
        borderRadius: 50,
        height: 35
    },
    titleInterface:{
        color:"white",
        textAlign: "center",
        fontSize: 18,
        marginBottom: 30
    },
    containerTextClear:{
        width: "50%",
        alignItems: "center", 
        flexDirection: "row",
        paddingLeft: 30,
        paddingTop:5,
        paddingBottom:5,
    },
    TextClear:{
        color: "white",
        fontSize: 16,
        marginLeft: 15,
        color: "#0066FF"
    },
    containerTextDark:{
        width: "50%",
        alignItems: "center",
        flexDirection: "row",
        paddingLeft: 30,
        paddingBottom: 5,
        paddingTop:5,
    },
    textDark:{
        color: "white",
        fontSize: 16,
        marginLeft: 15
    },
    borderBlue:{
        position: "absolute",
        height: 36,
        borderColor: "#0066FF",
        borderWidth: 2,
        width: "50%",
        left: -2,
        top: -2,
        borderRadius: 50
    },
    titleTheme:{
        color:"white",
        textAlign: "center",
        fontSize: 18,
        marginBottom: 30,
        marginTop: 30  
    }
})

export default Personalization