import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFonts } from "expo-font";

export function ModalDeleteFood({ isVisible, foodId, handleDeleteFood, onClose }) {

  if (!isVisible) {
    return null;
  }


  return (
    <View style={styles.containerModal}>
      <View style={styles.modalContent}>
        <Text style={styles.titleModal}>Êtes vous sûr ?</Text>
        <Text>Après la suppression le produit ne sera plus disponible pour les clients.</Text>
        <View style={styles.containerBottomModal}>
          <Text onPress={onClose}>Annuler</Text>
          <TouchableOpacity style={styles.btnDeleteModal} onPress={() => handleDeleteFood(foodId)}>
            <Text style={styles.textButtonDelete} onPress={() => handleDeleteFood(foodId)}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function ModalDeleteOrder({ isVisible, orderId, handleDelete, onClose }) {


  if (!isVisible) {
    return null;
  }


  return (
    <View style={styles.containerModal}>
      <View style={styles.modalContent}>
        <Text style={styles.titleModal}>Êtes vous sûr ?</Text>
        <Text>Après la suppression la commande ne sera plus disponible.</Text>
        <View style={styles.containerBottomModal}>
          <Text onPress={onClose}>Annuler</Text>
          <TouchableOpacity style={styles.btnDeleteModal} onPress={() => handleDelete(orderId)}>
            <Text style={styles.textButtonDelete} onPress={() => handleDelete(orderId)}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


export function ModalDeleteUser({ isVisible, userId, handleDeleteUser, onClose }) {


  if (!isVisible) {
    return null;
  }


  return (
    <View style={styles.containerModal}>
      <View style={styles.modalContent}>
        <Text style={styles.titleModal}>Êtes vous sûr ?</Text>
        <Text>Après la suppression la commande ne sera plus disponible.</Text>
        <View style={styles.containerBottomModal}>
          <Text onPress={onClose}>Annuler</Text>
          <TouchableOpacity style={styles.btnDeleteModal} onPress={() => handleDeleteUser(userId)}>
            <Text style={styles.textButtonDelete} onPress={() => handleDeleteUser(userId)}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  containerModal:{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent:{
    backgroundColor:"#dcdcdc",
    width: "90%",
    padding: 20,
    borderRadius: 20,
  },
  containerBottomModal:{
    display:"flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap:20,
    marginTop : 30,
    alignItems: 'center',
  },
  titleModal:{
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20
  },
  btnDeleteModal:{
    backgroundColor: "red",
    padding: 5,
    borderRadius: 10
  },
  textButtonDelete:{
    color: "white",
  }
});

