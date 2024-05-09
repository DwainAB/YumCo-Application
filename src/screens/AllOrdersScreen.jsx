import React, {useState} from "react";
import { View, StyleSheet,TouchableOpacity, Text} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import AllOrders from "../components/AllOrders/AllOrders";
import { refreshOrder } from "../components/AllOrders/AllOrders";

function AllOrdersScreen(){
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { colors } = useColors()

    const [refreshCounter, setRefreshCounter] = useState(0);

    const refreshOrder = () => {
        setRefreshCounter(prevCounter => prevCounter + 1);
    };

    return(
        <View style={[styles.containerCardPage, {backgroundColor:colors.colorBackground}]}> 

            <View style={styles.containerHeader}>
                <TouchableOpacity onPress={() => navigation.navigate('StatOptionScreen')} style={[styles.containerBtnBack, {backgroundColor: colors.colorBorderAndBlock}]}><Ionicons name="chevron-back-outline" size={30} color={colors.colorText}/></TouchableOpacity>
                <Text style={[styles.textHeader, {color : colors.colorText}]}>Toutes les commandes</Text>
                <View style={styles.containerEmpty}></View>
            </View>

            <View style={styles.line}></View>

            <AllOrders onRefresh={refreshOrder} refreshCounter={refreshCounter} />

            <TouchableOpacity onPress={refreshOrder} style={[styles.containerBtnLogout, {backgroundColor: colors.colorBorderAndBlock}]}>
                <Text><Ionicons name="reload-outline" size={30} color={colors.colorText}/></Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    containerCardPage:{
        height: "100%",
        position:'relative'
    },
    containerBtnLogout:{
        position:'absolute',
        right: 30,
        bottom: 30,
        height:60,
        width: 60,
        borderRadius: 30,
        justifyContent: 'center', 
        alignItems: 'center'
    },
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

export default AllOrdersScreen
