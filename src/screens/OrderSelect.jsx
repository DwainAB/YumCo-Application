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
import { useRoute } from '@react-navigation/native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "../components/ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import * as Device from 'expo-device';
import { supabase } from "../lib/supabase";
import { API_CONFIG } from '../config/constants';
import { useRestaurantId } from '../hooks/useRestaurantId';

// Détection de simulateur
const isSimulator = !Device.isDevice;

// Import conditionnel de expo-print
let Print;
let printAsync;

if (!Device.isDevice) {
  console.log('Mode simulateur détecté, l\'impression sera simulée');
} else {
  import('expo-print').then(module => {
    Print = module;
    printAsync = module.printAsync;
  }).catch(error => {
    console.error('Erreur lors de l\'import d\'expo-print:', error);
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
        
        <View style={styles.timeOptionsContainer}>
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
        </View>

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
  const { restaurantId } = useRestaurantId();
  const [restaurantName, setRestaurantName] = useState('RESTAURANT');
  const [expandedMenus, setExpandedMenus] = useState({});

  const timeOptions = [
    { label: '10 minutes', value: 10 },
    { label: '15 minutes', value: 15 },
    { label: '20 minutes', value: 20 },
    { label: '30 minutes', value: 30 },
    { label: '45 minutes', value: 45 }
  ];

  // Groupe les options de menu par leur menu parent
  const groupMenuOptions = () => {
    const menuGroups = {};
    
    if (!localOrder.orders || !Array.isArray(localOrder.orders)) {
      return menuGroups;
    }
    
    // Parcourir tous les éléments de commande
    localOrder.orders.forEach(item => {
      // Si c'est un menu (a un menu_id)
      if (item.menu_id) {
        const menuId = item.id; // Utiliser l'ID de l'item comme identifiant du menu
        
        menuGroups[menuId] = {
          menuItem: item,
          options: item.options || [] // Utiliser les options déjà incluses dans l'élément
        };
      }
    });
    
    return menuGroups;
  };

  const toggleMenuExpand = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const getAllStorageKeys = async () => {
    try {
      // Récupérer les informations du restaurant
      if (restaurantId) {
        fetchRestaurantInfo(restaurantId);
      }

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données:', error);
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

    // Initialiser l'état d'expansion des menus
    const menus = groupMenuOptions();
    const initialExpandState = {};
    Object.keys(menus).forEach(menuId => {
      initialExpandState[menuId] = false; // Tous les menus sont initialement fermés
    });
    setExpandedMenus(initialExpandState);
  }, [restaurantId]);

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
      const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/update_preparing_by`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`
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
              const updateResponse = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/updateOrder`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`
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
  
  // Fonction d'impression minimaliste qui évite les options avancées
  const printReceipt = async () => {
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
        // Générer le HTML du ticket
        const receiptHTML = createReceiptHTML();
        
        // Utiliser uniquement les options essentielles
        const printResult = await printAsync({
          html: receiptHTML,
          // Activer explicitement la sélection d'imprimante
          selectPrinter: true
        });
        
        // Ne montrer le message de succès que si l'impression a bien été effectuée
        if (printResult && printResult.uri) {
          Alert.alert(
            "Impression réussie",
            "Le ticket a été envoyé à l'imprimante.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      // Vérifions si l'erreur est due à une annulation par l'utilisateur
      const errorMessage = error.message ? error.message.toLowerCase() : '';
      
      if (
        errorMessage.includes('did not complete') ||
        errorMessage.includes('cancelled') ||
        errorMessage.includes('canceled') ||
        errorMessage.includes('dismiss')
      ) {
        // L'utilisateur a simplement annulé, ne pas afficher d'erreur
        console.log('Impression annulée par l\'utilisateur');
      } else {
        // C'est une véritable erreur d'impression
        console.error('Erreur impression:', error);
        Alert.alert(
          "Erreur d'impression",
          "Impossible d'imprimer le ticket. Détails: " + error.message,
          [{ text: "OK" }]
        );
      }
    } finally {
      setIsPrinting(false);
    }
  };

  // HTML optimisé pour s'adapter automatiquement aux imprimantes de tickets
  const createReceiptHTML = () => {
    const date = new Date().toLocaleString('fr-FR');
    const total = localOrder.amount_total;
    const menuGroups = groupMenuOptions();
    
    // Fonction pour générer le HTML des items (produits et menus)
    const generateItemsHTML = () => {
      let html = '';
      
      // D'abord, afficher tous les produits standards (sans menu_id)
      const regularProducts = localOrder.orders.filter(item => !item.menu_id);
      regularProducts.forEach(item => {
        html += `
          <div class="item">
            <span>${item.quantity}x ${item.name}</span>
            <span>${item.subtotal.toFixed(2)}€</span>
          </div>
          ${item.comment ? `<p style="margin-left: 8px; font-style: italic; font-size: 10px;">Note: ${item.comment}</p>` : ''}
        `;
      });
      
      // Ensuite, afficher tous les menus avec leurs options
      Object.values(menuGroups).forEach(menuGroup => {
        const menuItem = menuGroup.menuItem;
        html += `
          <div class="item">
            <span>${menuItem.quantity}x ${menuItem.name} (MENU)</span>
            <span>${menuItem.subtotal.toFixed(2)}€</span>
          </div>
          ${menuItem.comment ? `<p style="margin-left: 8px; font-style: italic; font-size: 10px;">Note: ${menuItem.comment}</p>` : ''}
        `;
        
        // Afficher les options du menu avec indentation
        if (menuGroup.options && menuGroup.options.length > 0) {
          menuGroup.options.forEach(option => {
            html += `
              <div class="item" style="margin-left: 12px; font-size: 10px;">
                <span>• ${option.name}</span>
                ${option.unit_price > 0 ? `<span>+${option.unit_price.toFixed(2)}€</span>` : ''}
              </div>
            `;
          });
        }
      });
      
      return html;
    };
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 5px;
              margin: 0 auto;
              font-size: 12px;
              max-width: 280px;
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
          
          ${generateItemsHTML()}
          
          <div class="divider"></div>
          
          <div class="total">
            TOTAL: ${total.toFixed(2)}€
          </div>
          
          <div class="divider"></div>
          
          <div style="font-size: 11px;">
            <p><b>${t("customer_information")}:</b></p>
            <p>${localOrder.client_firstname} ${localOrder.client_lastname}</p>
            ${localOrder.client_phone ? `<p>Tel: ${localOrder.client_phone}</p>` : ''}
            ${localOrder.client_email ? `<p>Email: ${localOrder.client_email}</p>` : ''}
            
            ${localOrder.client_address && localOrder.client_address !== "null, null null" ? `
              <p>Adresse: ${localOrder.client_address}</p>
            ` : localOrder.client_method === "Livraison" ? `
              <p>Mode: Livraison (adresse non spécifiée)</p>
            ` : `
              <p>Mode: À emporter</p>
            `}
          </div>
          
          ${localOrder.order_comment ? `
            <div class="divider"></div>
            <div style="font-size: 11px;">
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

  // Rendu des menus avec leurs options
  const renderMenuItems = () => {
    const menuGroups = groupMenuOptions();
    
    return Object.entries(menuGroups).map(([menuId, group]) => {
      const menuItem = group.menuItem;
      const options = group.options;
      const isExpanded = expandedMenus[menuId];
      
      return (
        <View key={menuId} style={styles.orderItem}>
          <TouchableOpacity 
            style={styles.orderItemHeader}
            onPress={() => toggleMenuExpand(menuId)}
          >
            <Text style={[styles.orderItemQuantity, {backgroundColor: colors.colorAction}]}>
              x{menuItem.quantity}
            </Text>
            <View style={styles.menuTitleContainer}>
              <Text style={[styles.orderItemTitle, {color: colors.colorText}]}>
                {menuItem.name}
              </Text>
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>MENU</Text>
              </View>
            </View>
            <View style={styles.menuPriceContainer}>
              <Text style={[styles.orderItemPrice, {color: colors.colorText}]}>
                {menuItem.subtotal.toFixed(2)}€
              </Text>
              <Icon 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.colorDetail} 
              />
            </View>
          </TouchableOpacity>
          
          {menuItem.comment && (
            <View style={styles.orderItemNote}>
              <Icon name="note-text-outline" size={16} color={colors.colorAction} />
              <Text style={[styles.orderItemNoteText, {color: colors.colorDetail}]}>
                {menuItem.comment}
              </Text>
            </View>
          )}
          
          {isExpanded && options && options.length > 0 && (
            <View style={styles.menuOptionsContainer}>
              {options.map((option, index) => (
                <View key={index} style={styles.menuOption}>
                  <View style={styles.menuOptionDot} />
                  <Text style={[styles.menuOptionName, {color: colors.colorText}]}>
                    {option.name}
                  </Text>
                  {option.unit_price > 0 && (
                    <Text style={[styles.menuOptionPrice, {color: colors.colorDetail}]}>
                      +{option.unit_price.toFixed(2)}€
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      );
    });
  };

  // Rendu des produits standards (non-menus)
  const renderRegularProducts = () => {
    if (!localOrder.orders || !Array.isArray(localOrder.orders)) {
      return null;
    }
    
    // Filtrer pour ne prendre que les produits (sans menu_id)
    const regularProducts = localOrder.orders.filter(item => !item.menu_id);
    
    return regularProducts.map((item, index) => (
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
    ));
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
          
          {/* Afficher les menus */}
          {renderMenuItems()}
          
          {/* Afficher les produits standards */}
          {renderRegularProducts()}
          
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
          onPress={printReceipt} 
          style={[styles.printButton, {backgroundColor: colors.colorAction}]}
          disabled={isPrinting}
        >
          <Icon name="printer" size={20} color="#FFFFFF" style={styles.printIcon} />
          <Text style={[styles.printButtonText, {color: "#fff"}]}>
            {isPrinting ? `${t("printing")}...` : t('print_receipt')}
          </Text>
        </TouchableOpacity>
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
      marginBottom: 20,
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
      marginBottom: 20
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
    webView: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    // Nouveaux styles pour les menus
    menuTitleContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    menuBadge: {
      backgroundColor: '#0164FF',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    menuBadgeText: {
      color: '#FFFFFF',
      fontSize: width > 375 ? 10 : 8,
      fontWeight: '600',
    },
    menuPriceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    menuOptionsContainer: {
      marginTop: 8,
      marginLeft: 35,
      paddingLeft: 10,
      borderLeftWidth: 1,
      borderLeftColor: '#E0E0E0',
    },
    menuOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    menuOptionDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#0164FF',
    },
    menuOptionName: {
      flex: 1,
      fontSize: width > 375 ? 14 : 12,
    },
    menuOptionPrice: {
      fontSize: width > 375 ? 13 : 11,
      fontWeight: '500',
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