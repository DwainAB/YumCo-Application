import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Linking, Modal } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; 
import imgSupport from '../assets/imgSupport.png';
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { Crisp } from 'react-native-crisp-chat-sdk';
import {WebView} from 'react-native-webview';
import { Dimensions } from 'react-native';

function SupportScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { colors } = useColors();
    const styles = useStyles();
    const [isWebViewVisible, setIsWebViewVisible] = useState(false);

    const handleOpenWebView = () => {
      setIsWebViewVisible(true);
    };
  
    const handleCloseWebView = () => {
      setIsWebViewVisible(false);
    };


    const handleCall = (number) => {
        Linking.openURL(`tel:${number}`);
    };

    const handleEmail = (email) => {
        Linking.openURL(`mailto:${email}`);
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
                        <Text style={[styles.coordinateText, {color: colors.colorText}]}>support@yumeats.com</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleOpenWebView} style={[styles.contactContainer, {backgroundColor: colors.colorBorderAndBlock}]}>
                        <View style={styles.containerIconContact}>
                            <Ionicons size={20} color={colors.colorText} name="chatbubbles"/>
                        </View>
                        <Text style={[styles.coordinateText, {color: colors.colorText}]}>{t('chatSupport')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                visible={isWebViewVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCloseWebView}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {/* Header pour fermer le WebView */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Support Client</Text>
                            <TouchableOpacity onPress={handleCloseWebView} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Composant WebView */}
                        <View style={styles.webViewContainer}>
                            <WebView
                                style={styles.crispChat}
                                source={{
                                    uri: "https://go.crisp.chat/chat/embed/?website_id=19a1e5ae-66ac-4dba-b611-06ede8e27e20",
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>


        </View>
    );
}

function useStyles() {
    const { width, height } = useWindowDimensions();
    const { width: screenWidth } = Dimensions.get('window');

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
            left: '50%',
            transform: [{ translateX: -70 }],
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.30,
            shadowRadius: 4.65,
            elevation: 8,
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
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'flex-end', // Modal collé en bas de l'écran
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
        },
        modalContent: {
            width: screenWidth > 768 ? '90%' : '100%', // Largeur 100% pour petits écrans, 90% pour grands
            maxWidth: 600, // Largeur maximale pour les grands écrans
            height: '90%', // Réduire la hauteur à 50% de l'écran
            backgroundColor: '#27273A',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 15,
            backgroundColor: '#27273A',
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: 'white',
        },
        closeButton: {
            padding: 10, // Zone cliquable plus grande
        },
        webViewContainer: {
            flex: 1,
            borderRadius: 10, // Ajoute un léger arrondi
            overflow: 'hidden', // Empêche le débordement
        },
        crispChat: {
            flex: 1,
            width: '100%',
            height: '100%',
        },
        
        
    });
}

export default SupportScreen;