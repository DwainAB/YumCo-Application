import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Header from "../components/Header/Header"
import Menu from "../components/Menu/Menu";
import About from "../components/About/About";
import Hourly from "../components/Hourly/Hourly";
import Review from "../components/Review/Review";

function HomeScreen(){
    return(
        <ScrollView>
            <Header/>
            <Menu/>
            <About/>
            <Hourly/>
            <Review/>
        </ScrollView>
    )
}



export default HomeScreen