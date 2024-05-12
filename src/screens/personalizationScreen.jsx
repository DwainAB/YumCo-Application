import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useColors } from "../components/ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import AsyncStorage from "@react-native-async-storage/async-storage";



function Personalization(){
    const navigation = useNavigation(); 
    const { setColors } = useColors();
    const { colors } = useColors()
    const [theme, setTheme] = useState("light"); 
    const { t } = useTranslation();
    const [themeSelected, setThemeSelected] = useState('default')

    useEffect(() => {

        // Récupérer le thème sélectionné en mémoire
        AsyncStorage.getItem('selectedTheme').then(theme => {
            if (theme) {
                setThemeSelected(theme);
            }
        });
    }, []);

    const storeSelectedTheme = async (themeSelected) => {
        try {
            await AsyncStorage.setItem('selectedTheme', themeSelected);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const handleColorChangeDefault = () => {
        setColors({
            colorBackground: "#161622",
            colorBorderAndBlock: "#1E1E2D",
            colorRed: "#FF4267",
            colorDetail: "#8B8B94",
            colorAction: "#0066FF",
            colorText: "#ffffff",
        })
        storeSelectedTheme("default");
      };

    const handleColorChangeMars = () => {
        setColors({
            colorBackground: "#11151D",
            colorBorderAndBlock: "#222D41",
            colorDetail: "#7F5056",
            colorAction: "#D76C58",
            colorText: "#ffffff",
            colorRed: "#7f5056",
        })
        storeSelectedTheme("mars");
      };

    const handleColorChangeBlueLight = () => {
        setColors({
            colorBackground: "#0B162C",
            colorBorderAndBlock: "#1C2942",
            colorDetail: "#5FC2BA",
            colorAction: "#5FC2BA",
            colorText: "#FFFFFF",
            colorRed: "#FF4267",
        });
        storeSelectedTheme("blueLight");
      };

    const handleColorChangePurple = () => {
        setColors({
            colorBackground: "#11151D",
            colorBorderAndBlock: "#474252",
            colorDetail: "#ABA0F9",
            colorAction: "#8A68D2",
            colorText: "#ffffff",
            colorRed: "#FF4267",
        });
        storeSelectedTheme("purple");
      };

    const handleColorChangeLavande = () => {
        setColors({
            colorBackground: "#D6CFFF",
            colorBorderAndBlock: "#FEFEFF",
            colorDetail: "#7C80FC",
            colorAction: "#7C80FC",
            colorText: "#000",
            colorRed: "#FF4267",
        });
        storeSelectedTheme("lavande");
      };

    const handleColorChangePastel = () => {
        setColors({
            colorBackground: "#EDF2F4",
            colorBorderAndBlock: "#cecece",
            colorDetail: "#EE2449",
            colorAction: "#FF9999",
            colorText: "#2B2E42",
            colorRed: "#EE2449",
        });
        storeSelectedTheme("pastel");
      };

    const handleColorChangeCrepuscul = () => {
        setColors({
            colorBackground: "#EAEAEA",
            colorBorderAndBlock: "#ffffff",
            colorDetail: "#FCA616",
            colorAction: "#083456",
            colorText: "#FCA616",
            colorRed: "#EE2449",
        });
        storeSelectedTheme("crepuscul");
      };

    const handleColorChangeTest = () => {
        setColors({
            colorBackground: "#9ED3C9",
            colorBorderAndBlock: "#226D68",
            colorDetail: "#FCCC33",
            colorAction: "#FEEAA1",
            colorText: "#D6955B",
            colorRed: "#EE2449",
        });
        storeSelectedTheme("test");
      };

    return(
        <View style={[styles.containerPersonalization,{backgroundColor: colors.colorBackground}]}>

            <HeaderSetting name={t('personalization')} navigateTo="SettingPage"/>

            <Text style={[styles.titleInterface,{color: colors.colorText}]}>{t('interface')}</Text>

            <View style={[styles.containerBtnStyle, {borderColor: colors.colorText}]}>
            <View style={[theme === "light" ? styles.borderBlueLeft : styles.borderBlueRight, {borderColor: colors.colorAction}]}></View>
                <TouchableOpacity style={styles.containerTextClear} onPress={() => setTheme("light")}>
                    <Ionicons style={{fontSize:20, color: theme === "light" ? colors.colorAction : colors.colorText}} name="sunny-outline"/>
                    <Text style={[styles.TextClear, {color: theme === "light" ? colors.colorAction : colors.colorText}]}>{t('clear')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.containerTextDark} onPress={() => setTheme("dark")}>
                    <Ionicons style={{fontSize:20, color: theme === "dark" ? colors.colorAction : colors.colorText}} name="moon-outline"/>
                    <Text style={[styles.textDark, { color: theme === "dark" ? colors.colorAction : colors.colorText }]}>{t('dark')}</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.titleTheme, {color: colors.colorText}]}>{t('themes')}</Text>

            <View style={styles.containerGroupColor}>
            {theme === "light" && (
                    <>
                        <View style={styles.groupColor}>
                            <TouchableOpacity onPress={() => handleColorChangeLavande()}>
                                <Image
                                    source={require('../assets/groupLightpurple.png')} 
                                    style={[styles.image, {borderColor: colors.colorText, borderWidth: 2}]}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.textGroup, {color: colors.colorText}]}>{t('default')}</Text>
                        </View>

                        <View style={styles.groupColor}>
                            <TouchableOpacity onPress={() => handleColorChangePastel()}>
                                <Image
                                    source={require('../assets/groupSalmon.png')} 
                                    style={[styles.image, {borderColor: colors.colorText, borderWidth: 2}]}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.textGroup, {color: colors.colorText}]}>{t('mars')}</Text>
                        </View>

                        <View style={styles.groupColor}>
                            <TouchableOpacity onPress={() => handleColorChangeCrepuscul()}>
                                <Image
                                    source={require('../assets/groupEclipse.png')} 
                                    style={[styles.image, {borderColor: colors.colorText, borderWidth: 2}]}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.textGroup, {color: colors.colorText}]}>{t('turquoiseBlue')}</Text>
                        </View>

                        <View style={styles.groupColor}>
                            <TouchableOpacity onPress={() => handleColorChangeTest()}>
                                <Image
                                    source={require('../assets/ColorPurple.png')} 
                                    style={[styles.image, {borderColor: colors.colorText, borderWidth: 2}]}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.textGroup, {color: colors.colorText}]}>{t('purple')}</Text>
                        </View>
                    </>
                )}
                {theme === "dark" && (
                    <>
                        <View style={styles.groupColor}>
                            <TouchableOpacity onPress={() => handleColorChangeDefault()}>
                                <Image
                                    source={require('../assets/ColorBlue.png')} 
                                    style={[styles.image, {borderColor: colors.colorText, borderWidth: 2}]}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.textGroup, {color: colors.colorText}]}>{t('default')}</Text>
                        </View>

                        <View style={styles.groupColor}>
                            <TouchableOpacity onPress={() => handleColorChangeMars()}>
                                <Image
                                    source={require('../assets/groupMars.png')} 
                                    style={[styles.image, {borderColor: colors.colorText, borderWidth: 2}]}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.textGroup, {color: colors.colorText}]}>{t('mars')}</Text>
                        </View>

                        <View style={styles.groupColor}>
                            <TouchableOpacity onPress={() => handleColorChangeBlueLight()}>
                                <Image
                                    source={require('../assets/ColorBlueLight.png')} 
                                    style={[styles.image, {borderColor: colors.colorText, borderWidth: 2}]}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.textGroup, {color: colors.colorText}]}>{t('turquoiseBlue')}</Text>
                        </View>

                        <View style={styles.groupColor}>
                            <TouchableOpacity onPress={() => handleColorChangePurple()}>
                                <Image
                                    source={require('../assets/ColorPurple.png')} 
                                    style={[styles.image, {borderColor: colors.colorText, borderWidth: 2}]}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.textGroup, {color: colors.colorText}]}>{t('purple')}</Text>
                        </View>
                    </>
                )}

            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    containerPersonalization:{
        height: "100%",
    },
    containerHeader:{
        justifyContent: "space-between", 
        flexDirection:"row",
        marginTop : 60,
        paddingRight: 35,
        paddingLeft : 35,
        alignItems:'center',
    },
    textHeader:{
        fontSize: 22,
        color: "white",
    },
    containerBtnBack:{
        height:45,
        width: 45,
        alignItems: "center",
        borderRadius: 50,
        backgroundColor: "#1E1E2D",
        justifyContent: "center",
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
        marginBottom: 30
    },
    containerBtnStyle:{
        borderWidth: 1,
        marginLeft: 30,
        marginRight:30,
        flexDirection : "row",
        borderRadius: 50,
        height: 35
    },
    titleInterface:{
        color:"white",
        textAlign: "center",
        fontSize: 18,
        marginBottom: 30
    },
    containerTextClear:{
        width: "50%",
        alignItems: "center", 
        flexDirection: "row",
        paddingLeft: 30,
        paddingTop:5,
        paddingBottom:5,
    },
    TextClear:{
        color: "white",
        fontSize: 16,
        marginLeft: 15,
        color: "#0066FF"
    },
    containerTextDark:{
        width: "50%",
        alignItems: "center",
        flexDirection: "row",
        paddingLeft: 30,
        paddingBottom: 5,
        paddingTop:5,
    },
    textDark:{
        color: "white",
        fontSize: 16,
        marginLeft: 15
    },
    borderBlueLeft:{
        position: "absolute",
        height: 36,
        borderWidth: 2,
        width: "50%",
        left: -2,
        top: -2,
        borderRadius: 50
    },
    borderBlueRight:{
        position: "absolute",
        height: 36,
        borderWidth: 2,
        width: "50%",
        right: -2,
        top: -2,
        borderRadius: 50
    },
    titleTheme:{
        textAlign: "center",
        fontSize: 18,
        marginBottom: 30,
        marginTop: 30  
    },
    containerGroupColor:{
        marginLeft: 30,
        marginRight: 30,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 20
    },
    groupColor:{
        flexDirection: "column",
        gap: 10 
    },
    textGroup:{
        textAlign: "center",
        fontSize: 15
    }
})

export default Personalization