import { Alert, Platform } from "react-native";
import * as Device from 'expo-device';

// Import conditionnel de expo-print
let Print;
let printAsync;

// Détection de simulateur/emulateur
const isSimulator = !Device.isDevice;

// Import conditionnel du module d'impression
if (!isSimulator) {
  try {
    import('expo-print').then(module => {
      Print = module;
      printAsync = module.printAsync;
    }).catch(error => {
      console.error('Erreur lors de l\'import d\'expo-print:', error);
    });
  } catch (error) {
    console.error('Erreur lors de l\'import d\'expo-print:', error);
  }
}

/**
 * Service pour l'impression de tickets de caisse
 */
class PrintService {
  /**
   * Imprime un ticket de caisse pour une commande sur place
   * @param {Object} orderData - Données de la commande à imprimer
   * @param {string} restaurantName - Nom du restaurant
   * @param {Object} options - Options d'impression
   * @returns {Promise<void>}
   */
  async printTableReceipt(orderData, restaurantName = 'RESTAURANT', options = {}) {
    try {
      // Vérification si on est sur un simulateur
      if (isSimulator) {
        Alert.alert(
          "Mode simulateur",
          "L'impression n'est pas disponible sur le simulateur. En production, le ticket serait envoyé à l'imprimante.",
          [{ text: "OK" }]
        );
        return;
      }

      // Vérification que le module d'impression est chargé
      if (!printAsync) {
        Alert.alert(
          "Module d'impression non disponible",
          "Impossible de charger le module d'impression.",
          [{ text: "OK" }]
        );
        return;
      }

      // Générer le HTML du ticket
      const receiptHTML = this.createTableReceiptHTML(orderData, restaurantName, options);
      
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
    }
  }

  /**
   * Génère le HTML pour le ticket de caisse d'une commande sur place
   * @param {Object} orderData - Données de la commande
   * @param {string} restaurantName - Nom du restaurant
   * @param {Object} options - Options d'impression
   * @returns {string} - HTML du ticket
   */
  createTableReceiptHTML(orderData, restaurantName, options = {}) {
    const date = new Date().toLocaleString('fr-FR');
    const total = orderData.amount_total || 0;
    const tableNumber = options.tableNumber || orderData.table_number || "";
    const orderItems = orderData.order_items || [];
    
    // Fonction pour générer le HTML des items
    const generateItemsHTML = () => {
      let html = '';
      
      // Parcourir tous les produits
      orderItems.forEach(item => {
        html += `
          <div class="item">
            <span>${item.quantity}x ${item.name}</span>
            <span>${item.subtotal.toFixed(2)}€</span>
          </div>
        `;
        
        // Si l'article a des options, les afficher aussi
        if (item.options && item.options.length > 0) {
          item.options.forEach(option => {
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
            .table-number {
              font-size: 18px;
              font-weight: bold;
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${restaurantName}</h2>
            <p>${date}</p>
            <p>SUR PLACE</p>
            ${tableNumber ? `<p class="table-number">TABLE ${tableNumber}</p>` : ''}
          </div>
          
          <div class="divider"></div>
          
          ${generateItemsHTML()}
          
          <div class="divider"></div>
          
          <div class="total">
            TOTAL: ${total.toFixed(2)}€
          </div>
          
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
  }

  /**
   * Imprime un numéro de table
   * @param {string|number} tableNumber - Numéro de table à imprimer
   * @param {string} restaurantName - Nom du restaurant
   * @returns {Promise<void>}
   */
  async printTableNumber(tableNumber, restaurantName = 'RESTAURANT') {
    try {
      // Vérification si on est sur un simulateur
      if (isSimulator) {
        Alert.alert(
          "Mode simulateur",
          "L'impression n'est pas disponible sur le simulateur. En production, le numéro de table serait envoyé à l'imprimante.",
          [{ text: "OK" }]
        );
        return;
      }

      // Vérification que le module d'impression est chargé
      if (!printAsync) {
        Alert.alert(
          "Module d'impression non disponible",
          "Impossible de charger le module d'impression.",
          [{ text: "OK" }]
        );
        return;
      }

      // Générer le HTML simple pour le numéro de table
      const tableHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: 'Arial', sans-serif;
                padding: 10px;
                margin: 0 auto;
                text-align: center;
              }
              .restaurant {
                font-size: 18px;
                margin-bottom: 10px;
              }
              .table-number {
                font-size: 40px;
                font-weight: bold;
                margin: 20px 0;
              }
              .footer {
                font-size: 10px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="restaurant">${restaurantName}</div>
            <div>TABLE</div>
            <div class="table-number">${tableNumber}</div>
            <div class="footer">Powered by YumCo</div>
          </body>
        </html>
      `;
      
      // Utiliser uniquement les options essentielles
      const printResult = await printAsync({
        html: tableHTML,
        // Activer explicitement la sélection d'imprimante
        selectPrinter: true
      });
      
      // Ne montrer le message de succès que si l'impression a bien été effectuée
      if (printResult && printResult.uri) {
        Alert.alert(
          "Impression réussie",
          "Le numéro de table a été envoyé à l'imprimante.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      // Gestion des erreurs comme précédemment
      const errorMessage = error.message ? error.message.toLowerCase() : '';
      
      if (
        errorMessage.includes('did not complete') ||
        errorMessage.includes('cancelled') ||
        errorMessage.includes('canceled') ||
        errorMessage.includes('dismiss')
      ) {
        console.log('Impression annulée par l\'utilisateur');
      } else {
        console.error('Erreur impression:', error);
        Alert.alert(
          "Erreur d'impression",
          "Impossible d'imprimer le numéro de table. Détails: " + error.message,
          [{ text: "OK" }]
        );
      }
    }
  }
}

// Exporter une instance unique du service
export default new PrintService();