import {react, useState, useEffect} from "react";
import {View, Text, TextInput, Alert, TouchableOpacity, StyleSheet} from 'react-native'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventEmitter } from "../EventEmitter/EventEmitter";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [storageData, setStorageData] = useState(null);

    useEffect(() => {
        const getStorageData = async () => {
          try {
            const keys = await AsyncStorage.getAllKeys();
            const data = await AsyncStorage.multiGet(keys);
            setStorageData(keys);
          } catch (error) {
            console.error("Erreur lors de la récupération des données AsyncStorage :", error);
          }
        };
    
        getStorageData();
      }, []);

    console.log("storage: ", storageData);
  
    const handleLogin = async () => {
      try {
        const response = await fetch("https://back-wok-rosny.onrender.com/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });
  
        const data = await response.json();
        console.log(data);
  
        if (data.token) {
          EventEmitter.dispatch("loginSuccess");
          await AsyncStorage.setItem("token", data.token);
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
          setErrorMessage(""); // Réinitialiser le message d'erreur
        } else {
          setErrorMessage(data.error || "Une erreur est survenue");
        }
      } catch (error) {
        console.error("Erreur lors de la connexion : ", error);
        setErrorMessage("Erreur de connexion");
      }
    };
  
    return (
      <View style={styles.containerFormLogin}>
        <TextInput
          style={styles.inputLogin}
          value={email}
          onChangeText={setEmail}
          placeholder="Entrez votre email"
          name="email"
        />
        <TextInput
          style={styles.inputLogin}
          value={password}
          onChangeText={setPassword}
          placeholder="Mot de passe"
          secureTextEntry={true}
          name='password'
        />
        <TouchableOpacity  style={styles.buttonLogin} onPress={handleLogin}>
          <Text style={styles.textButtonLogin}>Se connecter</Text>
        </TouchableOpacity>
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
      </View>
    );
  }

const styles = StyleSheet.create ({
    inputLogin: {
        width:"80%",
        borderColor : "#FF9A00",
        borderRadius: 20,
        borderWidth: 2,
        height: 50,
        paddingLeft: 20
        
    },
    containerFormLogin:{
        display: "flex",
        justifyContent:  "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 20
    },
    buttonLogin: {
        backgroundColor: "#FF9A00",
        borderRadius: 20,
        borderWidth: 2,
        height: 50,
        width:  "40%",
        display: "flex",
        justifyContent:"center",
        alignItems: "center",
        borderWidth: 0
    },
    textButtonLogin: {
        color: "#fff",
    }

})

export default LoginForm