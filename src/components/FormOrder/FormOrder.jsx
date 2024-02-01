import {react, useState} from "react";
import {Text, View, StyleSheet, TextInput, TouchableOpacity} from "react-native"
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from "react-native-vector-icons/Ionicons"


function FormOrder(){
    const [firstname, setFirstName] = useState('')
    const [lastname, setLastname] = useState('')
    const [email, setEmail] = useState('')
    const [tel, setTel] = useState('')
    const [address, setAddress] = useState('')
    const [method, setMethod] = useState('Livraison')

    const handleSubmit = () => {
        // Traitement des données du formulaire
        // Par exemple, afficher les données dans une alerte ou les envoyer à un serveur
        console.log({ firstName, lastName, email, tel, address, method });
      };

    return(
        <View style={styles.containerInputForm}>
            <TextInput
            style={styles.inputOrder}
            onChangeText={setFirstName}
            value={firstname}
            placeholder="Prénom"
            />
            <TextInput
            style={styles.inputOrder}
            onChangeText={setLastname}
            value={lastname}
            placeholder="Nom"
            />
            <TextInput
            style={styles.inputOrder}
            onChangeText={setEmail}
            value={email}
            placeholder="Mail"
            />
            <TextInput
            style={styles.inputOrder}
            onChangeText={setTel}
            value={tel}
            placeholder="Téléphone"
            />
            <TextInput
            style={styles.inputOrder}
            onChangeText={setAddress}
            value={address}
            placeholder="Adresse"
            />
            <View style={styles.containerSelect}>
                <RNPickerSelect
                    onValueChange={(value) => setMethod(value)}
                    items={[
                    { label: 'Livraison', value: 'Livraison' },
                    { label: 'Emporter', value: 'Emporter' },
                    ]}
                    style={{ inputIOS: styles.picker, inputAndroid: styles.picker }} // Appliquez le style ici
                    value={method}
                    useNativeAndroidPickerStyle={false}
                    Icon={() => {
                        return <Ionicons name="chevron-down" size={24} color="gray" margin={13}/>;
                    }}
                />
            </View>

            <View style={styles.containerButtonOrderForm}>
                <TouchableOpacity style={styles.buttonOrderForm}><Text style={styles.textButtonFormOrder}>Envoyer</Text></TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerInputForm:{
        width: "100%",
        height: "70%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
    },
    inputOrder :{
        borderWidth: 1,
        borderColor: "#FF9A00",
        height: 50,
        width: "80%",
        borderRadius: 10,
        paddingLeft: 20
    }, 
    containerSelect:{
        width: "80%"
    },
    picker:{
        paddingLeft: 20,
        width:"100%",
        borderWidth:1,
        height:50,
        borderColor: "#ff9a00",
        borderRadius: 10
    },
    containerButtonOrderForm:{
        height: 50,
        width:"100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    buttonOrderForm:{
        borderRadius: 10,
        backgroundColor: "#ff9a00",
        width: "50%",
        height: 50,
        display: "flex",
        justifyContent:"center",
        alignItems: "center"
    },
    textButtonFormOrder:{
        color: "#fff"
    }
})
export default  FormOrder;