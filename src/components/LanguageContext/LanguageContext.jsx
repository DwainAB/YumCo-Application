import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Créer un contexte
const LanguageContext = createContext();

// Créer un fournisseur pour le contexte
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('Français');

  useEffect(() => {
    // Stocker le langage dans le stockage
    AsyncStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook pour accéder au contexte
export const useLanguage = () => useContext(LanguageContext);
