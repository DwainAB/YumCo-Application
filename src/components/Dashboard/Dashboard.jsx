import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import * as Updates from 'expo-updates';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "../ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';

function Dashboard (){
    const navigation = useNavigation(); // Obtenez l'objet de navigation
    const [storageData, setStorageData] = useState(null);
    const { colors } = useColors()
    const { t } = useTranslation();
    const [language, setLanguage] = useState(null);


    useEffect(() => {
        const getLanguageFromStorage = async () => {
            try {
                const storedLanguage = await AsyncStorage.getItem('selectedLanguage');
                if (storedLanguage !== null) {
                    setLanguage(storedLanguage);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la langue depuis AsyncStorage :", error);
            }
        };
    
        getLanguageFromStorage();
    }, []);


    useEffect(() => {
        const getStorageData = async () => {
          try {
            const keys = await AsyncStorage.getAllKeys();
            const data = await AsyncStorage.multiGet(keys);
            setStorageData(data);
          } catch (error) {
            console.error("Erreur lors de la récupération des données AsyncStorage :", error);
          }
        };
    
        getStorageData();
      }, []);

    console.log("storage dashboard: ", storageData);

    const handleRelaunchApp = async () => {
        try {
            await AsyncStorage.clear();
            console.log('Le stockage local a été effacé avec succès.');
            // Relancer l'application après avoir effacé le stockage
            Updates.reloadAsync();
          } catch (error) {
            console.error('Erreur lors de la suppression du stockage local :', error);
          }
    };

    return(
        <View style={styles.containerSetting}>
            <View style={styles.containerHeaderSetting}>
                <View style={styles.containerEmpty}></View>
                <Text style={[styles.textHeaderSetting, { color: colors.colorText }]}>{t('titleSetting')}</Text>
                <TouchableOpacity style={[styles.containerBtnLogout, {backgroundColor: colors.colorBorderAndBlock}]} onPress={handleRelaunchApp}><Ionicons name="log-out-outline" size={30} color={colors.colorText}/></TouchableOpacity>
            </View>
            <ScrollView style={styles.containerSettingScroll}>

                <View style={styles.containerMenuSetting}>

                    <View style={styles.containerCategorySetting}>
                        <Text style={[styles.titleCategorySetting, {color: colors.colorDetail}]}>{t('general')}</Text>
                        <TouchableOpacity style={styles.containerBtnSetting} onPress={() => navigation.navigate('LanguagePage')}><Text style={[styles.textBtnSetting, {color: colors.colorText}]}>{t('language')}</Text><View style={styles.langageSelect}><Text style={[styles.textLangageSelect, {color: colors.colorDetail}]}>{language ? language : "Français"}</Text><Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/></View></TouchableOpacity>
                        <TouchableOpacity style={styles.containerBtnSetting} onPress={() => navigation.navigate('Personalization')}><Text style={[styles.textBtnSetting, {color: colors.colorText}]}>{t('personalization')}</Text><Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                        <TouchableOpacity style={styles.containerBtnSetting} onPress={()=> navigation.navigate('SupportScreen')}><Text style={[styles.textBtnSetting, {color: colors.colorText}]}>{t('support')}</Text><Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                    </View>

                    <View style={styles.containerCategorySetting}>
                        <Text style={[styles.titleCategorySetting, {color: colors.colorDetail}]}>{t('myRestaurant')}</Text>
                        <TouchableOpacity style={styles.containerBtnSetting} onPress={() => navigation.navigate('CardOptionScreen')}><Text style={[styles.textBtnSetting, {color: colors.colorText}]}>{t('cards')}</Text><Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                        <TouchableOpacity style={styles.containerBtnSetting} onPress={() => navigation.navigate('UserOptionScreen')}><Text style={[styles.textBtnSetting, {color: colors.colorText}]}>{t('users')}</Text><Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                        <TouchableOpacity style={styles.containerBtnSetting}><Text style={[styles.textBtnSetting, {color: colors.colorText}]}>{t('hourly')}</Text><Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                    </View>

                    <View style={styles.containerCategorySetting}>
                        <Text style={[styles.titleCategorySetting, {color: colors.colorDetail}]}>{t('security')}</Text>
                        <TouchableOpacity style={styles.containerBtnSetting} onPress={()=> navigation.navigate('ResetPassword')}><Text style={[styles.textBtnSetting, {color: colors.colorText}]}>{t('changePassword')}</Text><Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                        <TouchableOpacity style={styles.containerBtnSetting} onPress={()=> navigation.navigate('PolityPrivacy')}><Text style={[styles.textBtnSetting, {color: colors.colorText}]}>{t('privacyPolicy')}</Text><Ionicons name="chevron-forward-outline" color={colors.colorDetail} size={24} marginTop={22} marginBottom={10}/></TouchableOpacity>
                    </View>

                </View>

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    containerSetting:{
        flex:1,
    },
    containerHeaderSetting:{
        justifyContent: "space-between", 
        flexDirection:"row",
        marginTop : 60,
        paddingRight: 35,
        paddingLeft : 35,
        alignItems:'center',
    },
    textHeaderSetting:{
        fontSize: 22,
        color: "white",
    },
    containerBtnLogout:{
        height:45,
        width: 45,
        alignItems: "center",
        borderRadius: 50,
        backgroundColor: "#1E1E2D",
        justifyContent: "center",
        paddingLeft: 5
    },
    containerEmpty:{
        width: "10%",
    },
    containerCategorySetting:{
        marginLeft: 20,
        marginRight: 20,
        marginTop: 30
    },
    titleCategorySetting:{
        color: "#A2A2A7",
        fontSize: 18,
        marginBottom: 0
    },
    containerBtnSetting:{
        borderBottomWidth: 1,
        borderColor: "#232533",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
    },
    textBtnSetting:{
        color: "white",
        fontSize: 18,
        marginBottom: 10,
        marginTop: 20
    },
    langageSelect:{
        flexDirection: "row",
        alignItems: "center"
    },
    textLangageSelect:{
        color: "#A2A2A7",
        fontSize: 18,
        marginBottom: 10,
        marginTop: 20,
        marginRight: 10
    },
    containerMenuSetting:{
        marginBottom: 100
    }
})

export default Dashboard;
