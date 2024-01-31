import {react, useState} from "react";
import {View, Text, TextInput, Alert, TouchableOpacity, StyleSheet} from 'react-native'

function LoginForm(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = () => {
        // Traitement du formulaire ici
        // Par exemple, afficher une alerte avec les données saisies
        Alert.alert('Formulaire Soumis', `Nom: ${nom}\nEmail: ${email}`);
      };

    return(
        <View style={styles.containerFormLogin}>
            <TextInput
                style={styles.inputLogin}
                value={email}
                onChangeText={setEmail}
                placeholder="Entrez votre email"
            />
            <TextInput
                style={styles.inputLogin}
                value={password}
                onChangeText={setPassword}
                placeholder="Mot de passe"
                keyboardType="password"
            />
            <TouchableOpacity style={styles.buttonLogin} onPress={handleSubmit}>
                <Text style={styles.textButtonLogin}>Se connecter</Text>
            </TouchableOpacity>
        </View>
    )
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