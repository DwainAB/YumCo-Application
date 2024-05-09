import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { apiService } from '../API/ApiService';
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConfirmDialog from "../ModalAction/ModalAction";
import { useColors } from "../ColorContext/ColorContext";


const Utilisateur = () => {
    const [users, setUsers] = useState([]);
    const { colors } = useColors()
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [nameRestaurant, setNameRestaurant] = useState('')

    //Récupère le nom du restaurant et le stock dans nameRestaurant
    useEffect(() => {
        const fetchRefRestaurant = async () => {
            try {
                const user = await AsyncStorage.getItem("user");
                const userObject = JSON.parse(user); // Convertir la chaîne JSON en objet JavaScript
                const nameRestaurant = userObject.ref_restaurant; // Récupérer la valeur de ref_restaurant
                setNameRestaurant(nameRestaurant);
            } catch (error) {
                console.error('Erreur lors de la récupération de ref_restaurant depuis le stockage:', error);
            }
        };
        fetchRefRestaurant();
    }, []);

    //Récupère les utilisateurs qui ont  pour ref_restaurant la même valeur que nameRestaurant
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await apiService.getAllUsers(nameRestaurant);
                setUsers(fetchedUsers); 
            } catch (error) {
                console.error('Erreur lors de la récupération des utilisateurs:', error.message);
            }
        };

        //Appel de la fonction qui récupère les utilisateurs seulement une fois que nameRestaurant soit remplis par le nom du restaurant
        if (nameRestaurant) {
            fetchUsers();
        }
    }, [nameRestaurant]);


      

    const handleDeleteUser = async (userId) => {
        try {

            ConfirmDialog({
                title: 'Confirmation de suppression',
                message: 'Voulez-vous vraiment supprimer cette utilisateur ?',
                onConfirm: async () => {
    
    
                    await apiService.deleteUser(userId);
                    console.log('Suppression réussie');
                    const updatedUsers = await apiService.getAllUsers(nameRestaurant); // Ajout de cette ligne pour récupérer la liste mise à jour
                    setUsers(updatedUsers);
                    alert('Utilisateur supprimé avec succès !')
    
                  
                },
                onCancel: () => {
                  console.log('Suppression annulée');
                }
              });


        } catch (error) {
            const updatedUsers = await apiService.getAllUsers(nameRestaurant); // Ajout de cette ligne pour récupérer la liste mise à jour
            setUsers(updatedUsers);
            console.error('Erreur lors de la suppression', error.message);
        }
    };

    console.log(users);
    return (
        <View>
            <ScrollView>
                <View style={styles.containerGlobalUsers}>
                    <View style={styles.containerListUsers}>
                        <ScrollView style={styles.listUsers}>
                            {users.map((user) => {
                                return(
                                <View style={[styles.userInfo, {borderColor: colors.colorText}]} key={user.id}>
                                    <View style={styles.containerNameUser}>
                                        <Text style={[styles.nameUser, {color: colors.colorText}]}>{user.lastname}</Text>
                                        <Text style={[styles.nameUser, {color: colors.colorText}]}>{user.firstname}</Text>
                                    </View>
                                    <TouchableOpacity style={[styles.ContainerDeleteUser, {backgroundColor: colors.colorRed}]} onPress={() => {handleDeleteUser(user.id)}}>
                                        <Text style={[styles.btnDeleteUser, {color: colors.colorText}]}>X</Text>
                                    </TouchableOpacity>
                                </View>)
                            })}
                        </ScrollView>
                    </View>
                </View>
            </ScrollView>
        </View>

    );
};

const styles = StyleSheet.create({
    containerGlobalUsers:{
        height: 1800,
    },
    containerListUsers:{
        height: 500,
    },
    listUsers:{
        width: "100%",
        height:"auto",
    },
    userInfo:{
        gap: 10,
        marginLeft: 30,
        marginRight:20,
        flexDirection:"row",
        justifyContent: "space-between",
        marginBottom: 30,
        alignItems: "center",
        borderLeftWidth: 2,
        paddingLeft: 20
    },
    containerNameUser:{
        flexDirection: "row",
        gap: 20
    },
    nameUser:{
        fontSize: 18,
    },
    ContainerDeleteUser:{
        backgroundColor: "red",
        display: "flex",
        justifyContent:"center",
        alignItems: 'center',
        height: 50,
        borderRadius: 10,
        width: 50
    },
    containerListUsers:{
        display: "flex",
        justifyContent:'center',
        alignItems:"center"
    },
})

export default Utilisateur;
