import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, Alert, SafeAreaView, Platform, Linking } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "../ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { useTranslation } from 'react-i18next';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { supabase } from '../../lib/supabase';
import { API_CONFIG } from '../../config/constants';
import { safeJSONParse } from '../../utils/storage';

const Utilisateur = () => {
   const { colors } = useColors();
   const styles = useStyles();
   const [users, setUsers] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [modalVisible, setModalVisible] = useState(false);
   const [selectedUser, setSelectedUser] = useState(null);
   const [editedUser, setEditedUser] = useState(null);
   const [isModified, setIsModified] = useState(false);
   const [restaurantId, setRestaurantId]= useState('');
   const [userId, setUserId] = useState('');
   const [userRole, setUserRole] = useState('USER');

   const { t } = useTranslation();

   useEffect(() => {
       const fetchRestaurantId = async () => {
           try {
               const owner = await AsyncStorage.getItem("owner");
               if (!owner) throw new Error("Aucune donnée propriétaire trouvée");
               const ownerData = safeJSONParse(owner);
               if (!ownerData.restaurantId) throw new Error("Restaurant ID non trouvé");
               setUserId(ownerData.id);
               setRestaurantId(ownerData.restaurantId);

               // Récupérer le rôle de l'utilisateur connecté
                if (ownerData.id && ownerData.restaurantId) {
                    const { data, error } = await supabase
                        .from('roles')
                        .select('type')
                        .eq('owner_id', ownerData.id)
                        .eq('restaurant_id', ownerData.restaurantId)
                        .single();
                    
                    if (error) {
                        console.error('Erreur lors de la récupération du rôle:', error);
                    } else if (data) {
                        setUserRole(data.type);
                        console.log('Rôle utilisateur:', data.type);
                    }
                }
           } catch (error) {
               console.error('Erreur récupération infos:', error);
               Alert.alert("Erreur", "Impossible de récupérer les informations du restaurant");
           }
       };
       fetchRestaurantId();
   }, []);

   useEffect(() => {
       if (restaurantId) {
           fetchUsers();
       }
   }, [restaurantId]);

   const fetchUsers = async () => {
       if (!restaurantId) return;
       setIsLoading(true);
       try {
           const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/getRestaurantUsers`, {
               method: "POST",
               headers: {
                   "Content-Type": "application/json",
                   "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
                   "apikey": SUPABASE_ANON_KEY
               },
               body: JSON.stringify({ restaurant_id: restaurantId })
           });
           
           const rawResponse = await response.text();
           if (!response.ok) throw new Error(`Erreur serveur: ${response.status} - ${rawResponse}`);
           const data = safeJSONParse(rawResponse);
           
           if (data?.users) setUsers(data.users);
           else {
               console.error('Format invalide:', data);
               setUsers([]);
           }
       } catch (error) {
           console.error('Erreur:', error);
           Alert.alert("Erreur", "Impossible de récupérer les utilisateurs");
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
           const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/updateUser`, {
               method: "POST",
               headers: { 
                   "Content-Type": "application/json",
                   "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
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
           } else throw new Error('Erreur lors de la mise à jour');
       } catch (error) {
           console.error('Erreur mise à jour:', error);
           Alert.alert("Erreur", "Erreur lors de la mise à jour");
       }
   };

   const handleDelete = async (userId) => {
       Alert.alert(
           "Confirmation",
           "Voulez-vous vraiment supprimer cet utilisateur ?",
           [
               { text: "Annuler", style: "cancel" },
               {
                   text: "OK",
                   onPress: async () => {
                       try {
                           const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/deleteUser`, {
                               method: "POST",
                               headers: { 
                                   "Content-Type": "application/json",
                                   "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
                                   "apikey": SUPABASE_ANON_KEY
                               },
                               body: JSON.stringify({ user_id: userId })
                           });

                           if (response.ok) {
                               Alert.alert("Succès", "Utilisateur supprimé avec succès");
                               setModalVisible(false);
                               fetchUsers();
                           } else throw new Error('Erreur lors de la suppression');
                       } catch (error) {
                           console.error('Erreur suppression:', error);
                           Alert.alert("Erreur", "Erreur lors de la suppression");
                       }
                   }
               }
           ]
       );
   };

   const handleCall = (user) => {
       Alert.alert(
           "Confirmation",
           `Voulez-vous appeler ${user.first_name} ${user.last_name} ?`,
           [
               { text: "Annuler", style: "cancel" },
               { text: "Appeler", onPress: () => Linking.openURL(`tel:${user.phone}`) }
           ]
       );
   };

   const getDisplayType = (type) => {
       switch(type.toLowerCase()) {
           case 'user': return 'UTILISATEUR';
           case 'chef': return 'RESPONSABLE';
           default: return type;
       }
   };

   const renderUserCard = (user) => (
       <View key={user.id} style={[styles.card, { backgroundColor: colors.colorBorderAndBlock }]}>
           <View style={styles.cardLeft}>
               <Icon name="account-circle" size={40} color={colors.colorDetail} />
               <View style={styles.userInfo}>
                   <Text style={[styles.userName, { color: colors.colorText }]}>
                       {user.first_name} {user.last_name}
                   </Text>
                   <Text style={[styles.userRole, { color: colors.colorAction }]}>
                       {getDisplayType(user.type)}
                   </Text>
                   <Text style={[styles.userPhone, { color: colors.colorDetail }]}>
                       {user.phone}
                   </Text>
               </View>
           </View>
           
           <View style={styles.cardButtons}>
                <TouchableOpacity 
                    style={[styles.cardButton, { backgroundColor: colors.colorAction }]}
                    onPress={() => handleCall(user)}
                >
                    <Icon name="phone" size={20} color="white" />
                    <Text style={styles.buttonText}>{t('call')}</Text>
                </TouchableOpacity>
                
                {(userRole === 'CHEF' || userRole === 'ADMIN') && (
                    <TouchableOpacity 
                        style={[styles.cardButton, { backgroundColor: colors.colorBorderAndBlock }]}
                        onPress={() => handleUserPress(user)}
                    >
                        <Icon name="pencil" size={20} color={colors.colorText} />
                        <Text style={[styles.buttonText, { color: colors.colorText }]}>{t('edit')}</Text>
                    </TouchableOpacity>
                )}
            </View>
       </View>
   );

   return (
       <View style={styles.container}>
           <ScrollView>
               {isLoading ? (
                   <Text style={[styles.message, { color: colors.colorText }]}>Chargement...</Text>
               ) : users.length === 0 ? (
                   <Text style={[styles.message, { color: colors.colorText }]}>Aucun utilisateur trouvé</Text>
               ) : (
                   <View style={styles.cardsContainer}>
                       {users.map(renderUserCard)}
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
                           {t('edit_user')}
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
                           <Text style={[styles.label, { color: colors.colorText }]}>{t('first_name')}</Text>
                           <TextInput
                               style={[styles.input, { 
                                   color: colors.colorText, 
                                   borderColor: colors.colorDetail,
                                   backgroundColor: colors.colorBorderAndBlock
                               }]}
                               value={editedUser?.first_name}
                               onChangeText={(value) => handleInputChange('first_name', value)}
                               placeholderTextColor={colors.colorDetail}
                           />
                       </View>

                       <View style={styles.inputGroup}>
                           <Text style={[styles.label, { color: colors.colorText }]}>{t('last_name')}</Text>
                           <TextInput
                               style={[styles.input, { 
                                   color: colors.colorText, 
                                   borderColor: colors.colorDetail,
                                   backgroundColor: colors.colorBorderAndBlock
                               }]}
                               value={editedUser?.last_name}
                               onChangeText={(value) => handleInputChange('last_name', value)}
                               placeholderTextColor={colors.colorDetail}
                           />
                       </View>

                       <View style={styles.inputGroup}>
                           <Text style={[styles.label, { color: colors.colorText }]}>{t('email')}</Text>
                           <TextInput
                               style={[styles.input, { 
                                   color: colors.colorText, 
                                   borderColor: colors.colorDetail,
                                   backgroundColor: colors.colorBorderAndBlock
                               }]}
                               value={editedUser?.email}
                               onChangeText={(value) => handleInputChange('email', value)}
                               keyboardType="email-address"
                               placeholderTextColor={colors.colorDetail}
                           />
                       </View>

                       <View style={styles.inputGroup}>
                           <Text style={[styles.label, { color: colors.colorText }]}>{t('phone')}</Text>
                           <TextInput
                               style={[styles.input, { 
                                   color: colors.colorText, 
                                   borderColor: colors.colorDetail,
                                   backgroundColor: colors.colorBorderAndBlock
                               }]}
                               value={editedUser?.phone}
                               onChangeText={(value) => handleInputChange('phone', value)}
                               keyboardType="phone-pad"
                               placeholderTextColor={colors.colorDetail}
                           />
                       </View>

                       <View style={styles.inputGroup}>
                           <Text style={[styles.label, { color: colors.colorText }]}>{t('street')}</Text>
                           <TextInput
                               style={[styles.input, { 
                                   color: colors.colorText, 
                                   borderColor: colors.colorDetail,
                                   backgroundColor: colors.colorBorderAndBlock
                               }]}
                               value={editedUser?.address?.street}
                               onChangeText={(value) => handleAddressChange('street', value)}
                               placeholderTextColor={colors.colorDetail}
                           />
                       </View>

                       <View style={styles.inputGroup}>
                           <Text style={[styles.label, { color: colors.colorText }]}>{t('city')}</Text>
                           <TextInput
                               style={[styles.input, { 
                                   color: colors.colorText, 
                                   borderColor: colors.colorDetail,
                                   backgroundColor: colors.colorBorderAndBlock
                               }]}
                               value={editedUser?.address?.city}
                               onChangeText={(value) => handleAddressChange('city', value)}
                               placeholderTextColor={colors.colorDetail}
                           />
                       </View>

                       <View style={styles.inputGroup}>
                           <Text style={[styles.label, { color: colors.colorText }]}>{t('postal_Code')}</Text>
                           <TextInput
                               style={[styles.input, { 
                                   color: colors.colorText, 
                                   borderColor: colors.colorDetail,
                                   backgroundColor: colors.colorBorderAndBlock
                               }]}
                               value={editedUser?.address?.postal_code}
                               onChangeText={(value) => handleAddressChange('postal_code', value)}
                               keyboardType="numeric"
                               placeholderTextColor={colors.colorDetail}
                           />
                       </View>

                       <View style={styles.inputGroup}>
                           <Text style={[styles.label, { color: colors.colorText }]}>{t('country')}</Text>
                           <TextInput
                               style={[styles.input, { 
                                   color: colors.colorText, 
                                   borderColor: colors.colorDetail,
                                   backgroundColor: colors.colorBorderAndBlock
                               }]}
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
   const { colors } = useColors();

   return StyleSheet.create({
       container: {
           flex: 1,
       },
       cardsContainer: {
           padding: 16,
       },
       card: {
           marginHorizontal: 20,
           marginBottom: 12,
           padding: 16,
           borderRadius: 12,
       },
       cardLeft: {
           flexDirection: 'row',
           alignItems: 'center',
           marginBottom: 16,
       },
       userInfo: {
           marginLeft: 12,
       },
       userName: {
           fontSize: width > 375 ? 18 : 16,
           fontWeight: '600',
           marginBottom: 4,
       },
       userRole: {
           fontSize: 14,
           fontWeight: '500',
           marginBottom: 4,
       },
       userPhone: {
           fontSize: 14,
       },
       cardButtons: {
           flexDirection: 'row',
           gap: 12,
       },
       cardButton: {
           flex: 1,
           flexDirection: 'row',
           alignItems: 'center',
           justifyContent: 'center',
           gap: 8,
           padding: 12,
           borderRadius: 8,
       },
       buttonText: {
           color: 'white',
           fontSize: 14,
           fontWeight: '500',
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