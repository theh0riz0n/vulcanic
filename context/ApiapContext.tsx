import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData } from '@/lib/utils/auth-utils';

interface ApiapContextType {
  apiap: string | null;
  setApiap: (apiap: string) => void;
  clearApiap: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const ApiapContext = createContext<ApiapContextType | undefined>(undefined);

export const ApiapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiap, setApiapState] = useState<string | null>(null);

  // Load APIAP from localStorage on component mount
  useEffect(() => {
    const userData = getUserData();
    if (userData.apiap) {
      setApiapState(userData.apiap);
    }
  }, []);

  // Set APIAP in state and localStorage
  const setApiap = (newApiap: string) => {
    setApiapState(newApiap);
  };

  // Clear APIAP from state and localStorage
  const clearApiap = () => {
    setApiapState(null);
  };

  // Get headers with APIAP for API requests
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiap) {
      headers['X-APIAP'] = apiap;
    }

    return headers;
  };

  return (
    <ApiapContext.Provider value={{ apiap, setApiap, clearApiap, getAuthHeaders }}>
      {children}
    </ApiapContext.Provider>
  );
};

// Custom hook to use the APIAP context
export const useApiap = (): ApiapContextType => {
  const context = useContext(ApiapContext);
  if (context === undefined) {
    throw new Error('useApiap must be used within an ApiapProvider');
  }
  return context;
}; 