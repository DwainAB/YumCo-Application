import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";

function LanguagePage(){
    const navigation = useNavigation();

    return(
        <View style={styles.containerLanguagePage}>
            
            <HeaderSetting name="Langage" navigateTo="SettingPage"/>

            <TouchableOpacity style={styles.containerCountry}>
                <View style={styles.containerImageCountry}>
                    <Image
                        source={require('../assets/england-flag-round-icon.png')} 
                        style={styles.image}
                    />
                </View>
                <Text style={styles.titleCountry}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.containerCountry}>
                <View style={styles.containerImageCountry}>
                    <Image
                        source={require('../assets/portugal-flag-round-icon.png')} 
                        style={styles.image}
                    />
                </View>
                <Text style={styles.titleCountry}>Português</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.containerCountry}>
                <View style={styles.containerImageCountry}>
                    <Image
                        source={require('../assets/france-flag-round-icon.png')} 
                        style={styles.image}
                    />
                </View>
                <Text style={styles.titleCountry}>Français</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.containerCountry}>
                <View style={styles.containerImageCountry}>
                    <Image
                        source={require('../assets/spain-flag-round-icon.png')} 
                        style={styles.image}
                    />
                </View>
                <Text style={styles.titleCountry}>Español</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.containerCountry}>
                <View style={styles.containerImageCountry}>
                    <Image
                        source={require('../assets/italy-flag-round-icon.png')} 
                        style={styles.image}
                    />
                </View>
                <Text style={styles.titleCountry}>Italiano</Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    containerLanguagePage:{
        height: "100%",
        backgroundColor:"#161622"
    },
    containerHeaderLanguage:{
        justifyContent: "space-between", 
        flexDirection:"row",
        marginTop : 60,
        paddingRight: 35,
        paddingLeft : 35,
        alignItems:'center',
    },
    textHeaderLanguage:{
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
    },
    containerImageCountry:{
        marginRight: 20
    },
    containerCountry:{
        marginLeft: 30,
        marginRight:30, 
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor : "#F4F4F4",
        paddingBottom: 15,
        marginBottom: 22
    }, 
    titleCountry:{
        fontSize: 18, 
        color: "white",
        fontWeight : "600"
    },
    image:{
        width: 60,
        height: 60
    }
})

export default LanguagePage
