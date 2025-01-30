import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, Alert, SafeAreaView, Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "../ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { useTranslation } from 'react-i18next';

const Utilisateur = () => {
    const { colors } = useColors();
    const styles = useStyles();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editedUser, setEditedUser] = useState(null);
    const [isModified, setIsModified] = useState(false);
    const [restaurantId, setRestaurantId]= useState('')
    const { t } = useTranslation();
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho";


    useEffect(() => {
        const fetchRestaurantId = async () => {
            try {
                const owner = await AsyncStorage.getItem("owner");
                if (!owner) {
                    throw new Error("Aucune donnée propriétaire trouvée");
                }
                const ownerData = JSON.parse(owner);
                if (!ownerData.restaurantId) {
                    throw new Error("Restaurant ID non trouvé dans les données propriétaire");
                }
                setRestaurantId(ownerData.restaurantId);
            } catch (error) {
                console.error('Erreur lors de la récupération des informations utilisateur:', error);
                Alert.alert(
                    "Erreur",
                    "Impossible de récupérer les informations du restaurant"
                );
            }
        };
        fetchRestaurantId();
    }, []); // Exécuté une seule fois au montage

    // useEffect séparé pour fetchUsers qui ne s'exécute que lorsque restaurantId change
    useEffect(() => {
        if (restaurantId) {
            fetchUsers();
        }
    }, [restaurantId]);

    const fetchUsers = async () => {
        if (!restaurantId) {
            return;
        }
        
        setIsLoading(true);
        try {
            if(!restaurantId){
                return
            }
            const response = await fetch("https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/getRestaurantUsers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                    "apikey": SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ 
                    restaurant_id: restaurantId
                })
            });
            
            // Log de la réponse brute
            const rawResponse = await response.text();
            
            if (!response.ok) {
                throw new Error(`Erreur serveur: ${response.status} - ${rawResponse}`);
            }
            
            const data = JSON.parse(rawResponse);
            
            if (data && Array.isArray(data.users)) {
                setUsers(data.users);
            } else {
                console.error('Format de données invalide:', data);
                setUsers([]);
            }
        } catch (error) {
            console.error('Erreur complète:', error);
            Alert.alert(
                "Erreur",
                error.message || "Impossible de récupérer les utilisateurs. Veuillez réessayer."
            );
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserPress = (user) => {
        setSelectedUser(user);
        setEditedUser({...user});
        setModalVisible(true);
        setIsModified(false);
    };

    const handleInputChange = (field, value) => {
        const newUser = { ...editedUser, [field]: value };
        setEditedUser(newUser);
        setIsModified(!isEqual(selectedUser, newUser));
    };

    const handleAddressChange = (field, value) => {
        const newAddress = { ...editedUser.address, [field]: value };
        const newUser = { ...editedUser, address: newAddress };
        setEditedUser(newUser);
        setIsModified(!isEqual(selectedUser, newUser));
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch("https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/updateUser", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                    "apikey": SUPABASE_ANON_KEY
                 },
                body: JSON.stringify({
                    user_id: editedUser.id,
                    first_name: editedUser.first_name,
                    last_name: editedUser.last_name,
                    email: editedUser.email,
                    phone: editedUser.phone,
                    street: editedUser.address.street,
                    city: editedUser.address.city,
                    postal_code: editedUser.address.postal_code,
                    country: editedUser.address.country,
                    type: editedUser.type,
                    restaurant_id: restaurantId
                })
            });
            
            if (response.ok) {
                Alert.alert("Succès", "Utilisateur mis à jour avec succès");
                setModalVisible(false);
                fetchUsers();
            } else {
                throw new Error('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur mise à jour:', error);
            Alert.alert("Erreur", "Erreur lors de la mise à jour");
        }
    };

    const handleDelete = async (userId) => {
        try {
            Alert.alert(
                "Confirmation",
                "Voulez-vous vraiment supprimer cet utilisateur ?",
                [
                    {
                        text: "Annuler",
                        style: "cancel"
                    },
                    {
                        text: "OK",
                        onPress: async () => {
                            const response = await fetch("https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/deleteUser", {
                                method: "POST",
                                headers: { 
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                                    "apikey": SUPABASE_ANON_KEY
                                 },
                                body: JSON.stringify({ user_id: userId })
                            });

                            if (response.ok) {
                                Alert.alert("Succès", "Utilisateur supprimé avec succès");
                                setModalVisible(false);
                                fetchUsers();
                            } else {
                                throw new Error('Erreur lors de la suppression');
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Erreur suppression:', error);
            Alert.alert("Erreur", "Erreur lors de la suppression");
        }
    };

    const getDisplayType = (type) => {
        switch(type.toLowerCase()) {
            case 'user':
                return 'UTILISATEUR';
            case 'chef':
                return 'RESPONSABLE';
            default:
                return type;
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                {isLoading ? (
                    <Text style={[styles.message, { color: colors.colorText }]}>Chargement...</Text>
                ) : users.length === 0 ? (
                    <Text style={[styles.message, { color: colors.colorText }]}>Aucun utilisateur trouvé</Text>
                ) : (
                    <View style={styles.cardsContainer}>
                        {users.map((user) => (
                            <TouchableOpacity 
                                key={user.id}
                                style={[styles.card, { 
                                    backgroundColor: colors.colorBorderAndBlock,
                                    shadowColor: colors.colorText
                                }]}
                                onPress={() => handleUserPress(user)}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardName, { color: colors.colorText }]}>
                                        {user.first_name} {user.last_name}
                                    </Text>
                                    <View style={[styles.typeTag, { backgroundColor: colors.colorAction }]}>
                                        <Text style={styles.typeText}>{getDisplayType(user.type)}</Text>
                                    </View>
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={[styles.cardText, { color: colors.colorDetail }]}>
                                        📱 {user.phone}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.colorBackground }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.colorText }]}>
                            {t('modifyUser')}
                        </Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={[styles.closeButtonText, { color: colors.colorText }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScroll}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.colorText }]}>{t('firstname')}</Text>
                            <TextInput
                                style={[styles.input, { color: colors.colorText, borderColor: colors.colorDetail }]}
                                value={editedUser?.first_name}
                                onChangeText={(value) => handleInputChange('first_name', value)}
                                placeholderTextColor={colors.colorDetail}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.colorText }]}>{t('lastname')}</Text>
                            <TextInput
                                style={[styles.input, { color: colors.colorText, borderColor: colors.colorDetail }]}
                                value={editedUser?.last_name}
                                onChangeText={(value) => handleInputChange('last_name', value)}
                                placeholderTextColor={colors.colorDetail}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.colorText }]}>{t('email')}</Text>
                            <TextInput
                                style={[styles.input, { color: colors.colorText, borderColor: colors.colorDetail }]}
                                value={editedUser?.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                keyboardType="email-address"
                                placeholderTextColor={colors.colorDetail}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.colorText }]}>{t('phone')}</Text>
                            <TextInput
                                style={[styles.input, { color: colors.colorText, borderColor: colors.colorDetail }]}
                                value={editedUser?.phone}
                                onChangeText={(value) => handleInputChange('phone', value)}
                                keyboardType="phone-pad"
                                placeholderTextColor={colors.colorDetail}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.colorText }]}>{t('street')}</Text>
                            <TextInput
                                style={[styles.input, { color: colors.colorText, borderColor: colors.colorDetail }]}
                                value={editedUser?.address?.street}
                                onChangeText={(value) => handleAddressChange('street', value)}
                                placeholderTextColor={colors.colorDetail}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.colorText }]}>{t('city')}</Text>
                            <TextInput
                                style={[styles.input, { color: colors.colorText, borderColor: colors.colorDetail }]}
                                value={editedUser?.address?.city}
                                onChangeText={(value) => handleAddressChange('city', value)}
                                placeholderTextColor={colors.colorDetail}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.colorText }]}>{t('postalCode')}</Text>
                            <TextInput
                                style={[styles.input, { color: colors.colorText, borderColor: colors.colorDetail }]}
                                value={editedUser?.address?.postal_code}
                                onChangeText={(value) => handleAddressChange('postal_code', value)}
                                keyboardType="numeric"
                                placeholderTextColor={colors.colorDetail}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.colorText }]}>{t('country')}</Text>
                            <TextInput
                                style={[styles.input, { color: colors.colorText, borderColor: colors.colorDetail }]}
                                value={editedUser?.address?.country}
                                onChangeText={(value) => handleAddressChange('country', value)}
                                placeholderTextColor={colors.colorDetail}
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.updateButton,
                                    { backgroundColor: isModified ? colors.colorAction : colors.colorDetail }
                                ]}
                                onPress={handleUpdate}
                                disabled={!isModified}
                            >
                                <Text style={styles.buttonText}>{t('editItems')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.deleteButton, { backgroundColor: colors.colorRed }]}
                                onPress={() => handleDelete(editedUser.id)}
                            >
                                <Text style={styles.buttonText}>{t('delete')}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

function useStyles() {
    const { width } = useWindowDimensions();
    const {colors} = useColors();

    return StyleSheet.create({
        container: {
            flex: 1,
        },
        cardsContainer: {
            padding: 16,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 12,
        },
        card: {
            width: '48%',
            padding: 16,
            marginBottom: 8,
            borderRadius: 16,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
        },
        cardHeader: {
            marginBottom: 12,
        },
        cardName: {
            fontSize: width > 375 ? 18 : 16,
            fontWeight: '600',
            marginBottom: 8,
        },
        typeTag: {
            alignSelf: 'flex-start',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            marginBottom: 8,
        },
        typeText: {
            color: 'white',
            fontSize: 12,
            fontWeight: '500',
        },
        cardInfo: {
            gap: 6,
        },
        cardText: {
            fontSize: width > 375 ? 14 : 13,
        },
        modalContainer: {
            flex: 1,
            width: '100%',
            height: '100%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0, 0, 0, 0.1)',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '600',
        },
        closeButton: {
            padding: 8,
        },
        closeButtonText: {
            fontSize: 24,
            fontWeight: '500',
        },
        modalScroll: {
            flex: 1,
            padding: 20,
        },
        inputGroup: {
            marginBottom: 20,
        },
        label: {
            marginBottom: 8,
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '500',
        },
        input: {
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            fontSize: width > 375 ? 16 : 14,
            backgroundColor: 'transparent',
        },
        buttonContainer: {
            flexDirection: 'column',
            gap: 12,
            marginTop: 24,
            marginBottom: Platform.OS === 'ios' ? 40 : 24,
        },
        button: {
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
        },
        updateButton: {
            width: '100%',
        },
        deleteButton: {
            width: '100%',
        },
        buttonText: {
            color: 'white',
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '600',
        },
        message: {
            textAlign: 'center',
            padding: 20,
            fontSize: 16,
        }
    });
}


const isEqual = (obj1, obj2) => {
    if (!obj1 || !obj2) return false;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
        if (key === 'address') {
            if (!isEqual(obj1[key], obj2[key])) return false;
        } else if (obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
};

export default Utilisateur;