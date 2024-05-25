import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "../ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";


function HeaderSetting({name, navigateTo}){
    const navigation = useNavigation();
    const { colors } = useColors()
    const styles = useStyles()

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

function useStyles(){

    const {width, height} = useWindowDimensions();

    return StyleSheet.create({
        containerHeader:{
            justifyContent: "space-between", 
            flexDirection:"row",
            marginTop : (height > 750) ? 60 : 40,
            paddingRight: 35,
            paddingLeft : 35,
            alignItems:'center',
        },
        textHeader:{
            fontSize:(width > 375) ? 22 : 18,
            color: "white",
        },
        containerBtnBack:{
            height:(width > 375) ? 55 : 35,
            width: (width > 375) ? 55 : 35,
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
            marginTop: (height > 750) ? 40 : 20,
            marginBottom: (width > 375) ? 40 : 20,
        }
     
    })
}


export default HeaderSetting
