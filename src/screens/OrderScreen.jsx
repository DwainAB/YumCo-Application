import { View, Text, StyleSheet, TouchableOpacity} from "react-native";
import ContentOrder from "../components/ContentOrder/ContentOrder"

function BasketScreen(){

    return(
        <View style={styles.containerScreenBasket}>
            <ContentOrder/>
        </View>
    )
}

const styles = StyleSheet.create({
    containerScreenBasket:{
        height: "100%",
        backgroundColor: "#161622",
    }
})

export default BasketScreen