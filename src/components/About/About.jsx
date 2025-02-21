import React, {useState, useEffect} from "react";
import {StyleSheet, Alert, View, Image, Text, TouchableOpacity, TextInput } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import imgStat from "../../assets/imgStat.png"
import imgOrder from "../../assets/imgOrder.png"
import imgCard from "../../assets/imgCard.png"
import { useWindowDimensions } from "react-native";
import { useLoading } from "../Hooks/useLoading";
import { supabase, checkSession } from "../../lib/supabase";

export  function InfoStat({nextPage}){
  const styles = useStyles()

    return(
        <View style={styles.containerInfoLogin}>
            <View style={styles.containerImageInfoLogin}>
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
    const styles = useStyles()

    return(
        <View style={styles.containerInfoLogin}>
            <View style={styles.containerImageInfoLogin}>
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
    const styles = useStyles()

    return(
        <View style={styles.containerInfoLogin}>
            <View style={styles.containerImageInfoLogin}>
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
  const styles = useStyles();
  const { startLoading, stopLoading } = useLoading();
  const NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho";

  // Vérifier la session au chargement
  useEffect(() => {
    const initSession = async () => {
      const session = await checkSession();
      if (session) {
        navigation.navigate("MainApp");
      }
    };
    initSession();
  }, []);

  const showAlert = (message) => {
    Alert.alert(
      'Erreur',
      message,
      [{ text: 'Fermer', style: 'cancel' }],
      { cancelable: true }
    );
  };

  const handleLogin = async () => {
    try {
      startLoading();
      
      if (!email || !password) {
        showAlert('Veuillez remplir tous les champs');
        return;
      }

      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      if (!user) throw new Error('Pas de données utilisateur reçues');

      // Récupération données owner
      const { data: owner, error: ownerError } = await supabase
        .from('owners')
        .select('*')
        .eq('id', user.id)
        .single();

      if (ownerError) throw ownerError;

      // Récupération données role
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('*')
        .eq('owner_id', owner.id)
        .single();

      if (roleError) throw roleError;

      // Stockage des données supplémentaires
      await AsyncStorage.setItem('owner', JSON.stringify({
        ...owner,
        restaurantId: role.restaurant_id
      }));
      await AsyncStorage.setItem('role', JSON.stringify(role));

      navigation.navigate("MainApp");
    } catch (error) {
      console.error('Erreur complète:', error);
      showAlert(
        error.message.includes('Invalid login credentials')
        ? 'Email ou mot de passe incorrect'
        : `Erreur de connexion: ${error.message}`
      );
    } finally {
      stopLoading();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetPassword = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez renseigner votre email !');
      return;
    }
  
    try {
      startLoading();
  
      const response = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      console.log("Email envoyé :", email.trim());
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }
  
      Alert.alert(
        'Succès',
        'Un nouveau mot de passe vous a été envoyé par email. Veuillez vérifier votre boîte de réception.',
        [{ text: 'OK' }]
      );
  
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe : ", error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de réinitialiser votre mot de passe. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      stopLoading();
    }
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
      <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
        <Text style={styles.textBtnNextInfoLogin}>Connexion</Text>
      </TouchableOpacity>
      <Text onPress={resetPassword} style={styles.textResetPassword}>Mot de passe oublié ?</Text>
    </View>
  );
}


  function useStyles(){
    const {width, height} = useWindowDimensions();
  
    return StyleSheet.create({
      btnNextInfoLogin:{
        marginHorizontal: 20,
        height: (width > 375) ? 55 : 40,
        backgroundColor: "#FF3F00",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center"
      },
      textBtnNextInfoLogin:{
        color:  "white",
        fontSize: (width > 375) ? 18 : 14
      },
      titleInfoLogin:{
        color: "#000",
        textAlign: "center",
        fontSize: (width > 375) ? 28 : 24,
        fontWeight: "700",
      },
      descriptionInfoLogin:{
        color:'#7E848D',
        fontSize: (width > 375) ? 16 : 13,
        textAlign:"center",
        marginBottom: 30,
        marginTop: 15
      },
      containerImageInfoLogin:{
        marginTop: (height > 800) ? 70 : 50,
        justifyContent: "center",
        alignItems: "center", 
        height: (height > 800) ? 400 : 250,
      },
      imageInfoLogin:{
        height: (width > 375) ? 400 : 200,
        width: 300, 
        resizeMode: "contain"
      },
      containerLineInfoLogin:{
        marginBottom: 36,
        marginTop: 30,
        flexDirection: "row",
        justifyContent: "center"
      },
      lineInfoStat1:{
        width: 25,
        height: 6,
        backgroundColor: "#FF3F00",
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
        backgroundColor: "#FF3F00",
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
        backgroundColor: "#FF3F00",
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
        color: "#000",
        fontSize: (width > 375) ? 40 : 25,
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
        fontSize: (width > 375) ? 16 : 13
      },
      inputLogin:{
        width: 250,
        color: "black"
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
        height: (width > 375) ? 55 : 40,
        backgroundColor: "#FF3F00",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center" 
      },
      textResetPassword:{
        textAlign: "center", 
        fontSize: (width > 375) ? 16 : 14,
        color : "black", 
        marginTop: 15
      },
      containerInfoLogin:{
        backgroundColor: "#fff",
        height: "100%"
      }, 
      containerLogin:{
        backgroundColor: "#fff",
        height: '100%'
      }
    })
    
    
  }
