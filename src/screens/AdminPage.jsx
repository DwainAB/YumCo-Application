import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import LoginScreen from "./LoginScreen";
import Dashboard from "./Dashboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventEmitter } from "../components/EventEmitter/EventEmitter";

function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setIsLoggedIn(!!token); // Convertit la valeur en booléen
      } catch (error) {
        console.error("Erreur lors de la vérification du statut de connexion :", error);
      }
    };

    const handleLoginSuccess = () => {
      setIsLoggedIn(true); // Mettre à jour l'état isLoggedIn lorsque l'utilisateur se connecte avec succès
    };

    const handleLogout = () => {
      setIsLoggedIn(false); // Mettre à jour l'état isLoggedIn lorsque l'utilisateur se déconnecte
    };

    checkLoginStatus();
    // Écouter l'événement de connexion réussie
    const unsubscribeLogin = EventEmitter.subscribe("loginSuccess", handleLoginSuccess);
    // Écouter l'événement de déconnexion
    const unsubscribeLogout = EventEmitter.subscribe("logout", handleLogout);

    return () => {
      // Nettoyer les écouteurs lorsque le composant est démonté
      unsubscribeLogin();
      unsubscribeLogout();
    };
  }, []);

  return (
    <View style={styles.container}>
      {isLoggedIn ? <Dashboard /> : <LoginScreen />}
    </View>
  );
}

const styles = StyleSheet.create({});

export default AdminPage;
