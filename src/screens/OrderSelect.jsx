import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRoute } from '@react-navigation/native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "../components/ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

function OrderSelectData() {
  const navigation = useNavigation();
  const { colors } = useColors();
  const route = useRoute();
  const { order } = route.params;
  const { t } = useTranslation();
  const styles = useStyles();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localOrder, setLocalOrder] = useState(order);
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho";

  const getAllStorageKeys = async () => {
    try {
      // Récupérer toutes les clés
      const keys = await AsyncStorage.getAllKeys();
      //console.log('🔑 Toutes les clés présentes dans le storage:', keys);
  
      // Récupérer toutes les paires clé-valeur
      const result = await AsyncStorage.multiGet(keys);
      //console.log('📦 Contenu complet du storage:');
      
      // Afficher chaque paire clé-valeur de manière formatée
      result.forEach(([key, value]) => {
        try {
          const parsedValue = JSON.parse(value);
          console.log(`\n🔸 Clé: ${key}`);
          console.log('📄 Valeur:', parsedValue);
        } catch (e) {
          console.log(`\n🔸 Clé: ${key}`);
          console.log('📄 Valeur:', value);
        }
      });
  
      // Récupération des données utilisateur depuis la clé "owner" au lieu de "user"
      const userDataFromStorage = await AsyncStorage.getItem('owner');
      if (userDataFromStorage) {
        const parsedUserData = JSON.parse(userDataFromStorage);
        console.log('\n👤 Données utilisateur détaillées:', parsedUserData);
        setUserData(parsedUserData);
      } else {
        console.log('\n❌ Aucune donnée utilisateur trouvée');
      }
  
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du storage:', error);
    }
  };

  console.log('rst', userData);
  

  useEffect(() => {
    getAllStorageKeys();
  }, []);

  const handlePrepare = async () => {
    if (!userData?.id) {
      console.error("ID utilisateur non trouvé");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/update_preparing_by', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          order_id: localOrder.order_id,
          preparing_by: userData.id
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Mettre à jour l'état local
      setLocalOrder({
        ...localOrder,
        preparing_by: userData.id
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cette commande ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const updateResponse = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/updateOrder', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                  order_id: localOrder.order_id,
                  new_status: "COMPLETED"
                })
              });
          
              if (!updateResponse.ok) {
                throw new Error('Erreur lors de la mise à jour du statut');
              }
          
              alert(t('alertDeleteOrder'));
              navigation.navigate("BasketScreen", { 
                triggerRefresh: Date.now() 
              });
              
            } catch (error) {
              console.error('Erreur lors de la mise à jour du statut:', error);
              alert('Erreur lors de la mise à jour de la commande');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, {backgroundColor: colors.colorBorderAndBlock}]}
        >
          <Icon name="chevron-left" size={24} color={colors.colorText} />
        </TouchableOpacity>
        <View style={styles.orderRefContainer}>
          <Text style={[styles.orderRef, {color: colors.colorText}]}>
            {localOrder.client_ref_order}
          </Text>
          <Icon 
            name={localOrder.client_method === "Livraison" ? "bike-fast" : "shopping-outline"} 
            size={24} 
            color={colors.colorAction} 
          />
          <Text style={[styles.orderStatus, {
            color: localOrder.payment_status === "PAID" ? colors.colorAction : colors.colorRed
          }]}>
            {localOrder.payment_status === "PAID" ? t('paid') : t('unpaid')}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {localOrder.preparing_by ? (
          <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
            <View style={styles.preparingHeader}>
              <Icon name="progress-check" size={24} color={colors.colorAction} />
              <View style={styles.preparingTitleContainer}>
                <Text style={[styles.preparingTitle, {color: colors.colorText}]}>
                  {t('order_in_preparation')}
                </Text>
                <Text style={[styles.preparingTimestamp, {color: colors.colorDetail}]}>
                  {t('handled')}
                </Text>
              </View>
            </View>
            <View style={[styles.preparingInfo, {backgroundColor: colors.colorBackground}]}>
              <View style={styles.preparingStaffInfo}>
                <Icon name="account" size={20} color={colors.colorAction} />
                <Text style={[styles.preparingText, {color: colors.colorDetail}]}>
                  {t("prepared_by")}
                </Text>
              </View>
              <Text style={[styles.preparingName, {color: colors.colorText}]}>
              {localOrder.preparing_by === userData?.id 
                ? `${userData.first_name} ${userData.last_name}`
                : localOrder.preparing_by}              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.prepareButton, {backgroundColor: colors.colorAction}]}
            onPress={handlePrepare}
            disabled={isLoading}
          >
            <Text style={[styles.prepareButtonText, {color: "#fff"}]}>
              {isLoading ? "En cours..." : "Je prépare cette commande"}
            </Text>
          </TouchableOpacity>
        )}

        {localOrder.order_comment && (
          <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
            <Text style={[styles.sectionTitle, {color: colors.colorText}]}>
              {t('customer_comment')}
            </Text>
            <Text style={[styles.commentText, {color: colors.colorDetail}]}>
              {localOrder.order_comment}
            </Text>
          </View>
        )}

        <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
          <Text style={[styles.sectionTitle, {color: colors.colorText}]}>
            {t('order_summary')}
          </Text>
          
          {localOrder.orders.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.orderItemHeader}>
                <Text style={[styles.orderItemQuantity, {backgroundColor: colors.colorAction}]}>
                  x{item.quantity}
                </Text>
                <Text style={[styles.orderItemTitle, {color: colors.colorText}]}>
                  {item.name}
                </Text>
                <Text style={[styles.orderItemPrice, {color: colors.colorText}]}>
                  {item.subtotal.toFixed(2)}€
                </Text>
              </View>
              {item.comment && (
                <View style={styles.orderItemNote}>
                  <Icon name="note-text-outline" size={16} color={colors.colorAction} />
                  <Text style={[styles.orderItemNoteText, {color: colors.colorDetail}]}>
                    {item.comment}
                  </Text>
                </View>
              )}
              <Text style={[styles.orderItemUnitPrice, {color: colors.colorDetail}]}>
                ({item.unit_price.toFixed(2)}€ {t('units')})
              </Text>
            </View>
          ))}
          
          <View style={[styles.totalContainer, {borderColor: colors.colorDetail}]}>
            <Text style={[styles.totalText, {color: colors.colorText}]}>{t('total')}</Text>
            <Text style={[styles.totalAmount, {color: colors.colorAction}]}>
              {localOrder.amount_total.toFixed(2)} €
            </Text>
          </View>
        </View>

        <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
          <Text style={[styles.sectionTitle, {color: colors.colorText}]}>
            {t('customer_information')}
          </Text>
          <View style={styles.clientInfo}>
            <InfoRow label="Nom" value={localOrder.client_lastname} />
            <InfoRow label="Prénom" value={localOrder.client_firstname} />
            <InfoRow label="Téléphone" value={localOrder.client_phone} />
            <InfoRow label="Email" value={localOrder.client_email} />
            <InfoRow label="Adresse" value={localOrder.client_address} />
          </View>
        </View>

        {localOrder.preparing_by && (
          <TouchableOpacity 
            onPress={handleDelete} 
            style={[styles.deleteButton, {backgroundColor: colors.colorRed}]}
          >
            <Text style={[styles.deleteButtonText, {color: "#fff"}]}>
              {t('delete')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

function useStyles() {
  const {width, height} = useWindowDimensions();

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: height > 750 ? 60 : 40,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    orderRefContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginLeft: 15,
    },
    orderRef: {
      fontSize: width > 375 ? 20 : 18,
      fontWeight: '600',
    },
    orderStatus: {
      fontSize: width > 375 ? 14 : 12,
      fontWeight: '500',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    prepareButton: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
    },
    prepareButtonText: {
      fontSize: width > 375 ? 16 : 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    preparingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    preparingTitleContainer: {
      flex: 1,
    },
    preparingTitle: {
      fontSize: width > 375 ? 18 : 16,
      fontWeight: '600',
    },
    preparingTimestamp: {
      fontSize: width > 375 ? 12 : 10,
      marginTop: 2,
    },
    preparingStaffInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    preparingInfo: {
      padding: 16,
      borderRadius: 12,
      marginTop: 12,
    },
    preparingText: {
      fontSize: width > 375 ? 14 : 12,
    },
    preparingName: {
      fontSize: width > 375 ? 16 : 14,
      fontWeight: '600',
      marginLeft: 28,
      marginTop: 4,
    },
    section: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: width > 375 ? 16 : 14,
      fontWeight: '600',
      marginBottom: 16,
    },
    commentText: {
      fontSize: width > 375 ? 14 : 12,
      lineHeight: 20,
    },
    orderItem: {
      marginBottom: 16,
    },
    orderItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    orderItemQuantity: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      color: '#FFFFFF',
      fontSize: width > 375 ? 14 : 12,
      fontWeight: '600',
    },
    orderItemTitle: {
      flex: 1,
      fontSize: width > 375 ? 15 : 13,
      fontWeight: '500',
    },
    orderItemPrice: {
      fontSize: width > 375 ? 15 : 13,
      fontWeight: '600',
    },
    orderItemNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      paddingLeft: 35,
    },
    orderItemNoteText: {
      fontSize: width > 375 ? 13 : 11,
      flex: 1,
    },
    orderItemUnitPrice: {
      fontSize: width > 375 ? 12 : 10,
      marginTop: 4,
      paddingLeft: 35,
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
    },
    totalText: {
      fontSize: width > 375 ? 18 : 16,
      fontWeight: '600',
    },
    totalAmount: {
      fontSize: width > 375 ? 20 : 18,
      fontWeight: '700',
    },
    clientInfo: {
      gap: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    infoLabel: {
      color: '#A2A2A7',
      fontSize: width > 375 ? 14 : 12,
    },
   infoValue: {
     fontSize: width > 375 ? 14 : 12,
     fontWeight: '500',
   },
   deleteButton: {
     padding: 16,
     borderRadius: 12,
     marginBottom: 40,
   },
   deleteButtonText: {
     fontSize: width > 375 ? 16 : 14,
     fontWeight: '600',
     textAlign: 'center',
   }
 });
}

const InfoRow = ({ label, value }) => {
 const { colors } = useColors();
 const styles = useStyles();
 const displayValue = value === "null, null null" || !value || value === "null" 
 ? " " 
 : value;

 return (
   <View style={styles.infoRow}>
     <Text style={[styles.infoLabel, {color: colors.colorDetail}]}>{label}</Text>
     <Text style={[styles.infoValue, {color: colors.colorText}]}>{displayValue}</Text>
   </View>
 );
};

export default OrderSelectData;