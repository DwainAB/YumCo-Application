// ColorContext.js
import React, { createContext, useContext, useState } from 'react';

const ColorContext = createContext();

export const useColors = () => useContext(ColorContext);

export const ColorProvider = ({ children }) => {
  const [colors, setColors] = useState({
    colorBackground: "#161622",
    colorBorderAndBlock: "#1E1E2D",
    colorRed: "#7f5056",
    colorDetail: "#8B8B94",
    colorAction: "#0066FF",
    colorText: "#ffffff",
  });

  return (
    <ColorContext.Provider value={{ colors, setColors }}>
      {children}
    </ColorContext.Provider>
  );
};

