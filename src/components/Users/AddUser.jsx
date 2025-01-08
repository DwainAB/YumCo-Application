import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';


const AddUser = () => {
    const { t } = useTranslation();
    const { colors } = useColors();
    const styles = useStyles();
    const [restaurantId, setRestaurantId] = useState('')
    const SUPABASE_ANON_KEY = Constants.expoConfig.extra.supabaseAnonKey;;

    const [newUser, setNewUser] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        postal_code: '',
        country: '',
        type: '',
    });

    useEffect(() => {
        const fetchRestaurantId = async () => {
            try {
                const owner = await AsyncStorage.getItem("owner");
                const ownerData = JSON.parse(owner);                
                setRestaurantId(ownerData.restaurantId);
                
                
            } catch (error) {
                console.error('Erreur lors de la récupération des informations utilisateur:', error);
            }
        };
        fetchRestaurantId();
    }, []);

    const handleNewUserInputChange = (name, value) => {
        setNewUser({ ...newUser, [name]: value });
    };

    const handleAddNewUser = async () => {
        const payload = {
            first_name: newUser.firstname,
            last_name: newUser.lastname,
            email: newUser.email,
            phone: newUser.phone,
            street: newUser.street,
            city: newUser.city,
            postal_code: newUser.postal_code,
            country: newUser.country,
            category: "CLIENTS",
            restaurant_id: restaurantId,
            type: newUser.type,
        };

        try {
            const response = await fetch(
                "https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/createUserWithRelations",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${SUPABASE_ANON_KEY}` 
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("Utilisateur ajouté avec succès !");
                setNewUser({
                    firstname: '',
                    lastname: '',
                    email: '',
                    phone: '',
                    street: '',
                    city: '',
                    postal_code: '',
                    country: '',
                    type: '',
                });
            } else {
                alert(`Erreur: ${data.message || "Une erreur s'est produite."}`);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi à Supabase:", error);
            alert("Une erreur s'est produite lors de l'envoi des données.");
        }
    };

    const pickerItems = [
        { label: 'ADMIN', value: 'ADMIN' },
        { label: 'UTILISATEUR', value: 'USER' },
        { label: 'RESPONSABLE', value: 'CHEF' },
    ];

    return (
        <View style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.containerFormAddUser}>
                    <Text style={[styles.labelUser, { color: colors.colorText }]}>{t('firstname')}</Text>
                    <TextInput
                        style={[styles.userInput, { color: colors.colorText, borderColor: colors.colorText }]}
                        placeholder={t('firstname')}
                        placeholderTextColor={colors.colorDetail}
                        value={newUser.firstname}
                        onChangeText={(value) => handleNewUserInputChange('firstname', value)}
                    />

                    <Text style={[styles.labelUser, { color: colors.colorText }]}>{t('lastname')}</Text>
                    <TextInput
                        style={[styles.userInput, { color: colors.colorText, borderColor: colors.colorText }]}
                        placeholder={t('lastname')}
                        placeholderTextColor={colors.colorDetail}
                        value={newUser.lastname}
                        onChangeText={(value) => handleNewUserInputChange('lastname', value)}
                    />

                    <Text style={[styles.labelUser, { color: colors.colorText }]}>{t('email')}</Text>
                    <TextInput
                        style={[styles.userInput, { color: colors.colorText, borderColor: colors.colorText }]}
                        placeholder={t('email')}
                        placeholderTextColor={colors.colorDetail}
                        value={newUser.email}
                        onChangeText={(value) => handleNewUserInputChange('email', value)}
                    />

                    <Text style={[styles.labelUser, { color: colors.colorText }]}>{t('phone')}</Text>
                    <TextInput
                        style={[styles.userInput, { color: colors.colorText, borderColor: colors.colorText }]}
                        placeholder={t('phone')}
                        placeholderTextColor={colors.colorDetail}
                        value={newUser.phone}
                        onChangeText={(value) => handleNewUserInputChange('phone', value)}
                    />

                    <Text style={[styles.labelUser, { color: colors.colorText }]}>{t('street')}</Text>
                    <TextInput
                        style={[styles.userInput, { color: colors.colorText, borderColor: colors.colorText }]}
                        placeholder={t('street')}
                        placeholderTextColor={colors.colorDetail}
                        value={newUser.street}
                        onChangeText={(value) => handleNewUserInputChange('street', value)}
                    />

                    <Text style={[styles.labelUser, { color: colors.colorText }]}>{t('city')}</Text>
                    <TextInput
                        style={[styles.userInput, { color: colors.colorText, borderColor: colors.colorText }]}
                        placeholder={t('city')}
                        placeholderTextColor={colors.colorDetail}
                        value={newUser.city}
                        onChangeText={(value) => handleNewUserInputChange('city', value)}
                    />

                    <Text style={[styles.labelUser, { color: colors.colorText }]}>{t('postalCode')}</Text>
                    <TextInput
                        style={[styles.userInput, { color: colors.colorText, borderColor: colors.colorText }]}
                        placeholder={t('postalCode')}
                        placeholderTextColor={colors.colorDetail}
                        value={newUser.postal_code}
                        onChangeText={(value) => handleNewUserInputChange('postal_code', value)}
                    />

                    <Text style={[styles.labelUser, { color: colors.colorText }]}>{t('country')}</Text>
                    <TextInput
                        style={[styles.userInput, { color: colors.colorText, borderColor: colors.colorText }]}
                        placeholder={t('country')}
                        placeholderTextColor={colors.colorDetail}
                        value={newUser.country}
                        onChangeText={(value) => handleNewUserInputChange('country', value)}
                    />

                    <Text style={[styles.labelUser, { color: colors.colorText }]}>{t('type')}</Text>
                    <RNPickerSelect
                            onValueChange={(value) => handleNewUserInputChange('type', value)}
                            items={pickerItems}
                            style={{
                                inputIOS: [styles.userInput, { 
                                    color: colors.colorText, 
                                    borderColor: colors.colorText,
                                }],
                                inputAndroid: [styles.userInput, { 
                                    color: colors.colorText, 
                                    borderColor: colors.colorText,
                                }],
                                iconContainer: {
                                    position: 'absolute',
                                    right: 40,
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }
                            }}
                            useNativeAndroidPickerStyle={false}
                            placeholder={{
                                label: t("Type d'utilisateur"),
                                value: '',
                                color: colors.colorDetail
                            }}
                            value={newUser.type}
                            Icon={() => (
                                <Ionicons 
                                    name="chevron-down"
                                    size={30}
                                    color={colors.colorText}
                                    style={{ marginRight: 0, marginTop: -15 }}
                                />
                            )}
                        />

                    <TouchableOpacity 
                        style={[styles.containerButtonAddUser, { backgroundColor: colors.colorAction }]} 
                        onPress={handleAddNewUser}
                    >
                        <Text style={styles.btnAddUser}>{t('add')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

function useStyles() {
    const { width } = useWindowDimensions();

    return StyleSheet.create({
        mainContainer: {
            flex: 1,
        },
        scrollViewContent: {
            flexGrow: 1,
            paddingBottom: 40,
        },
        containerFormAddUser: {
            paddingTop: 20,
        },
        userInput: {
            borderWidth: 1,
            height: (width > 375) ? 50 : 40,
            borderRadius: 20,
            paddingLeft: 20,
            marginBottom: 20,
            marginHorizontal: 30,
        },
        containerButtonAddUser: {
            height: (width > 375) ? 50 : 40,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 20,
            marginTop: 20,
            marginHorizontal: 30,
            marginBottom: 20,
        },
        btnAddUser: {
            color: "#fff",
        },
        labelUser: {
            marginLeft: 30,
            fontSize: (width > 375) ? 16 : 13,
            marginBottom: 10
        },
        pickerContainer: {
            marginHorizontal: 30,
            marginBottom: 20,
        },
        iconInput: {
            position: 'absolute',
            right: 0,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        }, 
        pickerWrapper: {
            position: 'relative',
            marginHorizontal: 30,
            marginBottom: 20
        },
    });
}

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        height: 50,
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 20,
        color: 'black',
        paddingRight: 30, // pour laisser de la place à l'icône
    },
    inputAndroid: {
        height: 50,
        fontSize: 16,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderWidth: 1,
        borderRadius: 20,
        color: 'black',
        paddingRight: 30, // pour laisser de la place à l'icône
    }
});

export default AddUser;