import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { InfoStat, InfoOrder, InfoCard, FormLogin } from '../components/About/About';

const InfoLoginScreen = () => {
  const [currentPage, setCurrentPage] = useState('infoStat');

  const nextPage = () => {
    switch (currentPage) {
      case 'infoStat':
        setCurrentPage('infoOrder');
        break;
      case 'infoOrder':
        setCurrentPage('infoCard');
        break;
      case 'infoCard':
        setCurrentPage('formLogin');
        break;
      case 'formLogin':
        // Rediriger vers l'application principale ou une autre page d'accueil
        break;
      default:
        break;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'infoStat':
        return <InfoStat nextPage={nextPage} />;
      case 'infoOrder':
        return <InfoOrder nextPage={nextPage} />;
      case 'infoCard':
        return <InfoCard nextPage={nextPage} />;
      case 'formLogin':
        return <FormLogin />;
      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderPage()}</View>;
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#161622",
  },
});

export default InfoLoginScreen;
