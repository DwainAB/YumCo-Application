import React from "react";
import { View, StyleSheet} from "react-native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import FormAddProduct from "../components/FormAddProduct/FormAddProduct";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";

function AddProductScreen(){
    const { t } = useTranslation();
    const { colors } = useColors()

    return(
        <View style={[styles.containerCardPage, {backgroundColor: colors.colorBackground}]}>
            
            <HeaderSetting name={t('addProduct')} navigateTo="CardOptionScreen"/>
            <FormAddProduct/>
        </View>
    )
}

const styles = StyleSheet.create({
    containerCardPage:{
        height: "100%",
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

export default AddProductScreen
