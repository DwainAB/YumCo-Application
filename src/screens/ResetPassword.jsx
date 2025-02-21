import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import HeaderSetting from '../components/HeaderSetting/HeaderSetting';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import * as Updates from 'expo-updates';

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
   const [isUpdating, setIsUpdating] = useState(false);
   const navigation = useNavigation();

   useEffect(() => {
       getCurrentUser();
   }, []);

   const getCurrentUser = async () => {
       try {
           const { data: { user }, error } = await supabase.auth.getUser();
           if (error) throw error;
           if (user) {
               setUserEmail(user.email);
               console.log(user);
               
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

   useEffect(() => {
    let unsubscribe;
    
    if (isUpdating) {
        console.log("Configuration du listener");
        const subscription = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Événement reçu:", event);
            if (event === 'USER_UPDATED') {
                console.log("Mise à jour détectée");
                setIsUpdating(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                
                Alert.alert(
                    'Succès',
                    'Mot de passe mis à jour avec succès',
                    [{ text: 'OK',
                       onPress: async () => { 
                           // Rafraîchir l'application
                           await Updates.reloadAsync();
                       }
                     }],
                    { cancelable: false }
                );
            }
        });
        
        unsubscribe = subscription.data.unsubscribe;
    }
    
    return () => {
        if (unsubscribe) {
            console.log("Nettoyage du listener");
            unsubscribe();
        }
    };
}, [isUpdating]);


   const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
   const toggleLastPasswordVisibility = () => setShowLastPassword(!showLastPassword);
   const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

   const updatePassword = async () => {
    try {
        console.log("1. Début de la mise à jour");

        if (!userEmail) {
            Alert.alert('Erreur', 'Utilisateur non connecté');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (confirmPassword !== newPassword) {
            Alert.alert('Erreur', 'Les deux mots de passe doivent correspondre');
            return;
        }

        setIsUpdating(true); // Activer le listener
        console.log("3. Tentative de mise à jour");
        
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            setIsUpdating(false); // Désactiver le listener en cas d'erreur
            console.log("4. Erreur de mise à jour:", updateError);
            Alert.alert('Erreur', 'Ancien mot de passe incorect');
            return;
        }

    } catch (error) {
        setIsUpdating(false); // Désactiver le listener en cas d'erreur
        console.log("5. Erreur générale:", error);
        Alert.alert('Erreur', 'Une erreur inattendue est survenue');
    }
};

   return (
       <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
           <HeaderSetting name={t('changePassword')} navigateTo="SettingPage"/>
           
           <ScrollView style={styles.content}>
               <View style={[styles.formCard, { backgroundColor: colors.colorBorderAndBlock }]}>
                   {/* Ancien mot de passe */}
                   <View style={styles.inputGroup}>
                       <Text style={[styles.inputLabel, {color: colors.colorDetail}]}>
                           {t('oldPassword')}
                       </Text>
                       <View style={[styles.inputContainer, { backgroundColor: colors.colorBackground }]}>
                           <Icon name="lock-outline" size={20} color={colors.colorDetail} style={styles.inputIcon} />
                           <TextInput
                               style={[styles.input, {color: colors.colorText}]}
                               placeholder="••••••"
                               placeholderTextColor={colors.colorDetail}
                               value={oldPassword}
                               secureTextEntry={!showNewPassword}
                               onChangeText={setOldPassword}
                           />
                           <TouchableOpacity onPress={toggleNewPasswordVisibility}>
                               <Icon 
                                   name={showNewPassword ? 'eye-off' : 'eye'} 
                                   size={20} 
                                   color={colors.colorDetail} 
                               />
                           </TouchableOpacity>
                       </View>
                   </View>

                   {/* Nouveau mot de passe */}
                   <View style={styles.inputGroup}>
                       <Text style={[styles.inputLabel, {color: colors.colorDetail}]}>
                           {t('newPassword')}
                       </Text>
                       <View style={[styles.inputContainer, { backgroundColor: colors.colorBackground }]}>
                           <Icon name="key-outline" size={20} color={colors.colorDetail} style={styles.inputIcon} />
                           <TextInput
                               style={[styles.input, {color: colors.colorText}]}
                               placeholder="••••••"
                               placeholderTextColor={colors.colorDetail}
                               value={newPassword}
                               secureTextEntry={!showLastPassword}
                               onChangeText={setNewPassword}
                           />
                           <TouchableOpacity onPress={toggleLastPasswordVisibility}>
                               <Icon 
                                   name={showLastPassword ? 'eye-off' : 'eye'} 
                                   size={20} 
                                   color={colors.colorDetail} 
                               />
                           </TouchableOpacity>
                       </View>
                   </View>

                   {/* Confirmation mot de passe */}
                   <View style={styles.inputGroup}>
                       <Text style={[styles.inputLabel, {color: colors.colorDetail}]}>
                           {t('confirmPassword')}
                       </Text>
                       <View style={[styles.inputContainer, { backgroundColor: colors.colorBackground }]}>
                           <Icon name="key-outline" size={20} color={colors.colorDetail} style={styles.inputIcon} />
                           <TextInput
                               style={[styles.input, {color: colors.colorText}]}
                               placeholder="••••••"
                               placeholderTextColor={colors.colorDetail}
                               value={confirmPassword}
                               secureTextEntry={!showConfirmPassword}
                               onChangeText={setConfirmPassword}
                           />
                           <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
                               <Icon 
                                   name={showConfirmPassword ? 'eye-off' : 'eye'} 
                                   size={20} 
                                   color={colors.colorDetail} 
                               />
                           </TouchableOpacity>
                       </View>
                       <Text style={[styles.helperText, {color: colors.colorDetail}]}>
                           {t('matchPassword')}
                       </Text>
                   </View>
               </View>

               <TouchableOpacity 
                   onPress={updatePassword} 
                   style={[styles.submitButton, {backgroundColor: colors.colorAction}]}
               >
                   <Text style={styles.submitButtonText}>{t('validate')}</Text>
               </TouchableOpacity>
           </ScrollView>
       </View>
   );
};

function useStyles() {
   const {width, height} = useWindowDimensions();

   return StyleSheet.create({
       container: {
           flex: 1,
       },
       content: {
           flex: 1,
           padding: 20,
       },
       formCard: {
           borderRadius: 12,
           padding: 20,
           marginBottom: 20,
       },
       inputGroup: {
           marginBottom: 24,
       },
       inputLabel: {
           fontSize: width > 375 ? 16 : 14,
           fontWeight: '500',
           marginBottom: 8,
       },
       inputContainer: {
           flexDirection: 'row',
           alignItems: 'center',
           borderRadius: 8,
           padding: 12,
           gap: 12,
       },
       inputIcon: {
           width: 24,
       },
       input: {
           flex: 1,
           fontSize: width > 375 ? 16 : 14,
           padding: 0,
       },
       helperText: {
           fontSize: 12,
           marginTop: 8,
           opacity: 0.8,
       },
       submitButton: {
           padding: 16,
           borderRadius: 12,
           alignItems: 'center',
           marginBottom: 20,
       },
       submitButtonText: {
           color: '#FFFFFF',
           fontSize: width > 375 ? 16 : 14,
           fontWeight: '600',
       }
   });
}

export default ResetPassword;