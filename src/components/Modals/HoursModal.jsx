import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Alert,
  FlatList
} from "react-native";
import { useColors } from "../ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import * as Haptics from 'expo-haptics';
import { supabase } from "../../lib/supabase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Sélecteur de temps personnalisé pour remplacer DateTimePicker
// Modification du CustomTimePicker pour augmenter la largeur des colonnes
const CustomTimePicker = ({ visible, onClose, onConfirm, initialHour = 12, initialMinute = 0 }) => {
  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);
  const { colors } = useColors();
  const { t } = useTranslation();
  const styles = useStyles();
  const { width } = useWindowDimensions();
  
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.timePickerContainer}>
        <View style={[styles.timePickerContent, { backgroundColor: colors.colorBackground, width: width * 0.9 }]}>
          <View style={styles.timePickerHeader}>
            <Text style={[styles.timePickerTitle, { color: colors.colorText }]}>
              {t('Select Time')}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.colorBorderAndBlock }]}
            >
              <Icon name="close" size={24} color={colors.colorText} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.timePickerSelectors}>
            <View style={styles.timePickerColumn}>
              <Text style={[styles.timePickerLabel, { color: colors.colorDetail }]}>
                {t('schedules')}
              </Text>
              <FlatList
                data={hours}
                keyExtractor={(item) => `hour-${item}`}
                style={[styles.timePickerList, { backgroundColor: colors.colorBorderAndBlock, width: width * 0.3 }]}
                showsVerticalScrollIndicator={true}
                initialScrollIndex={selectedHour}
                getItemLayout={(data, index) => ({
                  length: 50,
                  offset: 50 * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.timePickerItem,
                      selectedHour === item && { backgroundColor: colors.colorAction + '40' }
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedHour(item);
                    }}
                  >
                    <Text
                      style={[
                        styles.timePickerItemText,
                        { color: colors.colorText },
                        selectedHour === item && { fontWeight: 'bold', color: colors.colorAction }
                      ]}
                    >
                      {item.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            
            <Text style={[styles.timePickerSeparator, { color: colors.colorText }]}>:</Text>
            
            <View style={styles.timePickerColumn}>
              <Text style={[styles.timePickerLabel, { color: colors.colorDetail }]}>
                {t('Minute')}
              </Text>
              <FlatList
                data={minutes}
                keyExtractor={(item) => `minute-${item}`}
                style={[styles.timePickerList, { backgroundColor: colors.colorBorderAndBlock, width: width * 0.3 }]}
                showsVerticalScrollIndicator={true}
                initialScrollIndex={Math.floor(selectedMinute / 5)}
                getItemLayout={(data, index) => ({
                  length: 50,
                  offset: 50 * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.timePickerItem,
                      selectedMinute === item && { backgroundColor: colors.colorAction + '40' }
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedMinute(item);
                    }}
                  >
                    <Text
                      style={[
                        styles.timePickerItemText,
                        { color: colors.colorText },
                        selectedMinute === item && { fontWeight: 'bold', color: colors.colorAction }
                      ]}
                    >
                      {item.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: colors.colorAction }]}
            onPress={() => {
              const date = new Date();
              date.setHours(selectedHour);
              date.setMinutes(selectedMinute);
              onConfirm(date);
            }}
          >
            <Text style={styles.confirmButtonText}>{t('Confirm')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const HoursModal = ({ visible, onClose, restaurantId }) => {
  const [hourData, setHourData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [initialHour, setInitialHour] = useState(12);
  const [initialMinute, setInitialMinute] = useState(0);
  
  const { t } = useTranslation();
  const { colors } = useColors();
  const { width } = useWindowDimensions();
  const styles = useStyles();

  // Jours de la semaine
  const days = [
    { id: 0, name: t('monday') },
    { id: 1, name: t('tuesday') },
    { id: 2, name: t('wednesday') },
    { id: 3, name: t('thursday') },
    { id: 4, name: t('friday') },
    { id: 5, name: t('saturday') },
    { id: 6, name: t('sunday') }
  ];

  useEffect(() => {
    if (visible && restaurantId) {
      fetchHours(restaurantId);
    }
  }, [visible, restaurantId]);

  const fetchHours = async (id) => {
    setIsLoading(true);
    try {
      // Récupérer les horaires existants
      const { data, error } = await supabase
        .from('restaurant_hours')
        .select('*')
        .eq('restaurant_id', id)
        .order('day_of_week');

      if (error) throw error;

      // Créer un tableau avec des données pour chaque jour
      const defaultHours = days.map(day => ({
        restaurant_id: id,
        day_of_week: day.id,
        lunch_open_time: '12:00:00',
        lunch_close_time: '14:30:00',
        dinner_open_time: '19:00:00',
        dinner_close_time: '22:30:00',
        is_lunch_closed: false,
        is_dinner_closed: false,
        is_closed_all_day: false
      }));

      // Fusionner avec les données existantes
      if (data && data.length > 0) {
        data.forEach(item => {
          const index = defaultHours.findIndex(h => h.day_of_week === item.day_of_week);
          if (index !== -1) {
            defaultHours[index] = item;
          }
        });
      }

      setHourData(defaultHours);
    } catch (error) {
      console.error('Erreur lors de la récupération des horaires:', error);
      Alert.alert(
        t('Error'),
        t('Failed to load restaurant hours')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:00`;

    updateHourField(selectedDay, selectedField, timeString);
    setTimePickerVisible(false);
  };

// Update the updateHourField function to set default times when toggling from closed to open
const updateHourField = async (dayIndex, field, value) => {
  try {
    Haptics.selectionAsync();

    // Mettre à jour l'état local
    const updatedData = [...hourData];
    
    // Si on ferme toute la journée, on ferme aussi le midi et le soir
    if (field === 'is_closed_all_day' && value === true) {
      updatedData[dayIndex].is_closed_all_day = true;
      updatedData[dayIndex].is_lunch_closed = true;
      updatedData[dayIndex].is_dinner_closed = true;
    } 
    // Si on active midi ou soir, on ne peut pas être fermé toute la journée
    else if ((field === 'is_lunch_closed' || field === 'is_dinner_closed') && value === false) {
      updatedData[dayIndex].is_closed_all_day = false;
      updatedData[dayIndex][field] = value;
      
      // Set default times when toggling from closed to open
      if (field === 'is_lunch_closed') {
        updatedData[dayIndex].lunch_open_time = '12:00:00';
        updatedData[dayIndex].lunch_close_time = '14:30:00';
      } else if (field === 'is_dinner_closed') {
        updatedData[dayIndex].dinner_open_time = '19:00:00';
        updatedData[dayIndex].dinner_close_time = '22:30:00';
      }
    }
    // Pour tous les autres cas
    else {
      updatedData[dayIndex][field] = value;
    }
    
    setHourData(updatedData);

    // Mettre à jour dans la base de données
    const dayData = updatedData[dayIndex];
    
    if (dayData.id) {
      // Mise à jour d'un enregistrement existant
      const { error } = await supabase
        .from('restaurant_hours')
        .update({
          lunch_open_time: dayData.lunch_open_time,
          lunch_close_time: dayData.lunch_close_time,
          dinner_open_time: dayData.dinner_open_time,
          dinner_close_time: dayData.dinner_close_time,
          is_lunch_closed: dayData.is_lunch_closed,
          is_dinner_closed: dayData.is_dinner_closed,
          is_closed_all_day: dayData.is_closed_all_day
        })
        .eq('id', dayData.id);

      if (error) throw error;
    } else {
      // Création d'un nouvel enregistrement
      const { data, error } = await supabase
        .from('restaurant_hours')
        .insert({
          restaurant_id: dayData.restaurant_id,
          day_of_week: dayData.day_of_week,
          lunch_open_time: dayData.lunch_open_time,
          lunch_close_time: dayData.lunch_close_time,
          dinner_open_time: dayData.dinner_open_time,
          dinner_close_time: dayData.dinner_close_time,
          is_lunch_closed: dayData.is_lunch_closed,
          is_dinner_closed: dayData.is_dinner_closed,
          is_closed_all_day: dayData.is_closed_all_day
        })
        .select();

      if (error) throw error;

      // Mettre à jour l'ID dans l'état local
      if (data && data.length > 0) {
        updatedData[dayIndex].id = data[0].id;
        setHourData(updatedData);
      }
    }

    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour des horaires:', error);
    Alert.alert(
      t('Error'),
      t('Failed to update restaurant hours')
    );
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Error
    );
  }
};

  const handleTimeTap = (dayIndex, period, field) => {
    setSelectedDay(dayIndex);
    setSelectedField(field);
    
    // Préparer l'heure actuelle pour le picker
    const currentTimeStr = hourData[dayIndex][field];
    const [hours, minutes] = currentTimeStr.split(':');
    
    setInitialHour(parseInt(hours, 10));
    setInitialMinute(parseInt(minutes, 10));
    setTimePickerVisible(true);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    // Format: "HH:MM:SS" → "HH:MM"
    return timeString.substring(0, 5);
  };

  const renderDayCard = (day, index) => {
    const dayData = hourData[index];
    if (!dayData) return null;

    return (
      <View key={day.id} style={[styles.dayCard, { backgroundColor: colors.colorBorderAndBlock }]}>
        <View style={styles.dayHeader}>
          <Text style={[styles.dayTitle, { color: colors.colorText }]}>
            {day.name}
          </Text>
          <View style={styles.closedContainer}>
            <Text style={[styles.closedText, { color: colors.colorDetail }]}>
              {t('closed')}
            </Text>
            <Switch
              value={dayData.is_closed_all_day}
              onValueChange={(value) => updateHourField(index, 'is_closed_all_day', value)}
              trackColor={{ false: "#767577", true: colors.colorAction }}
              thumbColor={"#ffffff"}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        {!dayData.is_closed_all_day && (
          <View style={styles.periodsContainer}>
            {/* Lunch Period */}
            <View style={styles.periodSection}>
              <View style={styles.periodHeader}>
                <Text style={[styles.periodTitle, { color: colors.colorText }]}>
                  {t('lunch')}
                </Text>
                <View style={styles.closedContainer}>
                  <Text style={[styles.closedText, { color: colors.colorDetail }]}>
                    {t('closed')}
                  </Text>
                  <Switch
                    value={dayData.is_lunch_closed}
                    onValueChange={(value) => updateHourField(index, 'is_lunch_closed', value)}
                    trackColor={{ false: "#767577", true: colors.colorAction }}
                    thumbColor={"#ffffff"}
                    ios_backgroundColor="#3e3e3e"
                  />
                </View>
              </View>

              {!dayData.is_lunch_closed && (
                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={[styles.timeButton, { backgroundColor: colors.colorBackground }]}
                    onPress={() => handleTimeTap(index, 'lunch', 'lunch_open_time')}
                  >
                    <Text style={[styles.timeText, { color: colors.colorText }]}>
                      {formatTime(dayData.lunch_open_time)}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.timeSeparator, { color: colors.colorText }]}>-</Text>
                  <TouchableOpacity
                    style={[styles.timeButton, { backgroundColor: colors.colorBackground }]}
                    onPress={() => handleTimeTap(index, 'lunch', 'lunch_close_time')}
                  >
                    <Text style={[styles.timeText, { color: colors.colorText }]}>
                      {formatTime(dayData.lunch_close_time)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Dinner Period */}
            <View style={styles.periodSection}>
              <View style={styles.periodHeader}>
                <Text style={[styles.periodTitle, { color: colors.colorText }]}>
                  {t('dinner')}
                </Text>
                <View style={styles.closedContainer}>
                  <Text style={[styles.closedText, { color: colors.colorDetail }]}>
                    {t('closed')}
                  </Text>
                  <Switch
                    value={dayData.is_dinner_closed}
                    onValueChange={(value) => updateHourField(index, 'is_dinner_closed', value)}
                    trackColor={{ false: "#767577", true: colors.colorAction }}
                    thumbColor={"#ffffff"}
                    ios_backgroundColor="#3e3e3e"
                  />
                </View>
              </View>

              {!dayData.is_dinner_closed && (
                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={[styles.timeButton, { backgroundColor: colors.colorBackground }]}
                    onPress={() => handleTimeTap(index, 'dinner', 'dinner_open_time')}
                  >
                    <Text style={[styles.timeText, { color: colors.colorText }]}>
                      {formatTime(dayData.dinner_open_time)}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.timeSeparator, { color: colors.colorText }]}>-</Text>
                  <TouchableOpacity
                    style={[styles.timeButton, { backgroundColor: colors.colorBackground }]}
                    onPress={() => handleTimeTap(index, 'dinner', 'dinner_close_time')}
                  >
                    <Text style={[styles.timeText, { color: colors.colorText }]}>
                      {formatTime(dayData.dinner_close_time)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {dayData.is_closed_all_day && (
          <View style={styles.closedDayMessage}>
            <Text style={[styles.closedDayText, { color: colors.colorDetail }]}>
              {t('day_closed')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.colorBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.colorText }]}>
              {t('opening_hours')}
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.colorBorderAndBlock }]}
            >
              <Icon name="close" size={24} color={colors.colorText} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.modalDescription, { color: colors.colorDetail }]}>
            {t('set_hours_per_day')}
          </Text>
          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {days.map((day, index) => renderDayCard(day, index))}
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.colorAction }]}
            onPress={onClose}
          >
            <Text style={styles.saveButtonText}>{t('confirm')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Notre sélecteur personnalisé à la place de DateTimePicker */}
        <CustomTimePicker 
          visible={timePickerVisible}
          onClose={() => setTimePickerVisible(false)}
          onConfirm={handleTimeChange}
          initialHour={initialHour}
          initialMinute={initialMinute}
        />
      </View>
    </Modal>
  );
};

function useStyles() {
  const { width } = useWindowDimensions();

  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingTop: 16,
      maxHeight: '90%',
      flex: 0.9,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: width > 375 ? 20 : 18,
      fontWeight: '600',
    },
    modalDescription: {
      fontSize: 14,
      marginBottom: 16,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingVertical: 8,
    },
    dayCard: {
      borderRadius: 16,
      marginBottom: 16,
      padding: 16,
    },
    dayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    dayTitle: {
      fontSize: width > 375 ? 18 : 16,
      fontWeight: '600',
    },
    closedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    closedText: {
      fontSize: 14,
      marginRight: 8,
    },
    periodsContainer: {
      marginTop: 8,
    },
    periodSection: {
      marginBottom: 16,
    },
    periodHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    periodTitle: {
      fontSize: width > 375 ? 16 : 14,
      fontWeight: '500',
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    timeButton: {
      paddingVertical: 8,
      paddingHorizontal: 24,
      borderRadius: 8,
      minWidth: 100,
      alignItems: 'center',
    },
    timeText: {
      fontSize: width > 375 ? 16 : 14,
      fontWeight: '500',
    },
    timeSeparator: {
      marginHorizontal: 16,
      fontSize: 18,
      fontWeight: '300',
    },
    closedDayMessage: {
      alignItems: 'center',
      padding: 16,
    },
    closedDayText: {
      fontSize: 16,
      fontStyle: 'italic',
    },
    saveButton: {
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: width > 375 ? 16 : 14,
      fontWeight: '600',
    },
    
    // Styles pour CustomTimePicker
    timePickerContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    timePickerContent: {
      width: '80%',
      borderRadius: 16,
      padding: 20,
      paddingTop: 16,
    },
    timePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    timePickerTitle: {
      fontSize: 20,
      fontWeight: '600',
    },
    timePickerSelectors: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    timePickerColumn: {
      width: 80,
      alignItems: 'center',
    },
    timePickerLabel: {
      fontSize: 14,
      marginBottom: 8,
    },
    timePickerList: {
      height: 200,
      borderRadius: 8,
    },
    timePickerItem: {
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    timePickerItemText: {
      fontSize: 18,
    },
    timePickerSeparator: {
      fontSize: 24,
      marginHorizontal: 20,
      fontWeight: 'bold',
    },
    confirmButton: {
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    confirmButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    timePickerContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    timePickerContent: {
      width: '90%', // Augmenté de 80% à 90%
      borderRadius: 16,
      padding: 20,
      paddingTop: 16,
    },
    timePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    timePickerTitle: {
      fontSize: 20,
      fontWeight: '600',
    },
    timePickerSelectors: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    timePickerColumn: {
      width: width * 0.3, // Dynamique selon la largeur de l'écran
      alignItems: 'center',
    },
    timePickerLabel: {
      fontSize: 14,
      marginBottom: 8,
    },
    timePickerList: {
      height: 250, // Augmenté de 200 à 250
      borderRadius: 8,
      width: '100%', // Pour s'assurer que la liste prend toute la largeur de la colonne
    },
    timePickerItem: {
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%', // Pour s'assurer que l'élément prend toute la largeur
    },
    timePickerItemText: {
      fontSize: 20, // Augmenté de 18 à 20 pour une meilleure lisibilité
    },
    timePickerSeparator: {
      fontSize: 24,
      marginHorizontal: 20,
      fontWeight: 'bold',
    },
    confirmButton: {
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    confirmButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}

export default HoursModal;