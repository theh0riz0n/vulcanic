import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SnowflakesContextType = {
  showSnowflakes: boolean;
  setShowSnowflakes: (show: boolean) => void;
  snowflakeIntensity: number;
  setSnowflakeIntensity: (intensity: number) => void;
};

const defaultContext: SnowflakesContextType = {
  showSnowflakes: true,
  setShowSnowflakes: () => {},
  snowflakeIntensity: 50,
  setSnowflakeIntensity: () => {},
};

const SnowflakesContext = createContext<SnowflakesContextType>(defaultContext);

export const useSnowflakes = () => useContext(SnowflakesContext);

export const SnowflakesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available, otherwise use defaults
  const [showSnowflakes, setShowSnowflakes] = useState<boolean>(true);
  const [snowflakeIntensity, setSnowflakeIntensity] = useState<number>(50);

  // Load settings from localStorage on first render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedShow = localStorage.getItem('showSnowflakes');
      const savedIntensity = localStorage.getItem('snowflakeIntensity');
      
      if (savedShow !== null) {
        setShowSnowflakes(savedShow === 'true');
      }
      
      if (savedIntensity !== null) {
        setSnowflakeIntensity(parseInt(savedIntensity, 10));
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showSnowflakes', String(showSnowflakes));
      localStorage.setItem('snowflakeIntensity', String(snowflakeIntensity));
    }
  }, [showSnowflakes, snowflakeIntensity]);

  return (
    <SnowflakesContext.Provider
      value={{
        showSnowflakes,
        setShowSnowflakes,
        snowflakeIntensity,
        setSnowflakeIntensity,
      }}
    >
      {children}
    </SnowflakesContext.Provider>
  );
}; 