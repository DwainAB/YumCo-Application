import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import HeaderSetting from "../components/HeaderSetting/HeaderSetting";
import { useWindowDimensions } from "react-native";
import { useTranslation } from 'react-i18next';
import { useColors } from "../components/ColorContext/ColorContext";

function StatOptionScreen() {
    const navigation = useNavigation();
    const styles = useStyles();
    const { t } = useTranslation();
    const { colors } = useColors();

    const statOptions = [
        {
            id: 'orders',
            title: t('orders'),
            icon: 'shopping',
            route: 'OrdersAnalysisScreen',
            iconColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)'
        },
        {
            id: 'revenue',
            title: t('revenue'),
            icon: 'chart-line',
            route: 'StatTurnover',
            iconColor: '#4ECDC4',
            backgroundColor: 'rgba(78, 205, 196, 0.1)'
        },
        {
            id: 'users',
            title: t('users'),
            icon: 'account-group',
            route: 'statCustomer',
            iconColor: '#FFD93D',
            backgroundColor: 'rgba(255, 217, 61, 0.1)'
        },
        {
            id: 'performance',
            title: t('performance'),
            icon: 'trending-up',
            route: 'StatPerformance',
            iconColor: '#6C5CE7',
            backgroundColor: 'rgba(108, 92, 231, 0.1)'
        }
    ];

    return (
        <View style={[styles.containerStatPage, {backgroundColor : colors.colorBackground}]}>
            <HeaderSetting color={colors.colorText} name={t('homeStat')} navigateTo="HomeScreen"/>
            
            <ScrollView style={styles.scrollView}>
                <Text style={[styles.titleStat, {color: colors.colorDetail}]}>{t('listOfStatistics')}</Text>

                <View style={styles.optionsContainer}>
                    {statOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.statBlock, {backgroundColor: colors.colorBorderAndBlock}]}
                            onPress={() => navigation.navigate(option.route)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: option.backgroundColor }]}>
                                <Icon name={option.icon} size={28} color={option.iconColor} />
                            </View>
                            
                            <View style={styles.textContainer}>
                                <Text style={[styles.blockTitle, {color : colors.colorText}]}>{option.title}</Text>
                                <Icon 
                                    name="chevron-right" 
                                    size={20} 
                                    color="#A2A2A7"
                                    style={styles.chevron}
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

function useStyles() {
    const { width, height } = useWindowDimensions();
    const colors = useColors()

    return StyleSheet.create({
        containerStatPage: {
            flex: 1,
        },
        scrollView: {
            flex: 1,
        },
        titleStat: {
            marginLeft: 30,
            marginTop: 20,
            fontSize: width > 375 ? 18 : 15,
            marginBottom: 30
        },
        optionsContainer: {
            paddingHorizontal: 20,
            gap: 16,
        },
        statBlock: {
            backgroundColor: colors.colorBorderAndBlock, 
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            elevation: 2,
        },
        iconContainer: {
            width: 50,
            height: 50,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        textContainer: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        blockTitle: {
            color: 'white',
            fontSize: width > 375 ? 18 : 15,
            fontWeight: '500',
        },
        chevron: {
            opacity: 0.7,
        }
    });
}

export default StatOptionScreen;