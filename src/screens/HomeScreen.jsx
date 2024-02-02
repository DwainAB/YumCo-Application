import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Header from "../components/Header/Header"
import Menu from "../components/Menu/Menu";
import About from "../components/About/About";

function HomeScreen(){
    return(
        <ScrollView>
            <Header/>
            <Menu/>
            <About/>
        </ScrollView>
    )
}



export default HomeScreen