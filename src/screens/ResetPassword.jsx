import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import HeaderSetting from '../components/HeaderSetting/HeaderSetting';
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";


const ResetPassword = () => {
    const { t } = useTranslation();
    const { colors } = useColors()
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showLastPassword, setShowLastPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('')
    const [oldPassword, setOldPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('');

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };
    const toggleLastPasswordVisibility = () => {
        setShowLastPassword(!showLastPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const updatePassword = async () => {
        try {

            if(confirmPassword  === newPassword) {
                // Récupérer l'ID de l'utilisateur depuis le stockage
                const user = await AsyncStorage.getItem("user");
                const userId = JSON.parse(user).id;
        
                // Créer un objet FormData
                const formData = new FormData();
                formData.append('oldPassword', oldPassword);
                formData.append('newPassword', newPassword);
        
                const apiUrl = `http://192.168.1.8/back-website-restaurant-1/api/users/update/${userId}`;
        
                // Envoyer la requête HTTP POST avec l'ancien et le nouveau mot de passe
                const response = await fetch(apiUrl, {
                    method: "POST",
                    body: formData, // Utilisation de FormData
                });
        
                // Traiter la réponse de l'API
                const data = await response.json();
                if (response.ok) {
                    // Succès
                    showAlertSuccess()
                    console.log("Mot de passe mis à jour avec succès :", data.message);
                    // Afficher un message à l'utilisateur (par exemple, avec un toast)
                } else {
                    // Échec
                    showAlertMissed()
                    console.error("Erreur lors de la mise à jour du mot de passe :", data.message);
                    // Afficher un message d'erreur à l'utilisateur (par exemple, avec un toast)
                }
            }else{
                showAlertNotMatchingPasswords()
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du mot de passe :", error);
            // Afficher un message d'erreur à l'utilisateur (par exemple, avec un toast)
        }
    };
    
    const showAlertSuccess = () => {
        Alert.alert(
          'Succès',
          'Votre mot de passe a été mis à jours  avec succès !',
          [
            {
              text: 'Fermer',
              onPress: () => console.log('Alerte fermée'),
              style: 'cancel',
            },
          ],
          { cancelable: true } // Permet de fermer l'alerte en touchant à l'extérieur de celle-ci
        );
      };

    const showAlertMissed = () => {
        Alert.alert(
          'Erreur',
          "L'ancien mot de passe est incorrect",
          [
            {
              text: 'Fermer',
              onPress: () => console.log('Alerte fermée'),
              style: 'cancel',
            },
          ],
          { cancelable: true } // Permet de fermer l'alerte en touchant à l'extérieur de celle-ci
        );
      };

    const showAlertNotMatchingPasswords = () => {
        Alert.alert(
          'Erreur',
          "Les deux mots de passe doivent correspondre",
          [
            {
              text: 'Fermer',
              onPress: () => console.log('Alerte fermée'),
              style: 'cancel',
            },
          ],
          { cancelable: true } // Permet de fermer l'alerte en touchant à l'extérieur de celle-ci
        );
      };

    return (
        <View style={[styles.containerResetPassword, {backgroundColor: colors.colorBackground}]}>

            <HeaderSetting name={t('changePassword')} navigateTo="SettingPage"/>

            <ScrollView>
                <View style={styles.containerGlobalUsers}>
                    <View style={styles.containerGlobalAddUser}>
                        <View style={styles.containerFormAddUser}>
                            <View style={styles.containerAddUserSectionTop}>

                                
                                <Text style={[styles.labelUser, {color: colors.colorText}]}>{t('oldPassword')}</Text>
                                <View style={styles.containerInputPassword}>
                                    <Ionicons marginRight={15} name='key-outline' size={20} color={colors.colorText}/>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="******"
                                        placeholderTextColor={colors.colorDetail}
                                        name='oldPassword'
                                        secureTextEntry={!showNewPassword}
                                        onChangeText={setOldPassword}
                                    />
                                    <TouchableOpacity style={styles.eye} onPress={toggleNewPasswordVisibility}>
                                        <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.colorText} />
                                    </TouchableOpacity>
                                </View>
                                
                                <Text style={[styles.labelUser, {color: colors.colorText}]}>{t('newPassword')}</Text>
                                <View style={styles.containerInputPassword}>
                                    <Ionicons marginRight={15} name='key-outline' size={20} color={colors.colorText}/>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="******"
                                        placeholderTextColor={colors.colorDetail}
                                        name="newPassword"
                                        secureTextEntry={!showLastPassword}
                                        onChangeText={setNewPassword}
                                    />
                                    <TouchableOpacity style={styles.eye} onPress={toggleLastPasswordVisibility}>
                                        <Ionicons name={showLastPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.colorText} />
                                    </TouchableOpacity>                                
                                </View>


                                <Text style={[styles.labelUser, {color: colors.colorText}]}>{t('confirmPassword')}</Text>
                                <View style={styles.containerInputPassword}>
                                    <Ionicons marginRight={15} name='key-outline' size={20} color={colors.colorText}/>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="******"
                                        placeholderTextColor={colors.colorDetail}
                                        name="newPassword"
                                        secureTextEntry={!showConfirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                    <TouchableOpacity style={styles.eye} onPress={toggleConfirmPasswordVisibility}>
                                        <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.colorText} />
                                    </TouchableOpacity> 
                                </View>
                                <Text style={[styles.infoPassWord, {color: colors.colorText}]}>{t('matchPassword')}</Text>


                            </View>

                            <View style={styles.containerAddUserSectionBottom}>
                                <TouchableOpacity onPress={updatePassword} style={[styles.containerButtonAddUser, {backgroundColor: colors.colorAction}]}>
                                    <Text style={styles.btnAddUser}>{t('validate')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>

    );
};

const styles = StyleSheet.create({
    containerResetPassword:{
        height: "100%",
    },
    containerGlobalUsers:{
        height: "auto"
    },
    containerInputPassword:{
        borderBottomWidth: 1,
        borderColor: "#232533",
        height: 50,
        marginBottom: 20,
        marginLeft: 30,
        marginRight: 30,
        color: "#cbcbcb",
        alignItems: "center",
        flexDirection: "row",
    },
    containerGlobalAddUser:{
        height: 500,
        zIndex: -1
    }, 
    containerButtonAddUser:{
        backgroundColor: "#0066FF",
        height: 50,
        display: "flex",
        justifyContent: "center",
        alignItems:"center",
        borderRadius: 20,
        marginTop: 20,
        marginLeft: 30,
        marginRight: 30,
    },
    btnAddUser:{
        color: "#fff",
    },
    labelUser:{
        color: '#cbcbcb',
        marginLeft: 30,
        fontSize: 16,
        marginBottom: 10
    },
    infoPassWord:{
        color: "#cbcbcb",
        marginLeft: 30,
        marginTop : -15,
        marginBottom: 30,
        fontSize: 12
    },
    passwordInput:{
        color: '#cbcbcb',
        fontSize: 16,
        width: 250
    },
    eye:{
        position:'absolute',
        right: 0,
        top: '4px'
    },

})

export default ResetPassword;
