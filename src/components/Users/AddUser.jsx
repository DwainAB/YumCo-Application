import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { apiService } from '../API/ApiService';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";

const AddUser = () => {
    const { t } = useTranslation();
    const { colors } = useColors()
    const [newUser, setNewUser] = useState({
         firstname: '',
          lastname: '',
          email: '',
          password: '',
          ref_restaurant: '',
          place_id:'',
          address: '',
          tel: '',
          role: ''
        });


        
    useEffect(() => {
        async function fetchRefRestaurant() {
            try {
                const user = await AsyncStorage.getItem("user");
                console.log(user);
                const refRestaurant = JSON.parse(user).ref_restaurant;
                const placeId = JSON.parse(user).place_id
                setNewUser(prevState => ({ ...prevState, ref_restaurant: refRestaurant }));
                setNewUser(prevState => ({ ...prevState, place_id: placeId }));
            } catch (error) {
                console.error('Erreur lors de la récupération de ref_restaurant depuis le stockage:', error);
            }
        }      
        fetchRefRestaurant();
    }, []);

    const handleNewUserInputChange = (name, value) => {
        setNewUser({ ...newUser, [name]: value });
    };
       

    const handleAddNewUser = async (event) => {
        event.preventDefault();
    
        // Créer un nouvel objet FormData
        const formData = new FormData();
        formData.append('ref_restaurant', newUser.ref_restaurant);
        formData.append('place_id', newUser.place_id);
        formData.append('firstname', newUser.firstname);
        formData.append('lastname', newUser.lastname);
        formData.append('email', newUser.email);
        formData.append('password', newUser.password);
        formData.append('address', newUser.address);
        formData.append('tel', newUser.tel);
        formData.append('role', newUser.role);
    
        try {
            const addUserResponse = await apiService.addUser(formData, { timeout: 10000 }); // Augmentez le délai d'attente à 10 secondes
            console.log('Réponse de l\'API:', addUserResponse);
    
            // Vérifier si l'ajout de l'utilisateur a réussi
            if (addUserResponse.success) {
                alert("Utilisateur ajouté avec succès, un mail d'information a été envoyé !")
                console.log('Utilisateur ajouté avec succès', addUserResponse.message);
    
                // Réinitialiser le formulaire
                setNewUser({ firstname: '', lastname: '', email: '', password: '', ref_restaurant: '' });
            } else {
                console.error('Erreur lors de l\'ajout de l\'utilisateur', addUserResponse.message);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi à l\'API:', error.message);
        }
    };
    

    return (
        <View>
            <ScrollView>
                <View style={styles.containerGlobalUsers}>
                    <View style={styles.containerGlobalAddUser}>
                        <View style={styles.containerFormAddUser}>
                            <View style={styles.containerAddUserSectionTop}>

                                
                                <Text style={[styles.labelUser, {color: colors.colorText}]}>{t('firstname')}</Text>
                                <TextInput
                                    style={[styles.userInput, {color: colors.colorText, borderColor: colors.colorText}]}
                                    placeholder={t('firstname')}
                                    placeholderTextColor={colors.colorDetail}
                                    value={newUser.lastname}
                                    name='lastname'
                                    onChangeText={(value) => handleNewUserInputChange('lastname', value)}
                                />
                                
                                <Text style={[styles.labelUser, {color: colors.colorText}]}>{t('lastname')}</Text>
                                <TextInput
                                    style={[styles.userInput, {color: colors.colorText, borderColor: colors.colorText}]}
                                    placeholder={t('lastname')}
                                    placeholderTextColor={colors.colorDetail}
                                    value={newUser.firstname}
                                    name="firstname"
                                    onChangeText={(value) => handleNewUserInputChange('firstname', value)}
                                    />

                                <Text style={[styles.labelUser, {color: colors.colorText}]}>{t('email')}</Text>
                                <TextInput
                                    style={[styles.userInput, {color: colors.colorText, borderColor: colors.colorText}]}
                                    placeholder={t('email')}
                                    placeholderTextColor={colors.colorDetail}
                                    name="email"
                                    value={newUser.email}
                                    onChangeText={(value) => handleNewUserInputChange('email', value)}
                                />

                                <Text style={[styles.labelUser, {color: colors.colorText}]}>{t('password')}</Text>
                                <TextInput
                                    style={[styles.userInput, {color: colors.colorText, borderColor: colors.colorText}]}
                                    placeholder={t('password')}
                                    placeholderTextColor={colors.colorDetail}
                                    name="password"
                                    value={newUser.password}
                                    secureTextEntry={true}
                                    onChangeText={(value) => handleNewUserInputChange('password', value)}
                                />
                            </View>

                            <View style={styles.containerAddUserSectionBottom}>
                                <TouchableOpacity style={[styles.containerButtonAddUser, {backgroundColor: colors.colorAction}]} onPress={handleAddNewUser}>
                                    <Text style={styles.btnAddUser}>{t('add')}</Text>
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
    containerGlobalUsers:{
        height: 1800
    },
    userInput:{
        borderWidth: 1,
        height: 50,
        borderRadius: 20,
        paddingLeft: 20,
        marginBottom: 20,
        marginLeft: 30,
        marginRight: 30,
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
    }
})

export default AddUser;
