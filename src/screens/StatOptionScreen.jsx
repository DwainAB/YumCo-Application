import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useWindowDimensions } from "react-native";
import { useTranslation } from 'react-i18next';

function StatOptionScreen(){
    const navigation = useNavigation();
    const styles = useStyles()
    const { t } = useTranslation();

    return(
        <View style={styles.containerStatPage}>
            
            <HeaderSetting name={t('homeStat')} navigateTo="HomeScreen"/>

            <Text style={styles.titleStat}>{t('listOfStatistics')}</Text>

            <TouchableOpacity onPress={() => navigation.navigate('AllOrdersScreen')} style={styles.containerOptionStat}>
                <Text style={styles.textOptionStat}>{t('allCommands')}</Text>
                <Ionicons name="chevron-forward-outline" color={"#A2A2A7"} size={24} marginTop={22} marginBottom={10}/>
            </TouchableOpacity>

        </View>
    )
}

function useStyles(){
    const {width, height} = useWindowDimensions();

    return StyleSheet.create({
        containerStatPage:{
            height: "100%",
            backgroundColor: "#161622"
        },
        titleStat:{
            marginLeft: 30,
            color: "#A2A2A7",
            fontSize: (width > 375) ? 18 : 15,
            marginBottom: 30
        },
        containerOptionStat:{
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
        textOptionStat:{
            color: "white",
            fontSize: (width > 375) ? 18 : 15
        }
     
    })
    
}

export default StatOptionScreen
