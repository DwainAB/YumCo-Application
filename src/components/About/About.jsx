import react from "react";
import {View, Text, StyleSheet} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import {useFonts} from "expo-font"

function About(){

    return(
        <View style={styles.containerAbout}>
            <Text style={styles.titleAbout}>Nos caractéristiques</Text>

        </View>
    )
}

const styles = StyleSheet.create({
    containerAbout:{
        display: "flex",
        flexDirection:"column", 
        alignItems:"center", 
        justifyContent:"center", 
        marginTop: 70
    },
    titleAbout :{
        fontSize:35,
    },
    containerAboutItem:{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#dcdcdc",
        borderRadius: 20,
        padding: 30,
        marginTop: 30,
        shadowColor: "#000",
        shadowOffset: {width:9, height:8},
        shadowOpacity: 0.25,
        shadowRadius: 18,
        width: "85%",
        height: 170
    },
    textAboutItem:{
        fontSize: 16,
        textAlign: "center",
    }, 
    titleAboutItem:{
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 20,
    }
})

export default About