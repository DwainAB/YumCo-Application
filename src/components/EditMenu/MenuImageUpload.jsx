import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColors } from '../ColorContext/ColorContext';
import { useWindowDimensions } from 'react-native';

export const MenuImageUpload = ({ imageUri, onUploadPress }) => {
    const { colors } = useColors();
    const styles = useStyles();

    return (
        <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
                {imageUri ? (
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.menuImage}
                    />
                ) : (
                    <View style={styles.noImageContainer}>
                        <Ionicons name="image" size={40} color={colors.colorText} />
                    </View>
                )}
                <TouchableOpacity
                    style={styles.editImageButton}
                    onPress={onUploadPress}
                >
                    <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

function useStyles() {
    const { width } = useWindowDimensions();
    const { colors } = useColors();

    return StyleSheet.create({
        imageContainer: {
            alignItems: 'center',
            marginBottom: 20,
        },
        imageWrapper: {
            position: 'relative',
            width: width > 800 ? 300 : width > 500 ? 200 : 150,
            height: width > 800 ? 300 : width > 500 ? 200 : 150,
        },
        menuImage: {
            width: '100%',
            height: '100%',
            borderRadius: 12,
        },
        noImageContainer: {
            width: '100%',
            height: '100%',
            borderRadius: 12,
            backgroundColor: colors.colorBorderAndBlock,
            justifyContent: 'center',
            alignItems: 'center',
        },
        editImageButton: {
            position: 'absolute',
            bottom: 10,
            right: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.colorAction,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
    });
}