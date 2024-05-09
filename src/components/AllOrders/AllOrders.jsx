import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "../API/ApiService";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";
import RNPickerSelect from 'react-native-picker-select';


function AllOrders({ refreshCounter, onRefresh }) {
    const [nameRestaurant, setNameRestaurant] = useState('');
    const [ordersAndClients, setOrdersAndClients] = useState([]);
    const navigation = useNavigation(); // Obtenez l'objet de navigation
    const { t } = useTranslation();
    const { colors } = useColors()
    const [selectedMonth, setSelectedMonth] = useState('');
    const [orderFiltred, setOrderFiltred] = useState([]);




    useEffect(() => {
        const fetchRefRestaurant = async () => {
            try {
                const user = await AsyncStorage.getItem("user");
                const userObject = JSON.parse(user);
                const nameRestaurant = userObject.ref_restaurant;
                setNameRestaurant(nameRestaurant);
            } catch (error) {
                console.error('Erreur lors de la récupération de ref_restaurant depuis le stockage:', error);
            }
        };
        fetchRefRestaurant();
    }, []);


    useEffect(() => {
        if (nameRestaurant) {
            fetchOrdersAndClients();
        }
    }, [nameRestaurant]);


    const fetchOrdersAndClients = async () => {
        try {
            const fetchedUsers = await apiService.getAllOrdersAndClientsData(nameRestaurant);
            setOrdersAndClients(fetchedUsers); 
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error.message);
        }
    };


    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Rechargez les commandes chaque fois que l'écran est mis au premier plan
            fetchOrdersAndClients();
        });
        // Retournez une fonction de nettoyage pour annuler l'écouteur
        return unsubscribe;
    }, [nameRestaurant, navigation]); // Écouter les changements de navigation


    const refreshOrder = () => {
        fetchOrdersAndClients();
        alert('Commandes mis à jour')
    }

    useEffect(() => {

        if(refreshCounter > 0){
            refreshOrder();
        }
        console.log(ordersAndClients);
    }, [refreshCounter]);


    // Fonction pour calculer le prix total d'une commande
    const calculateAndFormatTotalPrice = (order) => {
        let totalPrice = 0;
        order.orders.forEach((product) => {
            totalPrice += product.product_price * product.order_quantity;
        });
    
        // Vérifier si le prix est un nombre
        if (typeof totalPrice !== 'number' || isNaN(totalPrice)) {
            return 'Prix invalide';
        }
    
        // Arrondir le prix à deux décimales
        const roundedPrice = Math.round(totalPrice * 100) / 100;
    
        // Formater le prix avec deux décimales et le signe euro
        return roundedPrice.toFixed(2);
    };


    // Grouper les commandes par mois
    const groupOrdersByMonth = () => {
        const groupedOrders = {};
        ordersAndClients.forEach(order => {
            const date = new Date(order.client_date);
            const month = date.getMonth();
            const year = date.getFullYear();
            const monthAndYear = `${month}-${year}`;
            if (!groupedOrders[monthAndYear]) {
                groupedOrders[monthAndYear] = [];
            }
            groupedOrders[monthAndYear].push(order);
        });
        return groupedOrders;
    };

    const groupOrdersByDay = () => {
        const groupedOrders = {};
        const filteredOrders = orderFiltred; // Utilisez orderFiltred au lieu de filteredOrders

        filteredOrders.forEach(order => {
            const date = new Date(order.client_date);
            const day = t(date.toLocaleDateString('en', { weekday: 'long' }).toLowerCase());
            const month = t(date.toLocaleDateString('en', { month: 'long' }).toLowerCase());
            const dayOfMonth = date.getDate(); // Numéro du jour du mois
            const year = date.getFullYear(); // Année
            const dayAndMonth = `${day} ${dayOfMonth} ${month} ${year}`; // Combine le nom du jour, du mois, du numéro du jour et de l'année
    
            if (!groupedOrders[dayAndMonth]) {
                groupedOrders[dayAndMonth] = [];
            }
            groupedOrders[dayAndMonth].push(order);
        });
        return groupedOrders;
    };
    


    // Obtenir les commandes groupées par mois et trier les mois
    const ordersGroupedByMonth = groupOrdersByMonth();
    const sortedMonths = Object.keys(ordersGroupedByMonth).sort((a, b) => new Date(b) - new Date(a));

    const getMonthAndYear = (monthAndYear) => {
        const [month, year] = monthAndYear.split('-');
        const months = [
            "january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"
        ];
        const monthName = months[parseInt(month)];
        return `${t(monthName)} ${year}`;
    };


    useEffect(() => {
        if (selectedMonth !== '') {
            const selectedMonthParts = selectedMonth.split('-');
            const selectedMonthNumber = parseInt(selectedMonthParts[0]);
            const selectedYear = parseInt(selectedMonthParts[1]);
            
            const filteredOrders = ordersAndClients.filter(order => {
                const date = new Date(order.client_date);
                const month = date.getMonth(); // Obtenez le mois (0-11)
                const year = date.getFullYear(); // Obtenez l'année
                
                return month === selectedMonthNumber && year === selectedYear;
            });
    
            // Mettre à jour orderFiltred avec les commandes filtrées
            setOrderFiltred(filteredOrders);
        } else {
            // Retournez toutes les commandes si aucun mois n'est sélectionné
            setOrderFiltred(ordersAndClients);
        }
    }, [selectedMonth, ordersAndClients]);

    
    
   

    
    const currentYear = new Date().getFullYear();
    const ordersGroupedByDayFiltered = groupOrdersByDay();


    return(
        <View style={styles.containerScreenBasket}>
        <View style={styles.pickerContainer}>
            <RNPickerSelect
                onValueChange={(value) => setSelectedMonth(value)}
                items={sortedMonths.map(month => ({ label: getMonthAndYear(month, currentYear), value: month }))}
                placeholder={{ label: t('all'), value: "" }}
                style={{
                    inputIOS: [styles.input, {color: colors.colorText, borderColor: colors.colorText}],
                    inputAndroid: [styles.input, {color: colors.colorText, borderColor: colors.colorText}],
                    borderColor: colors.colorText
                }}
                useNativeAndroidPickerStyle={false}
                Icon={() => {
                    return <Ionicons name="chevron-down" style={{position: "absolute", right: 180, marginTop:10, fontSize:30, color: colors.colorText}} />;
                }}
            />
        </View>
        <ScrollView>
        <View style={styles.listOrder}>
            {Object.entries(ordersGroupedByDayFiltered).map(([dayAndMonth, orders]) => (
                <View key={dayAndMonth}>
                    <Text style={[styles.dayHeader, {color: colors.colorText}]}>{t(dayAndMonth)}</Text>
                    {orders
                        .filter(order => orderFiltred.some(filteredOrder => filteredOrder.client_id === order.client_id))
                        .map(order => (
                            <TouchableOpacity onPress={() => navigation.navigate('OrderSelectData', { order })} key={order.client_id} style={styles.containerOrderItem}>
                                <View style={[styles.containerIconOrderItem , {backgroundColor: colors.colorText}]}>
                                    <Ionicons size={28} color={colors.colorAction} name="bag-handle-outline"/>
                                </View >
                                <View style={styles.containerTextOrderItem}>
                                    <View>
                                        <Text style={[styles.textOrderItem, {color: colors.colorText}]}>{order.client_ref_order}</Text>
                                        <Text style={[styles.textOrderItemName, {color: colors.colorDetail}]}>{order.client_lastname} {order.client_firstname}</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.textOrderItem, {color: colors.colorText}]}>{calculateAndFormatTotalPrice(order)} €</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    <View style={[styles.line, {backgroundColor: colors.colorText}]}></View>
                </View>
            ))}
        </View>
        </ScrollView>
    </View>

    )
}

const styles = StyleSheet.create({
    containerHeaderSetting:{
        justifyContent: "space-between", 
        flexDirection:"row",
        marginTop : 60,
        paddingRight: 35,
        paddingLeft : 35,
        alignItems:'center',
    },
    textHeaderSetting:{
        fontSize: 22,
        color: "white",
    },
    containerEmpty:{
        width: "10%",
    },
    line:{
        borderWidth:1,
        marginLeft: 30,
        marginRight:30,
        marginTop: 40,
        marginBottom: 40
    },
    containerOrderItem:{
        flexDirection: "row",
        marginRight: 30,
        marginLeft: 30,
        marginBottom:22
    },
    containerTextOrderItem:{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center" ,
        width: "80%"
    },
    containerIconOrderItem:{
        backgroundColor: "white",
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 25,
        marginRight: 20
    },
    textOrderItem:{
        fontSize: 18,
        color:"white"
    },
    textOrderItemName:{
        color:"#A2A2A7",
        fontSize: 14
    },
    input:{
        marginLeft: 30,
        width: 220,
        borderWidth: 1,
        paddingLeft: 15,
        fontSize: 18, 
        height: 45,
        marginBottom: 30,
        borderRadius: 20,
        position: "relative"
    },
    dayHeader:{
        fontSize: 18, 
        marginLeft: 30,
        marginBottom: 20
    },
    line:{
        marginLeft: 30,
        marginRight: 30, 
        height: 1,
        marginBottom: 20
    },
    listOrder: {
        height: "auto", 
        marginBottom: 300
    }

    
})

export default AllOrders