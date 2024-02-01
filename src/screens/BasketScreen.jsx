import {react, useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity} from "react-native";
import ContentBasket from "../components/ContentBasket/ContentBasket";
import FormOrder from "../components/FormOrder/FormOrder";


function BasketScreen(){
    const [showForm, setShowForm] = useState(false)

    function activeForm (){
        setShowForm(!showForm);
    }

    return(
        <View style={styles.containerScreenBasket}>

            <View style={styles.containerTitleBasket}>
                <Text style={styles.titleBasket}>Panier</Text>
            </View>

            {showForm ? (
                <ContentBasket/>
            ):(
                <FormOrder/>
            )}

            <View style={styles.containerButtonBasket}>
                {showForm ? (
                    <TouchableOpacity style={styles.buttonBasket} onPress={activeForm}>
                        <Text style={styles.textButtonBasket}>Suivant</Text>
                    </TouchableOpacity>
                ):(
                    <TouchableOpacity style={styles.buttonBasket} onPress={activeForm}>
                        <Text style={styles.textButtonBasket}>Retour</Text>
                    </TouchableOpacity>
                )}

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerTitleBasket: {
        marginTop: 50,
        borderBottomWidth: 1,
        borderColor: "#FF9A00",
        width: "100%",
        paddingBottom: 20
    },
    titleBasket:{
        textAlign: "center",
        fontSize: 40,
    },
    containerButtonBasket :{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        marginTop:40,
        borderTopWidth: 1,
        paddingTop:20,
        borderColor: "#ff9a00"
    },
    buttonBasket :{
        backgroundColor:"#FF9A00",
        height: 50,
        width: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius:20
    },
    textButtonBasket: {
        color: "#fff"
    },

    
})

export default BasketScreen