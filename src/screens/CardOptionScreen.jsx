import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";

function CardOptionScreen(){
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { colors } = useColors()
    const styles = useStyles()

    return(
        <View style={[styles.containerCardPage, {backgroundColor:colors.colorBackground}]}>
            
            <HeaderSetting name={t('cards')} navigateTo="SettingPage"/>

            <Text style={[styles.titleCard, {color: colors.colorDetail}]}>{t('menuManagement')}</Text>

            <TouchableOpacity onPress={() => navigation.navigate('AddProductScreen')} style={styles.containerOptionCard}>
                <Text style={[styles.textOptionCard, {color: colors.colorText}]}>{t('addProduct')}</Text>
                <Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> navigation.navigate('UpdateProductScreen')} style={styles.containerOptionCard}>
                <Text style={[styles.textOptionCard, {color: colors.colorText}]}>{t('editProduct')}</Text>
                <Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> navigation.navigate('CategoriesScreen')} style={styles.containerOptionCard}>
                <Text style={[styles.textOptionCard, {color: colors.colorText}]}>{t('categories')}</Text>
                <Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/>
            </TouchableOpacity>

        </View>
    )
}

function useStyles(){
    const {width} = useWindowDimensions();

    return StyleSheet.create({
        containerCardPage:{
            height: "100%",
            backgroundColor: "#161622"
        },
        titleCard:{
            marginLeft: 30,
            color: "#A2A2A7",
            fontSize: (width > 375) ? 18 : 15,
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
            fontSize: (width > 375) ? 18 : 15
        }
     
    })
}


export default CardOptionScreen
