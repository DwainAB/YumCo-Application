import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

const ColorContext = createContext();

export const useColors = () => useContext(ColorContext);

export const ColorProvider = ({ children }) => {
  const [themeSelected, setThemeSelected] = useState('default');
  const [colors, setColors] = useState({});

  // Définir des objets de couleurs pour différents thèmes
  const colorThemes = {
    default: {
      colorBackground: "#161622",
      colorBorderAndBlock: "#1E1E2D",
      colorRed: "#FF4267",
      colorDetail: "#8B8B94",
      colorAction: "#0066FF",
      colorText: "#ffffff",
    },
    mars: {
      colorBackground: "#11151D",
      colorBorderAndBlock: "#222D41",
      colorDetail: "#7F5056",
      colorAction: "#D76C58",
      colorText: "#ffffff",
      colorRed: "#7f5056",
    },
    blueLight: {
      colorBackground: "#0B162C",
      colorBorderAndBlock: "#1C2942",
      colorDetail: "#5FC2BA",
      colorAction: "#5FC2BA",
      colorText: "#FFFFFF",
      colorRed: "#FF4267",
    },
    purple: {
      colorBackground: "#11151D",
      colorBorderAndBlock: "#474252",
      colorDetail: "#ABA0F9",
      colorAction: "#8A68D2",
      colorText: "#ffffff",
      colorRed: "#FF4267",
    },
    lavande: {
      colorBackground: "#D6CFFF",
      colorBorderAndBlock: "#FEFEFF",
      colorDetail: "#7C80FC",
      colorAction: "#7C80FC",
      colorText: "#000",
      colorRed: "#FF4267",
    },
    pastel: {
      colorBackground: "#EDF2F4",
      colorBorderAndBlock: "#cecece",
      colorDetail: "#EE2449",
      colorAction: "#FF9999",
      colorText: "#2B2E42",
      colorRed: "#EE2449",
    },
    crepuscul:{
      colorBackground: "#EAEAEA",
      colorBorderAndBlock: "#ffffff",
      colorDetail: "#FCA616",
      colorAction: "#083456",
      colorText: "#FCA616",
      colorRed: "#EE2449",
    },
    test:{
      colorBackground: "#9ED3C9",
      colorBorderAndBlock: "#226D68",
      colorDetail: "#FCCC33",
      colorAction: "#FEEAA1",
      colorText: "#D6955B",
      colorRed: "#EE2449",
    }
  };

  // Fonction pour mettre à jour les couleurs en fonction du thème sélectionné
  const updateColors = (theme) => {
    setColors(colorThemes[theme] || colorThemes.default);
  };


    const checkStoredTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('selectedTheme');
        if (storedTheme && colorThemes[storedTheme]) {
          console.log("Stored theme:", storedTheme);
          setThemeSelected(storedTheme);
        } else {
          console.log("No theme stored or invalid theme.");
        }
      } catch (error) {
        console.error('Error retrieving theme:', error);
      }
    };

  useEffect(() => {
    checkStoredTheme();
  }, [themeSelected]);

  useEffect(() => {
    updateColors(themeSelected);
  }, [themeSelected]);

  return (
    <ColorContext.Provider value={{ colors, setThemeSelected, setColors }}>
      {children}
    </ColorContext.Provider>
  );
};
