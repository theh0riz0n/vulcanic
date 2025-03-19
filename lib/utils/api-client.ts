// Dynamic imports will only work on the server
let Keypair: any, VulcanJwtRegister: any, VulcanHebeCe: any;
// Check if we are on the server
const isServer = typeof window === 'undefined';

if (isServer) {
  // Import modules only on the server
  const hebece = require('hebece');
  Keypair = hebece.Keypair;
  VulcanJwtRegister = hebece.VulcanJwtRegister;
  VulcanHebeCe = hebece.VulcanHebeCe;
}

// Store APIAP string directly in code for client access
const APIAP_VULCAN = '<html><head></head><body><input id="ap" type="hidden" value="{&quot;Tokens&quot;:[&quot;eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTWFrc3ltIE1vcnlrb24gKFpTRS1JKSIsInVpZCI6IjNkYzU3ZWQwLTk2NjgtNDAyZS04MmU5LTUzYzBkYTVmOGFiYSIsInRlbmFudCI6ImxvZHoiLCJ1bml0dWlkIjoiNjdiMTA2NDktOWRjZS00NzM4LTlhMzItODhlM2M3YzFlYzg4IiwidXJpIjoiaHR0cHM6Ly91Y3plbi5lZHV2dWxjYW4ucGwvbG9kei9zdGFydD9wcm9maWw9M2RjNTdlZDAtOTY2OC00MDJlLTgyZTktNTNjMGRhNWY4YWJhIiwic2VydmljZSI6IlRydWUiLCJjYXBzIjoiW1wiRURVVlVMQ0FOX1BSRU1JVU1cIl0iLCJuYmYiOjE3NDIxNTM2NDEsImV4cCI6MTc0MjE1NzI0MSwiaWF0IjoxNzQyMTUzNjQxfQ.T6pn5UFokG21_cd0FbZJ84NInbtpfJn6o5vOEO8phbLJ0uQix86ECEXUNSOcpTQUTjhCbKlcsl4tvXMQ1Sx5X-fRdgritrY-bMSuDMKYzMp5KU-eXINZBhAVXDl71caKs_eNeFnpjXor0UL0NutHCKZet8RIlIiA8uEme8xtbYxrKw1ENd7GmDGnUC8jt4mY3gSfhKdP09OwFYqX6IKwUYHvJSCqE6CmzUJ1sw-vTXSg8jKedMbZ0Z6gVtaevadS-JHiL7FN2EZe36ROBOjOP6PXGAdRdLF1OwfbLUqsHdtR2eM61CflovndB6VsJUM4ucmBEmB1O81OtdBt0OjyGQ&quot;],&quot;Alias&quot;:&quot;artemka141008.9@gmail.com&quot;,&quot;Email&quot;:&quot;artemka141008.9@gmail.com&quot;,&quot;EmailCandidate&quot;:null,&quot;GivenName&quot;:null,&quot;Surname&quot;:null,&quot;IsConsentAccepted&quot;:true,&quot;CanAcceptConsent&quot;:true,&quot;AccessToken&quot;:&quot;eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiOTMzMmU5YmYtOGU1ZS00NDVlLTllNzktOTUxYTYzZjdkNzMyIiwiZ3VpZCI6IjVmMWFkNGE0LTU0NTctNDA3OC05MjQxLWFjMWI3OThkYjAxNSIsImh0dHA6Ly9zY2hlbWFzLnZ1bGNhbi5lZHUucGwvd3MvaWRlbnRpdHkvY2xhaW1zL3Byb21ldGV1c3ovYWxpYXMiOiJhcnRlbWthMTQxMDA4LjlAZ21haWwuY29tIiwibmJmIjoxNzQyMTUzNjQxLCJleHAiOjE3NzM2ODk2NDEsImlhdCI6MTc0MjE1MzY0MX0.ZTtfsi57_7D9kUL_RRwKHjZDhFM4VrB-xyhvjevXBVKHeTbvAsb8M11qXPFx8-g5MG-hj-l9DXe95joIt7M_T4gRVk4PlGZ4uChBX5tsKQLDF-tlPL1lU9KIovVCHvxYO0vBkZ8ClqvWfn3QDa361fh9PfRbSj615QDlMZQb0KW1x_2A_8rb6AB7eXJlK-rZKVN4Tefnpm1s7P9PjhHylqTREn5ScIOFaBM9gip2QN26SLzx9U6AMLkl-MPHCYtkip2kv8KeDoDwx0VMdGpY8MvFWJ8HWrQL8a9DdQQ46zgqGTA8BQwhTzgCOtb5qiIk3CDtMjR0QvNC7eTEikcFPA&quot;,&quot;Capabilities&quot;:[&quot;EMAIL_CONFIRMATION&quot;],&quot;Success&quot;:true,&quot;ErrorMessage&quot;:null}"></body></html>';

// Extract JSON data from APIAP
let jsonData;
try {
  const match = APIAP_VULCAN.match(/<input id="ap" type="hidden" value="(.*?)"><\/body>/);
  if (match && match[1]) {
    const htmlDecodedJson = match[1].replace(/&quot;/g, '"');
    jsonData = JSON.parse(htmlDecodedJson);
  } else {
    if (isServer) {
      console.error('Could not extract JSON from APIAP_VULCAN environment variable');
    } else {
      console.error('Could not extract JSON from APIAP_VULCAN');
    }
    // Use empty object to avoid errors
    jsonData = {};
  }
} catch (error) {
  console.error('Error parsing APIAP_VULCAN:', error);
  // Use empty object to avoid errors
  jsonData = {};
}

// Create string for VulcanJwtRegister
const apiap = `<html><head></head><body><input id="ap" type="hidden" value='${JSON.stringify(jsonData)}' /></body></html>`;

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
  
  try {
    const keypair = await (new Keypair()).init();
    const jwt = await (new VulcanJwtRegister(keypair, apiap, 0)).init();
    const hebe = new VulcanHebeCe(keypair, jwt.Envelope.RestURL);
    await hebe.connect();
    return hebe;
  } catch (error) {
    console.error('Failed to initialize Vulcan API:', error);
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