import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";

const TableEditModal = ({ 
  visible, 
  table, 
  isNew, 
  onClose, 
  onSave, 
  onDelete, 
  colors 
}) => {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const {t} = useTranslation()

  useEffect(() => {
    if (table) {
      setTableNumber(table.table_number ? table.table_number.toString() : "");
      setCapacity(table.number_of_people ? table.number_of_people.toString() : "");
      setLocation(table.location || "");
      setIsAvailable(table.is_available || true);
    }
  }, [table]);

  const handleSave = () => {
    if (!tableNumber || !capacity || !location) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const updatedTable = {
      ...table,
      table_number: tableNumber,
      number_of_people: parseInt(capacity),
      location: location,
      is_available: isAvailable
    };

    onSave(updatedTable);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <View style={[
          styles.modalView,
          { backgroundColor: colors.colorBackground }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.colorText }]}>
              {isNew ? t('add_table') : t('edit')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.colorText} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.colorText }]}>
                {t('table_number')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.colorText,
                    backgroundColor: colors.colorBorderAndBlock,
                    borderColor: colors.colorDetail
                  }
                ]}
                value={tableNumber}
                onChangeText={setTableNumber}
                placeholder={t('table_number')}
                placeholderTextColor={colors.colorDetail}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.colorText }]}>
                {t('capacity')} ({t('number_of_persons')})
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.colorText,
                    backgroundColor: colors.colorBorderAndBlock,
                    borderColor: colors.colorDetail
                  }
                ]}
                value={capacity}
                onChangeText={setCapacity}
                placeholder={t('capacity')}
                placeholderTextColor={colors.colorDetail}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.colorText }]}>
                {t('location')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.colorText,
                    backgroundColor: colors.colorBorderAndBlock,
                    borderColor: colors.colorDetail
                  }
                ]}
                value={location}
                onChangeText={setLocation}
                placeholder={t('location')}
                placeholderTextColor={colors.colorDetail}
              />
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={[styles.label, { color: colors.colorText }]}>
                {t('available')}
              </Text>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: "#767577", true: colors.colorAction }}
                thumbColor={isAvailable ? "#f4f3f4" : "#f4f3f4"}
              />
            </View>
          </ScrollView>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: colors.colorAction }
              ]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: "#fff" }]}>
                {isNew ? t('add') : t('Save')}
              </Text>
            </TouchableOpacity>
            
            {!isNew && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.deleteButton,
                  { backgroundColor: "#F44336" }
                ]}
                onPress={() => onDelete(table.id)}
              >
                <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                  {t('delete')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold"
  },
  closeButton: {
    padding: 5
  },
  formContainer: {
    marginBottom: 20
  },
  inputContainer: {
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    marginBottom: 5
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  saveButton: {
    flex: 1,
    marginRight: 10
  },
  deleteButton: {
    flex: 1,
    marginLeft: 10
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold"
  }
});

export default TableEditModal;