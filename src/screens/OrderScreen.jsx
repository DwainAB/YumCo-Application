import { View, StyleSheet} from "react-native";
import ContentOrder from "../components/ContentOrder/ContentOrder"
import { useColors } from "../components/ColorContext/ColorContext";

function BasketScreen(){
    const { colors } = useColors()

    return(
        <View style={[styles.containerScreenBasket, {backgroundColor: colors.colorBackground}]}>
            <ContentOrder/>
        </View>
    )
}

const styles = StyleSheet.create({
    containerScreenBasket:{
        height: "100%",
    }
})

export default BasketScreen