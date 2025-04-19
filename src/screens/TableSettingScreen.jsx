import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { useTranslation } from 'react-i18next';
import SelectionTableModal from "../components/Modals/SelectionTableModal";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';
import TableEditModal from "../components/Modals/TableEditModal"; // Vous devrez créer ce composant
import { useNavigation } from "@react-navigation/native";

export default function TableSettingScreen() {
    const { colors } = useColors();
    const { t } = useTranslation();
    const customStyles = styles();
    const navigation = useNavigation();
    const [restaurantId, setRestaurantId] = useState(null);
    const { width, height } = useWindowDimensions();

    // États pour les valeurs sélectionnées
    const [capacity, setCapacity] = useState('Toutes');
    const [location, setLocation] = useState('Tous');
    const [selectedTable, setSelectedTable] = useState(null);
    
    // États pour contrôler l'ouverture des modals
    const [capacityModalVisible, setCapacityModalVisible] = useState(false);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [tableEditModalVisible, setTableEditModalVisible] = useState(false);
    const [isNewTable, setIsNewTable] = useState(false);
    
    // Options pour les selects
    const [capacityOptions, setCapacityOptions] = useState(['Toutes']);
    const [locationOptions, setLocationOptions] = useState(["Tous"]);
    
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

    // Récupérer les données des tables depuis Supabase
    useEffect(() => {
        fetchTables();
    }, [restaurantId]);

    const fetchTables = async () => {
        if (!restaurantId) return;

        const { data, error } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', restaurantId);

        if (error) {
            console.error("Erreur lors de la récupération des tables :", error);
            Alert.alert("Erreur", "Impossible de récupérer les tables");
        } else {
            setTableData(data);
        }
    };

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
            
            setCapacityOptions(sortedCapacities);
        }
    
        if (tableData.length > 0) {
            getUniqueLocations();
            getUniqueCapacity();
        }
    }, [tableData]);

    const handleAddTable = () => {
        // Créer un objet table vide pour le modal d'ajout
        const newTable = {
            restaurant_id: restaurantId,
            table_number: "",
            number_of_people: 2,
            location: "",
            is_available: true
        };
        
        setSelectedTable(newTable);
        setIsNewTable(true);
        setTableEditModalVisible(true);
    };

    const handleEditTable = (table) => {
        setSelectedTable(table);
        setIsNewTable(false);
        setTableEditModalVisible(true);
    };

    const handleSaveTable = async (table) => {
        try {
            if (isNewTable) {
                // Ajouter une nouvelle table
                const { data, error } = await supabase
                    .from('tables')
                    .insert([table])
                    .select();

                if (error) throw error;
                
                Alert.alert("Succès", "Table ajoutée avec succès");
            } else {
                // Mettre à jour une table existante
                const { data, error } = await supabase
                    .from('tables')
                    .update(table)
                    .eq('id', table.id)
                    .select();

                if (error) throw error;
                
                Alert.alert("Succès", "Table mise à jour avec succès");
            }
            
            // Rafraîchir les données
            fetchTables();
            setTableEditModalVisible(false);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de la table:", error);
            Alert.alert("Erreur", "Impossible de sauvegarder les modifications");
        }
    };

    const handleDeleteTable = async (tableId) => {
        Alert.alert(
            "Confirmation",
            "Êtes-vous sûr de vouloir supprimer cette table ?",
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
                            const { error } = await supabase
                                .from('tables')
                                .delete()
                                .eq('id', tableId);

                            if (error) throw error;
                            
                            Alert.alert("Succès", "Table supprimée avec succès");
                            fetchTables();
                            setTableEditModalVisible(false);
                        } catch (error) {
                            console.error("Erreur lors de la suppression de la table:", error);
                            Alert.alert("Erreur", "Impossible de supprimer la table");
                        }
                    }
                }
            ]
        );
    };

    const filteredTables = tableData.filter(table => {
        const capacityMatch = capacity === 'Toutes' || 
                             (table.number_of_people && table.number_of_people.toString() === capacity);
        const locationMatch = location === 'Tous' || table.location === location;
        return capacityMatch && locationMatch;
    });

    const renderTable = (table) => (
        <TouchableOpacity
            onPress={() => handleEditTable(table)}
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
            <View style={[customStyles.container, {backgroundColor: colors.colorBackground}]}>
                {/* En-tête dans le style de HeaderSetting */}
                <View style={customStyles.containerCardPage}>
                    <View style={customStyles.containerHeader}>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate("SettingPage")} 
                            style={[customStyles.containerBtnBack, {backgroundColor: colors.colorBorderAndBlock}]}
                        >
                            <Ionicons name="chevron-back-outline" size={30} color={colors.colorText}/>
                        </TouchableOpacity>
                        <Text style={[customStyles.textHeader, {color: colors.colorText}]}>
                            {t('table_settings')}
                        </Text>
                        <View style={customStyles.containerEmpty}></View>
                    </View>
                    <View style={[customStyles.line, {borderColor: colors.colorText}]}></View>
                </View>

                <TouchableOpacity 
                    style={[
                        customStyles.btnAddTable,
                        {
                            backgroundColor: colors.colorAction,
                            borderWidth: 1,
                            borderColor: colors.colorAction === '#FFFFFF' ? colors.colorBorderAndBlock : 'transparent'
                        }
                    ]}
                    onPress={handleAddTable}
                >
                    <Ionicons name="add-circle-outline" size={20} color={"#fff"} />
                    <Text style={[customStyles.textBtnAddTable, {color: "#fff"}]}>
                        {t('add_table')}
                    </Text>
                </TouchableOpacity>
                
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
            
            {/* Modal pour sélectionner la capacité */}
            <SelectionTableModal
                visible={capacityModalVisible}
                title={t('select_capacity')}
                options={capacityOptions}
                currentValue={capacity}
                onSelect={setCapacity}
                onClose={() => setCapacityModalVisible(false)}
                colors={colors}
            />
            
            {/* Modal pour sélectionner l'emplacement */}
            <SelectionTableModal
                visible={locationModalVisible}
                title={t('select_location')}
                options={locationOptions}
                currentValue={location}
                onSelect={setLocation}
                onClose={() => setLocationModalVisible(false)}
                colors={colors}
            />
            
            {/* Modal pour éditer/ajouter une table */}
            {selectedTable && (
                <TableEditModal
                    visible={tableEditModalVisible}
                    table={selectedTable}
                    isNew={isNewTable}
                    onClose={() => setTableEditModalVisible(false)}
                    onSave={handleSaveTable}
                    onDelete={handleDeleteTable}
                    colors={colors}
                />
            )}
        </SafeAreaView>
    );
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
        // Styles similaires à HeaderSetting
        containerCardPage: {
            width: '100%',
        },
        containerHeader: {
            justifyContent: "space-between", 
            flexDirection: "row",
            marginTop: (height > 750) ? 20 : 10, // Valeurs réduites pour moins d'espace
            paddingRight: 35,
            paddingLeft: 35,
            alignItems: 'center',
        },
        textHeader: {
            fontSize: (width > 375) ? 22 : 18,
            fontWeight: "600",
        },
        containerBtnBack: {
            height: (width > 375) ? 55 : 35,
            width: (width > 375) ? 55 : 35,
            alignItems: "center",
            borderRadius: 50,
            justifyContent: "center",
        },
        containerEmpty: {
            width: "10%",
        },
        line: {
            borderWidth: 1,
            marginLeft: 30,
            marginRight: 30,
            marginTop: (height > 750) ? 15 : 10, 
            marginBottom: (width > 375) ? 30 : 25, 
        },
        // Autres styles pour le contenu
        contentContainer: {
            flex: 1,
            width: '100%',
            paddingHorizontal: 16,
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
        btnAddTable: {
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
        textBtnAddTable: {
            fontSize: 16,
            fontWeight: '600',
            textAlign: "center",
            marginLeft: 8,
        },
    });
}