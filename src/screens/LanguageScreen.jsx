import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image  } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useTranslation } from "react-i18next";
import { useColors } from "../components/ColorContext/ColorContext";
import {useLanguage} from "../components/LanguageContext/LanguageContext"

function LanguagePage(){
    const { i18n } = useTranslation();
    const { t } = useTranslation();
    const {colors} = useColors()
    const { language, setLanguage } = useLanguage();

    const changeLanguage = (lng, languageSelect) => {
        setLanguage(languageSelect);
        i18n.changeLanguage(lng);
        console.log(languageSelect);
      };

    return(
        <View style={[styles.containerLanguagePage, {backgroundColor: colors.colorBackground}]}>
            
            <HeaderSetting name={t('language')} navigateTo="SettingPage"/>
            <ScrollView>
                <View style={styles.listLanguage}>
                    <TouchableOpacity  onPress={() => changeLanguage('en', 'English')} style={styles.containerCountry}>
                        <View style={styles.containerImageCountry}>
                            <Image
                                source={require('../assets/england-flag-round-icon.png')} 
                                style={styles.image}
                            />
                        </View>
                        <Text style={[styles.titleCountry, {color: colors.colorText}]}>English</Text>
                        {language === 'English' ? (<View style={[styles.containerCheck, {backgroundColor: colors.colorAction}]}><Ionicons name='checkmark-outline' style={{color: colors.colorText, fontSize: 20}}/></View>) : null}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => changeLanguage('pt', 'Português')} style={styles.containerCountry}>
                        <View style={styles.containerImageCountry}>
                            <Image
                                source={require('../assets/portugal-flag-round-icon.png')} 
                                style={styles.image}
                            />
                        </View>
                        <Text style={[styles.titleCountry, {color: colors.colorText}]}>Português</Text>
                        {language === 'Português' ? (<View style={[styles.containerCheck, {backgroundColor: colors.colorAction}]}><Ionicons name='checkmark-outline' style={{color: colors.colorText, fontSize: 20}}/></View>) : null}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => changeLanguage('fr', 'Français')} style={styles.containerCountry}>
                        <View style={styles.containerImageCountry}>
                            <Image
                                source={require('../assets/france-flag-round-icon.png')} 
                                style={styles.image}
                            />
                        </View>
                        <Text style={[styles.titleCountry, {color: colors.colorText}]}>Français</Text>
                        {language === 'Français' ? (<View style={[styles.containerCheck, {backgroundColor: colors.colorAction}]}><Ionicons name='checkmark-outline' style={{color: colors.colorText, fontSize: 20}}/></View>) : null}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => changeLanguage('es', "Español")} style={styles.containerCountry}>
                        <View style={styles.containerImageCountry}>
                            <Image
                                source={require('../assets/spain-flag-round-icon.png')} 
                                style={styles.image}
                            />
                        </View>
                        <Text style={[styles.titleCountry, {color: colors.colorText}]}>Español</Text>
                        {language === 'Español' ? (<View style={[styles.containerCheck, {backgroundColor: colors.colorAction}]}><Ionicons name='checkmark-outline' style={{color: colors.colorText, fontSize: 20}}/></View>) : null}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => changeLanguage('it', 'Italiano')} style={styles.containerCountry}>
                        <View style={styles.containerImageCountry}>
                            <Image
                                source={require('../assets/italy-flag-round-icon.png')} 
                                style={styles.image}
                            />
                        </View>
                        <Text style={[styles.titleCountry, {color: colors.colorText}]}>Italiano</Text>
                        {language === 'Italiano' ? (<View style={[styles.containerCheck, {backgroundColor: colors.colorAction}]}><Ionicons name='checkmark-outline' style={{color: colors.colorText, fontSize: 20}}/></View>) : null}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => changeLanguage('jp', 'おはよう')} style={styles.containerCountry}>
                        <View style={styles.containerImageCountry}>
                            <Image
                                source={require('../assets/japan-flag-round-medium.png')} 
                                style={styles.image}
                            />
                        </View>
                        <Text style={[styles.titleCountry, {color: colors.colorText}]}>おはよう</Text>
                        {language === 'おはよう' ? (<View style={[styles.containerCheck, {backgroundColor: colors.colorAction}]}><Ionicons name='checkmark-outline' style={{color: colors.colorText, fontSize: 20}}/></View>) : null}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => changeLanguage('ch', '中文')} style={styles.containerCountry}>
                        <View style={styles.containerImageCountry}>
                            <Image
                                source={require('../assets/china-flag-round-medium.png')} 
                                style={styles.image}
                            />
                        </View>
                        <Text style={[styles.titleCountry, {color: colors.colorText}]}>中文</Text>
                        {language === '中文' ? (<View style={[styles.containerCheck, {backgroundColor: colors.colorAction}]}><Ionicons name='checkmark-outline' style={{color: colors.colorText, fontSize: 20}}/></View>) : null}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    containerLanguagePage:{
        height: "100%"
    },
    containerHeaderLanguage:{
        justifyContent: "space-between", 
        flexDirection:"row",
        marginTop : 60,
        paddingRight: 35,
        paddingLeft : 35,
        alignItems:'center',
    },
    textHeaderLanguage:{
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
        marginBottom: 40
    },
    containerImageCountry:{
        marginRight: 20
    },
    containerCountry:{
        marginLeft: 30,
        marginRight:30, 
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor : "#F4F4F4",
        paddingBottom: 15,
        marginBottom: 22,
        position: "relative"
    }, 
    titleCountry:{
        fontSize: 18, 
        color: "white",
        fontWeight : "600"
    },
    image:{
        width: 60,
        height: 60
    },
    containerCheck:{
        position: "absolute",
        right: 15,
        top: 15,
        borderRadius: 15,
        padding: 5
    },
    listLanguage:{
        height: "auto",
        marginBottom: 100
    }
})

export default LanguagePage
