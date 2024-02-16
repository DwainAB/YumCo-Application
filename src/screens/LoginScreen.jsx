import react from "react";
import { View, Text, StyleSheet } from "react-native";
import LoginForm from "../components/FormLogin/FormLogin";
import {useFonts} from "expo-font"

function LoginScreen(){

    const [loaded] = useFonts({
        Philosopher: require('../assets/fonts/Philosopher-Regular.ttf'),
        MavenPro: require('../assets/fonts/MavenPro-VariableFont_wght.ttf'),
    });

    if (!loaded) {
        // Peut-être afficher un indicateur de chargement ici
        return null;
    }

    return(
        <View style={styles.containerScreenLogin}>
            <Text style={styles.titleLogin}>Connexion</Text>
            <LoginForm></LoginForm>
        </View>
    )
}

const styles = StyleSheet.create({
    containerScreenLogin: {
        display:"flex",
        justifyContent: "center",
        flexDirection: "column",
        height: "100%",
    },

    titleLogin:{
        textAlign: "center",
        fontSize: 40,
        marginBottom: 50,
        fontFamily: 'Philosopher'
    }
})

export default LoginScreen