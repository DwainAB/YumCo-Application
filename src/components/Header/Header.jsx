import react from "react";
import {View, Text, Image, StyleSheet, TouchableOpacity} from "react-native"


function Header(){

    return(
        <View style={styles.containerHeader}>

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
        borderWidth: 0
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