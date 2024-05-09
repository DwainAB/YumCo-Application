import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; 
import imgSupport from '../assets/imgSupport.png'
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";

function SupportScreen(){
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { colors } = useColors()

    return(
        <View style={[styles.containerSupport, {backgroundColor: colors.colorBackground}]}>

            <View style={styles.containerImgSupport}>

                <TouchableOpacity onPress={() => navigation.navigate('SettingPage')} style={[styles.containerIconBack, {backgroundColor: colors.colorBorderAndBlock}]}>
                    <Ionicons name="chevron-back" size={20} color={colors.colorText}/>
                </TouchableOpacity>

                <Image 
                    source={imgSupport}
                    style={styles.supportImg}
                />
                <Text style={[styles.titleSupport, {color: colors.colorText}]}>{t('support')}</Text>
            </View>

            <View style={styles.containerTextInfoSupport}><Text style={[styles.textInfoSupport, {color: colors.colorDetail}]}>{t('textSupport')}</Text></View>
        
            <View style={[styles.contactContainer, {backgroundColor: colors.colorBorderAndBlock}]}>
                <View style={styles.containerIconContact}><Ionicons size={20} color={colors.colorText} name="call"/></View>
                <Text style={[styles.coordinateText, {color: colors.colorText}]}>01 23 45 67 89</Text>
            </View>

            <View style={[styles.contactContainer, {backgroundColor: colors.colorBorderAndBlock}]}>
                <View style={styles.containerIconContact}><Ionicons size={20} color={colors.colorText} name="mail"/></View>
                <Text style={[styles.coordinateText, {color: colors.colorText}]}>support@societe.fr</Text>
            </View>

            <View style={[styles.contactContainer, {backgroundColor: colors.colorBorderAndBlock}]}>
                <View style={styles.containerIconContact}><Ionicons size={20} color={colors.colorText} name="logo-whatsapp"/></View>
                <Text style={[styles.coordinateText, {color: colors.colorText}]}>06 12 34 56 78</Text>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    containerSupport:{
        height: "100%",
        backgroundColor: "#161622"
    },
    supportImg:{
        width: "100%"
    },
    titleSupport:{
        fontSize: 40,
        color: "white", 
        fontWeight: "bold",
        textAlign: "center",
        position: "absolute",
        bottom: 15,
        transform: [{ translateX: -80 }], // Translate pour centrer sur l'axe horizontal
        left: '50%',
    },
    textInfoSupport:{
        color: "#A8A8A8",
        fontSize: 18,
        marginTop: 20, 
        marginBottom: 65,
        marginLeft:30,
        marginRight:30
    },
    containerTextInfoSupport:{
        justifyContent: "center",
        alignItems:'center'
    },
    contactContainer:{
        backgroundColor: "#27273A",
        flexDirection: "row",
        height: 80,
        marginBottom: 15,
        marginLeft: 15,
        marginRight: 15,
        alignItems:"center"
    },
    coordinateText:{
        color: "white",
        fontSize: 18,
        marginLeft: 16
    },
    containerIconContact:{
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: "#525252",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 20
    },
    containerIconBack:{
        position: "absolute",
        backgroundColor: "#1E1E2D",
        width: 45,
        height: 45,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        top: 70,
        left: 30,
        zIndex: 999
    }
})

export default SupportScreen