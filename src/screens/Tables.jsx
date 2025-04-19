import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { useTranslation } from 'react-i18next';
import SelectionTableModal from "../components/Modals/SelectionTableModal"; 
import { supabase } from "../lib/supabase";
import RestaurantDetailsModal from "../components/Modals/RestaurantDetailsModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function Tables() {
    const { colors } = useColors()
    const { t } = useTranslation();
    const customStyles = styles(); 
    const [restaurantId, setRestaurantId] = useState(null);
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [reservationOption, setReservationOption] = useState(false);

    // États pour les valeurs sélectionnées
    const [capacity, setCapacity] = useState('Toutes');
    const [location, setLocation] = useState('Tous');
    const [selectedTable, setSelectedTable] = useState(null);
    const [restaurantModalVisible, setRestaurantModalVisible] = useState(false);
    // États pour contrôler l'ouverture des modals
    const [capacityModalVisible, setCapacityModalVisible] = useState(false);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    
    // Options pour les selects
    const [capacityOptions, setCapacityOptions] = useState(['Toutes']);
    const [locationOptions, setLocationOptions] = useState(["Tous"])
    // État pour stocker les données des tables
    const [tableData, setTableData] = useState([]);


    useEffect(() => {
        const fetchRestaurantId = async () => {
            try {
                const owner = await AsyncStorage.getItem("owner");
                const ownerData = JSON.parse(owner);                
                setRestaurantId(ownerData.restaurantId);
            } catch (error) {
                console.error('Erreur récupération utilisateur:', error);
            }
        };
        fetchRestaurantId();
    }, []);

    // Récupérer les données du restaurant depuis Supabase
    useEffect(() => {
        const fetchRestaurantData = async () => {
            if (!restaurantId) return;

            try {
                // D'abord, essayer de récupérer les données du restaurant depuis AsyncStorage
                const restaurantData = await AsyncStorage.getItem("restaurant");
                if (restaurantData) {
                    const parsedData = JSON.parse(restaurantData);
                    setReservationOption(parsedData.reservation_option || false);
                } else {
                    // Si les données ne sont pas dans AsyncStorage, les récupérer depuis Supabase
                    const { data, error } = await supabase
                        .from('restaurants')
                        .select('reservation_option')
                        .eq('id', restaurantId)
                        .single();
                    
                    if (error) {
                        console.error("Erreur lors de la récupération du restaurant :", error);
                    } else if (data) {
                        setReservationOption(data.reservation_option || false);
                    }
                }
                
                // Une fois les données récupérées, masquer le loader après 2 secondes
                setTimeout(() => {
                    setIsLoading(false);
                }, 2000);
            } catch (error) {
                console.error('Erreur récupération données restaurant:', error);
                setTimeout(() => {
                    setIsLoading(false);
                }, 2000);
            }
        };

        fetchRestaurantData();
    }, [restaurantId]);

    // Récupérer les données des tables depuis Supabase
    useEffect(() => {
        const fetchTables = async () => {
            if (!restaurantId) return;

            const { data, error } = await supabase
                .from('tables')
                .select('*')
                .eq('restaurant_id', restaurantId)

            if (error) {
                console.error("Erreur lors de la récupération des tables :", error);
            } else {
                setTableData(data);
                console.log('test:',data);
            }
        };

        fetchTables();
    }, [restaurantId]);

    useEffect(() => {
        function getUniqueLocations() {
            const uniqueLocations = new Set(['Tous']);
            
            tableData.forEach(table => {
                if (table.location) {
                    uniqueLocations.add(table.location);
                }
            });
            
            setLocationOptions(Array.from(uniqueLocations));
        }

        function getUniqueCapacity() {
            const uniqueCapacity = new Set(['Toutes']);
            
            tableData.forEach(table => {
                if (table.number_of_people) {
                    uniqueCapacity.add(table.number_of_people.toString());
                }
            });

            const sortedCapacities = Array.from(uniqueCapacity).sort((a, b) => {
                if (a === 'Toutes') return -1;
                if (b === 'Toutes') return 1;
                return parseInt(a) - parseInt(b);
            });
            
            setCapacityOptions(Array.from(sortedCapacities));
        }
    
        if (tableData.length > 0) {
            getUniqueLocations();
            getUniqueCapacity()
        }
    }, [tableData]);

    // Fonction pour gérer la mise à jour d'une table
    const handleTableUpdate = (updatedTable) => {
        // Mettre à jour l'état local pour refléter les changements
        setTableData(prevTables => 
            prevTables.map(table => 
                table.id === updatedTable.id ? updatedTable : table
            )
        );
        
        // Mettre à jour également la table sélectionnée pour que le modal soit synchronisé
        if (selectedTable && selectedTable.id === updatedTable.id) {
            setSelectedTable(updatedTable);
        }
    };

    const filteredTables = tableData.filter(table => {
        const capacityMatch = capacity === 'Toutes' || 
                              (table.number_of_people && table.number_of_people.toString() === capacity) || 
                              (capacity === '10+' && table.number_of_people >= 10);
        const locationMatch = location === 'Tous' || table.location === location;
        return capacityMatch && locationMatch;
    });

    const renderTable = (table) => (
        <TouchableOpacity
            onPress={() => {
                setSelectedTable(table);
                setRestaurantModalVisible(true);
                console.log("rrrrrr",table);
            }}
            style={[customStyles.tableCard, { backgroundColor: colors.colorBorderAndBlock }]} 
            key={table.id}
        >
            <View 
                style={[
                    customStyles.tableAvailability, 
                    { backgroundColor: table.is_available ? '#4CAF50' : '#F44336' }
                ]} 
            />
            <View style={customStyles.tableInfo}>
                <Text style={[customStyles.tableNumber, { color: colors.colorText }]}>
                    {t('table')} {table.table_number}
                </Text>
                <View style={customStyles.tableDetailsRow}>
                    <View style={customStyles.tableDetail}>
                        <Text style={[customStyles.tableDetailLabel, { color: colors.colorText }]}>
                            {t('capacity')}
                        </Text>
                        <Text style={[customStyles.tableDetailValue, { color: colors.colorDetail }]}>
                            {table.number_of_people} {table.number_of_people > 1 ? t('persons') : t('person')}
                        </Text>
                    </View>
                    <View style={customStyles.tableDetail}>
                        <Text style={[customStyles.tableDetailLabel, { color: colors.colorText }]}>
                            {t('location')}
                        </Text>
                        <Text style={[customStyles.tableDetailValue, { color: colors.colorDetail }]}>
                            {table.location}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    // Fonction pour rendre le select
    const renderSelect = (label, value, onPress) => (
        <TouchableOpacity 
            style={[customStyles.selectButton, { backgroundColor: colors.colorBorderAndBlock }]} 
            onPress={onPress}
        >
            <View style={customStyles.selectButtonContent}>
                <Text style={[customStyles.selectLabel, { color: colors.colorText }]}>
                    {label}
                </Text>
                <Text style={[customStyles.selectValue, { color: colors.colorDetail }]}>
                    {value}
                </Text>
            </View>
            <Text style={[customStyles.arrowDown, { color: colors.colorText }]}>▼</Text>
        </TouchableOpacity>
    );

    return(
        <SafeAreaView style={[customStyles.safeArea, {backgroundColor: colors.colorBackground}]}>
            {isLoading ? (
                <View style={customStyles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.colorAction} />
                </View>
            ) : (
                <View style={[customStyles.container, {backgroundColor: colors.colorBackground}]}>
                    <View style={customStyles.headerContainer}>
                        <Text style={[customStyles.pageTitle, { color: colors.colorText }]}>
                            {t('tables')}
                        </Text>
                        <View style={[customStyles.separator, { backgroundColor: colors.colorText }]} />
                    </View>

                    {reservationOption && (
                        <TouchableOpacity 
                            style={[
                                customStyles.btnReservation,
                                {
                                backgroundColor: colors.colorAction,
                                borderWidth: 1,
                                borderColor: colors.colorAction === '#FFFFFF' ? colors.colorBorderAndBlock : 'transparent',
                                color: colors.colorText
                                }
                            ]}
                            onPress={() => navigation.navigate('Reservation')}
                        >
                            <Text style={[customStyles.textBtnReservation, {color: "#fff"}]}>
                                {t('table_reservation')}
                            </Text>
                        </TouchableOpacity>
                    )}
                    
                    <View style={customStyles.contentContainer}>
                        <View style={customStyles.filtersContainer}>
                            {renderSelect(t('capacity'), capacity, () => setCapacityModalVisible(true))}
                            {renderSelect(t('location'), location, () => setLocationModalVisible(true))}
                        </View>

                        <View style={customStyles.tableCountContainer}>
                            <Text style={[customStyles.tableCount, { color: colors.colorText }]}>
                                {filteredTables.length} {filteredTables.length > 1 ? t('tables') : t('table')}
                            </Text>
                        </View>
                        
                        <ScrollView style={customStyles.tableList}>
                            {filteredTables.map(renderTable)}
                        </ScrollView>
                    </View>
                </View>
            )}
            
            {/* Utilisation du composant SelectionTableModal */}
            <SelectionTableModal
                visible={capacityModalVisible}
                title="Sélectionner une capacité"
                options={capacityOptions}
                currentValue={capacity}
                onSelect={setCapacity}
                onClose={() => setCapacityModalVisible(false)}
                colors={colors}
            />
            
            <SelectionTableModal
                visible={locationModalVisible}
                title="Sélectionner un emplacement"
                options={locationOptions}
                currentValue={location}
                onSelect={setLocation}
                onClose={() => setLocationModalVisible(false)}
                colors={colors}
            />
            
            {/* Ajout de onTableUpdate pour synchroniser l'état */}
            <RestaurantDetailsModal
                visible={restaurantModalVisible}
                table={selectedTable}
                onClose={() => setRestaurantModalVisible(false)}
                colors={colors}
                onTableUpdate={handleTableUpdate}
                restaurantId={restaurantId}
            />
        </SafeAreaView>
    )
}

function styles() {
    const { width, height } = useWindowDimensions();
    
    return StyleSheet.create({
        safeArea: {
            flex: 1,
        },
        container: {
            flex: 1,
            width: '100%',
        },
        headerContainer: {
            width: '100%',
            alignItems: 'center',
            paddingTop: 10,
        },
        contentContainer: {
            flex: 1,
            width: '100%',
            paddingHorizontal: 16,
        },
        pageTitle: {
            fontSize: width > 375 ? 24 : 20,
            fontWeight: "600",
            textAlign: 'center',
            marginBottom: 15,
        },
        separator: {
            height: 1,
            width: '80%',
            marginBottom: 20,
        },
        filtersContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 15,
        },
        selectButton: {
            width: '48%',
            borderRadius: 10,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        selectButtonContent: {
            flex: 1,
        },
        selectLabel: {
            fontSize: 12,
            marginBottom: 2,
        },
        selectValue: {
            fontSize: 16,
            fontWeight: '500',
        },
        arrowDown: {
            fontSize: 12,
            marginLeft: 5,
        },
        tableCountContainer: {
            marginBottom: 10,
        },
        tableCount: {
            fontSize: 16,
            fontWeight: '500',
        },
        tableList: {
            flex: 1,
        },
        tableCard: {
            flexDirection: 'row',
            borderRadius: 10,
            marginBottom: 12,
            overflow: 'hidden',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        tableAvailability: {
            width: 8,
        },
        tableInfo: {
            flex: 1,
            padding: 12,
        },
        tableNumber: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        tableDetailsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        tableDetail: {
            flex: 1,
        },
        tableDetailLabel: {
            fontSize: 12,
            marginBottom: 2,
        },
        tableDetailValue: {
            fontSize: 14,
        },
        btnReservation: {
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 15,
            marginHorizontal: 16,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
        },
        textBtnReservation: {
            fontSize: 16,
            fontWeight: '600',
            textAlign: "center",
            marginLeft: 8,
        },
        buttonIcon: {
            width: 20,
            height: 20,
        },
        // Styles pour le loader
        loaderContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loaderText: {
            marginTop: 12,
            fontSize: width > 375 ? 16 : 14,
            fontWeight: '500',
        },
    });
}