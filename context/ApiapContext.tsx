import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData } from '@/lib/utils/auth-utils';

// Declare global type for __APIAP__ to fix TypeScript errors
declare global {
  var __APIAP__: string | undefined;
}

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
    if (userData && userData.apiap) {
      console.log('ApiapContext: Loaded APIAP from localStorage with length:', userData.apiap.length);
      setApiapState(userData.apiap);
    } else {
      console.log('ApiapContext: No APIAP found in localStorage');
    }
  }, []);

  // Set APIAP in state and localStorage
  const setApiap = (newApiap: string) => {
    console.log('ApiapContext: Setting new APIAP with length:', newApiap.length);
    setApiapState(newApiap);
    // Note: We don't need to set localStorage here as saveUserData already does this
  };

  // Clear APIAP from state and localStorage
  const clearApiap = () => {
    console.log('ApiapContext: Clearing APIAP');
    setApiapState(null);
    // Note: We don't clear localStorage here as clearUserData would handle this
  };

  // Get headers with APIAP for API requests
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Check if we're in a Node.js environment (server-side)
    const isNodeJS = typeof process !== 'undefined' && 
      process.versions != null && 
      process.versions.node != null;
    
    if (isNodeJS) {
      // Server-side: try to use global.__APIAP__
      try {
        if (global && global.__APIAP__) {
          console.log('ApiapContext: Adding X-APIAP header from server-side global state with length:', global.__APIAP__.length);
          headers['X-APIAP'] = global.__APIAP__;
        } else {
          console.log('ApiapContext: No APIAP available in server-side global state');
        }
      } catch (error) {
        console.log('ApiapContext: Error accessing server-side global state');
      }
    } else {
      // Client-side: first try component state, then localStorage
      if (apiap) {
        console.log('ApiapContext: Adding X-APIAP header from state with length:', apiap.length);
        headers['X-APIAP'] = apiap;
      } else {
        // State is empty, try localStorage
        try {
          const userData = getUserData();
          if (userData && userData.apiap) {
            console.log('ApiapContext: Adding X-APIAP header from localStorage with length:', userData.apiap.length);
            headers['X-APIAP'] = userData.apiap;
          } else {
            console.log('ApiapContext: No APIAP available in localStorage');
          }
        } catch (error) {
          console.error('ApiapContext: Error accessing user data:', error);
        }
      }
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