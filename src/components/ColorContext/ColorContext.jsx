import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { safeJSONParse } from '../../utils/storage';

const ColorContext = createContext();

export const useColors = () => useContext(ColorContext);

// Déplacer la déclaration des thèmes AVANT leur utilisation
const colorThemes = {
  dark: {
    colorBackground: "#161622",
    colorBorderAndBlock: "#1E1E2D",
    colorRed: "#FF4267",
    colorDetail: "#8B8B94",
    colorAction: "#FF3F00",
    colorText: "#fff",
    colorDetaillight: "#5D5D5D"
  },
  light: {
    colorBackground: "#F8F8F8",
    colorBorderAndBlock: "#FFF",
    colorDetail: "#848484",
    colorAction: "#FF3F00",
    colorText: "#000",
    colorRed: "#F54432",
    colorDetaillight: "#f0f0f0"
  }
};

export const ColorProvider = ({ children }) => {
  const [themeSelected, setThemeSelected] = useState('light'); 
  const [colors, setColors] = useState(colorThemes.light); 

  // Fonction pour mettre à jour les couleurs en fonction du thème sélectionné
  const updateColors = (theme) => {
    setColors(colorThemes[theme] || colorThemes.default);
  };


    const checkStoredTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('selectedTheme');
        if (storedTheme && colorThemes[storedTheme]) {
          setThemeSelected(storedTheme);
        } else {
          // Définir le thème light par défaut au premier lancement
          await AsyncStorage.setItem('selectedTheme', 'light');
          setThemeSelected('light');
        }
      } catch (error) {
        console.error('Error retrieving theme:', error);
      }
    };

  useEffect(() => {
    checkStoredTheme();
  }, []);

  useEffect(() => {
    updateColors(themeSelected);
  }, [themeSelected]);

  return (
    <ColorContext.Provider value={{ colors, setThemeSelected, setColors }}>
      {children}
    </ColorContext.Provider>
  );
};
