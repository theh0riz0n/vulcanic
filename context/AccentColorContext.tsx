import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available accent colors
export const ACCENT_COLORS = {
  blue: '#38BDF8',
  purple: '#7C3AED',
  pink: '#F472B6',
  green: '#10B981',
  orange: '#F59E0B',
  red: '#EF4444',
};

// Define available background colors
export const BACKGROUND_COLORS = {
  // Dark themes
  dark: '17, 24, 39', // Default dark
  darker: '10, 15, 25', // Even darker
  navy: '15, 23, 42', // Navy blue
  gray: '31, 41, 55', // Gray
  charcoal: '24, 24, 27', // Charcoal
  black: '0, 0, 0', // Pure black
  
  // Light themes
  light: '249, 250, 251', // Default light
  white: '255, 255, 255', // Pure white
  cream: '255, 253, 244', // Cream
  silver: '241, 243, 244', // Silver
  lavender: '245, 243, 255', // Light lavender
  mint: '240, 253, 250', // Mint
};

// Define text colors for light/dark modes
export const TEXT_COLORS = {
  dark: {
    primary: '249, 250, 251',
    secondary: '209, 213, 219'
  },
  light: {
    primary: '17, 24, 39',
    secondary: '75, 85, 99'
  }
};

type ThemeContextType = {
  accentColor: string;
  setAccentColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  isDarkMode: boolean;
  toggleThemeMode: () => void;
};

const defaultContext: ThemeContextType = {
  accentColor: ACCENT_COLORS.purple,
  setAccentColor: () => {},
  backgroundColor: BACKGROUND_COLORS.dark,
  setBackgroundColor: () => {},
  isDarkMode: true,
  toggleThemeMode: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available, otherwise use default
  const [accentColor, setAccentColor] = useState<string>(ACCENT_COLORS.purple);
  const [backgroundColor, setBackgroundColor] = useState<string>(BACKGROUND_COLORS.dark);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Load settings from localStorage on first render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAccentColor = localStorage.getItem('accentColor');
      const savedBackgroundColor = localStorage.getItem('backgroundColor');
      const savedThemeMode = localStorage.getItem('isDarkMode');
      
      if (savedAccentColor !== null) {
        setAccentColor(savedAccentColor);
        document.documentElement.style.setProperty('--color-primary', savedAccentColor);
      }
      
      if (savedBackgroundColor !== null) {
        setBackgroundColor(savedBackgroundColor);
        document.documentElement.style.setProperty('--background-rgb', savedBackgroundColor);
      }

      if (savedThemeMode !== null) {
        setIsDarkMode(savedThemeMode === 'true');
      }
    }
  }, []);

  // Toggle between light and dark mode
  const toggleThemeMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Switch to default background color of the new mode
    if (newMode) {
      // Switch to dark mode
      setBackgroundColor(BACKGROUND_COLORS.dark);
    } else {
      // Switch to light mode
      setBackgroundColor(BACKGROUND_COLORS.light);
    }
  };

  // Save settings to localStorage and update CSS variables when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accentColor', accentColor);
      document.documentElement.style.setProperty('--color-primary', accentColor);
    }
  }, [accentColor]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('backgroundColor', backgroundColor);
      document.documentElement.style.setProperty('--background-rgb', backgroundColor);
      
      // Calculate and update surface and overlay colors based on background
      const [r, g, b] = backgroundColor.split(',').map(Number);
      
      if (isDarkMode) {
        // For dark mode, make surface and overlay lighter than background
        const surfaceRgb = `${Math.min(r + 14, 255)}, ${Math.min(g + 17, 255)}, ${Math.min(b + 16, 255)}`;
        const overlayRgb = `${Math.min(r + 38, 255)}, ${Math.min(g + 41, 255)}, ${Math.min(b + 42, 255)}`;
        document.documentElement.style.setProperty('--surface-rgb', surfaceRgb);
        document.documentElement.style.setProperty('--overlay-rgb', overlayRgb);
      } else {
        // For light mode, make surface and overlay darker than background
        const surfaceRgb = `${Math.max(r - 14, 0)}, ${Math.max(g - 10, 0)}, ${Math.max(b - 10, 0)}`;
        const overlayRgb = `${Math.max(r - 30, 0)}, ${Math.max(g - 25, 0)}, ${Math.max(b - 25, 0)}`;
        document.documentElement.style.setProperty('--surface-rgb', surfaceRgb);
        document.documentElement.style.setProperty('--overlay-rgb', overlayRgb);
      }
      
      // Set text colors based on theme mode
      const textColors = isDarkMode ? TEXT_COLORS.dark : TEXT_COLORS.light;
      document.documentElement.style.setProperty('--foreground-rgb', textColors.primary);
      document.documentElement.style.setProperty('--text-secondary-rgb', textColors.secondary);
    }
  }, [backgroundColor, isDarkMode]);

  // Save theme mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isDarkMode', String(isDarkMode));
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider
      value={{
        accentColor,
        setAccentColor,
        backgroundColor,
        setBackgroundColor,
        isDarkMode,
        toggleThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}; 