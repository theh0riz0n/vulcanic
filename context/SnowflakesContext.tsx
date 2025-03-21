import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SnowflakesContextType = {
  showSnowflakes: boolean;
  setShowSnowflakes: (show: boolean) => void;
  snowflakeIntensity: number;
  setSnowflakeIntensity: (intensity: number) => void;
  isSnowflakesLoaded: boolean;
};

const defaultContext: SnowflakesContextType = {
  showSnowflakes: false, // Start with hidden until loaded
  setShowSnowflakes: () => {},
  snowflakeIntensity: 50,
  setSnowflakeIntensity: () => {},
  isSnowflakesLoaded: false,
};

const SnowflakesContext = createContext<SnowflakesContextType>(defaultContext);

export const useSnowflakes = () => useContext(SnowflakesContext);

// Helper to get snowflake settings
const getInitialSnowflakes = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedShow = localStorage.getItem('showSnowflakes');
    const savedIntensity = localStorage.getItem('snowflakeIntensity');
    
    return {
      showSnowflakes: savedShow === null ? true : savedShow === 'true',
      snowflakeIntensity: savedIntensity ? parseInt(savedIntensity, 10) : 50
    };
  } catch (e) {
    console.error('Error reading snowflakes settings from localStorage', e);
    return null;
  }
};

export const SnowflakesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSnowflakesLoaded, setIsSnowflakesLoaded] = useState(false);
  const [showSnowflakes, setShowSnowflakesState] = useState<boolean>(false);
  const [snowflakeIntensity, setSnowflakeIntensityState] = useState<number>(50);

  // Load settings from localStorage on first render
  useEffect(() => {
    const initialSettings = getInitialSnowflakes();
    if (initialSettings) {
      setShowSnowflakesState(initialSettings.showSnowflakes);
      setSnowflakeIntensityState(initialSettings.snowflakeIntensity);
    }
    setIsSnowflakesLoaded(true);
  }, []);

  // Wrapper function to save showSnowflakes to localStorage
  const setShowSnowflakes = (show: boolean) => {
    setShowSnowflakesState(show);
    if (typeof window !== 'undefined') {
      localStorage.setItem('showSnowflakes', String(show));
      // Update CSS variable for immediate effect even before hydration
      document.documentElement.style.setProperty('--show-snowflakes', show ? 'block' : 'none');
    }
  };

  // Wrapper function to save snowflakeIntensity to localStorage
  const setSnowflakeIntensity = (intensity: number) => {
    setSnowflakeIntensityState(intensity);
    if (typeof window !== 'undefined') {
      localStorage.setItem('snowflakeIntensity', String(intensity));
    }
  };

  return (
    <SnowflakesContext.Provider
      value={{
        showSnowflakes,
        setShowSnowflakes,
        snowflakeIntensity,
        setSnowflakeIntensity,
        isSnowflakesLoaded,
      }}
    >
      {children}
    </SnowflakesContext.Provider>
  );
}; 