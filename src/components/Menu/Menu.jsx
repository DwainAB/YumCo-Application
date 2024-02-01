import {react, useState} from "react";
import {View, Text, StyleSheet, Image, TouchableOpacity, ScrollView} from "react-native"
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from "react-native-vector-icons/Ionicons"
import imagePlat from "../../assets/nemspoulet.jpg"

function Menu(){
    const [filter, setFilter] = useState('Tous')

    return(
        <View style={styles.containerMenu}>
            <Text style={styles.titleMenu}>Notre carte</Text>

            <View style={styles.containerFilter}>
                <RNPickerSelect
                    onValueChange={(value) => setFilter(value)}
                    items={[
                    { label: 'Tous', value: 'Tous' },
                    { label: 'Sushi', value: 'Sushi' },
                    { label: 'Entrées', value: 'Enrées' },
                    { label: 'Plats chauds', value: 'Plats chauds' },
                    { label: 'Yakitori', value: 'Yakitori' },
                    ]}
                    value={filter}
                    style={{ inputIOS: styles.picker, inputAndroid: styles.picker }} // Appliquez le style ici
                    useNativeAndroidPickerStyle={false}
                    Icon={() => {
                        return <Ionicons name="chevron-down" size={20} color="#FF9A00" margin={11}/>;
                    }}
                />
            </View>

            <ScrollView horizontal={true} style={styles.containerCards}>

                <View style={styles.card}>
                    <Image source={imagePlat} style={styles.imageCard}/>
                    <Text style={styles.textCard}>Nouilles sautées au légumes</Text>
                    <View style={styles.containerBottomCard}>
                        <Text style={styles.priceCard}>6.50€</Text>
                        <View style={styles.containerButtonCard}>
                            <TouchableOpacity style={styles.buttonCard}><Text style={styles.textButtonCard}>+</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.card}>
                    <Image source={imagePlat} style={styles.imageCard}/>
                    <Text style={styles.textCard}>Nouilles sautées au légumes</Text>
                    <View style={styles.containerBottomCard}>
                        <Text style={styles.priceCard}>6.50€</Text>
                        <View style={styles.containerButtonCard}>
                            <TouchableOpacity style={styles.buttonCard}><Text style={styles.textButtonCard}>+</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.card}>
                    <Image source={imagePlat} style={styles.imageCard}/>
                    <Text style={styles.textCard}>Nouilles sautées </Text>
                    <View style={styles.containerBottomCard}>
                        <Text style={styles.priceCard}>6.50€</Text>
                        <View style={styles.containerButtonCard}>
                            <TouchableOpacity style={styles.buttonCard}><Text style={styles.textButtonCard}>+</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
 containerMenu:{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
 },
 titleMenu :{
    fontSize: 30,
    textAlign:"center",
    marginTop: 50
 },
 containerFilter:{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "red",
    marginTop: 20,
    width: "30%",
 },
 picker:{
    width: "100%",
    height:40,
    color: "#FF9A00",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FF9A00",
    paddingLeft:10
 }, 
 containerCards:{
    width: "100%",
    display: "flex",
    flexDirection: "row",
    marginTop: 30,
    gap: 30,
 },
 card:{
    width: "30%",
    backgroundColor : "#dcdcdc",
    borderRadius:20,
    marginLeft:20
 },
 imageCard:{
    width: "100%",
    height: 150,
    objectFit: "cover",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20
 }, 
 textCard:{
    textAlign: "center",
    fontSize: 18,
    marginBottom:20,
    marginTop: 20,
    height: 50
 },
 containerBottomCard:{
    display:"flex", 
    flexDirection: "row",  
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop:20,
    paddingBottom : 20
 }, 
 textButtonCard:{
    fontSize: 18,
    color:  "#fff"
 }, 
 priceCard:{
    fontSize:18
 },
 containerButtonCard:{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor : "#FF9A00",
    width:30,
    height: 30,
    borderRadius: 6
 }
})

export default Menu