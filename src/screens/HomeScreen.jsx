import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Header from "../components/Header/Header"
import Menu from "../components/Menu/Menu";

function HomeScreen(){
    return(
        <ScrollView>
            <Header/>
            <Menu/>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    // Vos styles ici
  });

export default HomeScreen