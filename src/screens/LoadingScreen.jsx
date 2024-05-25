import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Image, Modal } from 'react-native';

const LoadingScreen = ({ visible, message }) => {
    return (
        <Modal
            transparent={true}
            animationType="none"
            visible={visible}
            onRequestClose={() => {}}
        >
            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <Image 
                        source={require('../assets/logo.png')} // Assurez-vous que le chemin est correct
                        style={styles.logo}
                    />
                    {message && <Text style={styles.message}>{message}</Text>}
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
        width: '100%', // Prend toute la largeur de l'écran
        height: '100%', // Prend toute la hauteur de l'écran
    },
    innerContainer: {
        backgroundColor: "#161622",
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: "100%",
        height: "100%",
        justifyContent:'center',
        alignItems:"center"
    },
    logo: {
        width: 300,
        height: 300,
        marginLeft: 30, 
        marginRight: 30,
        marginBottom: 20,
    },
    text: {
        fontSize: 34,
        color: '#fff',
        marginBottom: 20,
    },
    message: {
        fontSize: 16,
        color: '#000',
        marginBottom: 20,
    }
});

export default LoadingScreen;
