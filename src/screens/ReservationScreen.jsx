import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import { useTranslation } from 'react-i18next';
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from 'react-native-modal'; // Assurez-vous d'avoir cette dépendance

export default function ReservationScreen() {
    const { colors } = useColors();
    const { t } = useTranslation();
    const customStyles = styles();
    const [restaurantId, setRestaurantId] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('Tous'); // 'Tous', 'PENDING', 'CONFIRMED', 'CANCELED'
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [dateFilter, setDateFilter] = useState('Tous'); // 'Tous', 'Aujourd\'hui', 'Demain', 'Cette semaine', etc.
    const [dateModalVisible, setDateModalVisible] = useState(false);

    // Options pour le filtre de statut
    const statusOptions = ['Tous', 'En attente', 'Confirmé', 'Annulé'];
    const statusMapping = {
        'Tous': 'Tous',
        'En attente': 'PENDING',
        'Confirmé': 'CONFIRMED',
        'Annulé': 'CANCELED'
    };
    const reversedStatusMapping = {
        'Tous': 'Tous',
        'PENDING': 'En attente',
        'CONFIRMED': 'Confirmé',
        'CANCELED': 'Annulé'
    };
    
    // Options pour le filtre de date
    const dateOptions = [
        'Tous',
        t('today'),
        t('tomorrow'),
        t('yesterday'),
        t('this_week'),
        t('next_week'),
        t('last_week'),
        t('this_month'),
        t('next_month'),
        t('last_month')
    ];

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                const restaurantData = await AsyncStorage.getItem("restaurant");
                if (restaurantData) {
                    const parsedData = JSON.parse(restaurantData);
                    setRestaurantId(parsedData.id);
                }
            } catch (error) {
                console.error('Erreur récupération données restaurant:', error);
            }
        };
        
        fetchRestaurantData();
    }, []);

    useEffect(() => {
        if (restaurantId) {
            fetchReservations();
        }
    }, [restaurantId]);
    
    // Effet pour filtrer les réservations quand les filtres changent
    useEffect(() => {
        if (reservations.length > 0) {
            applyFilters();
        }
    }, [reservations, statusFilter, dateFilter]);

    const fetchReservations = async () => {
        try {
            setIsLoading(true);
            let query = supabase
                .from('reservations')
                .select('*')
                .eq('restaurant_id', restaurantId)
                // Ordonner par date et heure de réservation
                .order('reservation_date', { ascending: true })
                .order('reservation_time', { ascending: true });

            const { data, error } = await query;

            if (error) throw error;
            setReservations(data);
            setFilteredReservations(data); // Initialiser les données filtrées
        } catch (error) {
            console.error('Erreur lors de la récupération des réservations:', error);
            Alert.alert('Erreur', 'Impossible de charger les réservations');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Fonction pour filtrer les réservations selon les critères de date et de statut
    const applyFilters = () => {
        let filtered = [...reservations];
        
        // Appliquer le filtre de statut
        if (statusFilter !== 'Tous') {
            filtered = filtered.filter(res => res.status === statusMapping[statusFilter]);
        }
        
        // Appliquer le filtre de date
        if (dateFilter !== 'Tous') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Trouver le début de la semaine (lundi)
            const startOfWeek = new Date(today);
            const dayOfWeek = today.getDay();
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajuster quand c'est dimanche
            startOfWeek.setDate(diff);
            startOfWeek.setHours(0, 0, 0, 0);
            
            // Fin de la semaine (dimanche)
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            // Semaine prochaine
            const startOfNextWeek = new Date(startOfWeek);
            startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
            const endOfNextWeek = new Date(endOfWeek);
            endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);
            
            // Semaine dernière
            const startOfLastWeek = new Date(startOfWeek);
            startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
            const endOfLastWeek = new Date(endOfWeek);
            endOfLastWeek.setDate(endOfLastWeek.getDate() - 7);
            
            // Début du mois
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            // Fin du mois
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
            
            // Mois prochain
            const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59, 999);
            
            // Mois dernier
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
            
            filtered = filtered.filter(reservation => {
                const reservationDate = new Date(reservation.reservation_date);
                reservationDate.setHours(0, 0, 0, 0);
                
                switch (dateFilter) {
                    case t('today'):
                        return reservationDate.getTime() === today.getTime();
                    case t('tomorrow'):
                        return reservationDate.getTime() === tomorrow.getTime();
                    case t('yesterday'):
                        return reservationDate.getTime() === yesterday.getTime();
                    case t('this_week'):
                        return reservationDate >= startOfWeek && reservationDate <= endOfWeek;
                    case t('next_week'):
                        return reservationDate >= startOfNextWeek && reservationDate <= endOfNextWeek;
                    case t('last_week'):
                        return reservationDate >= startOfLastWeek && reservationDate <= endOfLastWeek;
                    case t('this_month'):
                        return reservationDate >= startOfMonth && reservationDate <= endOfMonth;
                    case t('next_month'):
                        return reservationDate >= startOfNextMonth && reservationDate <= endOfNextMonth;
                    case t('last_month'):
                        return reservationDate >= startOfLastMonth && reservationDate <= endOfLastMonth;
                    default:
                        return true;
                }
            });
        }
        
        // Si aucun élément n'est trouvé dans 'Aujourd'hui' mais qu'il y a des éléments dans 'Cette semaine',
        // on peut suggérer à l'utilisateur de voir 'Cette semaine' à la place
        
        // Trier par date et heure (les plus proches en premier)
        filtered.sort((a, b) => {
            // D'abord comparer les dates
            const dateA = new Date(a.reservation_date);
            const dateB = new Date(b.reservation_date);
            const dateDiff = dateA - dateB;
            
            // Si les dates sont égales, comparer les heures
            if (dateDiff === 0) {
                const timeA = a.reservation_time;
                const timeB = b.reservation_time;
                return timeA.localeCompare(timeB);
            }
            
            return dateDiff;
        });
        
        setFilteredReservations(filtered);
    };

    const updateReservationStatus = async (id, status) => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('reservations')
                .update({ status })
                .eq('id', id)
                .select();

            if (error) throw error;

            // Mettre à jour l'état local avec la nouvelle réservation
            const updatedReservations = reservations.map(reservation => 
                reservation.id === id ? data[0] : reservation
            );
            setReservations(updatedReservations);
            
            // Réappliquer les filtres pour mettre à jour l'affichage
            setFilteredReservations(updatedReservations.filter(reservation => {
                const matchesStatus = statusFilter === 'Tous' || 
                    reservation.status === statusMapping[statusFilter];
                
                // Nous réappliquerons le filtre de date lors du prochain rendu via useEffect
                return matchesStatus;
            }));

            // Mettre à jour également la réservation sélectionnée
            if (selectedReservation && selectedReservation.id === id) {
                setSelectedReservation(data[0]);
            }

            Alert.alert('Succès', `Réservation ${status === 'CONFIRMED' ? 'confirmée' : 'annulée'} avec succès`);
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du statut:`, error);
            Alert.alert('Erreur', `Impossible de mettre à jour le statut de la réservation`);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const formatTime = (timeString) => {
        return timeString.substring(0, 5); // Format HH:MM
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#FFA000'; // Orange
            case 'CONFIRMED': return '#4CAF50'; // Vert
            case 'CANCELED': return '#F44336'; // Rouge
            default: return '#757575'; // Gris
        }
    };

    const renderReservationCard = (reservation) => (
        <TouchableOpacity
            onPress={() => {
                setSelectedReservation(reservation);
                setDetailsModalVisible(true);
            }}
            style={[customStyles.reservationCard, { backgroundColor: colors.colorBorderAndBlock }]} 
            key={reservation.id}
        >
            <View 
                style={[
                    customStyles.reservationStatus, 
                    { backgroundColor: getStatusColor(reservation.status) }
                ]} 
            />
            <View style={customStyles.reservationInfo}>
                <View style={customStyles.reservationHeader}>
                    <Text style={[customStyles.reservationName, { color: colors.colorText }]}>
                        {reservation.full_name}
                    </Text>
                    <Text style={[customStyles.reservationDate, { color: colors.colorDetail }]}>
                        {formatDate(reservation.reservation_date)} à {formatTime(reservation.reservation_time)}
                    </Text>
                </View>
                <View style={customStyles.reservationDetailsRow}>
                    <View style={customStyles.reservationDetail}>
                        <Text style={[customStyles.reservationDetailLabel, { color: colors.colorText }]}>
                            {t('persons')}
                        </Text>
                        <Text style={[customStyles.reservationDetailValue, { color: colors.colorDetail }]}>
                            {reservation.number_of_people} {reservation.number_of_people > 1 ? t('persons') : t('person')}
                        </Text>
                    </View>
                    <View style={customStyles.reservationDetail}>
                        <Text style={[customStyles.reservationDetailLabel, { color: colors.colorText }]}>
                            {t('status')}
                        </Text>
                        <Text style={[customStyles.reservationDetailValue, { color: colors.colorDetail }]}>
                            {reversedStatusMapping[reservation.status]}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderDetailsModal = () => (
        <Modal 
            isVisible={detailsModalVisible}
            onBackdropPress={() => setDetailsModalVisible(false)}
            backdropOpacity={0.6}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            style={customStyles.modal}
        >
            {selectedReservation && (
                <View style={[customStyles.modalContent, { backgroundColor: colors.colorBackground }]}>
                    <Text style={[customStyles.modalTitle, { color: colors.colorText }]}>
                        {t('reservation_details')}
                    </Text>
                    
                    <View style={customStyles.detailSection}>
                        <Text style={[customStyles.detailLabel, { color: colors.colorText }]}>{t('client')}</Text>
                        <Text style={[customStyles.detailValue, { color: colors.colorDetail }]}>
                            {selectedReservation.full_name}
                        </Text>
                    </View>
                    
                    <View style={customStyles.detailSection}>
                        <Text style={[customStyles.detailLabel, { color: colors.colorText }]}>{t('date_time')}</Text>
                        <Text style={[customStyles.detailValue, { color: colors.colorDetail }]}>
                            {formatDate(selectedReservation.reservation_date)} à {formatTime(selectedReservation.reservation_time)}
                        </Text>
                    </View>
                    
                    <View style={customStyles.detailSection}>
                        <Text style={[customStyles.detailLabel, { color: colors.colorText }]}>{t('number_of_persons')}</Text>
                        <Text style={[customStyles.detailValue, { color: colors.colorDetail }]}>
                            {selectedReservation.number_of_people}
                        </Text>
                    </View>
                    
                    <View style={customStyles.detailSection}>
                        <Text style={[customStyles.detailLabel, { color: colors.colorText }]}>{t('contact')}</Text>
                        <Text style={[customStyles.detailValue, { color: colors.colorDetail }]}>
                            {t('phone')}: {selectedReservation.phone}
                        </Text>
                        <Text style={[customStyles.detailValue, { color: colors.colorDetail }]}>
                            {t('email')}: {selectedReservation.email}
                        </Text>
                    </View>
                    
                    {selectedReservation.comment && (
                        <View style={customStyles.detailSection}>
                            <Text style={[customStyles.detailLabel, { color: colors.colorText }]}>{t('comment')}</Text>
                            <Text style={[customStyles.detailValue, { color: colors.colorDetail }]}>
                                {selectedReservation.comment}
                            </Text>
                        </View>
                    )}
                    
                    <View style={customStyles.detailSection}>
                        <Text style={[customStyles.detailLabel, { color: colors.colorText }]}>{t('current_status')}</Text>
                        <View style={customStyles.statusBadge}>
                            <View style={[customStyles.statusIndicator, { backgroundColor: getStatusColor(selectedReservation.status) }]} />
                            <Text style={[customStyles.statusText, { color: colors.colorText }]}>
                                {reversedStatusMapping[selectedReservation.status]}
                            </Text>
                        </View>
                    </View>
                    
                    {selectedReservation.status === 'PENDING' && (
                        <View style={customStyles.actionButtonsContainer}>
                            <TouchableOpacity 
                                style={[customStyles.actionButton, { backgroundColor: '#4CAF50' }]}
                                onPress={() => {
                                    updateReservationStatus(selectedReservation.id, 'CONFIRMED');
                                    setDetailsModalVisible(false);
                                }}
                            >
                                <Text style={customStyles.actionButtonText}>Confirmer</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[customStyles.actionButton, { backgroundColor: '#F44336' }]}
                                onPress={() => {
                                    updateReservationStatus(selectedReservation.id, 'CANCELED');
                                    setDetailsModalVisible(false);
                                }}
                            >
                                <Text style={customStyles.actionButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    
                    {selectedReservation.status === 'CONFIRMED' && (
                        <View style={customStyles.actionButtonsContainer}>
                            <TouchableOpacity 
                                style={[customStyles.actionButton, { backgroundColor: '#F44336' }]}
                                onPress={() => {
                                    updateReservationStatus(selectedReservation.id, 'CANCELED');
                                    setDetailsModalVisible(false);
                                }}
                            >
                                <Text style={customStyles.actionButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    
                    <TouchableOpacity 
                        style={[customStyles.closeButton, { borderColor: colors.colorAction }]}
                        onPress={() => setDetailsModalVisible(false)}
                    >
                        <Text style={[customStyles.closeButtonText, { color: colors.colorText }]}>{t('close')}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </Modal>
    );

    // Composant pour le modal de sélection de statut (similaire au SelectionTableModal)
    const renderStatusModal = () => (
        <Modal
            isVisible={statusModalVisible}
            onBackdropPress={() => setStatusModalVisible(false)}
            backdropOpacity={0.6}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            style={customStyles.modal}
        >
            <View style={[customStyles.modalContent, { backgroundColor: colors.colorBackground }]}>
                <Text style={[customStyles.modalTitle, { color: colors.colorText }]}>
                    {t('select_status')}
                </Text>
                
                <ScrollView style={customStyles.optionsList}>
                    {statusOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                customStyles.optionItem,
                                statusFilter === option && [customStyles.selectedOption, { borderColor: colors.colorAction }]
                            ]}
                            onPress={() => {
                                setStatusFilter(option);
                                setStatusModalVisible(false);
                            }}
                        >
                            <Text style={[customStyles.optionText, { color: colors.colorText }]}>
                                {option}
                            </Text>
                            {statusFilter === option && (
                                <Text style={[customStyles.checkmark, { color: colors.colorAction }]}>✓</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                
                <TouchableOpacity
                    style={[customStyles.closeButton, { backgroundColor: colors.colorAction }]}
                    onPress={() => setStatusModalVisible(false)}
                >
                    <Text style={[customStyles.closeButtonText, { color: colors.colorText }]}>{t('close')}</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
    
    // Composant pour le modal de sélection de date
    const renderDateModal = () => (
        <Modal
            isVisible={dateModalVisible}
            onBackdropPress={() => setDateModalVisible(false)}
            backdropOpacity={0.6}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            style={customStyles.modal}
        >
            <View style={[customStyles.modalContent, { backgroundColor: colors.colorBackground }]}>
                <Text style={[customStyles.modalTitle, { color: colors.colorText }]}>
                    {t('select_period')}
                </Text>
                
                <ScrollView style={customStyles.optionsList}>
                    {dateOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                customStyles.optionItem,
                                dateFilter === option && [customStyles.selectedOption, { borderColor: colors.colorAction }]
                            ]}
                            onPress={() => {
                                setDateFilter(option);
                                setDateModalVisible(false);
                            }}
                        >
                            <Text style={[customStyles.optionText, { color: colors.colorText }]}>
                                {option}
                            </Text>
                            {dateFilter === option && (
                                <Text style={[customStyles.checkmark, { color: colors.colorAction }]}>✓</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                
                <TouchableOpacity
                    style={[customStyles.closeButton, { backgroundColor: colors.colorAction }]}
                    onPress={() => setDateModalVisible(false)}
                >
                    <Text style={[customStyles.closeButtonText, { color: colors.colorText }]}>{t('close')}</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );

    // Fonction pour rendre le select (similaire à votre Tables.js)
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

    return (
        <SafeAreaView style={[customStyles.safeArea, {backgroundColor: colors.colorBackground}]}>
            <View style={[customStyles.container, {backgroundColor: colors.colorBackground}]}>
                <View style={customStyles.headerContainer}>
                    <Text style={[customStyles.pageTitle, { color: colors.colorText }]}>
                        {t('reservations')}
                    </Text>
                    <View style={[customStyles.separator, { backgroundColor: colors.colorText }]} />
                </View>
                
                <View style={customStyles.contentContainer}>
                    <View style={customStyles.filtersContainer}>
                        {renderSelect(t('status'), statusFilter, () => setStatusModalVisible(true))}
                        {renderSelect(t('period'), dateFilter, () => setDateModalVisible(true))}
                    </View>
                    
                    <TouchableOpacity 
                        style={[customStyles.refreshButton, { backgroundColor: colors.colorAction, width: '100%' }]}
                        onPress={fetchReservations}
                    >
                        <Text style={[customStyles.refreshButtonText, { color: "#fff" }]}>
                            {t('refresh')}
                        </Text>
                    </TouchableOpacity>

                    <View style={customStyles.reservationCountContainer}>
                        <Text style={[customStyles.reservationCount, { color: colors.colorText }]}>
                            {filteredReservations.length} {filteredReservations.length > 1 ? t('reservations') : t('reservation')}
                            {dateFilter !== 'Tous' ? ` - ${dateFilter}` : ''}
                        </Text>
                    </View>
                    
                    <ScrollView style={customStyles.reservationList}>
                        {filteredReservations.length > 0 ? (
                            filteredReservations.map(renderReservationCard)
                        ) : (
                            <View style={customStyles.emptyStateContainer}>
                                <Text style={[customStyles.emptyStateText, { color: colors.colorDetail }]}>
                                    Aucune réservation trouvée pour cette période.
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
            
            {renderDetailsModal()}
            {renderStatusModal()}
            {renderDateModal()}
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
        refreshButton: {
            width: '100%',
            borderRadius: 10,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
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
        refreshButtonText: {
            fontSize: 16,
            fontWeight: '500',
        },
        reservationCountContainer: {
            marginBottom: 10,
        },
        reservationCount: {
            fontSize: 16,
            fontWeight: '500',
        },
        reservationList: {
            flex: 1,
        },
        reservationCard: {
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
        reservationStatus: {
            width: 8,
        },
        reservationInfo: {
            flex: 1,
            padding: 12,
        },
        reservationHeader: {
            marginBottom: 8,
        },
        reservationName: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 2,
        },
        reservationDate: {
            fontSize: 14,
            fontStyle: 'italic',
        },
        reservationDetailsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        reservationDetail: {
            flex: 1,
        },
        reservationDetailLabel: {
            fontSize: 12,
            marginBottom: 2,
        },
        reservationDetailValue: {
            fontSize: 14,
        },
        // Styles pour le modal
        modal: {
            margin: 0,
            justifyContent: 'flex-end',
        },
        modalContent: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: '80%',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
        },
        detailSection: {
            marginBottom: 16,
        },
        detailLabel: {
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 4,
        },
        detailValue: {
            fontSize: 16,
            marginBottom: 2,
        },
        statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
        },
        statusIndicator: {
            width: 12,
            height: 12,
            borderRadius: 6,
            marginRight: 8,
        },
        statusText: {
            fontSize: 16,
        },
        actionButtonsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
            marginBottom: 10,
        },
        actionButton: {
            flex: 1,
            padding: 12,
            borderRadius: 10,
            alignItems: 'center',
            marginHorizontal: 5,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
        },
        actionButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
        },
        closeButton: {
            padding: 12,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 10,
            borderWidth: 1,
        },
        closeButtonText: {
            fontSize: 16,
            fontWeight: '500',
        },
        // Styles pour le modal de sélection de statut
        optionsList: {
            maxHeight: 300,
        },
        optionItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.1)',
        },
        selectedOption: {
            borderLeftWidth: 3,
        },
        optionText: {
            fontSize: 16,
        },
        checkmark: {
            fontSize: 18,
            fontWeight: 'bold',
        },
        emptyStateContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 30,
        },
        emptyStateText: {
            fontSize: 16,
            textAlign: 'center',
        },
    });
}