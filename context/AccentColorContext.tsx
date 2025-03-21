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
  isThemeLoaded: boolean;
};

const defaultContext: ThemeContextType = {
  accentColor: ACCENT_COLORS.purple,
  setAccentColor: () => {},
  backgroundColor: BACKGROUND_COLORS.dark,
  setBackgroundColor: () => {},
  isDarkMode: true,
  toggleThemeMode: () => {},
  isThemeLoaded: false,
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

export const useTheme = () => useContext(ThemeContext);

// Create a helper to get theme settings from localStorage
const getInitialTheme = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedAccentColor = localStorage.getItem('accentColor');
    const savedBackgroundColor = localStorage.getItem('backgroundColor');
    const savedThemeMode = localStorage.getItem('isDarkMode');
    
    const isDarkMode = savedThemeMode === null ? true : savedThemeMode === 'true';
    
    // Helper to check if a background belongs to a theme family
    const isDarkBg = (bg: string) => 
      Object.entries(BACKGROUND_COLORS)
        .filter(([key]) => ['dark', 'darker', 'navy', 'gray', 'charcoal', 'black'].includes(key))
        .some(([_, value]) => value === bg);
    
    const isLightBg = (bg: string) => 
      Object.entries(BACKGROUND_COLORS)
        .filter(([key]) => ['light', 'white', 'cream', 'silver', 'lavender', 'mint'].includes(key))
        .some(([_, value]) => value === bg);
    
    // Make sure the background matches the theme mode
    let backgroundColor;
    if (savedBackgroundColor) {
      if (isDarkMode && !isDarkBg(savedBackgroundColor)) {
        backgroundColor = BACKGROUND_COLORS.dark;
      } else if (!isDarkMode && !isLightBg(savedBackgroundColor)) {
        backgroundColor = BACKGROUND_COLORS.light;
      } else {
        backgroundColor = savedBackgroundColor;
      }
    } else {
      backgroundColor = isDarkMode ? BACKGROUND_COLORS.dark : BACKGROUND_COLORS.light;
    }
    
    return {
      accentColor: savedAccentColor || ACCENT_COLORS.purple,
      backgroundColor,
      isDarkMode,
    };
  } catch (e) {
    console.error('Error reading theme from localStorage', e);
    return null;
  }
};

// Helper to apply theme to document
const applyTheme = (
  accentColor: string, 
  backgroundColor: string, 
  isDarkMode: boolean
) => {
  if (typeof document === 'undefined') return;
  
  document.documentElement.style.setProperty('--color-primary', accentColor);
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
  
  // Add/remove a data attribute for CSS targeting
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
};

// Add script to immediately load theme before React hydration
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var savedAccentColor = localStorage.getItem('accentColor');
              var savedBackgroundColor = localStorage.getItem('backgroundColor');
              var savedThemeMode = localStorage.getItem('isDarkMode');
              
              var accentColor = savedAccentColor || '${ACCENT_COLORS.purple}';
              var isDarkMode = savedThemeMode === null ? true : savedThemeMode === 'true';
              
              // Define theme background categories
              var darkBackgrounds = ['${BACKGROUND_COLORS.dark}', '${BACKGROUND_COLORS.darker}', '${BACKGROUND_COLORS.navy}', '${BACKGROUND_COLORS.gray}', '${BACKGROUND_COLORS.charcoal}', '${BACKGROUND_COLORS.black}'];
              var lightBackgrounds = ['${BACKGROUND_COLORS.light}', '${BACKGROUND_COLORS.white}', '${BACKGROUND_COLORS.cream}', '${BACKGROUND_COLORS.silver}', '${BACKGROUND_COLORS.lavender}', '${BACKGROUND_COLORS.mint}'];
              
              // Check if saved background matches current theme
              var backgroundColor = savedBackgroundColor || '${BACKGROUND_COLORS.dark}';
              var isDarkBg = darkBackgrounds.includes(backgroundColor);
              var isLightBg = lightBackgrounds.includes(backgroundColor);
              
              // Ensure background matches theme mode
              if (isDarkMode && !isDarkBg) {
                backgroundColor = '${BACKGROUND_COLORS.dark}';
              } else if (!isDarkMode && !isLightBg) {
                backgroundColor = '${BACKGROUND_COLORS.light}';
              }
              
              document.documentElement.style.setProperty('--color-primary', accentColor);
              document.documentElement.style.setProperty('--background-rgb', backgroundColor);
              
              // Rest of theme application
              var rgbParts = backgroundColor.split(',').map(Number);
              var r = rgbParts[0] || 17;
              var g = rgbParts[1] || 24;
              var b = rgbParts[2] || 39;
              
              if (isDarkMode) {
                var surfaceRgb = Math.min(r + 14, 255) + ', ' + Math.min(g + 17, 255) + ', ' + Math.min(b + 16, 255);
                var overlayRgb = Math.min(r + 38, 255) + ', ' + Math.min(g + 41, 255) + ', ' + Math.min(b + 42, 255);
              } else {
                var surfaceRgb = Math.max(r - 14, 0) + ', ' + Math.max(g - 10, 0) + ', ' + Math.max(b - 10, 0);
                var overlayRgb = Math.max(r - 30, 0) + ', ' + Math.max(g - 25, 0) + ', ' + Math.max(b - 25, 0);
              }
              
              document.documentElement.style.setProperty('--surface-rgb', surfaceRgb);
              document.documentElement.style.setProperty('--overlay-rgb', overlayRgb);
              
              var textPrimary = isDarkMode ? '249, 250, 251' : '17, 24, 39';
              var textSecondary = isDarkMode ? '209, 213, 219' : '75, 85, 99';
              
              document.documentElement.style.setProperty('--foreground-rgb', textPrimary);
              document.documentElement.style.setProperty('--text-secondary-rgb', textSecondary);
              document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
              
              document.documentElement.style.setProperty('--show-snowflakes', localStorage.getItem('showSnowflakes') === 'true' ? 'block' : 'none');
            } catch (e) {
              console.error('Error applying theme', e);
            }
          })();
        `,
      }}
    />
  );
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  // Initialize with default values
  const [accentColor, setAccentColorState] = useState<string>(ACCENT_COLORS.purple);
  const [backgroundColor, setBackgroundColorState] = useState<string>(BACKGROUND_COLORS.dark);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Load settings from localStorage on first render
  useEffect(() => {
    const initialTheme = getInitialTheme();
    if (initialTheme) {
      setAccentColorState(initialTheme.accentColor);
      setBackgroundColorState(initialTheme.backgroundColor);
      setIsDarkMode(initialTheme.isDarkMode);
    }
    setIsThemeLoaded(true);
  }, []);

  // Wrapper function to save accent color to localStorage and update CSS
  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('accentColor', color);
      document.documentElement.style.setProperty('--color-primary', color);
    }
  };

  // Wrapper function to save background color
  const setBackgroundColor = (color: string) => {
    setBackgroundColorState(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('backgroundColor', color);
      applyTheme(accentColor, color, isDarkMode);
    }
  };

  // Toggle between light and dark mode
  const toggleThemeMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('isDarkMode', String(newMode));
      
      // Check if current background belongs to the current theme family
      const isDarkBg = Object.entries(BACKGROUND_COLORS)
        .filter(([key, _]) => ['dark', 'darker', 'navy', 'gray', 'charcoal', 'black'].includes(key))
        .some(([_, value]) => value === backgroundColor);
      
      const isLightBg = Object.entries(BACKGROUND_COLORS)
        .filter(([key, _]) => ['light', 'white', 'cream', 'silver', 'lavender', 'mint'].includes(key))
        .some(([_, value]) => value === backgroundColor);
      
      // Always switch to appropriate background for the theme
      let newBackground;
      if (newMode) {
        // Switching to dark mode
        newBackground = isLightBg ? BACKGROUND_COLORS.dark : backgroundColor;
      } else {
        // Switching to light mode
        newBackground = isDarkBg ? BACKGROUND_COLORS.light : backgroundColor;
      }
      
      setBackgroundColorState(newBackground);
      localStorage.setItem('backgroundColor', newBackground);
      
      applyTheme(accentColor, newBackground, newMode);
    }
  };

  // Apply theme whenever dependencies change
  useEffect(() => {
    if (isThemeLoaded) {
      applyTheme(accentColor, backgroundColor, isDarkMode);
    }
  }, [accentColor, backgroundColor, isDarkMode, isThemeLoaded]);

  return (
    <ThemeContext.Provider
      value={{
        accentColor,
        setAccentColor,
        backgroundColor,
        setBackgroundColor,
        isDarkMode,
        toggleThemeMode,
        isThemeLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}; 