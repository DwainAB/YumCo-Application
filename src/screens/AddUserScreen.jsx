import React from "react";
import { View, StyleSheet} from "react-native";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import AddUser from "../components/Users/AddUser";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";

function AddUserScreen(){
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { colors } = useColors()

    return(
        <View style={[styles.containerCardPage, {backgroundColor:colors.colorBackground}]}> 
            
            <HeaderSetting name={t('addUser')} navigateTo="UserOptionScreen"/>
            <AddUser/>
        </View>
    )
}

const styles = StyleSheet.create({
    containerCardPage:{
        height: "100%",
    }
 
})

export default AddUserScreen
