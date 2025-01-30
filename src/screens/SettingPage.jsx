import React from "react";
import { View, StyleSheet } from "react-native";
import Dashboard from "../components/Dashboard/Dashboard";
import { useColors } from "../components/ColorContext/ColorContext";

function SettingPage() {
  const { colors } = useColors()

  return (
    <View style={[styles.containerSetting, {backgroundColor: colors.colorBackground}]}>
      <Dashboard /> 
    </View>
  );
}

const styles = StyleSheet.create({
  containerSetting:{
    height:  "100%",
  } 
});

export default SettingPage;
