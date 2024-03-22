import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { apiService } from '../API/ApiService';
import {useFonts} from "expo-font"
import { ModalDeleteUser } from '../Modal/Modal';

const Utilisateur = () => {
    const [users, setUsers] = useState([]);
    const [editableUsers, setEditableUsers] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newUser, setNewUser] = useState({
         firstname: '',
          lastname: '',
          email: '',
          tel: '',
          address: '',
          role: '' 
        });

    useEffect(() => {
        console.log(editableUsers);
    }, [editableUsers]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await apiService.getAllUsers();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs :", error);
            }
        };

        fetchUsers();
    }, []);

    const handleInputChange = (userId, fieldName, value) => {
        setEditableUsers((prev) => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            [fieldName]: value === '' ? "" : value,
          },
        }));
      };
      

    const handleUpdateAllUsers = async (event) => {
        event.preventDefault();
    
        let isUpdated = false;
    
        for (const userId in editableUsers) {
            const formData = new FormData();
            const userData = editableUsers[userId];
    
            for (const key in userData) {
                formData.append(key, userData[key]);
            }
    
            try {
                const response = await apiService.updateUser(userId, formData);
                if (!response.ok) {
                    const errorData = await response.json(); // Supposons que le serveur renvoie un JSON même pour les erreurs.
                    throw new Error(`HTTP status code: ${response.status}, Message: ${errorData.message}`);
                }
                
                const data = await response.json();
                console.log('Réponse de l\'API:', data);
                
                if (data.message === 'Utilisateur mis à jour avec succès.') {
                    isUpdated = true;
                } else {
                    console.error('Erreur lors de la mise à jour de l\'utilisateur', data.message);
                }
            } catch (error) {
                console.error('Erreur lors de l\'envoi à l\'API', error);
                // Si vous souhaitez traiter l'erreur plus spécifiquement, vous pouvez ici.
            }
        }
    
        if (isUpdated) {
            alert("Modifications ajoutées avec succès");
            const updatedUsers = await apiService.getAllUsers();
            setUsers(updatedUsers);
        }
    
        setEditableUsers({});
    };

    const handleDeleteUser = async (userId) => {
        try {
            await apiService.deleteUser(userId);
            console.log('Suppression réussie');
            const updatedUsers = await apiService.getAllUsers(); // Ajout de cette ligne pour récupérer la liste mise à jour
            setUsers(updatedUsers);
            alert('Utilisateur supprimé')
            setModalVisible(false)
        } catch (error) {
            const updatedUsers = await apiService.getAllUsers(); // Ajout de cette ligne pour récupérer la liste mise à jour
            setUsers(updatedUsers);
            console.error('Erreur lors de la suppression', error.message);
        }
    };

    const handleNewUserInputChange = (name, value) => {
        setNewUser({ ...newUser, [name]: value });
    };
    
    

    const handleAddNewUser = async (event) => {
        event.preventDefault();
    
        console.log(newUser);
            
        // Formater les données dans une chaîne de requête
        const formattedData = Object.keys(newUser)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(newUser[key]))
            .join('&');
    
        try {
            const addUserResponse = await apiService.addUser(formattedData); // Envoyer la chaîne de requête
            console.log('Réponse de l\'API:', addUserResponse);
            
            // Vérifiez si l'ajout de l'utilisateur a réussi
            if (addUserResponse.success) {
                console.log('Utilisateur ajouté avec succès', addUserResponse.message);
    
                // Réinitialiser le formulaire
                setNewUser({ firstname: '', lastname: '', email: '', tel: '', address: '', role: 'User' });
    
                // Récupérer la liste mise à jour des utilisateurs
                const fetchedUsers = await apiService.getAllUsers();
                setUsers(fetchedUsers);
            } else {
                const fetchedUsers = await apiService.getAllUsers();
                setUsers(fetchedUsers);
                console.error('Erreur lors de l\'ajout de l\'utilisateur', addUserResponse.message);
            }
        } catch (error) {
            const fetchedUsers = await apiService.getAllUsers();
            setUsers(fetchedUsers);
            console.error('Erreur lors de l\'envoi à l\'API', error);
        }
    };

    console.log(users);
    return (
        <View>
            <ModalDeleteUser isVisible={modalVisible} userId={selectedUserId} handleDeleteUser={handleDeleteUser} onClose={() => setModalVisible(false)} />
            <ScrollView>
                <View style={styles.containerGlobalUsers}>
                    <View style={styles.containerListUsers}>
                        <ScrollView horizontal={true} style={styles.listUsers}>
                            {users.map((user) => {
                                console.log(user);
                                return(
                                <View style={styles.userInfo} key={user.id}>
                                    <TextInput
                                        style={styles.userInput}
                                        placeholder="Prénom"
                                        value={editableUsers[user.id]?.firstname ?? user.firstname}
                                        onChangeText={(value) => handleInputChange(user.id, 'firstname', value)}
                                    />
                                    <TextInput
                                        style={styles.userInput}
                                        placeholder="Nom"
                                        value={editableUsers[user.id]?.lastname ?? user.lastname}
                                        onChangeText={(value) => handleInputChange(user.id, 'lastname', value)}
                                    />
                                    <TextInput
                                        style={styles.userInput}
                                        placeholder="Email"
                                        value={editableUsers[user.id]?.email ?? user.email}
                                        onChangeText={(value) => handleInputChange(user.id, 'email', value)}
                                    />
                                    <TextInput
                                        style={styles.userInput}
                                        placeholder="Téléphone"
                                        value={editableUsers[user.id]?.tel.toString() ?? user.tel.toString()}
                                        onChangeText={(value) => handleInputChange(user.id, 'tel', value)}
                                        keyboardType="numeric"
                                    />

                                    <TextInput
                                        style={styles.userInput}
                                        placeholder="Adresse"
                                        value={editableUsers[user.id]?.address ?? user.address}
                                        onChangeText={(value) => handleInputChange(user.id, 'address', value)}
                                    />
                                    <TextInput
                                        style={styles.userInput}
                                        placeholder="Role"
                                        value={editableUsers[user.id]?.role ?? user.role}
                                        onChangeText={(value) => handleInputChange(user.id, 'role', value)}
                                    />
                                    <TouchableOpacity style={styles.ContainerDeleteUser} onPress={() => { setModalVisible(true); setSelectedUserId(user.id)}}>
                                        <Text style={styles.btnDeleteUser}>Supprimer</Text>
                                    </TouchableOpacity>
                                </View>)
                            })}
                        </ScrollView>
                        <TouchableOpacity style={styles.containerBtnUpdateUser} onPress={handleUpdateAllUsers}>
                                <Text style={styles.btnUpdateUser}>Mettre à jour</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.containerGlobalAddUser}>
                        <Text style={styles.titleUser}>Ajouter un nouvel utilisateur</Text>
                        <View style={styles.containerFormAddUser}>
                            <View style={styles.containerAddUserSectionTop}>
                                <TextInput
                                    style={styles.userInput}
                                    placeholder="Prénom"
                                    value={newUser.firstname}
                                    name="firstname"
                                    onChangeText={(value) => handleNewUserInputChange('firstname', value)}
                                    />
                                <TextInput
                                    style={styles.userInput}
                                    placeholder="Nom"
                                    value={newUser.lastname}
                                    name='lastname'
                                    onChangeText={(value) => handleNewUserInputChange('lastname', value)}
                                />
                                <TextInput
                                    style={styles.userInput}
                                    placeholder="Mail"
                                    name="email"
                                    value={newUser.email}
                                    onChangeText={(value) => handleNewUserInputChange('email', value)}
                                />
                                <TextInput
                                    style={styles.userInput}
                                    placeholder="Mot de passe"
                                    name="password"
                                    value={newUser.password}
                                    secureTextEntry={true}
                                    onChangeText={(value) => handleNewUserInputChange('password', value)}
                                />
                            </View>

                            <View style={styles.containerAddUserSectionBottom}>
                                <TextInput
                                    style={styles.userInput}
                                    placeholder="Téléphone"
                                    name="tel"
                                    value={newUser.tel}
                                    onChangeText={(value) => handleNewUserInputChange('tel', value)}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    style={styles.userInput}
                                    placeholder="Adresse"
                                    name="address"
                                    value={newUser.address}
                                    onChangeText={(value) => handleNewUserInputChange('address', value)}
                                />
                                <TextInput
                                    style={styles.userInput}
                                    placeholder="Role"
                                    name="role"
                                    value={newUser.role}
                                    onChangeText={(value) => handleNewUserInputChange('role', value)}
                                />
                                <TouchableOpacity style={styles.containerButtonAddUser} onPress={handleAddNewUser}>
                                    <Text style={styles.btnAddUser}>Ajouter</Text>
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
    containerListUsers:{
        height: 500
    },
    listUsers:{
        width: "100%",
        height:"auto",
    },
    userInfo:{
        width:240,
        gap: 10,
        marginLeft: 30,
        marginRight:20
    },
    userInput:{
        borderWidth: 1,
        borderColor: "#FF9A00",
        height: 40,
        width: "100%",
        borderRadius: 10,
        paddingLeft: 20 
    },
    ContainerDeleteUser:{
        backgroundColor: "red",
        display: "flex",
        justifyContent:"center",
        alignItems: 'center',
        height: 30,
        borderRadius: 10,
    },
    btnDeleteUser:{
        color: "#fff"
    },
    containerBtnUpdateUser:{
        backgroundColor:"#ff9a00",
        marginTop: 15,
        height: 30,
        width: "80%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10
    },
    btnUpdateUser:{
        color:"#fff"
    },
    containerListUsers:{
        display: "flex",
        justifyContent:'center',
        alignItems:"center"
    },
    containerGlobalAddUser:{
        height: 500,
        zIndex: -1
    }, 
    titleUser:{
        fontSize: 23,
        textAlign: "center",
        marginTop : 30,
        marginBottom: 30,
    },
    containerAddUserSectionTop:{
        gap: 10,
        width: "80%",
        display: "flex",
        justifyContent:"center",
        alignItems:"center"
    },
    containerAddUserSectionBottom:{
        gap: 10,
        marginTop: 10,
        width: "80%",
        display: "flex",
        justifyContent:"center",
        alignItems:"center"
    },
    containerFormAddUser:{
        display: "flex",
        justifyContent:"center",
        alignItems:"center"
    },
    containerButtonAddUser:{
        backgroundColor: "#ff9a00",
        height: 30,
        width: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems:"center",
        borderRadius: 10,
        marginTop: 20
    },
    btnAddUser:{
        color: "#fff",
    }
})

export default Utilisateur;
