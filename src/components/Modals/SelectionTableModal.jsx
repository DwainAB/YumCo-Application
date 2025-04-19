// src/components/Modals/SelectionModal.js
import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

const SelectionModal = ({ 
    visible, 
    title, 
    options, 
    currentValue, 
    onSelect, 
    onClose, 
    colors 
}) => {
    const { width, height } = useWindowDimensions();
    const {t} = useTranslation()
    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
            width: width * 0.85,
            maxHeight: height * 0.7,
            borderRadius: 16,
            overflow: 'hidden',
        },
        modalHeader: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0, 0, 0, 0.1)',
            alignItems: 'center',
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: '600',
        },
        optionsList: {
            maxHeight: height * 0.4,
        },
        optionItem: {
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        },
        optionText: {
            fontSize: 16,
        },
        modalFooter: {
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.1)',
        },
        closeButton: {
            alignItems: 'center',
            paddingVertical: 14,
            borderRadius: 10,
        },
        closeButtonText: {
            color: 'white',
            fontWeight: '600',
            fontSize: 16,
        },
    });

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.colorBorderAndBlock }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.colorText }]}>
                            {title}
                        </Text>
                    </View>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={[
                                    styles.optionItem,
                                    currentValue === item && { backgroundColor: colors.colorAction + '20' }
                                ]}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={[
                                    styles.optionText, 
                                    { color: colors.colorText },
                                    currentValue === item && { fontWeight: 'bold', color: colors.colorAction }
                                ]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                        style={styles.optionsList}
                    />
                    <View style={styles.modalFooter}>
                        <TouchableOpacity 
                            style={[styles.closeButton, { backgroundColor: colors.colorAction }]} 
                            onPress={onClose}
                        >
                            <Text style={styles.closeButtonText}>{t('close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SelectionModal;