// UpdateModal.js
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Utilisation de paramètres par défaut au lieu de defaultProps
const UpdateModal = ({ version = '1.0.0', releaseNotes = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkVersion();
  }, [version]); // Réexécuter quand la version change

  const checkVersion = async () => {
    try {
      // Récupérer la dernière version vue par l'utilisateur
      const lastSeenVersion = await AsyncStorage.getItem('lastSeenVersion');
      
      console.log("Comparaison des versions:");
      console.log("- Version actuelle:", version);
      console.log("- Dernière version vue:", lastSeenVersion || "Aucune");

      // Si c'est une nouvelle version et que l'utilisateur ne l'a pas encore vue
      if (version !== lastSeenVersion) {
        console.log("Versions différentes, affichage du modal");
        setIsVisible(true);
      } else {
        console.log("Versions identiques, pas d'affichage du modal");
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la version:', error);
    }
  };

  const handleClose = async () => {
    try {
      console.log("Sauvegarde de la version:", version);
      await AsyncStorage.setItem('lastSeenVersion', version);
      console.log("Version sauvegardée avec succès");
      
      setIsVisible(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la version:', error);
    }
  };

  // Pour forcer l'affichage en développement
  useEffect(() => {
    if (__DEV__) {
      const forceShowInDev = async () => {
        // Vérifier si nous sommes en mode développement et s'il y a un paramètre forceModal
        const forceModal = await AsyncStorage.getItem('forceUpdateModal');
        if (forceModal === 'true') {
          console.log("Affichage forcé du modal (mode développement)");
          setIsVisible(true);
          // Réinitialiser le forçage après utilisation
          await AsyncStorage.removeItem('forceUpdateModal');
        }
      };
      
      forceShowInDev();
    }
  }, []);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Nouvelle mise à jour !</Text>
          
          <Text style={styles.modalText}>
            Version {version}
          </Text>
          
          <View style={styles.releaseNotesContainer}>
            {releaseNotes.split('\n').map((note, index) => (
              <Text key={index} style={styles.releaseNote}>
                {note.trim()}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleClose}
          >
            <Text style={styles.buttonText}>J'ai compris</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  modalText: {
    marginBottom: 15,
    fontSize: 16,
    alignSelf: 'flex-start',
  },
  releaseNotesContainer: {
    width: '100%',
    marginBottom: 20,
    paddingLeft: 20,
    alignSelf: 'flex-start',
  },
  releaseNote: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 10,
    width: '100%',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    minWidth: 100,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default UpdateModal;