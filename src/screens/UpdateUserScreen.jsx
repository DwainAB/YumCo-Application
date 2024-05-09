import React from "react";
import { View, StyleSheet} from "react-native";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import Utilisateur from "../components/Users/UpdateUser";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";

function UpdateUserScreen(){
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { colors } = useColors()

    return(
        <View style={[styles.containerCardPage, {backgroundColor:colors.colorBackground}]}> 
            
            <HeaderSetting name={t('userList')} navigateTo="UserOptionScreen"/>
            <Utilisateur/>
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

export default UpdateUserScreen
