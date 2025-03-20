// Dynamic imports will only work on the server
let Keypair: any, VulcanJwtRegister: any, VulcanHebeCe: any;
// Check if we are on the server
const isServer = typeof window === 'undefined';

// Declare global type for __APIAP__ to fix TypeScript errors
declare global {
  var __APIAP__: string | undefined;
  namespace NodeJS {
    interface ProcessEnv {
      RUNTIME_APIAP?: string;
    }
  }
}

// Initialize server-side modules
const initServerModules = async () => {
  if (isServer) {
    try {
      // Using ES modules dynamic import
      const hebece = await import('hebece');
      Keypair = hebece.Keypair;
      VulcanJwtRegister = hebece.VulcanJwtRegister;
      VulcanHebeCe = hebece.VulcanHebeCe;
      return true;
    } catch (err) {
      console.error('Failed to import hebece module:', err);
      return false;
    }
  }
  return false;
};

// Initialize server modules
if (isServer) {
  initServerModules().catch(err => {
    console.error('Failed to initialize server modules:', err);
  });
}

// Server-side utility to set APIAP globally and in process.env for persistence
export const setServerSideApiap = (apiapString: string): void => {
  if (isServer && apiapString) {
    console.log('Setting server-side APIAP cache');
    // Store in both global and process.env for redundancy
    global.__APIAP__ = apiapString;
    process.env.RUNTIME_APIAP = apiapString;
    console.log('APIAP stored in both global state and process.env');
  }
};

// Function to get APIAP string from process.env, global state, local storage, or return null
const getApiapString = (): string | null => {
  if (isServer) {
    // On server-side, first check process.env for persistence across cold starts
    if (process.env.RUNTIME_APIAP) {
      console.log('Using APIAP from process.env');
      // Also update global state to ensure consistency
      global.__APIAP__ = process.env.RUNTIME_APIAP;
      return process.env.RUNTIME_APIAP;
    }
    
    // Then check global state as fallback
    if (global.__APIAP__) {
      console.log('Using server-side cached APIAP from global state');
      // Store in process.env for future cold starts
      process.env.RUNTIME_APIAP = global.__APIAP__;
      return global.__APIAP__;
    }
    
    console.warn('No APIAP available on server without explicit configuration');
    return null;
  }
  
  try {
    // Try to get from localStorage
    const storedApiap = localStorage.getItem('auth_apiap');
    if (!storedApiap) return null;
    
    // Return the stored APIAP string as is
    return storedApiap;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

// Get APIAP string
const APIAP_VULCAN = getApiapString();

// Format the APIAP string for the VulcanJwtRegister
const formatApiap = (apiapString: string | null): string | null => {
  if (!apiapString) return null;
  
  try {
    // If it already has HTML structure, use it as is
    if (apiapString.startsWith('<html>')) {
      return apiapString;
    }
    
    // Try to parse as JSON if needed
    let jsonData = {};
    
    // If it looks like JSON, parse it
    if (apiapString.trim().startsWith('{')) {
      try {
        jsonData = JSON.parse(apiapString);
      } catch (e) {
        console.error('Failed to parse APIAP as JSON:', e);
      }
    } else {
      // Otherwise, try to extract from HTML format
      const match = apiapString.match(/<input id="ap" type="hidden" value="(.*?)"><\/body>/);
      if (match && match[1]) {
        const htmlDecodedJson = match[1].replace(/&quot;/g, '"');
        try {
          jsonData = JSON.parse(htmlDecodedJson);
        } catch (e) {
          console.error('Failed to parse extracted HTML value as JSON:', e);
        }
      }
    }
    
    // Create properly formatted APIAP string
    return `<html><head></head><body><input id="ap" type="hidden" value='${JSON.stringify(jsonData)}' /></body></html>`;
  } catch (error) {
    console.error('Error formatting APIAP string:', error);
    return null;
  }
};

// Create string for VulcanJwtRegister
const apiap = formatApiap(APIAP_VULCAN);

// Create stubs for methods that will be used on the client
const mockData = {
  lessons: [],
  exams: [],
  attendance: [],
  grades: [],
  homework: []
};

// Function to format dates
export const formatDateRange = (startDate: Date, endDate: Date) => {
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

// Initialize VulcanHebeCe (will only work on the server)
export const initVulcan = async () => {
  if (!isServer) {
    console.warn('Attempted to initialize Vulcan API on client side. Using mock data instead.');
    return {
      getLessons: () => ({ Envelope: mockData.lessons }),
      getExams: () => ({ Envelope: mockData.exams }),
      getAttendance: () => ({ Envelope: mockData.attendance }),
      getGrades: () => ({ Envelope: mockData.grades }),
      getHomework: () => ({ Envelope: mockData.homework })
    };
  }
  
  // Try to get APIAP from process.env first, then global state
  let serverApiap = process.env.RUNTIME_APIAP || global.__APIAP__;
  
  // Debug global state
  console.log('[API CLIENT] APIAP state check:',  
    serverApiap ? `APIAP found with length: ${serverApiap.length}` : 'No APIAP found in available state');
  
  if (!serverApiap) {
    console.error('No valid APIAP string available. Cannot initialize Vulcan API.');
    // List all global properties for debugging
    console.log('[API CLIENT] Available global properties:', Object.keys(global).join(', '));
    throw new Error('No valid API key found. Please authenticate first.');
  }
  
  try {
    // Make sure modules are initialized
    if (!Keypair || !VulcanJwtRegister || !VulcanHebeCe) {
      console.log('[API CLIENT] Initializing server modules...');
      const initialized = await initServerModules();
      if (!initialized) {
        throw new Error('Failed to initialize required modules');
      }
    }
    
    console.log('[API CLIENT] Using server-side APIAP for API initialization...');
    
    const keypair = await (new Keypair()).init();
    console.log('[API CLIENT] Keypair initialized, creating JWT register with APIAP...');
    
    const jwt = await (new VulcanJwtRegister(keypair, serverApiap, 0)).init();
    console.log('[API CLIENT] JWT register successful, RestURL:', jwt.Envelope.RestURL);
    
    const hebe = new VulcanHebeCe(keypair, jwt.Envelope.RestURL);
    console.log('[API CLIENT] Connecting HebeCe...');
    
    await hebe.connect();
    console.log('[API CLIENT] HebeCe connected successfully');
    
    // Ensure global and process.env are in sync
    global.__APIAP__ = serverApiap;
    process.env.RUNTIME_APIAP = serverApiap;
    
    return hebe;
  } catch (error) {
    console.error('[API CLIENT] Failed to initialize Vulcan API:', error);
    throw new Error('Failed to connect to Vulcan API');
  }
};

// API functions with environment check

// Get lessons schedule
export const getLessons = async (startDate: string, endDate: string) => {
  try {
    const hebe = await initVulcan();
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);
    const lessons = await hebe.getLessons(date1, date2);
    return lessons.Envelope || [];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

// Get exams
export const getExams = async (startDate: string, endDate: string) => {
  try {
    const hebe = await initVulcan();
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);
    const exams = await hebe.getExams(date1, date2);
    return exams.Envelope || [];
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

// Get attendance
export const getAttendance = async (startDate: string, endDate: string) => {
  try {
    const hebe = await initVulcan();
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);
    const attendance = await hebe.getAttendance(date1, date2);
    return attendance.Envelope || [];
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

// Get grades
export const getGrades = async () => {
  try {
    const hebe = await initVulcan();
    const grades = await hebe.getGrades();
    return grades.Envelope || [];
  } catch (error) {
    console.error('Error fetching grades:', error);
    throw error;
  }
};

// Get homework
export const getHomework = async (startDate: string, endDate: string) => {
  try {
    console.log(`[API CLIENT DEBUG] getHomework called with dates: ${startDate} to ${endDate}`);
    const hebe = await initVulcan();
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);
    
    console.log(`[API CLIENT DEBUG] Parsed dates: ${date1.toISOString()} to ${date2.toISOString()}`);
    console.log(`[API CLIENT DEBUG] Calling hebe.getHomework...`);
    
    const homework = await hebe.getHomework(date1, date2);
    
    console.log(`[API CLIENT DEBUG] Raw API response:`, homework);
    
    // Check data structure and presence of Envelope
    if (homework && homework.Envelope) {
      console.log(`[API CLIENT DEBUG] Found Envelope with ${Array.isArray(homework.Envelope) ? homework.Envelope.length : 'non-array'} items`);
      return homework.Envelope || [];
    } else if (homework && Array.isArray(homework)) {
      console.log(`[API CLIENT DEBUG] Found array with ${homework.length} items`);
      return homework;
    } else {
      console.log(`[API CLIENT DEBUG] Unexpected data structure:`, homework);
      // Return empty array if data is missing or has unexpected structure
      return [];
    }
  } catch (error) {
    console.error('[API CLIENT DEBUG] Error fetching homework:', error);
    throw error;
  }
};

// Get changed lessons (substitutions)
export const getChangedLessons = async (startDate: string, endDate: string) => {
  try {
    console.log(`[API CLIENT DEBUG] getChangedLessons called with dates: ${startDate} to ${endDate}`);
    const hebe = await initVulcan();
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);
    
    console.log(`[API CLIENT DEBUG] Parsed dates for substitutions: ${date1.toISOString()} to ${date2.toISOString()}`);
    console.log(`[API CLIENT DEBUG] Calling hebe.getChangedLessons...`);
    
    const changedLessons = await hebe.getChangedLessons(date1, date2);
    
    console.log(`[API CLIENT DEBUG] Raw API response for substitutions:`, changedLessons);
    
    // Check data structure and presence of Envelope
    if (changedLessons && changedLessons.Envelope) {
      console.log(`[API CLIENT DEBUG] Found Envelope with ${Array.isArray(changedLessons.Envelope) ? changedLessons.Envelope.length : 'non-array'} substitutions`);
      return changedLessons.Envelope || [];
    } else if (changedLessons && Array.isArray(changedLessons)) {
      console.log(`[API CLIENT DEBUG] Found array with ${changedLessons.length} substitutions`);
      return changedLessons;
    } else {
      console.log(`[API CLIENT DEBUG] Unexpected data structure for substitutions:`, changedLessons);
      // Return empty array if data is missing or has unexpected structure
      return [];
    }
  } catch (error) {
    console.error('[API CLIENT DEBUG] Error fetching substitutions:', error);
    throw error;
  }
}; 