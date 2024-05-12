import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

// Créer un contexte
const LanguageContext = createContext();

// Créer un fournisseur pour le contexte
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('Français');
  const [codeLanguage, setCodeLanguage] = useState('');
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('selectedLanguage');
        const storedCodeLanguage = await AsyncStorage.getItem('codeLanguage');
        console.log("tetetetet",storedLanguage, storedCodeLanguage);
        if (storedLanguage && storedCodeLanguage) {
          setLanguage(storedLanguage);
          i18n.changeLanguage(storedCodeLanguage);
        } else {
          console.log('dddddd');
          setLanguage('Français');
          i18n.changeLanguage('fr');
        }
      } catch (error) {
        console.error('Error fetching language:', error);
      }

    };

    fetchLanguage();
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, codeLanguage, setCodeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};


// Custom hook pour accéder au contexte
export const useLanguage = () => useContext(LanguageContext);