import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { apiService } from "../API/ApiService";
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from "react-native-vector-icons/Ionicons"


function CardsOrder() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState('Tous');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const newFilteredOrders = orders.filter(order => {
      if (filter === 'Tous') return true;
      return order.client_method === filter;
    });
    setFilteredOrders(newFilteredOrders);
  }, [orders, filter]);

  const fetchOrders = async () => {
    try {
      const ordersData = await apiService.getAllOrdersAndClients();
      const formattedOrders = ordersData.map(client => {
        const total = client.orders.reduce((acc, product) => {
          const price = parseFloat(product.product_price) || 0;
          const quantity = parseFloat(product.order_quantity) || 0;
          return acc + (price * quantity);
        }, 0);
        return { ...client, total };
      });
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
    }
  };

  const handleDelete = async (clientId) => {
    try {
      await apiService.deleteClient(clientId);
      alert("Client et commandes supprimés avec succès");
      fetchOrders();
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const currentOrders = filteredOrders;
  return (
    <View style={styles.container}>

      <View style={styles.containerFilterOrder}>
        <RNPickerSelect
          onValueChange={(value) => handleFilterChange(value)}
          items={[
            { label: 'Tous', value: 'Tous' },
            { label: 'A emporter', value: 'A emporter' },
            { label: 'Livraison', value: 'Livraison' }
          ]}
          value={filter}
          style={{ inputAndroid: { ...styles.filterOrder, height: 40 }, inputIOS: { ...styles.filterOrder, height: 40 } }}
          Icon={() => {
            return <Ionicons name="chevron-down" size={24} color="gray" margin={10}/>;
        }}
        />
      </View>

      <ScrollView style={styles.containerScrollOrder}>
        <View style={styles.containerCard}>

        {currentOrders.length > 0 ? currentOrders.map(order => (
                <View key={order.client_id} style={styles.cardOrder}>
                    <View style={styles.containerTitleCardOrder}>
                        <Text style={styles.titleCardOrder}>Commande #{order.client_id}</Text>
                        <Text style={styles.textMethod}>{order.client_method}</Text>
                    </View>

                    <View style={styles.sectionCardOrder}>
                        <View style={styles.order}>
                            {order.orders ? order.orders.map((product, index) => (
                            <View key={index} style={styles.productOrder}>
                                <Text style={styles.textProduct}><Text style={styles.bold}>{product.order_quantity}x</Text> - {product.product_title || 'Produit inconnu'}</Text>
                            </View>
                            )) : <Text>Informations sur les commandes indisponibles</Text>}
                        </View>

                        <View style={styles.orderInfoClient}>
                            <Text style={styles.textClient}><Text style={styles.bold}>Client:</Text> {order.client_firstname} {order.client_lastname}</Text>
                            <Text style={styles.textClient}><Text style={styles.bold}>Mail:</Text> {order.client_email}</Text>
                            <Text style={styles.textClient}><Text style={styles.bold}>Tel:</Text> {order.client_phone}</Text>
                            <Text style={styles.textClient}><Text style={styles.bold}>Adresse:</Text> {order.client_address}</Text>
                            <Text style={styles.totalOrder}><Text style={styles.bold}>Total:</Text> {order.total ? order.total.toFixed(2) : '0.00'} €</Text>

                            <TouchableOpacity style={styles.deleteOrder} onPress={() => handleDelete(order.client_id)} >
                                <Text style={styles.deleteOrderText}>Supprimer</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            

        )) : <Text style={styles.textEmptyOrder}>Aucune commande trouvée.</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    containerScrollOrder:{
        height: 463,                                                                                                                                                                                                                                                                   
        width: "100%"
    },
    containerCard:{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    cardOrder:{
        backgroundColor:"#dcdcdc",
        marginBottom: 40,
        width: "80%",
        padding: 20
    },
    containerTitleCardOrder:{
        marginBottom: 20
    },
    order:{
        marginBottom: 40
    },
    deleteOrder:{
        marginTop: 30,
        backgroundColor: "red",
        width: "100%",
        height: 40,
        display: "flex",
        justifyContent: "center",
        alignItems : "center",
        borderRadius: 10
    },
    deleteOrderText:{
        color: "#fff",
    },
    titleCardOrder:{
        textAlign:"center",
        fontSize: 22
    },
    textMethod:{
        textAlign: "center",
        marginTop: 10,
        fontSize: 20
    },
    textProduct:{
        fontSize: 18
    },
    textClient:{
        fontSize:18,
        marginBottom: 5
    },
    bold:{
        fontWeight: 'bold'
    }, 
    totalOrder:{
        fontSize:18,
        marginBottom: 5 
    },
    containerFilterOrder:{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "40%",
    }, 
    filterOrder:{
        width: "100%",
        marginBottom: 20,
        borderWidth: 2,
        borderColor: "#ff9a00",
        paddingLeft: 20,
        borderRadius: 10
    },
    container:{
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    }
});

export default CardsOrder;
