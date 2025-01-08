import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import HeaderSetting from '../components/HeaderSetting/HeaderSetting';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { supabase } from '../lib/supabase';

const ResetPassword = () => {
    const { t } = useTranslation();
    const { colors } = useColors();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showLastPassword, setShowLastPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userEmail, setUserEmail] = useState(null);
    const styles = useStyles();

    // Récupérer l'email de l'utilisateur connecté au chargement du composant
    useEffect(() => {
        getCurrentUser();
    }, []);

    const getCurrentUser = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            if (user) {
                setUserEmail(user.email);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur:", error.message);
            Alert.alert(
                'Erreur',
                'Impossible de récupérer les informations utilisateur',
                [{ text: 'OK', style: 'cancel' }]
            );
        }
    };

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
        if (!userEmail) {
            Alert.alert('Erreur', 'Utilisateur non connecté');
            return;
        }

        try {
            // Vérification des mots de passe
            if (newPassword.length < 6) {
                Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères');
                return;
            }

            if (confirmPassword !== newPassword) {
                Alert.alert('Erreur', 'Les deux mots de passe doivent correspondre');
                return;
            }

            // Connexion avec l'ancien mot de passe
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: userEmail,
                password: oldPassword
            });

            if (signInError) {
                console.error("Erreur lors de la connexion:", signInError.message);
                Alert.alert('Erreur', "L'ancien mot de passe est incorrect");
                return;
            }

            // Mise à jour du mot de passe
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) {
                console.error("Erreur lors de la mise à jour du mot de passe:", updateError.message);
                Alert.alert('Erreur', 'Impossible de mettre à jour le mot de passe');
                return;
            }

            // Succès
            console.log('Changement de mot de passe réussi:');
            console.log('Ancien mot de passe:', oldPassword);
            console.log('Nouveau mot de passe:', newPassword);

            Alert.alert(
                'Succès',
                'Votre mot de passe a été mis à jour avec succès !',
                [{ text: 'OK', style: 'cancel' }]
            );

            // Réinitialisation des champs
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error) {
            console.error("Erreur lors de la mise à jour du mot de passe :", error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour du mot de passe');
        }
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
                                        style={[styles.passwordInput, {color: colors.colorText}]}
                                        placeholder="******"
                                        placeholderTextColor={colors.colorDetail}
                                        value={oldPassword}
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
                                        style={[styles.passwordInput, {color: colors.colorText}]}
                                        placeholder="******"
                                        placeholderTextColor={colors.colorDetail}
                                        value={newPassword}
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
                                        style={[styles.passwordInput, {color: colors.colorText}]}
                                        placeholder="******"
                                        placeholderTextColor={colors.colorDetail}
                                        value={confirmPassword}
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


function useStyles(){
    const {width, height} = useWindowDimensions();

    return StyleSheet.create({
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
            height: (width > 375) ? 50 : 40,
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
            fontSize: (width > 375) ? 16 : 14,
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
}


export default ResetPassword;
