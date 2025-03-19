// Function to validate APIAP string by attempting to create keypair, jwt, and hebe
export const validateApiap = async (apiapString: string): Promise<boolean> => {
  // Only run on server
  if (typeof window !== 'undefined') {
    console.warn('validateApiap should only be called server-side');
    return false;
  }

  try {
    let jsonData = {};
    
    // Extract JSON data from the APIAP string
    if (apiapString.startsWith('<html>')) {
      const match = apiapString.match(/<input id="ap" type="hidden" value="(.*?)"><\/body>/);
      if (match && match[1]) {
        try {
          // Replace HTML entity quotes with actual quotes
          const htmlDecodedJson = match[1].replace(/&quot;/g, '"');
          jsonData = JSON.parse(htmlDecodedJson);
          console.log('Successfully extracted and parsed JSON data from APIAP HTML');
        } catch (err) {
          console.error('Failed to parse JSON from APIAP HTML:', err);
          return false;
        }
      } else {
        console.error('Failed to extract value attribute from APIAP HTML');
        return false;
      }
    } else {
      console.error('APIAP string is not in HTML format');
      return false;
    }
    
    // Create a properly formatted APIAP string with the extracted JSON
    const formattedApiap = `<html><head></head><body><input id="ap" type="hidden" value='${JSON.stringify(jsonData)}' /></body></html>`;
    
    // Dynamic imports for server-side only using ES modules dynamic import
    let hebece;
    try {
      hebece = await import('hebece');
    } catch (err) {
      console.error('Failed to import hebece module:', err);
      return false;
    }
    
    const Keypair = hebece.Keypair;
    const VulcanJwtRegister = hebece.VulcanJwtRegister;
    const VulcanHebeCe = hebece.VulcanHebeCe;
    
    // Test connection to validate APIAP string
    const keypair = await (new Keypair()).init();
    
    console.log('Keypair initialized, attempting JWT register...');
    
    const jwt = await (new VulcanJwtRegister(keypair, formattedApiap, 0)).init();
    
    console.log('JWT Register successful, connecting HebeCe...');
    
    const hebe = new VulcanHebeCe(keypair, jwt.Envelope.RestURL);
    await hebe.connect();
    
    // Store the validated APIAP in global state for server-side use
    global.__APIAP__ = formattedApiap;
    console.log('APIAP stored in server-side global state with length:', formattedApiap.length);
    
    return true;
  } catch (error) {
    console.error('APIAP validation failed:', error);
    return false;
  }
};

// Save user auth data to localStorage
export const saveUserData = (apiap: string, name: string, email: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('auth_apiap', apiap);
    localStorage.setItem('auth_name', name);
    localStorage.setItem('auth_email', email);
  } catch (error) {
    console.error('Failed to save user data to localStorage:', error);
  }
};

// Check if user is authenticated (has valid data in localStorage)
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const apiap = localStorage.getItem('auth_apiap');
    const name = localStorage.getItem('auth_name');
    const email = localStorage.getItem('auth_email');
    
    return !!apiap && !!name && !!email;
  } catch (error) {
    console.error('Failed to check authentication status:', error);
    return false;
  }
};

// Get user data from localStorage
export const getUserData = () => {
  if (typeof window === 'undefined') return { apiap: null, name: null, email: null };
  
  try {
    const apiap = localStorage.getItem('auth_apiap');
    const name = localStorage.getItem('auth_name');
    const email = localStorage.getItem('auth_email');
    
    return { apiap, name, email };
  } catch (error) {
    console.error('Failed to get user data from localStorage:', error);
    return { apiap: null, name: null, email: null };
  }
};

// Clear user data from localStorage (logout)
export const clearUserData = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('auth_apiap');
    localStorage.removeItem('auth_name');
    localStorage.removeItem('auth_email');
  } catch (error) {
    console.error('Failed to clear user data from localStorage:', error);
  }
};

// Check if all required user data is present
export const hasRequiredAuthData = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const apiap = localStorage.getItem('auth_apiap');
    const name = localStorage.getItem('auth_name');
    const email = localStorage.getItem('auth_email');
    
    return !!apiap && !!name && !!email;
  } catch (error) {
    console.error('Failed to check required auth data:', error);
    return false;
  }
}; 