import React from "react";
import { View, StyleSheet} from "react-native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import FormUpdate from "../components/FormUpdateProduct/FormUpdateProduct";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";

function UpdateProductScreen(){
    const { t } = useTranslation();
    const { colors } = useColors()

    return(
        <View style={[styles.containerCardPage, {backgroundColor: colors.colorBackground}]}> 
            
            <HeaderSetting name={t('editProduct')} navigateTo="CardOptionScreen"/>
            <FormUpdate/>
        </View>
    )
}

const styles = StyleSheet.create({
    containerCardPage:{
        height: "100%",
    },
 
})

export default UpdateProductScreen
