import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useColors } from '../ColorContext/ColorContext';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';

export const MenuBasicFields = ({ menuData, onInputChange }) => {
    const { colors } = useColors();
    const { t } = useTranslation();
    const styles = useStyles();

    return (
        <>
            <TextInput
                style={[styles.input, { color: colors.colorText }]}
                value={menuData?.name ?? ""}
                onChangeText={(text) => onInputChange(text, 'name')}
                placeholder={t('menu_name')}
                placeholderTextColor="#9EA0A4"
            />

            <View style={styles.priceInputContainer}>
                <TextInput
                    style={[styles.input, { color: colors.colorText, paddingRight: 30 }]}
                    value={menuData?.price?.toString() ?? ""}
                    onChangeText={(text) => onInputChange(text, 'price')}
                    keyboardType="numeric"
                    placeholder={t('price')}
                    placeholderTextColor="#9EA0A4"
                />
                <Text style={styles.euroSymbol}>€</Text>
            </View>

            <TextInput
                style={[styles.input, { color: colors.colorText, height: 100 }]}
                value={menuData?.description ?? ""}
                onChangeText={(text) => onInputChange(text, 'description')}
                placeholder={t('menu_details')}
                placeholderTextColor="#9EA0A4"
                multiline
                numberOfLines={4}
            />
        </>
    );
};

function useStyles() {
    const { width } = useWindowDimensions();

    const { colors } = useColors();

    return StyleSheet.create({
        input: {
            borderWidth: 1,
            borderColor: colors.colorDetail,
            borderRadius: 12,
            padding: 12,
            marginBottom: 15,
            fontSize: width > 500 ? 16 : 14,
            backgroundColor: colors.colorBorderAndBlock,
        },
        priceInputContainer: {
            position: 'relative',
            marginBottom: 15,
        },
        euroSymbol: {
            position: 'absolute',
            right: 15,
            top: 12,
            fontSize: width > 500 ? 16 : 14,
            color: colors.colorDetail,
        },
    });
}