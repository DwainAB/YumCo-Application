import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";

function PolityPrivacy(){
    const { t } = useTranslation();
    const { colors } = useColors()
    const styles = useStyles()

    return(
        <View style={[styles.containerPrivacyPolicy, { backgroundColor: colors.colorBackground }]}>
            
            <HeaderSetting name={t('privacyPolicy')} navigateTo="SettingPage"/>
          
            <View> 
                <ScrollView>
                    <View style={styles.containerTextPolicy}>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorText, fontWeight: "bold"} ]}>{t('textPrivacyPolicy1')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorDetail} ]}>{t('textPrivacyPolicy2')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorDetail} ]}>{t('textPrivacyPolicy3')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorText, fontWeight: "bold"} ]}>{t('textPrivacyPolicy4')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorDetail} ]}>{t('textPrivacyPolicy5')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorText, fontWeight: "bold"} ]}>{t('textPrivacyPolicy6')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorDetail} ]}>{t('textPrivacyPolicy7')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorText , fontWeight: "bold"} ]}>{t('textPrivacyPolicy8')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorDetail} ]}>{t('textPrivacyPolicy9')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorText, fontWeight: "bold"} ]}>{t('textPrivacyPolicy10')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorDetail} ]}>{t('textPrivacyPolicy11')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorText, fontWeight: "bold"} ]}>{t('textPrivacyPolicy12')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorDetail} ]}>{t('textPrivacyPolicy13')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorDetail} ]}>{t('textPrivacyPolicy14')}</Text>
                        <Text style={[styles.textPrivacyPolicy, {color: colors.colorDetail} ]}>{t('textPrivacyPolicy15')}</Text>
                    </View>
                </ScrollView>
            </View>

        </View>
    )
}


function useStyles(){
    const {width, height} = useWindowDimensions();

    return StyleSheet.create({

        containerPrivacyPolicy:{
            height: "100%",
        },
        textPrivacyPolicy:{
            fontSize: (width > 375) ? 16 : 14, 
            marginBottom: 20
        },
        containerTextPolicy:{
            marginBottom: 300,
            height: 'auto',
            marginRight: 30,
            marginLeft: 30,
            
        }
     
    })
    
}

export default PolityPrivacy
