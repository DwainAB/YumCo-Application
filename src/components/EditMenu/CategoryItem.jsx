import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColors } from '../ColorContext/ColorContext';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import { OptionItem } from './OptionItem';

export const CategoryItem = ({
    category,
    categoryIndex,
    isExpanded,
    isEditing,
    editingData,
    onToggleExpand,
    onStartEdit,
    onDelete,
    onSaveEdit,
    onCancelEdit,
    onEditDataChange,
    onAddOption,
    onEditOption,
    onDeleteOption,
    editingOptionId,
    editingOptionData,
    onStartEditOption,
    onSaveEditOption,
    onCancelEditOption,
    onEditOptionDataChange
}) => {
    const { colors } = useColors();
    const { t } = useTranslation();
    const styles = useStyles();

    return (
        <View style={styles.categoryCollapse}>
            <TouchableOpacity
                style={[
                    styles.categoryCollapseHeader,
                    isExpanded && styles.categoryCollapseHeaderActive
                ]}
                onPress={onToggleExpand}
            >
                <View style={styles.categoryCollapseTitle}>
                    <Ionicons
                        name={isExpanded ? "chevron-down" : "chevron-forward"}
                        size={18}
                        color={colors.colorText}
                    />
                    <Text style={[styles.categoryName, { color: colors.colorText }]}>
                        {category.name}
                    </Text>
                </View>
                <View style={styles.categoryHeaderActions}>
                    <TouchableOpacity
                        style={styles.categoryActionButton}
                        onPress={onStartEdit}
                    >
                        <Ionicons name="pencil" size={26} color={colors.colorAction} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.categoryActionButton}
                        onPress={onDelete}
                    >
                        <Ionicons name="trash" size={26} color="#FF4444" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <TouchableWithoutFeedback>
                    <View style={styles.categoryCollapseContent}>
                        {isEditing ? (
                            <View style={styles.categoryEditForm}>
                                <Text style={[styles.editFormLabel, { color: colors.colorText }]}>
                                    {t('category_name')}:
                                </Text>
                                <TextInput
                                    style={[styles.editFormInput, { color: colors.colorText }]}
                                    value={editingData.name}
                                    onChangeText={(text) => onEditDataChange('name', text)}
                                    placeholder={t('category_name')}
                                    placeholderTextColor="#9EA0A4"
                                />

                                <Text style={[styles.editFormLabel, { color: colors.colorText }]}>
                                    {t('max_option')}:
                                </Text>
                                <TextInput
                                    style={[styles.editFormInput, { color: colors.colorText }]}
                                    value={editingData.maxOptions.toString()}
                                    onChangeText={(text) => onEditDataChange('maxOptions', text)}
                                    keyboardType="numeric"
                                    placeholder={t('max_option')}
                                    placeholderTextColor="#9EA0A4"
                                />

                                <View style={styles.switchContainer}>
                                    <Text style={[styles.switchLabel, { color: colors.colorText }]}>
                                        {t('category_required')}
                                    </Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.switchButton,
                                            {
                                                backgroundColor: editingData.isRequired ? '#4CAF50' : '#FF4444'
                                            }
                                        ]}
                                        onPress={() => onEditDataChange('isRequired', !editingData.isRequired)}
                                    >
                                        <View style={[
                                            styles.switchKnob,
                                            {
                                                transform: [{
                                                    translateX: editingData.isRequired ? 20 : 0
                                                }]
                                            }
                                        ]} />
                                    </TouchableOpacity>
                                </View>

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
                        ) : (
                            <View style={styles.categoryReadMode}>
                                <Text style={[styles.categoryDetail, { color: colors.colorDetail }]}>
                                    {t('max_option')}: {category.max_options}
                                </Text>
                                <Text style={[styles.categoryDetail, { color: colors.colorDetail }]}>
                                    {category.is_required ? t('required') : t('optional')}
                                </Text>
                            </View>
                        )}

                        <View style={styles.optionsSection}>
                            <View style={styles.optionsSectionHeader}>
                                <Text style={[styles.optionsTitle, { color: colors.colorText }]}>
                                    {t('options')}
                                </Text>
                                <TouchableOpacity
                                    style={styles.addOptionButton}
                                    onPress={onAddOption}
                                >
                                    <Ionicons name="add" size={20} color={colors.colorAction} />
                                </TouchableOpacity>
                            </View>

                            {category.options && category.options.length > 0 ? (
                                category.options.map((option, optionIndex) => (
                                    <OptionItem
                                        key={option.id || optionIndex}
                                        option={option}
                                        optionIndex={optionIndex}
                                        isEditing={editingOptionId === option.id}
                                        editingData={editingOptionData}
                                        onStartEdit={() => onStartEditOption(option)}
                                        onDelete={() => onDeleteOption(optionIndex)}
                                        onSaveEdit={() => onSaveEditOption(categoryIndex, optionIndex)}
                                        onCancelEdit={onCancelEditOption}
                                        onEditDataChange={onEditOptionDataChange}
                                    />
                                ))
                            ) : (
                                <Text style={[styles.noOptionsText, { color: colors.colorDetail }]}>
                                    {t('no_options')}
                                </Text>
                            )}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </View>
    );
};

function useStyles() {
    const { width } = useWindowDimensions();
    const { colors } = useColors();

    return StyleSheet.create({
        categoryCollapse: {
            marginBottom: 12,
            borderRadius: 8,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.colorDetail,
        },
        categoryCollapseHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            backgroundColor: colors.colorBorderAndBlock,
        },
        categoryCollapseHeaderActive: {
            backgroundColor: colors.colorBorderAndBlock,
            opacity: 0.8,
        },
        categoryCollapseTitle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            flex: 1,
        },
        categoryName: {
            fontSize: width > 500 ? 16 : 14,
            fontWeight: '600',
        },
        categoryHeaderActions: {
            flexDirection: 'row',
            gap: 8,
        },
        categoryActionButton: {
            padding: 4,
        },
        categoryCollapseContent: {
            padding: 12,
            backgroundColor: colors.colorBackground,
        },
        categoryEditForm: {
            gap: 12,
        },
        editFormLabel: {
            fontSize: width > 500 ? 14 : 12,
            marginBottom: 4,
        },
        editFormInput: {
            borderWidth: 1,
            borderColor: colors.colorDetail,
            borderRadius: 8,
            padding: 10,
            fontSize: width > 500 ? 14 : 12,
            backgroundColor: colors.colorBorderAndBlock,
        },
        switchContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        switchLabel: {
            fontSize: width > 500 ? 14 : 12,
        },
        switchButton: {
            width: 50,
            height: 30,
            borderRadius: 15,
            padding: 2,
            justifyContent: 'center',
        },
        switchKnob: {
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: 'white',
        },
        editFormActions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 8,
        },
        editFormButton: {
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 8,
        },
        cancelButton: {
            backgroundColor: colors.colorDetail,
        },
        saveButton: {
            backgroundColor: colors.colorAction,
        },
        editFormButtonText: {
            color: 'white',
            fontSize: width > 500 ? 14 : 12,
            fontWeight: '600',
        },
        categoryReadMode: {
            gap: 4,
            marginBottom: 12,
        },
        categoryDetail: {
            fontSize: width > 500 ? 13 : 11,
        },
        optionsSection: {
            marginTop: 8,
        },
        optionsSectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        optionsTitle: {
            fontSize: width > 500 ? 14 : 12,
            fontWeight: '600',
        },
        addOptionButton: {
            padding: 4,
        },
        noOptionsText: {
            fontSize: width > 500 ? 12 : 10,
            fontStyle: 'italic',
            textAlign: 'center',
            paddingVertical: 8,
        },
    });
}