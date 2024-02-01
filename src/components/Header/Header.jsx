import react from "react";
import {View, Text, Image, StyleSheet, TouchableOpacity} from "react-native"
import logo from "../../assets/logo.png"

function Header(){
    return(
        <View style={styles.containerHeader}>
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
        fontSize: 40
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
        fontSize: 18
    }
})

export default Header