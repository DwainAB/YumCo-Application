import react from "react";
import {View, Text, Image, StyleSheet, TouchableOpacity} from "react-native"
import logo from "../../assets/logo.png"
import * as Svg from 'react-native-svg';
import WaveSVG from "../../assets/wave.jsx"
import {useFonts} from "expo-font"

function Header(){

    const [loaded] = useFonts({
        Philosopher: require('../../assets/fonts/Philosopher-Regular.ttf'),
        MavenPro: require('../../assets/fonts/MavenPro-VariableFont_wght.ttf'),
    });

    if (!loaded) {
        // Peut-être afficher un indicateur de chargement ici
        return null;
    }
    return(
        <View style={styles.containerHeader}>

            <View style={styles.containerSvg}>
                <View style={styles.backgroundWave}></View>
                <WaveSVG/>
            </View>

            <Image
                source={logo}
                style={styles.image}
            />

            <Text style={styles.titleHeader}>Wok Grill{'\n'}<Text style={styles.textColor}>Rosny-sous-bois</Text></Text>
            <TouchableOpacity style={styles.containerButtonHeader}><Text style={styles.buttonHeader}>Contact</Text></TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    containerHeader:{
        display:"flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30
    },
    image:{
        width: 250,
        height: 250
    },
    textColor:{
        color: "#ff9a00"
    },
    titleHeader:{
        textAlign: "center",
        fontSize: 45,
        fontFamily: "Philosopher"
    },
    containerButtonHeader:{
        backgroundColor: "#ff9a00",
        height: 40,
        width: "35%",
        display: "flex",
        justifyContent: "center", 
        alignItems: "center",
        marginTop: 20,
        borderRadius:10
    },
    buttonHeader:{
        color: '#fff',
        fontSize: 18,
        fontFamily: "MavenPro"
    },
    containerSvg:{
        position: 'absolute',
        top: -30,
        left: 0,
        width: '100%',
        height: 95,
        zIndex: -1,
    },
    backgroundWave:{
        backgroundColor: "#ff9a00",
        height: 100,
        marginBottom: -10
    }
})

export default Header