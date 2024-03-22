import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import LoginScreen from "./LoginScreen";
import Dashboard from "../components/Dashboard/Dashboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventEmitter } from "../components/EventEmitter/EventEmitter";

function SettingPage() {

  return (
    <View style={styles.containerSetting}>
      <Dashboard /> 
    </View>
  );
}

const styles = StyleSheet.create({
  containerSetting:{
    backgroundColor: "#161622",
    height:  "100%",
  } 
});

export default SettingPage;
