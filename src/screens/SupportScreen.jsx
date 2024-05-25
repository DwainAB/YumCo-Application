import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; 
import imgSupport from '../assets/imgSupport.png'
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";

function SupportScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { colors } = useColors();
    const styles = useStyles();

    const handleCall = (number) => {
        Linking.openURL(`tel:${number}`);
    };

    const handleEmail = (email) => {
        Linking.openURL(`mailto:${email}`);
    };

    const handleWhatsApp = (number) => {
        Linking.openURL(`whatsapp://send?phone=${number}`);
    };

    return (
        <View style={[styles.containerSupport, {backgroundColor: colors.colorBackground}]}>
            <ScrollView>
                <View style={styles.containerScrollSupport}>
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

                    <View style={styles.containerTextInfoSupport}>
                        <Text style={[styles.textInfoSupport, {color: colors.colorDetail}]}>{t('textSupport')}</Text>
                    </View>

                    <TouchableOpacity onPress={() => handleCall('0761244284')} style={[styles.contactContainer, {backgroundColor: colors.colorBorderAndBlock}]}>
                        <View style={styles.containerIconContact}><Ionicons size={20} color={colors.colorText} name="call"/></View>
                        <Text style={[styles.coordinateText, {color: colors.colorText}]}>07 61 24 42 84</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleEmail('support@sasyumeats.com')} style={[styles.contactContainer, {backgroundColor: colors.colorBorderAndBlock}]}>
                        <View style={styles.containerIconContact}><Ionicons size={20} color={colors.colorText} name="mail"/></View>
                        <Text style={[styles.coordinateText, {color: colors.colorText}]}>support@sasyumeats.com</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleWhatsApp('0764293920')} style={[styles.contactContainer, {backgroundColor: colors.colorBorderAndBlock}]}>
                        <View style={styles.containerIconContact}><Ionicons size={20} color={colors.colorText} name="logo-whatsapp"/></View>
                        <Text style={[styles.coordinateText, {color: colors.colorText}]}>07 64 29 39 20</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

function useStyles() {
    const { width, height } = useWindowDimensions();

    return StyleSheet.create({
        containerSupport: {
            height: "100%",
            backgroundColor: "#161622"
        },
        supportImg: {
            width: "100%",
            height: (height > 750) ? 300 : 200
        },
        titleSupport: {
            fontSize: (width > 375) ? 40 : 30,
            color: "white", 
            fontWeight: "bold",
            textAlign: "center",
            position: "absolute",
            bottom: 15,
            transform: [{ translateX: -80 }], // Translate pour centrer sur l'axe horizontal
            left: '50%',
        },
        textInfoSupport: {
            color: "#A8A8A8",
            fontSize: (width > 375) ? 18 : 15,
            marginTop: 20, 
            marginBottom: (height > 750) ? 65 : 50,
            marginLeft: 30,
            marginRight: 30
        },
        containerTextInfoSupport: {
            justifyContent: "center",
            alignItems: 'center'
        },
        contactContainer: {
            backgroundColor: "#27273A",
            flexDirection: "row",
            height: (width > 375) ? 80 : 50,
            marginBottom: 15,
            marginLeft: 15,
            marginRight: 15,
            alignItems: "center"
        },
        coordinateText: {
            color: "white",
            fontSize: (width > 375) ? 18 : 15,
            marginLeft: 16
        },
        containerIconContact: {
            height: (width > 375) ? 40 : 30,
            width: (width > 375) ? 40 : 30,
            borderRadius: 20,
            backgroundColor: "#525252",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 20
        },
        containerIconBack: {
            position: "absolute",
            backgroundColor: "#1E1E2D",
            width: (width > 375) ? 45 : 35,
            height: (width > 375) ? 45 : 35,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            top: (width > 375) ? 70 : 40,
            left: 30,
            zIndex: 999
        },
        containerScrollSupport: {
            marginBottom: 100
        }
    });
}

export default SupportScreen;
