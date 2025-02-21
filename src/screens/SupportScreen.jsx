import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
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
       <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
           <View style={styles.header}>
               <TouchableOpacity 
                   onPress={() => navigation.navigate('SettingPage')} 
                   style={[styles.backButton, {backgroundColor: colors.colorBorderAndBlock}]}
               >
                   <Icon name="chevron-left" size={24} color={colors.colorText}/>
               </TouchableOpacity>
               <Text style={[styles.title, {color: colors.colorText}]}>{t('support')}</Text>
           </View>

           <ScrollView style={styles.content}>
               <View style={styles.buttonsContainer}>
                   {/* Bouton Téléphone */}
                   <TouchableOpacity 
                       onPress={() => handleCall('0650536385')}
                       style={[styles.supportButton, {backgroundColor: colors.colorBorderAndBlock}]}
                   >
                       <View style={styles.buttonContent}>
                           <Icon name="phone" size={24} color="#4ECDC4" />
                           <View style={styles.buttonTextContainer}>
                               <Text style={[styles.buttonTitle, {color: colors.colorText}]}>{t('phone_support')}</Text>
                               <Text style={[styles.buttonSubtitle, {color: colors.colorDetail}]}>06 50 53 63 85</Text>
                           </View>
                       </View>
                   </TouchableOpacity>

                   {/* Bouton Email */}
                   <TouchableOpacity 
                       onPress={() => handleEmail('support@yumco.fr')}
                       style={[styles.supportButton, {backgroundColor: colors.colorBorderAndBlock}]}
                   >
                       <View style={styles.buttonContent}>
                           <Icon name="email" size={24} color="#FF6B6B" />
                           <View style={styles.buttonTextContainer}>
                               <Text style={[styles.buttonTitle, {color: colors.colorText}]}>{t('email_us')}</Text>
                               <Text style={[styles.buttonSubtitle, {color: colors.colorDetail}]}>support@yumco.fr</Text>
                           </View>
                       </View>
                   </TouchableOpacity>

                   {/* Bouton Chat */}
                   <TouchableOpacity 
                       onPress={handleOpenWebView}
                       style={[styles.supportButton, {backgroundColor: colors.colorBorderAndBlock}]}
                   >
                       <View style={styles.buttonContent}>
                           <Icon name="message-processing" size={24} color="#6C5CE7" />
                           <View style={styles.buttonTextContainer}>
                               <Text style={[styles.buttonTitle, {color: colors.colorText}]}>{t('chat_with_us')}</Text>
                               <Text style={[styles.buttonSubtitle, {color: colors.colorDetail}]}>{t('live_chat')}</Text>
                           </View>
                       </View>
                   </TouchableOpacity>
               </View>

               <View style={[styles.scheduleSection, {backgroundColor: colors.colorBorderAndBlock}]}>
                   <Text style={[styles.scheduleTitle, {color: colors.colorDetail}]}>{t('support_hours')}</Text>
                   <Text style={[styles.scheduleText, {color: colors.colorText}]}>
                       {t('support_availability')}
                   </Text>
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
                       <View style={styles.modalHeader}>
                           <Text style={styles.modalTitle}>Support Client</Text>
                           <TouchableOpacity onPress={handleCloseWebView} style={styles.closeButton}>
                               <Icon name="close" size={24} color="white" />
                           </TouchableOpacity>
                       </View>

                       <View style={styles.webViewContainer}>
                           <WebView
                               style={styles.crispChat}
                               source={{
                                   uri: "https://go.crisp.chat/chat/embed/?website_id=ab2d4e41-5eb7-471d-abad-7130eea312a3",
                               }}
                               injectedJavaScript={`
                                   window.$crisp = [];
                                   window.CRISP_RUNTIME_CONFIG = {
                                       do_not_track: true,
                                       disable_geolocation: true
                                   };
                                   true;  
                               `}
                               geolocationEnabled={false}
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
       container: {
           flex: 1,
       },
       header: {
           flexDirection: 'row',
           alignItems: 'center',
           paddingHorizontal: 20,
           paddingTop: height > 750 ? 60 : 40,
           marginBottom: 30,
       },
       backButton: {
           width: 40,
           height: 40,
           borderRadius: 20,
           alignItems: 'center',
           justifyContent: 'center',
           marginRight: 15,
       },
       title: {
           fontSize: width > 375 ? 24 : 20,
           fontWeight: '600',
       },
       content: {
           flex: 1,
           paddingHorizontal: 20,
       },
       buttonsContainer: {
           gap: 16,
           marginBottom: 30,
       },
       supportButton: {
           borderRadius: 12,
           padding: 16,
       },
       buttonContent: {
           flexDirection: 'row',
           alignItems: 'center',
           gap: 16,
       },
       buttonTextContainer: {
           flex: 1,
       },
       buttonTitle: {
           fontSize: width > 375 ? 16 : 14,
           fontWeight: '500',
           marginBottom: 4,
       },
       buttonSubtitle: {
           fontSize: width > 375 ? 14 : 12,
       },
       scheduleSection: {
           padding: 20,
           borderRadius: 12,
       },
       scheduleTitle: {
           fontSize: width > 375 ? 18 : 16,
           fontWeight: '600',
           marginBottom: 12,
       },
       scheduleText: {
           fontSize: width > 375 ? 15 : 13,
           lineHeight: 22,
       },
       modalContainer: {
           flex: 1,
           justifyContent: 'flex-end',
           backgroundColor: 'rgba(0, 0, 0, 0.5)',
       },
       modalContent: {
           width: screenWidth > 768 ? '90%' : '100%',
           maxWidth: 600,
           height: '90%',
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
           padding: 10,
       },
       webViewContainer: {
           flex: 1,
           borderRadius: 10,
           overflow: 'hidden',
       },
       crispChat: {
           flex: 1,
           width: '100%',
           height: '100%',
       },
   });
}

export default SupportScreen;