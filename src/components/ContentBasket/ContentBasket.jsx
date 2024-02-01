import {react, useState} from "react";
import {Text, View, StyleSheet, TouchableOpacity, ScrollView} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"


function ContentBasket(){
    const [basketFull, setBasketFull] = useState(true)
    return(
        <View style={styles.containerContentBasket}>
            {basketFull ? (
                <>
                <ScrollView style={styles.containerContentFull}>

                    <View style={styles.containerProductBasket}>
                        <Text style={styles.titleProductBasket}>x2 Sushi saumon</Text>
                        <View style={styles.containerButtonStepper}>
                            <TouchableOpacity style={styles.buttonStepper}><Text style={styles.textStepper}>+</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.buttonStepper}><Text style={styles.textStepper}>-</Text></TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.containerProductBasket}>
                        <Text style={styles.titleProductBasket}>x1 Nems poulet</Text>
                        <View style={styles.containerButtonStepper}>
                            <TouchableOpacity style={styles.buttonStepper}><Text style={styles.textStepper}>+</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.buttonStepper}><Text style={styles.textStepper}>-</Text></TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.containerProductBasket}>
                        <Text style={styles.titleProductBasket}>x4 Soupe miso</Text>
                        <View style={styles.containerButtonStepper}>
                            <TouchableOpacity style={styles.buttonStepper}><Text style={styles.textStepper}>+</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.buttonStepper}><Text style={styles.textStepper}>-</Text></TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
                <Text style={styles.textTotal}>Total : 18.50 €</Text>
                </>
            ):(
                <View style={styles.containerContentEmpty}>
                    <Ionicons name="basket-outline" size={100} color={"lightgrey"}/>
                    <Text>Votre panier est actuellement vide ! </Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    containerContentBasket: {
        height:"70%",
        width:"100%",
    },
    containerContentEmpty:{
        display:"flex",
        flexDirection:"column", 
        alignItems:"center",
        justifyContent:"center",
        height:"100%",
    },
    containerProductBasket:{
        display:"flex",
        flexDirection:"row",  
        paddingLeft: 20,
        paddingRight:20,
        paddingTop:20,
        justifyContent: "space-between",
        alignItems: "center"
    },
    titleProductBasket :{
        fontSize: 20
    },
    containerButtonStepper:{
        display: "flex",
        flexDirection: "row",
        gap:20
    },
    buttonStepper:{
        display:"flex",
        justifyContent:"center",
        alignItems: "center",
        backgroundColor: "#FF9A00",
        height: 30,
        width: 30,
        borderRadius: 8
    }, 
    textStepper:{
        color:"#fff",
        fontSize:20
    },
    textTotal:{
        fontSize:20,
        textAlign: "right",
        paddingRight:20,
        paddingTop:10
    }
})

export default ContentBasket