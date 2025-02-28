import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal, 
  Platform,
  SafeAreaView
} from "react-native";
import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "../components/ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { supabase } from "../lib/supabase";

// Détection de simulateur
const isSimulator = !Device.isDevice;

// Import conditionnel de expo-print
let Print;
if (!isSimulator) {
  import('expo-print').then(module => {
    Print = module;
  }).catch(error => {
    console.log('Erreur lors de l\'import d\'expo-print:', error);
  });
}

// TimeSelectionModal component
const TimeSelectionModal = ({
  isVisible,
  onClose,
  onConfirm,
  selectedTime,
  onTimeSelection,
  timeOptions,
  colors,
  styles,
  t
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={isVisible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { backgroundColor: colors.colorBackground }]}>
        <Text style={[styles.modalTitle, { color: colors.colorText }]}>
          {t("estimated_preparation_time")}
        </Text>
        
        <ScrollView style={styles.timeOptionsContainer}>
          {timeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.timeOption,
                { 
                  backgroundColor: colors.colorBorderAndBlock,
                  borderWidth: 2,
                  borderColor: selectedTime === option.value ? colors.colorAction : 'transparent'
                }
              ]}
              onPress={() => onTimeSelection(option.value)}
            >
              <Text style={[
                styles.timeOptionText,
                { color: colors.colorText }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.colorBorderAndBlock }]}
            onPress={onClose}
          >
            <Text style={[styles.modalButtonText, { color: colors.colorText }]}>{t("back")}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modalButton,
              { backgroundColor: colors.colorAction },
              !selectedTime && { opacity: 0.5 }
            ]}
            onPress={onConfirm}
            disabled={!selectedTime}
          >
            <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>{t("confirm")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

function OrderSelect() {
  const navigation = useNavigation();
  const { colors } = useColors();
  const route = useRoute();
  const { order } = route.params;
  const { t } = useTranslation();
  const styles = useStyles();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localOrder, setLocalOrder] = useState(order);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('RESTAURANT');
  const [receiptHTML, setReceiptHTML] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho";

  const timeOptions = [
    { label: '10 minutes', value: 10 },
    { label: '15 minutes', value: 15 },
    { label: '20 minutes', value: 20 },
    { label: '30 minutes', value: 30 },
    { label: '45 minutes', value: 45 }
  ];

  const getAllStorageKeys = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      
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
  
      const userDataFromStorage = await AsyncStorage.getItem('owner');
      if (userDataFromStorage) {
        const parsedUserData = JSON.parse(userDataFromStorage);
        console.log('\n👤 Données utilisateur détaillées:', parsedUserData);
        setUserData(parsedUserData);
        
        // Récupérer l'ID du restaurant
        if (parsedUserData.restaurantId) {
          setRestaurantId(parsedUserData.restaurantId);
          fetchRestaurantInfo(parsedUserData.restaurantId);
        }
      } else {
        console.log('\n❌ Aucune donnée utilisateur trouvée');
      }
  
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du storage:', error);
    }
  };

  // Fonction pour récupérer les informations du restaurant depuis Supabase
  const fetchRestaurantInfo = async (id) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data && data.name) {
        setRestaurantName(data.name.toUpperCase());
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du restaurant:', error);
    }
  };

  useEffect(() => {
    getAllStorageKeys();
  }, []);

  const handlePreparePress = () => {
    setIsModalVisible(true);
    setSelectedTime(null); // Réinitialiser la sélection à l'ouverture
  };

  const handleTimeSelection = (value) => {
    setSelectedTime(value);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedTime(null);
  };

  const handleConfirm = async () => {
    if (!selectedTime) {
      Alert.alert("Erreur", "Veuillez sélectionner un temps de préparation");
      return;
    }

    if (!userData?.id) {
      console.error("ID utilisateur non trouvé");
      return;
    }

    setIsModalVisible(false);
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
          preparing_by: userData.id,
          preparation_time: selectedTime
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      setLocalOrder({
        ...localOrder,
        preparing_by: userData.id,
        preparation_time: selectedTime
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
      t("confirmation"),
      t("are_you_sure_order_ready"),
      [
        {
          text: t("cancel"),
          style: "cancel"
        },
        {
          text: t("validate"),
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

  // Fonction pour prévisualiser le ticket
  const previewReceipt = () => {
    const html = createReceiptHTML();
    setReceiptHTML(html);
    setShowPreview(true);
  };
  
  // Fonction pour imprimer le ticket après prévisualisation
  const printReceiptAfterPreview = async () => {
    setIsPrinting(true);
    
    try {
      // Détection du simulateur
      const isSimulator = !Device.isDevice;
      
      if (isSimulator) {
        // Mode simulateur : afficher seulement une alerte
        Alert.alert(
          "Mode simulateur",
          "L'impression n'est pas disponible sur le simulateur. En production, le ticket serait envoyé à l'imprimante.",
          [{ text: "OK" }]
        );
      } else {
        // Configuration spécifique pour imprimante de tickets de caisse
        await Print.printAsync({
          html: receiptHTML,
          width: 280, // Largeur standard pour les tickets de caisse (58mm ou 80mm)
          // height omis pour calculer automatiquement en fonction du contenu
          orientation: 'portrait',
          selectPrinter: true,
          // Options supplémentaires pour minimiser l'interaction utilisateur
          printerType: 'thermal', // Indique une préférence pour les imprimantes thermiques
          markupFormatterIOS: {
            // Paramètres iOS pour impression simplifiée
            paperWidth: 58, // 58mm (standard pour petits tickets)
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            marginBottom: 0,
            scalingFactor: 1.0
          }
        });
        
        // Feedback visuel de succès
        Alert.alert(
          "Impression réussie",
          "Le ticket a été envoyé à l'imprimante.",
          [{ text: "OK" }]
        );
      }
      
    } catch (error) {
      console.error('Erreur impression:', error);
      Alert.alert(
        "Erreur d'impression",
        "Vérifiez que votre imprimante est allumée et connectée au même réseau Wi-Fi.",
        [{ text: "OK" }]
      );
    } finally {
      setIsPrinting(false);
      setShowPreview(false); // Ferme la prévisualisation après impression
    }
  };

  const createReceiptHTML = () => {
    const date = new Date().toLocaleString('fr-FR');
    const total = localOrder.amount_total;
    
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            @page {
              margin: 0;
              size: 58mm auto;  /* Largeur standard imprimante thermique */
            }
            body { 
              font-family: 'Courier New', monospace;
              width: 100%;
              max-width: 280px;
              padding: 5px;
              margin: 0 auto;
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 8px; 
            }
            .divider { 
              border-top: 1px dashed #000; 
              margin: 5px 0; 
            }
            .item { 
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              font-size: 12px;
            }
            .total { 
              text-align: right;
              font-weight: bold;
              font-size: 14px;
              margin-top: 5px;
            }
            h2 {
              margin: 0;
              font-size: 16px;
            }
            p {
              margin: 2px 0;
            }
            .customer-info {
              font-size: 11px;
            }
            .small {
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${restaurantName}</h2>
            <p>${localOrder.client_ref_order}</p>
            <p>${date}</p>
            <p>${localOrder.client_method === "Livraison" ? "LIVRAISON" : "À EMPORTER"}</p>
          </div>
          
          <div class="divider"></div>
          
          ${localOrder.orders.map(item => `
            <div class="item">
              <span>${item.quantity}x ${item.name}</span>
              <span>${item.subtotal.toFixed(2)}€</span>
            </div>
            ${item.comment ? `<p class="small" style="margin-left: 8px; font-style: italic;">Note: ${item.comment}</p>` : ''}
          `).join('')}
          
          <div class="divider"></div>
          
          <div class="total">
            TOTAL: ${total.toFixed(2)}€
          </div>
          
          <div class="divider"></div>
          
          <div class="customer-info">
            <p><b>${t("customer_information")}:</b></p>
            <p>${localOrder.client_firstname} ${localOrder.client_lastname}</p>
            ${localOrder.client_phone ? `<p>Tel: ${localOrder.client_phone}</p>` : ''}
            ${localOrder.client_email ? `<p>Email: ${localOrder.client_email}</p>` : ''}
            
            ${localOrder.client_address && localOrder.client_address !== "null, null null" ? `
              <p><b>Adresse:</b> ${localOrder.client_address}</p>
            ` : localOrder.client_method === "Livraison" ? `
              <p><b>Mode:</b> Livraison (adresse non spécifiée)</p>
            ` : `
              <p><b>Mode:</b> À emporter</p>
            `}
          </div>
          
          ${localOrder.order_comment ? `
            <div class="divider"></div>
            <div class="customer-info">
              <p><b>${t("customer_comment")}:</b></p>
              <p style="font-style: italic;">"${localOrder.order_comment}"</p>
            </div>
          ` : ''}
          
          <div class="divider"></div>
          <p style="text-align: center; margin-top: 5px;">
            Merci pour votre commande !
          </p>
          <p style="text-align: center; font-size: 10px; margin-top: 10px;">
            Powered by YumCo - Solutions de restauration
          </p>
        </body>
      </html>
    `;
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.colorBackground}]}>
      <TimeSelectionModal 
        isVisible={isModalVisible}
        onClose={handleModalClose}
        onConfirm={handleConfirm}
        selectedTime={selectedTime}
        onTimeSelection={handleTimeSelection}
        timeOptions={timeOptions}
        colors={colors}
        styles={styles}
        t={t}
      />
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
            color: localOrder.payment_status === "PAID" ? "#4CAF50" : colors.colorRed
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
                  : localOrder.preparing_by}
              </Text>
              {localOrder.preparation_time && (
                <View style={styles.preparingStaffInfo}>
                  <Icon name="clock-outline" size={20} color={colors.colorAction} />
                  <Text style={[styles.preparingText, {color: colors.colorDetail}]}>
                    {t("estimated_preparation_time")}: {localOrder.preparation_time} minutes
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.prepareButton, {backgroundColor: colors.colorAction}]}
            onPress={handlePreparePress}
            disabled={isLoading}
          >
            <Text style={[styles.prepareButtonText, {color: "#fff"}]}>
              {isLoading ? `${t("in_progress")}...` : t("i_am_preparing_this_order")}
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
            <InfoRow label={t("last_name")} value={localOrder.client_lastname} />
            <InfoRow label={t("first_name")} value={localOrder.client_firstname} />
            <InfoRow label={t("phone")} value={localOrder.client_phone} />
            <InfoRow label={t("email")} value={localOrder.client_email} />
            <InfoRow label={t("address")} value={localOrder.client_address} />
          </View>
        </View>

        {localOrder.preparing_by && (
          <TouchableOpacity 
            onPress={handleDelete} 
            style={[styles.deleteButton, {backgroundColor: colors.colorRed}]}
          >
            <Text style={[styles.deleteButtonText, {color: "#fff"}]}>
              {t('order_ready')}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          onPress={previewReceipt} 
          style={[styles.printButton, {backgroundColor: colors.colorAction}]}
          disabled={isPrinting}
        >
          <Icon name="printer" size={20} color="#FFFFFF" style={styles.printIcon} />
          <Text style={[styles.printButtonText, {color: "#fff"}]}>
            {isPrinting ? `${t("printing")}...` : t('print_receipt')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de prévisualisation du ticket */}
      <Modal
        visible={showPreview}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowPreview(false)}
      >
        <SafeAreaView style={[styles.modalContainer, {backgroundColor: colors.colorBackground}]}>
          <View style={[styles.modalHeader, {backgroundColor: colors.colorBackground}]}>
            <Text style={[styles.modalTitle, {color: colors.colorText}]}>Prévisualisation du ticket</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setShowPreview(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.modalButtonText}>Fermer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={printReceiptAfterPreview}
                style={[styles.modalButton, styles.printModalButton]}
                disabled={isPrinting}
              >
                <Text style={styles.modalButtonText}>
                  {isPrinting ? 'Impression...' : 'Imprimer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <WebView
            style={styles.webView}
            originWhitelist={['*']}
            source={{ html: receiptHTML }}
            scalesPageToFit={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </SafeAreaView>
      </Modal>
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
      fontSize: width > 375 ? 20 : 18,
      fontWeight: '600',
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
    },
    // Nouveaux styles pour le modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '80%',
      borderRadius: 16,
      padding: 20,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 20,
      textAlign: 'center',
    },
    timeOptionsContainer: {
      maxHeight: 300,
    },
    timeOption: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    timeOptionText: {
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 10,
    },
    modalButton: {
      flex: 1,
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    printButton: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 40,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    printButtonText: {
      fontSize: width > 375 ? 16 : 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    printIcon: {
      marginRight: 10,
    },
      // Styles pour la modal de prévisualisation
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'column',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: 10,
    borderRadius: 6,
    marginLeft: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  printModalButton: {
    backgroundColor: '#FF3F00',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  webView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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

export default OrderSelect;