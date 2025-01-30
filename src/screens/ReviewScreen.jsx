import { View, StyleSheet} from "react-native";
import Review from "../components/Review/Review"
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";

function ReviewScreen(){

    return(
        <View style={styles.containerScreenBasket}>
            <HeaderSetting name="Avis" navigateTo="HomeScreen"/>
            <Review/>
        </View>
    )
}

const styles = StyleSheet.create({
    containerScreenBasket:{
        height: "100%",
        backgroundColor: "#161622",
    }
})

export default ReviewScreen