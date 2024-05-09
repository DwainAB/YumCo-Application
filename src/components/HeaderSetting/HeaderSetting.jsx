import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "../ColorContext/ColorContext";


function HeaderSetting({name, navigateTo}){
    const navigation = useNavigation();
    const { colors } = useColors()

    return(
        <View style={styles.containerCardPage}>
            
            <View style={styles.containerHeader}>
                <TouchableOpacity onPress={() => navigation.navigate(navigateTo)} style={[styles.containerBtnBack, {backgroundColor: colors.colorBorderAndBlock}]}><Ionicons name="chevron-back-outline" size={30} color={colors.colorText}/></TouchableOpacity>
                <Text style={[styles.textHeader, {color : colors.colorText}]}>{name}</Text>
                <View style={styles.containerEmpty}></View>
            </View>

            <View style={styles.line}></View>

        </View>
    )
}

const styles = StyleSheet.create({
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
        marginBottom: 40
    }
 
})

export default HeaderSetting
