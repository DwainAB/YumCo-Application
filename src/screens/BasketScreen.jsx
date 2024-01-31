import react from "react";
import { View, Text, StyleSheet} from "react-native";


function BasketScreen(){
    return(
        <View style={styles.containerScreenBasket}>
            <Text style={styles.titleBasket}>Panier</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    containerScreenBasket: {

    },
    titleBasket:{
        textAlign: "center",
        fontSize: 40,
        marginTop: 50,
        borderBottomWidth: 1,
        borderColor: "#FF9A00"
    }
})

export default BasketScreen