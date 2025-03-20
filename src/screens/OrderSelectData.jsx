import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  SafeAreaView
} from "react-native";
import { useRoute } from '@react-navigation/native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "../components/ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import { supabase } from "../lib/supabase";
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

function OrderSelectData() {
 const navigation = useNavigation();
 const { colors } = useColors();
 const route = useRoute();
 const { order } = route.params;
 const { t } = useTranslation();
 const styles = useStyles();
 const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho"
 const [preparer, setPreparer] = useState(null);
 const [isPrinting, setIsPrinting] = useState(false);
 const [restaurantId, setRestaurantId] = useState(null);
 const [restaurantName, setRestaurantName] = useState('RESTAURANT');

 useEffect(() => {
  const fetchRestaurantId = async () => {
      try {
          const owner = await AsyncStorage.getItem("owner");
          const ownerData = JSON.parse(owner);                
          setRestaurantId(ownerData.restaurantId);
          
          // Récupérer les informations du restaurant une fois que nous avons l'ID
          if (ownerData.restaurantId) {
            fetchRestaurantInfo(ownerData.restaurantId);
          }
      } catch (error) {
          console.error('Erreur récupération utilisateur:', error);
      }
  };
  fetchRestaurantId();
}, []);

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

 const calculateAndFormatTotalPrice = (order) => {
   let totalPrice = 0;
   order.orders.forEach((product) => {
     totalPrice += product.product_price * product.order_quantity;
   });

   if (typeof totalPrice !== 'number' || isNaN(totalPrice)) {
     return 'Prix invalide';
   }

   const roundedPrice = Math.round(totalPrice * 100) / 100;
   return roundedPrice.toFixed(2);
 };

 const formatPrice = (price) => {
   if (!price && price !== 0) return '0.00 €';
   return `${Number(price).toFixed(2)} €`;
 };

 const fetchPreparer = async (preparingById) => {
  try {
    const { data, error } = await supabase
      .from('owners')
      .select('first_name, last_name')
      .eq('id', preparingById)
      .single();

    if (error) throw error;
    
    setPreparer(data);
  } catch (error) {
    console.error('Erreur lors de la récupération du préparateur:', error);
  }
};

// Appeler fetchPreparer quand la commande est chargée
useEffect(() => {
  if (order?.preparing_by) {
    fetchPreparer(order.preparing_by);
  }
}, [order]);

 const handleDelete = async () => {
   try {
     const updateResponse = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/updateOrder', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
       },
       body: JSON.stringify({
         order_id: order.order_id,
         new_status: "DELETED"
       })
     });
 
     if (!updateResponse.ok) {
       throw new Error('Erreur lors de la mise à jour du statut');
     }
 
     alert(t('alertDeleteOrder'));
     navigation.navigate("AllOrders", { 
       triggerRefresh: Date.now() 
     });
     
   } catch (error) {
     console.error('Erreur lors de la mise à jour du statut:', error);
     alert('Erreur lors de la mise à jour de la commande');
   }
 };

 // Fonction pour imprimer directement le ticket sans prévisualisation
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
      
      // Utiliser uniquement les options essentielles pour éviter les erreurs
      const printResult = await printAsync({
        html: receiptHTML,
        selectPrinter: true // Pour permettre à l'utilisateur de choisir l'imprimante
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
    // Vérifier si l'erreur est due à une annulation par l'utilisateur
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

 // Fonction pour créer le HTML du ticket optimisé pour imprimantes thermiques
 const createReceiptHTML = () => {
  const date = new Date().toLocaleString('fr-FR');
  const total = order.amount_total;
  
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
          <p>${order.client_ref_order}</p>
          <p>${date}</p>
          <p>${order.client_method === "Livraison" ? "LIVRAISON" : "À EMPORTER"}</p>
        </div>
        
        <div class="divider"></div>
        
        ${order.orders.map(item => `
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
          <p>${order.client_firstname} ${order.client_lastname}</p>
          ${order.client_phone ? `<p>Tel: ${order.client_phone}</p>` : ''}
          ${order.client_email ? `<p>Email: ${order.client_email}</p>` : ''}
          
          ${order.client_address && order.client_address !== "null, null null" ? `
            <p>Adresse: ${order.client_address}</p>
          ` : order.client_method === "Livraison" ? `
            <p><b>Mode:</b> Livraison (adresse non spécifiée)</p>
          ` : `
            <p><b>Mode:</b> À emporter</p>
          `}
        </div>
        
        ${order.order_comment ? `
          <div class="divider"></div>
          <div class="customer-info">
            <p><b>${t("customer_comment")}:</b></p>
            <p style="font-style: italic;">"${order.order_comment}"</p>
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
     <View style={styles.header}>
       <TouchableOpacity 
         onPress={() => navigation.navigate("AllOrders")} 
         style={[styles.backButton, {backgroundColor: colors.colorBorderAndBlock}]}
       >
         <Icon name="chevron-left" size={24} color={colors.colorText} />
       </TouchableOpacity>
       <View style={styles.orderRefContainer}>
         <Text style={[styles.orderRef, {color: colors.colorText}]}>
           {order.client_ref_order}
         </Text>
         <Icon 
           name={order.client_method === "Livraison" ? "bike-fast" : "shopping-outline"} 
           size={24} 
           color={colors.colorAction} 
         />
          <Text style={[styles.orderStatus, {
            color: order.payment_status === "PAID" ? "#4CAF50" : colors.colorRed
          }]}>
            {order.payment_status === "PAID" ? t('paid') : t('unpaid')}
          </Text>
       </View>
     </View>

     <ScrollView style={styles.content}>
      <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
        <View style={styles.preparingHeader}>
          <Icon name="progress-check" size={24} color={colors.colorAction} />
          <View style={styles.preparingTitleContainer}>
            <Text style={[styles.preparingTitle, {color: colors.colorText}]}>
              {t('order_ready')}
            </Text>
            <Text style={[styles.preparingTimestamp, {color: colors.colorDetail}]}>
              {t('finished')}
            </Text>
          </View>
        </View>
        <View style={[styles.preparingInfo, {backgroundColor: colors.colorBackground}]}>
          <View style={styles.preparingStaffInfo}>
            <Icon name="account" size={20} color={colors.colorAction} />
            <Text style={[styles.preparingText, {color: colors.colorDetail}]}>
              {t('prepared_by')}
            </Text>
          </View>
          <Text style={[styles.preparingName, {color: colors.colorText}]}>
            {preparer ? `${preparer.first_name} ${preparer.last_name}` : 'Chargement...'}
          </Text>
        </View>
      </View>

       {order.order_comment && (
         <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
           <Text style={[styles.sectionTitle, {color: colors.colorDetail}]}>
             {t('customer_comment')}
           </Text>
           <Text style={[styles.commentText, {color: colors.colorText}]}>
             {order.order_comment}
           </Text>
         </View>
       )}

       <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
         <Text style={[styles.sectionTitle, {color: colors.colorDetail}]}>
           {t('order_summary')}
         </Text>
         
         {order.orders.map((item, index) => (
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
         
         <View style={styles.totalContainer}>
           <Text style={[styles.totalText, {color: colors.colorText}]}>{t('total')}</Text>
           <Text style={[styles.totalAmount, {color: colors.colorAction}]}>
            {order.amount_total.toFixed(2)} €
           </Text>
         </View>
       </View>

       <View style={[styles.section, {backgroundColor: colors.colorBorderAndBlock}]}>
         <Text style={[styles.sectionTitle, {color: colors.colorDetail}]}>
           {t('customer_information')}
         </Text>
         <View style={styles.clientInfo}>
           <InfoRow label="Nom" value={order.client_lastname} />
           <InfoRow label="Prénom" value={order.client_firstname} />
           <InfoRow label="Téléphone" value={order.client_phone} />
           <InfoRow label="Email" value={order.client_email} />
           <InfoRow 
              label="Adresse" 
              value={order.client_address === "null, null null" ? t('takeaway') : order.client_address} 
            />         
           </View>
       </View>

       <TouchableOpacity 
         onPress={handleDelete} 
         style={[styles.deleteButton, {backgroundColor: colors.colorRed}]}
       >
         <Text style={[styles.deleteButtonText, {color: "#fff"}]}>
           {t('delete')}
         </Text>
       </TouchableOpacity>
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
     flexDirection: 'row',
     alignItems: 'center',
     marginLeft: 15,
     gap: 10,
   },
   orderRef: {
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
     borderTopColor: 'rgba(162, 162, 167, 0.1)',
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
     marginBottom: 20,
   },
   deleteButtonText: {
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
  orderStatus:{
    fontSize: width > 375 ? 20 : 18,
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
  }
 });
}

const InfoRow = ({ label, value }) => {
 const { colors } = useColors();
 const styles = useStyles();
 return (
   <View style={styles.infoRow}>
     <Text style={[styles.infoLabel, {color: colors.colorDetail}]}>{label}</Text>
     <Text style={[styles.infoValue, {color: colors.colorText}]}>{value}</Text>
   </View>
 );
};

export default OrderSelectData;