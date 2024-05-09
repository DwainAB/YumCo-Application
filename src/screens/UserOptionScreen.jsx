import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";

function UserOptionScreen(){
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { colors } = useColors()

    return(
        <View style={[styles.containerUserPage, {backgroundColor: colors.colorBackground}]}>
            
            <HeaderSetting name={t('users')} navigateTo="SettingPage"/>

            <Text style={[styles.titleUser, {color: colors.colorDetail}]}>{t('userManagement')}</Text>

            <TouchableOpacity onPress={() => navigation.navigate('AddUserScreen')} style={styles.containerOptionUser}>
                <Text style={[styles.textOptionUser, {color: colors.colorText}]}>{t('addUser')}</Text>
                <Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('UpdateUserScreen')} style={styles.containerOptionUser}>
                <Text style={[styles.textOptionUser, {color: colors.colorText}]}>{t('userList')}</Text>
                <Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    containerUserPage:{
        height: "100%",
    },
    titleUser:{
        marginLeft: 30,
        color: "#A2A2A7",
        fontSize: 18,
        marginBottom: 30
    },
    containerOptionUser:{
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
    textOptionUser:{
        color: "white",
        fontSize: 18
    }
 
})

export default UserOptionScreen
