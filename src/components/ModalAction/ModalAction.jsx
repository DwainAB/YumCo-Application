import React from 'react';
import { Alert } from 'react-native';

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    Alert.alert(
      title,
      message,
      [
        { text: 'Annuler', onPress: handleCancel },
        { text: 'Confirmer', onPress: handleConfirm }
      ],
      { cancelable: false }
    )
  );
};

export default ConfirmDialog;
