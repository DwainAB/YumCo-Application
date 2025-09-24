import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColors } from '../ColorContext/ColorContext';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';

export const MenuCard = ({ menu, onPress, userRole }) => {
    const { colors } = useColors();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const styles = useStyles();

    return (
        <View style={styles.cardWrapper}>
            <TouchableOpacity
                style={[
                    styles.menuCard,
                    { backgroundColor: colors.colorBorderAndBlock },
                    userRole === 'USER' && styles.menuCardDisabled
                ]}
                onPress={() => onPress(menu)}
                disabled={userRole === 'USER'}
            >
                {menu.image_url ? (
                    <Image
                        source={{ uri: menu.image_url }}
                        style={styles.menuImage}
                    />
                ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: colors.colorBackground }]}>
                        <Ionicons name="image-outline" size={40} color={colors.colorDetail} />
                    </View>
                )}
                <View style={styles.menuInfo}>
                    <Text style={[styles.menuName, { color: colors.colorText }]}>
                        {menu.name}
                    </Text>
                    <Text style={[styles.menuPrice, { color: colors.colorAction }]}>
                        {menu.price} €
                    </Text>
                </View>
                <View style={[
                    styles.availabilityIndicator,
                    { backgroundColor: menu.is_active ? '#4CAF50' : '#FF4444' }
                ]} />
            </TouchableOpacity>
        </View>
    );
};

function useStyles() {
    const { width } = useWindowDimensions();
    const { colors } = useColors();

    return StyleSheet.create({
        cardWrapper: {
            width: width > 800 ? '23%' : width > 500 ? '30%' : '47%',
            marginBottom: 15,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        menuCard: {
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
        },
        menuCardDisabled: {
            opacity: 0.7,
        },
        menuImage: {
            width: '100%',
            height: width > 800 ? 150 : width > 500 ? 120 : 100,
            resizeMode: 'cover',
        },
        placeholderImage: {
            width: '100%',
            height: width > 800 ? 150 : width > 500 ? 120 : 100,
            justifyContent: 'center',
            alignItems: 'center',
        },
        menuInfo: {
            padding: 10,
        },
        menuName: {
            fontSize: width > 500 ? 16 : 14,
            fontWeight: '600',
            marginBottom: 4,
        },
        menuPrice: {
            fontSize: width > 500 ? 14 : 12,
            fontWeight: '500',
        },
        availabilityIndicator: {
            position: 'absolute',
            top: 8,
            right: 8,
            width: 12,
            height: 12,
            borderRadius: 6,
        },
    });
}