import react from "react";
import {View, Text, StyleSheet} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"



function About(){
    return(
        <View style={styles.containerAbout}>
            <Text style={styles.titleAbout}>Nos caractéristiques</Text>

            <View style={styles.containerAboutItem}>
                <Ionicons name="fish-outline" color={"#FF9A00"} size={40}/>
                <Text style={styles.titleAboutItem}>Produits frais</Text>
                <Text style={styles.textAboutItem}>Nos poissons sont pêchés le jour même</Text>
            </View>
            <View style={styles.containerAboutItem}>
                <Ionicons name="timer-outline" color={"#FF9A00"} size={40}/>
                <Text style={styles.titleAboutItem}>Service rapide</Text>
                <Text style={styles.textAboutItem}>Nos équipes répondront à vos attentes {"\n"} dans les plus bref délais</Text>
            </View>
            <View style={styles.containerAboutItem}>
                <Ionicons name="timer-outline" color={"#FF9A00"} size={40}/>
                <Text style={styles.titleAboutItem}>Buffet à volonté</Text>
                <Text style={styles.textAboutItem}>Une multitude de choix rien que {"\n"} pour vous</Text>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    containerAbout:{
        display: "flex",
        flexDirection:"column", 
        alignItems:"center", 
        justifyContent:"center", 
        marginTop: 40
    },
    titleAbout :{
        fontSize:30,
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
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 20,
    }
})

export default About