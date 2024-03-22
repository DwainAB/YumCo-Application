import { View, Text, StyleSheet, TouchableOpacity} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";


function BasketScreen(){

    return(
        <View style={styles.containerScreenBasket}>

            <View style={styles.containerHeaderSetting}>
                <View style={styles.containerEmpty}></View>
                <Text style={styles.textHeaderSetting}>Commandes</Text>
                <TouchableOpacity style={styles.containerBtnLogout}><Ionicons name="reload-outline" size={25} color="white"/></TouchableOpacity>
            </View>

            <View style={styles.line}></View>

            <TouchableOpacity style={styles.containerOrderItem}>

                <View style={styles.containerIconOrderItem}>
                    <Ionicons size={28} color={"#0066FF"} name="bag-handle-outline"/>
                </View>

                <View style={styles.containerTextOrderItem}>
                    <View>
                        <Text style={styles.textOrderItem}>#D1984</Text>
                        <Text style={styles.textOrderItemName}>Abrivard Dwain</Text>
                    </View>

                    <View><Text style={styles.textOrderItem}>54,60 €</Text></View>
                </View>

            </TouchableOpacity>

            <TouchableOpacity style={styles.containerOrderItem}>

                <View style={styles.containerIconOrderItem}>
                    <Ionicons size={28} color={"#0066FF"} name="bag-handle-outline"/>
                </View>

                <View style={styles.containerTextOrderItem}>
                    <View>
                        <Text style={styles.textOrderItem}>#D1984</Text>
                        <Text style={styles.textOrderItemName}>Abrivard Dwain</Text>
                    </View>

                    <View><Text style={styles.textOrderItem}>54,60 €</Text></View>
                </View>

            </TouchableOpacity>

            <TouchableOpacity  style={styles.containerOrderItem}>

                <View style={styles.containerIconOrderItem}>
                    <Ionicons size={28} color={"#0066FF"} name="bag-handle-outline"/>
                </View>

                <View style={styles.containerTextOrderItem}>
                    <View>
                        <Text style={styles.textOrderItem}>#D1984</Text>
                        <Text style={styles.textOrderItemName}>Abrivard Dwain</Text>
                    </View>

                    <View><Text style={styles.textOrderItem}>54,60 €</Text></View>
                </View>

            </TouchableOpacity>
           
        </View>
    )
}

const styles = StyleSheet.create({
    containerHeaderSetting:{
        justifyContent: "space-between", 
        flexDirection:"row",
        marginTop : 60,
        paddingRight: 35,
        paddingLeft : 35,
        alignItems:'center',
    },
    textHeaderSetting:{
        fontSize: 22,
        color: "white",
    },
    containerBtnLogout:{
        height:45,
        width: 45,
        alignItems: "center",
        borderRadius: 50,
        backgroundColor: "#1E1E2D",
        justifyContent: "center",
        paddingLeft: 5
    },
    containerEmpty:{
        width: "10%",
    },
    line:{
        borderWidth:1,
        marginLeft: 30,
        marginRight:30,
        borderColor: "#232533",
        marginTop: 40,
        marginBottom: 40
    },
    containerOrderItem:{
        flexDirection: "row",
        marginRight: 30,
        marginLeft: 30,
        marginBottom:22
    },
    containerTextOrderItem:{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center" ,
        width: "80%"
    },
    containerIconOrderItem:{
        backgroundColor: "white",
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        marginRight: 20
    },
    textOrderItem:{
        fontSize: 18,
        color:"white"
    },
    textOrderItemName:{
        color:"#A2A2A7",
        fontSize: 14
    }

    
})

export default BasketScreen