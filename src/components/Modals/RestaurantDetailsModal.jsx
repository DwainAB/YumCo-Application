import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from "react-native";
import { useWindowDimensions } from "react-native";
import { supabase } from "../../lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '../../config/constants';
import { safeJSONParse } from '../../utils/storage';


const RestaurantDetailsModal = ({ visible, table, onClose, colors, onTableUpdate, restaurantId }) => {
  const { width, height } = useWindowDimensions();
  const [isAvailable, setIsAvailable] = useState(false);
  const [menuType, setMenuType] = useState("carte"); // "carte" ou "volonte"
  const [adulteCount, setAdulteCount] = useState(0);
  const [enfantMoins10Count, setEnfantMoins10Count] = useState(0);
  const [enfantMoins6Count, setEnfantMoins6Count] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productQuantities, setProductQuantities] = useState({});
  const [activeOrder, setActiveOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [restaurantName, setRestaurantName] = useState('RESTAURANT');
  const [menus, setMenus] = useState([]);
  const [displayingMenus, setDisplayingMenus] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedMenuOptions, setSelectedMenuOptions] = useState({});
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [restaurantAllowsALaCarte, setRestaurantAllowsALaCarte] = useState(false);
  const [restaurantAllowsAllYouCanEat, setRestaurantAllowsAllYouCanEat] = useState(false);
  const [allYouCanEatFormulas, setAllYouCanEatFormulas] = useState([]);
  const [formulasCounts, setFormulasCounts] = useState({});
  const { t } = useTranslation();

  // Récupérer les informations à jour de la table depuis Supabase quand table.id change
    useEffect(() => {
    if (table?.id) {
        fetchTableData(table.id);
        if (restaurantId && table.id) {
        fetchTableOrder(restaurantId, table.id);
        }
    }
    }, [table?.id, restaurantId]);
    
    useEffect(() => {
      if (restaurantId) {
        fetchAllYouCanEatFormulas();
      }
    }, [restaurantId]);

    const changeFormulaQuantity = (formulaId, increment) => {
      setFormulasCounts(prev => {
        const currentCount = prev[formulaId] || 0;
        return {
          ...prev,
          [formulaId]: increment 
            ? Math.min(currentCount + 1, 20) 
            : Math.max(currentCount - 1, 0)
        };
      });
    };

    const fetchAllYouCanEatFormulas = async () => {
      try {
        const { data, error } = await supabase
          .from('all_you_can_eat')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('price', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setAllYouCanEatFormulas(data);
          
          // Initialiser les compteurs à 0 pour chaque formule
          const initialCounts = {};
          data.forEach(formula => {
            initialCounts[formula.id] = 0;
          });
          
          // Remplacer les compteurs spécifiques par un état générique
          setFormulasCounts(initialCounts);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des formules à volonté:', error);
      }
    };

    const fetchRestaurantInfo = async (id) => {
        try {
          const { data, error } = await supabase
            .from('restaurants')
            .select('name, a_la_carte, all_you_can_eat_option')
            .eq('id', id)
            .single();
    
          if (error) throw error;
          
          if (data && data.name) {
            console.log("volonté,",data.all_you_can_eat_option);
            
            setRestaurantName(data.name.toUpperCase());
            setRestaurantAllowsALaCarte(data.a_la_carte || false);
            setRestaurantAllowsAllYouCanEat(data.all_you_can_eat_option || false);          }
        } catch (error) {
          console.error('Erreur lors de la récupération du restaurant:', error);
        }
      };

      const getAllStorageKeys = async () => {
        try {
      
          const userDataFromStorage = await AsyncStorage.getItem('owner');
          if (userDataFromStorage) {
            const parsedUserData = safeJSONParse(userDataFromStorage);
            
            if (parsedUserData.restaurantId) {
              fetchRestaurantInfo(parsedUserData.restaurantId);
            }
          } else {
            console.log('\n❌ Aucune donnée utilisateur trouvée');
          }
      
        } catch (error) {
          console.error('❌ Erreur lors de la récupération du storage:', error);
        }
      };

      getAllStorageKeys();


    const handlePrintReceipt = async () => {
        if (!activeOrder) {
          Alert.alert("Attention", "Aucune commande active à imprimer");
          return;
        }
        
        try {
          setIsPrinting(true);
          
          // Importer le service d'impression dynamiquement
          const PrintService = (await import("../PrintService/PrintServiceTable")).default;
          
          // Préparer les données nécessaires pour l'impression
          await PrintService.printTableReceipt(
            activeOrder, 
            restaurantName || "RESTAURANT", 
            { tableNumber: table.table_number }
          );
          
        } catch (error) {
          console.error("Erreur lors de l'impression:", error);
          Alert.alert("Erreur d'impression", "Impossible d'imprimer le ticket de caisse");
        } finally {
          setIsPrinting(false);
        }
      };
      
      // Fonction pour imprimer le numéro de table
      const handlePrintTableNumber = async () => {
        if (!table || !table.table_number) {
          Alert.alert("Attention", "Numéro de table non disponible");
          return;
        }
        
        try {
          setIsPrinting(true);
          
          // Importer le service d'impression dynamiquement
          const PrintService = (await import("../PrintService/PrintServiceTable")).default;
          
          // Imprimer le numéro de table
          await PrintService.printTableNumber(
            table.table_number,
            restaurantName || "RESTAURANT"
          );
          
        } catch (error) {
          console.error("Erreur lors de l'impression:", error);
          Alert.alert("Erreur d'impression", "Impossible d'imprimer le numéro de table");
        } finally {
          setIsPrinting(false);
        }
      };

// Fonction pour créer une nouvelle commande
const handleNewOrder = async () => {
    try {
      setIsLoading(true);
      
      // Préparer les données pour la nouvelle commande
      const newOrderData = {
        amount_total: 0,
        amount_tax: 0,
        amount_subtotal: 0,
        status: "IN_PROGRESS",
        restaurant_id: restaurantId,
        type: "ON_SITE",
        table_id: table.id,
        order_items: []
      };
      
      // Appeler l'API pour créer une nouvelle commande
      const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/newOrder`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(newOrderData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur lors de la création de la commande:", errorText);
        throw new Error("Erreur lors de la création de la commande");
      }
      
      const result = await response.json();
      console.log("Nouvelle commande créée:", result);
      
      // Mettre à jour la disponibilité de la table
      await updateTableAvailability(false);
      
      // Rafraîchir les données
      await fetchTableOrder(restaurantId, table.id);
      
      Alert.alert("Succès", "Nouvelle commande créée");
      
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      Alert.alert("Erreur", "Impossible de créer une nouvelle commande");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour annuler une commande
  const handleCancelOrder = async () => {
    if (!activeOrder) {
      Alert.alert("Information", "Aucune commande active à annuler");
      return;
    }
    
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment annuler cette commande ?",
      [
        {
          text: "Non",
          style: "cancel"
        },
        {
          text: "Oui",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // Mettre à jour le statut de la commande à DELETED
              const { error } = await supabase
                .from("orders")
                .update({ status: "DELETED" })
                .eq("id", activeOrder.id);
              
              if (error) {
                console.error("Erreur lors de l'annulation de la commande:", error);
                throw error;
              }
              
              // Mettre à jour la disponibilité de la table
              await updateTableAvailability(true);
              
              // Rafraîchir les données
              await fetchTableOrder(restaurantId, table.id);
              
              Alert.alert("Succès", "La commande a été annulée");
              
            } catch (error) {
              console.error("Erreur lors de l'annulation de la commande:", error);
              Alert.alert("Erreur", "Impossible d'annuler la commande");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

    // Fonction pour valider la commande (changer le statut à COMPLETED)
const handleValidateOrder = async () => {
    if (!activeOrder) {
      Alert.alert("Information", "Aucune commande active à valider");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Mise à jour du statut directement avec le client Supabase
      const { data, error } = await supabase
        .from("orders")
        .update({ status: "COMPLETED", completed_at: new Date().toISOString() })
        .eq("id", activeOrder.id)
        .select();
      
      if (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
        throw error;
      }
      
      // Ajouter l'historique de statut
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: activeOrder.id,
          status: "COMPLETED"
        });
      
      if (historyError) {
        console.error("Erreur lors de l'ajout à l'historique:", historyError);
        // On ne bloque pas le processus si l'historique échoue
      }
      
      // Mise à jour réussie
      Alert.alert("Succès", "La commande a été validée avec succès");
      
      await updateTableAvailability(true);
      // Actualiser les données
      await fetchTableOrder(restaurantId, table.id);
      
    } catch (error) {
      console.error("Erreur lors de la validation de la commande:", error);
      Alert.alert("Erreur", "Impossible de valider la commande");
    } finally {
      setIsLoading(false);
    }
  };

// Fonction corrigée sans aucun champ temporaire envoyé à l'API
const handleConfirmProducts = async () => {
  console.log("Début handleConfirmProducts");
  
  try {
    setIsLoading(true);
    
    // Traiter les produits standards (seulement si nous sommes dans une catégorie de produits)
    const selectedProducts = [];
    if (!displayingMenus) {
      Object.keys(productQuantities)
        .filter(id => productQuantities[id] > 0)
        .forEach(id => {
          const product = products.find(p => p.id === id);
          if (product) {
            selectedProducts.push({
              name: product.name,
              quantity: productQuantities[id],
              unit_price: product.price,
              subtotal: product.price * productQuantities[id],
              product_id: product.id
            });
          }
        });
    }
    
    // Traiter les menus sélectionnés (seulement si nous sommes dans la catégorie menus)
    let menuItemsAndOptions = [];
    
    if (displayingMenus && selectedMenuId && productQuantities[selectedMenuId] > 0) {
      const menu = menus.find(m => m.id === selectedMenuId);
      
      if (menu) {
        // Calculer le prix total du menu avec les options supplémentaires
        let totalAdditionalPrice = 0;
        let selectedOptions = [];
        
        // Collecter toutes les options sélectionnées et leur prix
        Object.entries(selectedMenuOptions).forEach(([categoryId, optionIds]) => {
          const category = menu.categories.find(cat => cat.id === categoryId);
          if (!category) return;
          
          optionIds.forEach(optionId => {
            const option = category.options.find(opt => opt.id === optionId);
            if (option) {
              totalAdditionalPrice += option.additional_price;
              selectedOptions.push({
                categoryId,
                categoryName: category.name,
                optionId,
                optionName: option.name,
                additionalPrice: option.additional_price
              });
            }
          });
        });
        
        // Ajouter les informations du menu pour traitement séparé
        // Nous n'envoyons pas cela directement à l'API, c'est pour notre usage local
        menuItemsAndOptions = {
          menu: {
            menu_id: menu.id,
            name: menu.name,
            quantity: productQuantities[selectedMenuId],
            unit_price: menu.price,
            subtotal: (menu.price + totalAdditionalPrice) * productQuantities[selectedMenuId]
          },
          options: selectedOptions.map(option => ({
            menu_option_id: option.optionId,
            name: option.optionName,
            quantity: productQuantities[selectedMenuId],
            unit_price: option.additionalPrice,
            subtotal: option.additionalPrice * productQuantities[selectedMenuId]
          }))
        };
      }
    }
    
    if (selectedProducts.length === 0 && !menuItemsAndOptions.menu) {
      Alert.alert("Attention", "Aucun produit ou menu sélectionné");
      setIsLoading(false);
      return;
    }
    
    if (activeOrder) {
      // Clone profond des items existants
      const existingItems = JSON.parse(JSON.stringify(activeOrder.order_items || []));
      
      // Tableau pour stocker tous les items (existants mis à jour + nouveaux)
      const updatedItems = [];
      
      // Traiter d'abord les items existants
      for (const item of existingItems) {
        // Vérifier si c'est un produit standard
        const isProductItem = !item.menu_id && !item.menu_option_id;
        
        if (isProductItem) {
          const selectedProduct = selectedProducts.find(p => p.product_id === item.product_id);
          
          if (selectedProduct) {
            // Mettre à jour la quantité et le sous-total
            updatedItems.push({
              ...item,
              quantity: item.quantity + selectedProduct.quantity,
              subtotal: item.unit_price * (item.quantity + selectedProduct.quantity)
            });
            // Marquer comme traité
            selectedProduct.processed = true;
          } else {
            // Conserver l'item tel quel
            updatedItems.push(item);
          }
        } else {
          // Conserver les menus existants tels quels
          updatedItems.push(item);
        }
      }
      
      // Ajouter les nouveaux produits standards (ceux qui n'ont pas été traités)
      for (const product of selectedProducts) {
        if (!product.processed) {
          updatedItems.push({
            name: product.name,
            quantity: product.quantity,
            unit_price: product.unit_price,
            subtotal: product.subtotal,
            product_id: product.product_id,
            order_id: activeOrder.id
          });
        }
      }
      
      // Ajouter les menus et options en 2 étapes
      // Étape 1: Créer la commande seulement avec les produits et menus parents
      let newTotal = updatedItems.reduce((sum, item) => {
        if (item.parent_order_item_id) {
          return sum;
        }
        return sum + Number(item.subtotal);
      }, 0);
      
      // Si un menu a été sélectionné, ajouter son prix au total
      if (menuItemsAndOptions.menu) {
        newTotal += menuItemsAndOptions.menu.subtotal;
      }
      
      const newSubtotal = newTotal / 1.1;
      const newTax = newTotal - newSubtotal;
      
      // Étape 1: Mettre à jour la commande avec les produits et calculer le nouveau total
      const updateData = {
        order_id: activeOrder.id,
        update_items: true,
        items: updatedItems,
        amount_total: newTotal,
        amount_subtotal: newSubtotal,
        amount_tax: newTax
      };
      
      console.log("Données à envoyer (étape 1):", JSON.stringify(updateData));
      
      // Envoyer la requête
      const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/updateOrder`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(updateData)
      });
      
      // Analyser la réponse
      let responseData;
      try {
        const responseText = await response.text();
        responseData = safeJSONParse(responseText);
        console.log("Réponse de l'API (étape 1):", response.status, responseData);
        
        if (!response.ok) {
          console.error("Erreur API:", responseData);
          throw new Error("Erreur lors de la mise à jour de la commande");
        }
      } catch (e) {
        console.error("Erreur de parsing JSON:", e);
        throw new Error("Erreur de format dans la réponse de l'API");
      }
      
      // Étape 2: Si un menu a été sélectionné, l'ajouter séparément
      if (menuItemsAndOptions.menu) {
        try {
          // Récupérer la commande mise à jour avec les IDs des items
          const { data: refreshedOrder, error: fetchError } = await supabase
            .from("orders")
            .select(`
              id,
              order_items (*)
            `)
            .eq("id", activeOrder.id)
            .single();
            
          if (fetchError) throw fetchError;
          
          // Ajouter le menu parent
          const { data: menuItem, error: menuError } = await supabase
            .from("order_items")
            .insert({
              order_id: activeOrder.id,
              menu_id: menuItemsAndOptions.menu.menu_id,
              name: menuItemsAndOptions.menu.name,
              quantity: menuItemsAndOptions.menu.quantity,
              unit_price: menuItemsAndOptions.menu.unit_price,
              subtotal: menuItemsAndOptions.menu.subtotal
            })
            .select()
            .single();
            
          if (menuError) throw menuError;
          
          // Ajouter les options du menu
          for (const option of menuItemsAndOptions.options) {
            const { error: optionError } = await supabase
              .from("order_items")
              .insert({
                order_id: activeOrder.id,
                menu_option_id: option.menu_option_id,
                parent_order_item_id: menuItem.id,  // Utiliser l'ID du menu parent créé
                name: option.name,
                quantity: option.quantity,
                unit_price: option.unit_price,
                subtotal: option.subtotal
              });
              
            if (optionError) throw optionError;
          }
          
          console.log("Menu et options ajoutés avec succès");
        } catch (menuError) {
          console.error("Erreur lors de l'ajout du menu:", menuError);
          Alert.alert("Attention", "Les produits ont été ajoutés mais il y a eu un problème avec le menu");
        }
      }
      
      // Rafraîchir les données
      await fetchTableOrder(restaurantId, table.id);
      
      // Réinitialiser les états
      setProductQuantities({});
      setSelectedMenuId(null);
      setSelectedMenuOptions({});
      setShowProductSelection(false);
      
      Alert.alert("Succès", `Commande mise à jour avec succès${displayingMenus ? " (menu ajouté)" : ""}`);
    } else {
      Alert.alert("Information", "La création d'une nouvelle commande n'est pas encore implémentée");
    }
  } catch (error) {
    console.error("Erreur lors de la confirmation des produits:", error);
    Alert.alert("Erreur", "Impossible de mettre à jour la commande");
  } finally {
    setIsLoading(false);
  }
};

const fetchTableOrder = async (restaurantId, tableId) => {
    try {
      setLoadingOrder(true);
      const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/getRestaurantOrders`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          "restaurant_id": restaurantId,
          "table_id": tableId
        })
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de la commande");
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        setActiveOrder(result.data[0]);
      } else {
        setActiveOrder(null);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la commande:", error);
    } finally {
      setLoadingOrder(false);
    }
  };
  
  // Fonction pour récupérer les données de la table depuis Supabase
  const fetchTableData = async (tableId) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("tables")
        .select("*")
        .eq("id", tableId)
        .single();
      
      if (error) {
        console.error("Erreur lors de la récupération de la table:", error);
        Alert.alert("Erreur", "Impossible de récupérer les informations de la table");
        return;
      }
      
      if (data) {
        setIsAvailable(data.is_available);
      }
    } catch (error) {
      console.error("Exception lors de la récupération de la table:", error);
      Alert.alert("Erreur", "Une erreur s'est produite");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour récupérer les catégories et produits
const fetchCategoriesAndProducts = async () => {
  try {
    setLoadingProducts(true);

    const bodyData = {
      "restaurant_id": restaurantId,
      "available_onsite": true  
    };
    
    // Récupérer les catégories et produits standards
    const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/getCategoryProductByRestaurant`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(bodyData)
    });
    
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des produits");
    }
    
    const data = await response.json();
    
    // Récupérer les menus
    const menusResponse = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/get_menu_by_restaurant`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(bodyData)
    });
    
    if (!menusResponse.ok) {
      throw new Error("Erreur lors de la récupération des menus");
    }
    
    const menusData = await menusResponse.json();
    console.log("tst", menusData);
    
    
    if (data.success) {
      // Filtrer les produits qui ne sont pas supprimés
      const availableProducts = data.products.filter(product => !product.is_deleted);
      setProducts(availableProducts);
      
      // Ajouter une catégorie "Menus" si des menus existent
      const categoriesList = [...data.categories];
      
      if (menusData.success && menusData.menus && menusData.menus.length > 0) {
        // Filtrer les menus actifs
        const activeMenus = menusData.menus.filter(menu => menu.is_active && !menu.is_deleted);
        setMenus(activeMenus);
        
        // Ajouter une catégorie "Menus" en début de liste
        if (activeMenus.length > 0) {
          categoriesList.unshift({
            id: "menus_category",
            name: "Menus",
            is_default: false,
            restaurant_id: restaurantId
          });
        }
      }
      
      setCategories(categoriesList);
      
      // Initialiser les quantités à 0 pour chaque produit
      const quantities = {};
      availableProducts.forEach(product => {
        quantities[product.id] = 0;
      });
      
      // Initialiser également les quantités des menus à 0
      if (menusData.success && menusData.menus) {
        menusData.menus.forEach(menu => {
          quantities[menu.id] = 0;
        });
      }
      
      setProductQuantities(quantities);
      
      // Sélectionner la première catégorie par défaut (qui sera "Menus" si elle existe)
      if (categoriesList.length > 0) {
        setSelectedCategory(categoriesList[0].id);
        // Si la première catégorie est "Menus", marquer comme affichant les menus
        if (categoriesList[0].id === "menus_category") {
          setDisplayingMenus(true);
        } else {
          setDisplayingMenus(false);
        }
      }
    } else {
      Alert.alert("Erreur", "Impossible de récupérer les produits");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    Alert.alert("Erreur", "Une erreur s'est produite lors de la récupération des produits");
  } finally {
    setLoadingProducts(false);
  }
};
  
  // Fonction pour mettre à jour le statut de disponibilité dans Supabase
  const updateTableAvailability = async (newStatus) => {
    if (!table?.id) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("tables")
        .update({ is_available: newStatus })
        .eq("id", table.id)
        .select();
      
      if (error) {
        console.error("Erreur lors de la mise à jour de la table:", error);
        Alert.alert("Erreur", "Impossible de mettre à jour la disponibilité de la table");
        return false;
      }
      
      // Mise à jour réussie
      setIsAvailable(newStatus);
      
      // Notifier le composant parent de la mise à jour
      if (onTableUpdate && data && data.length > 0) {
        onTableUpdate(data[0]);
      }
      
      return true;
    } catch (error) {
      console.error("Exception lors de la mise à jour de la table:", error);
      Alert.alert("Erreur", "Une erreur s'est produite");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gestionnaire pour ajouter des produits
  const handleAddProducts = () => {
    setShowProductSelection(true);
    fetchCategoriesAndProducts();
  };
  
  const changeProductQuantity = (productId, increment) => {
    setProductQuantities(prev => {
      const currentQuantity = prev[productId] || 0;
      let newQuantity;
      
      if (increment) {
        newQuantity = currentQuantity + 1;
        
        // Si c'est un menu et qu'on l'ajoute pour la première fois, initialiser les options
        if (displayingMenus && currentQuantity === 0 && newQuantity === 1) {
          setSelectedMenuId(productId);
          setSelectedMenuOptions(initializeMenuOptions(productId));
        }
      } else {
        newQuantity = Math.max(0, currentQuantity - 1);
        
        // Si on enlève complètement un menu, réinitialiser la sélection
        if (displayingMenus && currentQuantity === 1 && newQuantity === 0 && selectedMenuId === productId) {
          setSelectedMenuId(null);
          setSelectedMenuOptions({});
        }
      }
      
      return { ...prev, [productId]: newQuantity };
    });
  };
  
  // Fonction pour revenir à l'écran précédent
  const handleBackToMainScreen = () => {
    setShowProductSelection(false);
  };
  
  // Si pas de table sélectionnée, ne rien afficher
  if (!table) return null;
  
  // Fonction pour changer la quantité
  const changeQuantity = (setter, currentValue, increment) => {
    if (increment && currentValue < 20) {
      setter(currentValue + 1);
    } else if (!increment && currentValue > 0) {
      setter(currentValue - 1);
    }
  };
  
  // Obtenir les produits filtrés par catégorie
  const getFilteredProducts = () => {
    // Si on est dans la catégorie "Menus", retourner une liste vide (les menus sont gérés séparément)
    if (displayingMenus) {
      return [];
    }
    
    // Sinon, retourner les produits de la catégorie sélectionnée
    if (!selectedCategory) return [];
    return products.filter(product => product.category_id === selectedCategory);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    // Déterminer si on affiche des menus ou des produits standards
    setDisplayingMenus(categoryId === "menus_category");
    
    // Réinitialiser la sélection du menu si on change de catégorie
    if (categoryId !== "menus_category") {
      setSelectedMenuId(null);
      setSelectedMenuOptions({});
    }
  };

  const initializeMenuOptions = (menuId) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu || !menu.categories) return {};
    
    // Créer un objet avec les catégories requises initialisées avec la première option
    const initialOptions = {};
    menu.categories.forEach(category => {
      if (category.is_required && category.options.length > 0) {
        initialOptions[category.id] = [category.options[0].id];
      } else {
        initialOptions[category.id] = [];
      }
    });
    
    return initialOptions;
  };

  const handleOptionSelection = (categoryId, optionId, isSelected) => {
    const menu = menus.find(m => m.id === selectedMenuId);
    if (!menu) return;
    
    setSelectedMenuOptions(prevOptions => {
      const category = menu.categories.find(cat => cat.id === categoryId);
      if (!category) return prevOptions;
      
      // Copier les options actuelles
      const updatedOptions = { ...prevOptions };
      
      // Si la catégorie permet une seule sélection (max_options = 1)
      if (category.max_options === 1) {
        // Remplacer par la nouvelle sélection
        updatedOptions[categoryId] = isSelected ? [optionId] : [];
      } else {
        // Sinon, ajouter ou supprimer l'option
        if (isSelected) {
          // Vérifier si on n'a pas dépassé le max_options
          if (!updatedOptions[categoryId]) {
            updatedOptions[categoryId] = [optionId];
          } else if (updatedOptions[categoryId].length < category.max_options) {
            updatedOptions[categoryId] = [...updatedOptions[categoryId], optionId];
          } else {
            // Si max atteint, ne rien faire
            return prevOptions;
          }
        } else {
          // Supprimer l'option
          updatedOptions[categoryId] = updatedOptions[categoryId].filter(id => id !== optionId);
        }
      }
      
      return updatedOptions;
    });
  };

  const areRequiredCategoriesSelected = () => {
    const menu = menus.find(m => m.id === selectedMenuId);
    if (!menu) return false;
    
    return menu.categories.every(category => {
      if (category.is_required) {
        return selectedMenuOptions[category.id] && selectedMenuOptions[category.id].length > 0;
      }
      return true;
    });
  };
  
  const customStyles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: width * 0.85,
      maxHeight: height * 0.7,
      backgroundColor: colors.colorBackground,
      borderRadius: 15,
      paddingVertical: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 15,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.colorText,
    },
    closeButton: {
      padding: 5,
    },
    closeButtonText: {
      fontSize: 22,
      color: colors.colorText,
      fontWeight: "500",
    },
    backButton: {
      padding: 5,
      flexDirection: "row",
      alignItems: "center",
    },
    backButtonText: {
      fontSize: 16,
      color: colors.colorText,
      marginLeft: 5,
    },
    separator: {
      height: 1,
      backgroundColor: colors.colorBorderAndBlock,
      marginHorizontal: 20,
      marginBottom: 15,
    },
    contentScroll: {
      paddingHorizontal: 20,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.colorText,
      marginBottom: 10,
    },
    availabilityContainer: {
      backgroundColor: colors.colorBorderAndBlock,
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    availabilityText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.colorText,
    },
    switchContainer: {
      width: 50,
      height: 24,
      borderRadius: 12,
      padding: 2,
      backgroundColor: isAvailable ? "#4CAF50" : "#F44336",
    },
    switchThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "white",
      marginLeft: isAvailable ? 24 : 2,
    },
    loadingOverlay: {
      opacity: 0.7,
    },
    menuTypeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    menuTypeButton: {
      flex: 1,
      backgroundColor: colors.colorBorderAndBlock,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      marginHorizontal: 5,
    },
    menuTypeButtonActive: {
      backgroundColor: colors.colorText,
    },
    menuTypeText: {
      fontWeight: "500",
      color: colors.colorText,
    },
    menuTypeTextActive: {
      color: colors.colorBackground,
    },
    addProductsButton: {
      backgroundColor: colors.colorAction,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 10,
    },
    validateButtonaddProductsText: {
      color: "white",
      fontWeight: "500",
    },
    personCountContainer: {
      backgroundColor: colors.colorBorderAndBlock,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    },
    personRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    personType: {
      fontSize: 16,
      color: colors.colorText,
    },
    personCountControls: {
      flexDirection: "row",
      alignItems: "center",
    },
    countButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.colorText,
      justifyContent: "center",
      alignItems: "center",
    },
    countButtonText: {
      color: colors.colorBackground,
      fontSize: 18,
      fontWeight: "bold",
    },
    countText: {
      marginHorizontal: 15,
      fontSize: 16,
      fontWeight: "500",
      color: colors.colorText,
      minWidth: 25,
      textAlign: "center",
    },
    orderHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    clearAllButton: {
      color: '#FF6B6B',
      fontSize: 16,
      fontWeight: '500',
    },
    orderSummaryContainer: {
      backgroundColor: '#F5F5F5',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    },
    orderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    itemQuantity: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.colorText,
      marginRight: 15,
      width: 20,
    },
    itemName: {
      flex: 1,
      fontSize: 16,
      color: colors.colorText,
    },
    itemPrice: {
      fontSize: 16,
      color: '#888',
      marginRight: 15,
    },
    deleteButton: {
      padding: 5,
    },
    deleteButtonText: {
      fontSize: 16,
      color: '#FF6B6B',
      fontWeight: '600',
    },
    orderSeparator: {
      height: 1,
      backgroundColor: '#DDDDDD',
      marginVertical: 2,
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      paddingTop: 15,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.colorText,
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.colorText,
    },
    actionButtonsContainer: {
      marginTop: 15,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    actionButton: {
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    printButton: {
      backgroundColor: '#4A6FA5',
      marginRight: 8,
    },
    printTableButton: {
      backgroundColor: '#4A6FA5',
      marginLeft: 8,
    },
    printButtonText: {
      color: 'white',
      fontWeight: '500',
      fontSize: 14,
    },
    validateButton: {
      backgroundColor: '#4CAF50',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    validateButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    // Styles pour la sélection de produits
    categoriesContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      flexWrap: 'wrap',
    },
    categoryButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: colors.colorBorderAndBlock,
    },
    categoryButtonActive: {
      backgroundColor: colors.colorText,
    },
    categoryButtonText: {
      color: colors.colorText,
      fontWeight: '500',
    },
    categoryButtonTextActive: {
      color: colors.colorBackground,
    },
    productsContainer: {
      marginBottom: 20,
    },
    productCard: {
      backgroundColor: colors.colorBorderAndBlock,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    productImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: '#eee',
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.colorText,
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 14,
      color: colors.colorDetail,
    },
    productCountControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    categoriesScrollContainer: {
        marginBottom: 15,
      },
      categoriesContainer: {
        flexDirection: 'row',
        paddingBottom: 5,
      },
      orderLoadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
      },
      noOrderContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.colorBorderAndBlock,
        borderRadius: 10,
      },
      noOrderText: {
        color: colors.colorText,
        fontSize: 16,
        textAlign: 'center',
      },
      menuOptionItem: {
        flexDirection: 'row', 
        marginBottom: 5
      },
      menuOptionText: {
        flex: 1, 
        fontSize: 14, 
        color: colors.colorDetail, 
        marginLeft: 10
      },
      menuOptionPrice: {
        fontSize: 14, 
        color: colors.colorDetail, 
        marginRight: 30
      },
      menuOptionsContainer: {
        marginLeft: 20, 
        marginTop: 5, 
        marginBottom: 10
      },
      categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.colorText,
        marginBottom: 8
      },
      optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 5
      },
      selectedOption: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.colorText,
        justifyContent: 'center',
        alignItems: 'center'
      },
      unselectedOption: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.colorText,
        justifyContent: 'center',
        alignItems: 'center'
      },
      optionName: {
        flex: 1,
        fontSize: 14,
        color: colors.colorText,
        marginLeft: 10
      },
      optionPrice: {
        fontSize: 14,
        color: colors.colorDetail,
        fontWeight: '500'
      },
      productDescription: {
        fontSize: 12,
        color: colors.colorDetail,
        marginTop: 4
      }
  });

  // Afficher l'écran de sélection de produits si showProductSelection est vrai
  if (showProductSelection) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={customStyles.modalContainer}>
          <View style={[
            customStyles.modalContent, 
            isLoading && customStyles.loadingOverlay
          ]}>
            <View style={customStyles.header}>
              <TouchableOpacity 
                style={customStyles.backButton} 
                onPress={handleBackToMainScreen}
                disabled={isLoading}
              >
                <Text style={customStyles.backButtonText}>← {t('back')}</Text>
              </TouchableOpacity>
              <Text style={customStyles.title}>
                {t('products')}
              </Text>
              <TouchableOpacity 
                style={customStyles.closeButton} 
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={customStyles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={customStyles.separator} />
            
            <ScrollView style={customStyles.contentScroll} showsVerticalScrollIndicator={false}>
            {loadingProducts ? (
                <View style={customStyles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.colorAction} />
                    <Text style={{color: colors.colorText, marginTop: 10}}>Chargement des produits...</Text>
                </View>
                ) : (
                <View style={{flex: 1}}>
                    {/* Section Catégories avec défilement horizontal */}
                    <View style={[customStyles.section, {paddingHorizontal: 20}]}>
                      <Text style={customStyles.sectionTitle}>{t('categories')}</Text>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={customStyles.categoriesScrollContainer}
                      >
                        <View style={customStyles.categoriesContainer}>
                          {categories.map(category => (
                            <TouchableOpacity
                              key={category.id}
                              style={[
                                customStyles.categoryButton,
                                selectedCategory === category.id && customStyles.categoryButtonActive
                              ]}
                              onPress={() => handleCategoryChange(category.id)}
                            >
                              <Text 
                                style={[
                                  customStyles.categoryButtonText,
                                  selectedCategory === category.id && customStyles.categoryButtonTextActive
                                ]}
                              >
                                {category.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                    
                    {/* Section Produits avec défilement vertical */}
                    {/* Section Produits ou Menus en fonction de la catégorie sélectionnée */}
                    <View style={customStyles.section}>
                      <Text style={customStyles.sectionTitle}>
                        {displayingMenus ? "Menus" : "Produits"}
                      </Text>

                      {displayingMenus ? (
                        /* Affichage des menus disponibles */
                        <View style={customStyles.productsContainer}>
                          {menus.length > 0 ? (
                            menus.map(menu => (
                              <View key={menu.id} style={customStyles.productCard}>
                                {menu.image_url ? (
                                  <Image
                                    source={{ uri: menu.image_url }}
                                    style={customStyles.productImage}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View style={customStyles.productImage} />
                                )}
                                <View style={customStyles.productInfo}>
                                  <Text style={customStyles.productName}>{menu.name}</Text>
                                  <Text style={customStyles.productPrice}>{menu.price.toFixed(2)} €</Text>
                                  {menu.description && (
                                    <Text style={customStyles.productDescription} numberOfLines={2}>
                                      {menu.description}
                                    </Text>
                                  )}
                                </View>
                                <View style={customStyles.productCountControls}>
                                  <TouchableOpacity
                                    style={customStyles.countButton}
                                    onPress={() => changeProductQuantity(menu.id, false)}
                                  >
                                    <Text style={customStyles.countButtonText}>-</Text>
                                  </TouchableOpacity>
                                  <Text style={customStyles.countText}>
                                    {productQuantities[menu.id] || 0}
                                  </Text>
                                  <TouchableOpacity
                                    style={customStyles.countButton}
                                    onPress={() => changeProductQuantity(menu.id, true)}
                                  >
                                    <Text style={customStyles.countButtonText}>+</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            ))
                          ) : (
                            <Text style={{color: colors.colorText, textAlign: 'center', marginTop: 10, marginBottom: 20}}>
                              Aucun menu disponible
                            </Text>
                          )}
                        </View>
                      ) : (
                        /* Affichage des produits standards (code existant) */
                        <View style={customStyles.productsContainer}>
                          {getFilteredProducts().length > 0 ? (
                            getFilteredProducts().map(product => (
                              <View key={product.id} style={customStyles.productCard}>
                                {product.image_url && (
                                  <Image
                                    source={{ uri: product.image_url }}
                                    style={customStyles.productImage}
                                    resizeMode="cover"
                                  />
                                )}
                                <View style={customStyles.productInfo}>
                                  <Text style={customStyles.productName}>{product.name}</Text>
                                  <Text style={customStyles.productPrice}>{product.price.toFixed(2)} €</Text>
                                </View>
                                <View style={customStyles.productCountControls}>
                                  <TouchableOpacity
                                    style={customStyles.countButton}
                                    onPress={() => changeProductQuantity(product.id, false)}
                                  >
                                    <Text style={customStyles.countButtonText}>-</Text>
                                  </TouchableOpacity>
                                  <Text style={customStyles.countText}>
                                    {productQuantities[product.id] || 0}
                                  </Text>
                                  <TouchableOpacity
                                    style={customStyles.countButton}
                                    onPress={() => changeProductQuantity(product.id, true)}
                                  >
                                    <Text style={customStyles.countButtonText}>+</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            ))
                          ) : (
                            <Text style={{color: colors.colorText, textAlign: 'center', marginTop: 10, marginBottom: 20}}>
                              Aucun produit dans cette catégorie
                            </Text>
                          )}
                        </View>
                      )}

                      {/* Affichage des options du menu si un menu est sélectionné */}
                      {displayingMenus && selectedMenuId && productQuantities[selectedMenuId] > 0 && (
                        <View style={{marginTop: 15}}>
                          <Text style={[customStyles.sectionTitle, {marginBottom: 10}]}>{t('menu_options')}</Text>
                          
                          {menus.find(m => m.id === selectedMenuId)?.categories.map(category => (
                            <View key={category.id} style={{marginBottom: 15}}>
                              <Text style={customStyles.categoryTitle}>
                                {category.name} 
                                {category.is_required ? " *" : ""} 
                                {category.max_options > 1 ? ` (${t('max')} ${category.max_options})` : ""}
                              </Text>
                              
                              {category.options.map(option => {
                                const isSelected = selectedMenuOptions[category.id]?.includes(option.id) || false;
                                
                                return (
                                  <TouchableOpacity
                                    key={option.id}
                                    style={[
                                      customStyles.optionItem,
                                      isSelected && {backgroundColor: colors.colorBorderAndBlock}
                                    ]}
                                    onPress={() => handleOptionSelection(category.id, option.id, !isSelected)}
                                  >
                                    <View style={isSelected ? customStyles.selectedOption : customStyles.unselectedOption}>
                                      {isSelected && <Text style={{color: colors.colorBackground}}>✓</Text>}
                                    </View>
                                    <Text style={customStyles.optionName}>{option.name}</Text>
                                    {option.additional_price > 0 && (
                                      <Text style={customStyles.optionPrice}>+{option.additional_price.toFixed(2)} €</Text>
                                    )}
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          ))}
                          
                          {/* Avertissement si les options requises ne sont pas sélectionnées */}
                          {!areRequiredCategoriesSelected() && (
                            <Text style={{color: '#F44336', marginTop: 5, marginBottom: 10}}>
                              Veuillez sélectionner toutes les options requises (*)
                            </Text>
                          )}
                        </View>
                      )}

                      {/* Bouton de confirmation */}
                      <TouchableOpacity 
                        style={[
                          customStyles.validateButton, 
                          {backgroundColor: colors.colorAction},
                          displayingMenus && selectedMenuId && !areRequiredCategoriesSelected() && {opacity: 0.6}
                        ]}
                        onPress={handleConfirmProducts}
                        disabled={isLoading || (displayingMenus && selectedMenuId && !areRequiredCategoriesSelected())}
                      >
                        <Text style={customStyles.validateButtonText}>{t('confirm')}</Text>
                      </TouchableOpacity>
                    </View>
                </View>
                )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  // Fonction pour confirmer et ajouter les formules à volonté à la commande
const handleConfirmFormulas = async () => {
  try {
    setIsLoading(true);
    
    // Vérifier qu'au moins une formule est sélectionnée
    const selectedFormulas = Object.entries(formulasCounts)
      .filter(([id, count]) => count > 0)
      .map(([id, count]) => {
        const formula = allYouCanEatFormulas.find(f => f.id === id);
        if (formula) {
          return {
            name: formula.name,
            quantity: count,
            unit_price: formula.price,
            subtotal: formula.price * count,
            all_you_can_eat_id: formula.id
          };
        }
        return null;
      })
      .filter(formula => formula !== null);
      
    if (selectedFormulas.length === 0) {
      Alert.alert("Attention", "Aucune formule à volonté sélectionnée");
      setIsLoading(false);
      return;
    }
    
    if (activeOrder) {
      // Clone profond des items existants
      const existingItems = JSON.parse(JSON.stringify(activeOrder.order_items || []));
      
      // Tableau pour stocker tous les items (existants mis à jour + nouveaux)
      const updatedItems = [];
      
      // Traiter d'abord les items existants
      for (const item of existingItems) {
        // Vérifier si c'est une formule à volonté
        const isFormulaItem = item.all_you_can_eat_id;
        
        if (isFormulaItem) {
          const selectedFormula = selectedFormulas.find(f => f.all_you_can_eat_id === item.all_you_can_eat_id);
          
          if (selectedFormula) {
            // Mettre à jour la quantité et le sous-total
            updatedItems.push({
              ...item,
              quantity: item.quantity + selectedFormula.quantity,
              subtotal: item.unit_price * (item.quantity + selectedFormula.quantity)
            });
            // Marquer comme traité
            selectedFormula.processed = true;
          } else {
            // Conserver l'item tel quel
            updatedItems.push(item);
          }
        } else {
          // Conserver les autres items tels quels (produits standards, menus)
          updatedItems.push(item);
        }
      }
      
      // Ajouter les nouvelles formules (celles qui n'ont pas été traitées)
      for (const formula of selectedFormulas) {
        if (!formula.processed) {
          updatedItems.push({
            name: formula.name,
            quantity: formula.quantity,
            unit_price: formula.unit_price,
            subtotal: formula.subtotal,
            all_you_can_eat_id: formula.all_you_can_eat_id,
            order_id: activeOrder.id
          });
        }
      }
      
      // Calculer le nouveau total
      let newTotal = updatedItems.reduce((sum, item) => {
        if (item.parent_order_item_id) {
          return sum;
        }
        return sum + Number(item.subtotal);
      }, 0);
      
      const newSubtotal = newTotal / 1.1;
      const newTax = newTotal - newSubtotal;
      
      // Préparer la requête de mise à jour
      const updateData = {
        order_id: activeOrder.id,
        update_items: true,
        items: updatedItems,
        amount_total: newTotal,
        amount_subtotal: newSubtotal,
        amount_tax: newTax
      };
      
      // Envoyer la requête
      const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/updateOrder`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(updateData)
      });
      
      // Analyser la réponse
      if (!response.ok) {
        const responseText = await response.text();
        console.error("Erreur API:", responseText);
        throw new Error("Erreur lors de la mise à jour de la commande");
      }
      
      // Rafraîchir les données
      await fetchTableOrder(restaurantId, table.id);
      
      // Réinitialiser les compteurs
      const initialCounts = {};
      allYouCanEatFormulas.forEach(formula => {
        initialCounts[formula.id] = 0;
      });
      setFormulasCounts(initialCounts);
      
      Alert.alert("Succès", "Formules à volonté ajoutées à la commande");
    } else {
      Alert.alert("Information", "Veuillez d'abord créer une commande");
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout des formules:", error);
    Alert.alert("Erreur", "Impossible d'ajouter les formules à la commande");
  } finally {
    setIsLoading(false);
  }
};

  // Fonction pour supprimer un item de la commande
const handleRemoveItem = async (itemId) => {
    if (!activeOrder) return;
    
    try {
      setIsLoading(true);
      
      // Supprimer l'item du tableau local
      const updatedItems = activeOrder.order_items.filter(item => item.id !== itemId);
      
      // Calculer le nouveau total
      const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const newSubtotal = newTotal / 1.1; // Estimation du sous-total (à ajuster selon votre taux de TVA)
      const newTax = newTotal - newSubtotal;
      
      // Préparer la requête de mise à jour
      const updateData = {
        order_id: activeOrder.id,
        update_items: true,
        items: updatedItems,
        amount_total: newTotal,
        amount_subtotal: newSubtotal,
        amount_tax: newTax
      };
      
      // Envoyer la requête de mise à jour
      const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/updateOrder`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la commande");
      }
      
      // Mettre à jour l'état local avec la commande modifiée
      setActiveOrder({
        ...activeOrder,
        order_items: updatedItems,
        amount_total: newTotal,
        amount_subtotal: newSubtotal,
        amount_tax: newTax
      });
      
      Alert.alert("Succès", "Le produit a été supprimé de la commande");
      
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      Alert.alert("Erreur", "Impossible de supprimer le produit de la commande");
    } finally {
      setIsLoading(false);
    }
  };

  
  // Fonction pour effacer toute la commande
  const handleClearOrder = async () => {
    if (!activeOrder) return;
    
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment vider toute la commande ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Confirmer",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // Préparer la requête de mise à jour avec un tableau d'items vide
              const updateData = {
                order_id: activeOrder.id,
                update_items: true,
                items: [],
                amount_total: 0,
                amount_subtotal: 0,
                amount_tax: 0
              };
              
              // Envoyer la requête de mise à jour
              const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/updateOrder`, {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json',
                  "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify(updateData)
              });
              
              if (!response.ok) {
                throw new Error("Erreur lors de la mise à jour de la commande");
              }
              
              // Mettre à jour l'état local
              setActiveOrder({
                ...activeOrder,
                order_items: [],
                amount_total: 0,
                amount_subtotal: 0,
                amount_tax: 0
              });
              
              Alert.alert("Succès", "La commande a été vidée");
              
            } catch (error) {
              console.error("Erreur lors de la suppression des produits:", error);
              Alert.alert("Erreur", "Impossible de vider la commande");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Afficher l'écran principal
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={customStyles.modalContainer}>
        <View style={[
          customStyles.modalContent, 
          isLoading && customStyles.loadingOverlay
        ]}>
          <View style={customStyles.header}>
            <Text style={customStyles.title}>
              {t('table')} {table.table_number}
            </Text>
            <TouchableOpacity 
              style={customStyles.closeButton} 
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={customStyles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={customStyles.separator} />
          
          <ScrollView style={customStyles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Section Disponibilité - Toujours visible */}
            <View style={[customStyles.menuTypeContainer, {marginTop: 10}]}>
                {isAvailable ? (
                    <TouchableOpacity 
                    style={[customStyles.menuTypeButton, {backgroundColor: colors.colorAction}]}
                    onPress={handleNewOrder}
                    disabled={isLoading}
                    >
                    <Text style={[customStyles.menuTypeText, {color: 'white'}]}>
                        {t('new_order')}
                    </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                    style={[customStyles.menuTypeButton, {backgroundColor: '#F44336'}]}
                    onPress={handleCancelOrder}
                    disabled={isLoading}
                    >
                    <Text style={[customStyles.menuTypeText, {color: 'white'}]}>
                        {t('cancel_order')}
                    </Text>
                    </TouchableOpacity>
                )}
            </View>
            
            {/* Sections supplémentaires - Visibles uniquement si la table n'est PAS disponible */}
            {!isAvailable && (
              <View style={customStyles.section}>
                <Text style={customStyles.sectionTitle}>{t('menu_type')}</Text>
                <View style={customStyles.menuTypeContainer}>
                {restaurantAllowsALaCarte && (
                  <TouchableOpacity 
                    style={[
                      customStyles.menuTypeButton, 
                      menuType === "carte" && customStyles.menuTypeButtonActive
                    ]}
                    onPress={() => setMenuType("carte")}
                    disabled={isLoading}
                  >
                    <Text 
                      style={[
                        customStyles.menuTypeText,
                        menuType === "carte" && customStyles.menuTypeTextActive
                      ]}
                    >
                      {t('à_la_carte')}
                    </Text>
                  </TouchableOpacity>
                )}
                {restaurantAllowsAllYouCanEat && (
                  <TouchableOpacity 
                    style={[
                      customStyles.menuTypeButton, 
                      menuType === "volonte" && customStyles.menuTypeButtonActive
                    ]}
                    onPress={() => setMenuType("volonte")}
                    disabled={isLoading}
                  >
                    <Text 
                      style={[
                        customStyles.menuTypeText,
                        menuType === "volonte" && customStyles.menuTypeTextActive
                      ]}
                    >
                      {t('all_you_can_eat')}
                    </Text>
                  </TouchableOpacity>
                )}
                </View>
                
                {/* Contenu conditionnel selon le type de menu */}
                {menuType === "carte" && restaurantAllowsALaCarte ? (
                  <>
                    <TouchableOpacity 
                      style={[customStyles.validateButton, {backgroundColor : colors.colorAction}]}
                      disabled={isLoading}
                      onPress={handleAddProducts}
                    >
                      <Text style={[customStyles.validateButtonText]}>{t('add_products')}</Text>
                    </TouchableOpacity>
                    
                  </>
                ) : (
                  <View>
                    <View style={customStyles.personCountContainer}>
                      {allYouCanEatFormulas.length > 0 ? (
                        allYouCanEatFormulas.map(formula => (
                          <View key={formula.id} style={customStyles.personRow}>
                            <Text style={customStyles.personType}>{formula.name}</Text>
                            <View style={customStyles.personCountControls}>
                              <TouchableOpacity 
                                style={customStyles.countButton}
                                onPress={() => changeFormulaQuantity(formula.id, false)}
                                disabled={isLoading}
                              >
                                <Text style={customStyles.countButtonText}>-</Text>
                              </TouchableOpacity>
                              <Text style={customStyles.countText}>
                                {formulasCounts[formula.id] || 0}
                              </Text>
                              <TouchableOpacity 
                                style={customStyles.countButton}
                                onPress={() => changeFormulaQuantity(formula.id, true)}
                                disabled={isLoading}
                              >
                                <Text style={customStyles.countButtonText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))
                      ) : (
                        <Text style={{color: colors.colorText, textAlign: 'center'}}>
                          Aucune formule à volonté disponible
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity 
                      style={[
                        customStyles.validateButton, 
                        {backgroundColor: colors.colorAction, marginTop: 15},
                        Object.values(formulasCounts).every(count => count === 0) && {opacity: 0.6}
                      ]}
                      onPress={handleConfirmFormulas}
                      disabled={isLoading || Object.values(formulasCounts).every(count => count === 0)}
                    >
                      <Text style={customStyles.validateButtonText}>{t('add_to_order')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View style={[customStyles.section, { marginTop: 20 }]}>
                    <View style={customStyles.orderHeaderContainer}>
                    <Text style={customStyles.sectionTitle}>{t('order_summary')}</Text>
                    <TouchableOpacity 
                        disabled={isLoading || loadingOrder || !activeOrder || activeOrder.order_items.length === 0}
                        onPress={handleClearOrder}
                        >
                        <Text style={customStyles.clearAllButton}>{t('clear')}</Text>
                    </TouchableOpacity>
                    </View>
                    <View style={[customStyles.orderSummaryContainer, {backgroundColor : colors.colorBorderAndBlock}]}>
                    {loadingOrder ? (
                        <View style={customStyles.orderLoadingContainer}>
                            <ActivityIndicator size="small" color={colors.colorAction} />
                            <Text style={{color: colors.colorText, marginTop: 10}}>Chargement de la commande...</Text>
                        </View>
                        ) : !activeOrder ? (
                        <View style={[customStyles.orderSummaryContainer, {backgroundColor: colors.colorBorderAndBlock}]}>
                            <Text style={{color: colors.colorText, textAlign: 'center'}}>Aucune commande active pour cette table</Text>
                        </View>
                        ) : (
                        <View style={[customStyles.orderSummaryContainer, {backgroundColor: colors.colorBorderAndBlock}]}>
                            {activeOrder.order_items.length === 0 ? (
                            <Text style={{color: colors.colorText, textAlign: 'center'}}>{t('no_product_in_order')}</Text>
                            ) : (
                            activeOrder.order_items.map((item, index) => (
                                <React.Fragment key={item.id}>
                                <View style={customStyles.orderItem}>
                                    <Text style={customStyles.itemQuantity}>{item.quantity}</Text>
                                    <Text style={customStyles.itemName}>{item.name}</Text>
                                    <Text style={customStyles.itemPrice}>{item.unit_price.toFixed(2).replace('.', ',')} €</Text>
                                    <TouchableOpacity 
                                        style={customStyles.deleteButton} 
                                        disabled={isLoading || loadingOrder}
                                        onPress={() => handleRemoveItem(item.id)}
                                        >
                                        <Text style={customStyles.deleteButtonText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                {/* Affichage des options de menu s'il y en a */}
                                {item.options && item.options.length > 0 && (
                                    <View style={{marginLeft: 20, marginTop: 5, marginBottom: 10}}>
                                    {item.options.map(option => (
                                        <View key={option.id} style={{flexDirection: 'row', marginBottom: 5}}>
                                        <Text style={{flex: 1, fontSize: 14, color: colors.colorDetail, marginLeft: 10}}>
                                            • {option.name}
                                        </Text>
                                        {option.unit_price > 0 && (
                                            <Text style={{fontSize: 14, color: colors.colorDetail, marginRight: 30}}>
                                            +{option.unit_price.toFixed(2).replace('.', ',')} €
                                            </Text>
                                        )}
                                        </View>
                                    ))}
                                    </View>
                                )}
                                
                                {index < activeOrder.order_items.length - 1 && (
                                    <View style={customStyles.orderSeparator} />
                                )}
                                </React.Fragment>
                            ))
                            )}
                            
                            {activeOrder.order_items.length > 0 && (
                            <>
                                <View style={customStyles.orderSeparator} />
                                
                                <View style={customStyles.totalContainer}>
                                <Text style={customStyles.totalLabel}>{t('total')}</Text>
                                <Text style={customStyles.totalAmount}>
                                    {activeOrder.amount_total.toFixed(2).replace('.', ',')} €
                                </Text>
                                </View>
                            </>
                            )}
                        </View>
                        )}
                    </View>
                    
                    <View style={customStyles.actionButtonsContainer}>
                    <View style={customStyles.actionRow}>
                        <TouchableOpacity 
                            style={[customStyles.actionButton, customStyles.printButton]} 
                            disabled={isLoading || isPrinting || !activeOrder}
                            onPress={handlePrintReceipt}
                        >
                            <Text style={customStyles.printButtonText}>
                            {isPrinting ? "Impression..." : t('receipt')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[customStyles.actionButton, customStyles.printTableButton]} 
                            disabled={isLoading || isPrinting || !table.table_number}
                            onPress={handlePrintTableNumber}
                        >
                            <Text style={customStyles.printButtonText}>
                            {isPrinting ? "Impression..." : t('print_table_number')}
                            </Text>
                        </TouchableOpacity>
                        </View>
                        <TouchableOpacity 
                        style={[customStyles.validateButton,{backgroundColor : colors.colorAction}]} 
                        disabled={isLoading || !activeOrder || activeOrder.order_items.length === 0}
                        onPress={handleValidateOrder}
                        >
                            <Text style={customStyles.validateButtonText}>{t('validate_order')}</Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RestaurantDetailsModal;