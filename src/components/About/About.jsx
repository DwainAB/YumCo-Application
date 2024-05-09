import React, {useState,  useEffect} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventEmitter } from "../EventEmitter/EventEmitter";
import imgStat from "../../assets/imgStat.png"
import imgOrder from "../../assets/imgOrder.png"
import imgCard from "../../assets/imgCard.png"

export  function InfoStat({nextPage}){

    return(
        <View style={styles.containerInfoLogin}>
            <View style={styles.imageInfoLogin}>
              <Image
                  source={imgStat} 
                  style={styles.imageInfoLogin}
                />
            </View>

            <View style={styles.containerLineInfoLogin}>
              <View style={styles.lineInfoStat1}></View>
              <View style={styles.lineInfoStat2}></View>
              <View style={styles.lineInfoStat3}></View>
            </View>

            <Text style={styles.titleInfoLogin}>Suivez toutes vos {'\n'} statistiques</Text>
            <Text style={styles.descriptionInfoLogin}>Tableau de bord vous permettant de{'\n'}suivre en temps réel toutes les{'\n'}statistiques pertinentes à votre activité.</Text>
            <TouchableOpacity style={styles.btnNextInfoLogin} onPress={nextPage}><Text style={styles.textBtnNextInfoLogin}>suivant</Text></TouchableOpacity>
        </View>
    )
}

export  function InfoOrder({nextPage}){

    return(
        <View style={styles.containerInfoLogin}>
            <View style={styles.imageInfoLogin}>
              <Image
                source={imgOrder} 
                style={styles.imageInfoLogin}
              />
            </View>

            <View style={styles.containerLineInfoLogin}>
              <View style={styles.lineInfoOrder1}></View>
              <View style={styles.lineInfoOrder2}></View>
              <View style={styles.lineInfoOrder3}></View>
            </View>
            <Text style={styles.titleInfoLogin}>Gérer toutes vos{'\n'} commandes</Text>
            <Text style={styles.descriptionInfoLogin}>Surveillez et gérez vos commandes{"\n"} en toute simplicité.</Text>
            <TouchableOpacity style={styles.btnNextInfoLogin} onPress={nextPage}><Text style={styles.textBtnNextInfoLogin}>suivant</Text></TouchableOpacity>
        </View>
    )
}

export  function InfoCard({nextPage}){

    return(
        <View style={styles.containerInfoLogin}>
            <View style={styles.imageInfoLogin}>
              <Image
                source={imgCard} 
                style={styles.imageInfoLogin}
              />
            </View>

            <View style={styles.containerLineInfoLogin}>
              <View style={styles.lineInfoCard1}></View>
              <View style={styles.lineInfoCard2}></View>
              <View style={styles.lineInfoCard3}></View>
            </View>
            <Text style={styles.titleInfoLogin}>Personnaliser votre{'\n'}carte</Text>
            <Text style={styles.descriptionInfoLogin}>Gérez facilement la carte de votre{'\n'} restaurant selon vos besoin.</Text>
            <TouchableOpacity style={styles.btnNextInfoLogin} onPress={nextPage}><Text style={styles.textBtnNextInfoLogin}>suivant</Text></TouchableOpacity>
        </View>
    )
}

export function FormLogin() {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
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

    const showAlert = () => {
      Alert.alert(
        'Erreur',
        'Email ou mot de passe incorrect.',
        [
          {
            text: 'Fermer',
            onPress: () => console.log('Alerte fermée'),
            style: 'cancel',
          },
        ],
        { cancelable: true } // Permet de fermer l'alerte en touchant à l'extérieur de celle-ci
      );
    };
  
    const handleLogin = async () => {
      try {
        const response = await fetch("http://192.168.1.8/back-website-restaurant-1/api/users/login", {
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
          navigation.navigate("MainApp");
        } else {
          setErrorMessage(data.error || "Une erreur est survenue");
          showAlert()
        }
      } catch (error) {
        console.error("Erreur lors de la connexion : ", error);
        setErrorMessage("Erreur de connexion");
      }
    };
 
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
  
  
    return (
      <View style={styles.containerLogin}>
          <Text style={styles.titleLogin}>Connexion</Text>
          
          <Text style={styles.titleInput}>Email</Text>
          <View style={styles.containerInputLogin}>
            <Ionicons color={"#707070"} marginRight={15} size={20} name="mail-outline"/>
            <TextInput
                style={styles.inputLogin}
                value={email}
                onChangeText={setEmail}
                placeholder="Entrez votre email"
                name="email"
                placeholderTextColor="#343434"
            />
          </View>

          <Text style={styles.titleInput}>Mot de passe</Text>
          <View style={styles.containerInputLogin}>
            <Ionicons marginRight={15} name='key-outline' size={20} color={'#707070'}/>
            <TextInput
                style={styles.inputLogin}
                placeholder="******"
                placeholderTextColor="#343434"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                name='password'
            />
            <TouchableOpacity style={styles.eye} onPress={togglePasswordVisibility}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={'#a2a2a7'} />
            </TouchableOpacity>  
          </View>
          <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}><Text style={styles.textBtnNextInfoLogin}>Connexion</Text></TouchableOpacity>     
      </View>
    );
  }

const styles = StyleSheet.create({
  btnNextInfoLogin:{
    marginLeft: 20,
    marginRight: 20,
    height: 55,
    backgroundColor: "#0066FF",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  textBtnNextInfoLogin:{
    color:  "white",
    fontSize: 18
  },
  titleInfoLogin:{
    color: "white",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700"
  },
  descriptionInfoLogin:{
    color:'#7E848D',
    fontSize: 16,
    textAlign:"center",
    marginBottom: 30,
    marginTop: 15
  },
  imageInfoLogin:{
    marginTop: 70,
    justifyContent: "center",
    alignItems: "center"
  },
  containerLineInfoLogin:{
    marginBottom: 36,
    marginTop: 70,
    flexDirection: "row",
    justifyContent: "center"
  },
  lineInfoStat1:{
    width: 25,
    height: 6,
    backgroundColor: "#0066ff",
    borderRadius: 3
  },
  lineInfoStat2:{
    width:6, 
    height:6, 
    backgroundColor: "#707070",
    borderRadius: 50,
    marginLeft: 10
  },
  lineInfoStat3:{
    width:6, 
    height:6, 
    backgroundColor: "#707070",
    borderRadius: 50,
    marginLeft: 10
  },
  lineInfoOrder2:{
    width: 25,
    height: 6,
    backgroundColor: "#0066ff",
    borderRadius: 3,
    marginLeft: 10
  },
  lineInfoOrder1:{
    width:6, 
    height:6, 
    backgroundColor: "#707070",
    borderRadius: 50,
  },
  lineInfoOrder3:{
    width:6, 
    height:6, 
    backgroundColor: "#707070",
    borderRadius: 50,
    marginLeft: 10
  },
  lineInfoCard3:{
    width: 25,
    height: 6,
    backgroundColor: "#0066ff",
    borderRadius: 3,
    marginLeft: 10
  },
  lineInfoCard1:{
    width:6, 
    height:6, 
    backgroundColor: "#707070",
    borderRadius: 50,
  },
  lineInfoCard2:{
    width:6, 
    height:6, 
    backgroundColor: "#707070",
    borderRadius: 50,
    marginLeft: 10
  },
  titleLogin:{
    color: "white",
    fontSize: 40,
    marginTop: 150,
    marginLeft:20,
    fontWeight:"500",
    marginBottom: 40
  },
  containerInputLogin:{
    flexDirection:'row',
    marginLeft: 20,
    marginRight:20,
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth:1,
    borderColor: "#232533"
  },
  titleInput:{
    color: "#707070",
    marginLeft:20,
    marginBottom: 15,
    fontSize: 16
  },
  inputLogin:{
    width: 250,
    color: "white"
  },
  eye:{
    position: 'absolute',
    right: 0,
    top: 0
  },
  btnLogin:{
    marginLeft: 20,
    marginRight: 20,
    marginTop: 40,
    height: 55,
    backgroundColor: "#0066FF",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center" 
  }
})

