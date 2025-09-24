import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColors } from '../ColorContext/ColorContext';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';

export const OptionItem = ({
    option,
    optionIndex,
    isEditing,
    editingData,
    onStartEdit,
    onDelete,
    onSaveEdit,
    onCancelEdit,
    onEditDataChange
}) => {
    const { colors } = useColors();
    const { t } = useTranslation();
    const styles = useStyles();

    if (isEditing) {
        return (
            <View style={styles.optionEditForm}>
                <TextInput
                    style={[styles.editFormInput, { color: colors.colorText }]}
                    value={editingData.name}
                    onChangeText={(text) => onEditDataChange('name', text)}
                    placeholder={t('option_name')}
                    placeholderTextColor="#9EA0A4"
                />
                <TextInput
                    style={[styles.editFormInput, { color: colors.colorText }]}
                    value={editingData.additionalPrice}
                    onChangeText={(text) => onEditDataChange('additionalPrice', text)}
                    keyboardType="numeric"
                    placeholder={t('additional_price')}
                    placeholderTextColor="#9EA0A4"
                />
                <View style={styles.editFormActions}>
                    <TouchableOpacity
                        style={[styles.editFormButton, styles.cancelButton]}
                        onPress={onCancelEdit}
                    >
                        <Text style={styles.editFormButtonText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.editFormButton, styles.saveButton]}
                        onPress={onSaveEdit}
                    >
                        <Text style={styles.editFormButtonText}>{t('save')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
                <Text style={[styles.optionName, { color: colors.colorText }]}>
                    {option.name}
                </Text>
                <Text style={[styles.optionPrice, { color: colors.colorAction }]}>
                    +{option.additional_price}€
                </Text>
            </View>
            <View style={styles.optionActions}>
                <TouchableOpacity
                    style={styles.optionActionButton}
                    onPress={onStartEdit}
                >
                    <Ionicons name="pencil" size={20} color={colors.colorAction} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.optionActionButton}
                    onPress={onDelete}
                >
                    <Ionicons name="trash" size={20} color="#FF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

function useStyles() {
    const { width } = useWindowDimensions();
    const { colors } = useColors();

    return StyleSheet.create({
        optionItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: colors.colorBorderAndBlock,
            borderRadius: 6,
            marginBottom: 6,
        },
        optionInfo: {
            flex: 1,
        },
        optionName: {
            fontSize: width > 500 ? 14 : 12,
            fontWeight: '500',
            marginBottom: 2,
        },
        optionPrice: {
            fontSize: width > 500 ? 12 : 10,
        },
        optionActions: {
            flexDirection: 'row',
            gap: 8,
        },
        optionActionButton: {
            padding: 4,
        },
        optionEditForm: {
            gap: 10,
            marginBottom: 8,
            padding: 12,
            backgroundColor: colors.colorBorderAndBlock,
            borderRadius: 6,
        },
        editFormInput: {
            borderWidth: 1,
            borderColor: colors.colorDetail,
            borderRadius: 8,
            padding: 10,
            fontSize: width > 500 ? 14 : 12,
            backgroundColor: colors.colorBackground,
        },
        editFormActions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 10,
        },
        editFormButton: {
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 6,
        },
        cancelButton: {
            backgroundColor: colors.colorDetail,
        },
        saveButton: {
            backgroundColor: colors.colorAction,
        },
        editFormButtonText: {
            color: 'white',
            fontSize: width > 500 ? 12 : 10,
            fontWeight: '600',
        },
    });
}