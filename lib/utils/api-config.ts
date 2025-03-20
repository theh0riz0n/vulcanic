import { NextApiRequest, NextApiResponse } from 'next';
import { getUserData } from './auth-utils';
import { setServerSideApiap } from './api-client';

/**
 * Format the APIAP string for use
 */
const formatApiap = (apiapString: string): string => {
  try {
    // If it already has HTML structure, use it as is
    if (apiapString.startsWith('<html>')) {
      return apiapString;
    }
    
    // Try to parse as JSON if it looks like JSON
    let jsonData = {};
    if (apiapString.trim().startsWith('{')) {
      jsonData = JSON.parse(apiapString);
    } else {
      // Try to extract from HTML format
      const match = apiapString.match(/<input id="ap" type="hidden" value="(.*?)"><\/body>/);
      if (match && match[1]) {
        const htmlDecodedJson = match[1].replace(/&quot;/g, '"');
        jsonData = JSON.parse(htmlDecodedJson);
      }
    }
    
    // Create properly formatted APIAP string
    return `<html><head></head><body><input id="ap" type="hidden" value='${JSON.stringify(jsonData)}' /></body></html>`;
  } catch (error) {
    console.error('[API CONFIG] Failed to format APIAP string:', error);
    throw new Error('Invalid APIAP string format');
  }
};

/**
 * Centralized API configuration handler
 * This ensures that all API routes have access to the APIAP data
 */
export const withApiConfig = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Create a case-insensitive lookup for headers
      let apiapFromHeader: string | undefined;
      
      // Look for the x-apiap header regardless of case
      for (const key of Object.keys(req.headers)) {
        if (key.toLowerCase() === 'x-apiap') {
          // Handle header value which could be string, string[] or undefined
          const headerValue = req.headers[key];
          if (headerValue !== undefined) {
            // Take the first value if it's an array, or use as is if it's a string
            apiapFromHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue;
          }
          break;
        }
      }
      
      // If APIAP was passed in header, use it
      if (apiapFromHeader) {
        console.log('[API CONFIG] APIAP provided in request header with length:', apiapFromHeader.length);
        try {
          // Format and validate the APIAP string
          const formattedApiap = formatApiap(apiapFromHeader);
          console.log('[API CONFIG] Successfully formatted APIAP string');
          // Store in both global and process.env
          global.__APIAP__ = formattedApiap;
          process.env.RUNTIME_APIAP = formattedApiap;
          console.log('[API CONFIG] APIAP stored in both global and process.env');
        } catch (error) {
          console.error('[API CONFIG] Failed to process APIAP from header:', error);
          return res.status(401).json({ error: 'Invalid APIAP string format' });
        }
      } else {
        // Check multiple sources for APIAP in this priority: global, process.env
        if (global.__APIAP__) {
          console.log('[API CONFIG] Using existing server-side APIAP from global state with length:', global.__APIAP__.length);
          // Ensure process.env is synced with global
          process.env.RUNTIME_APIAP = global.__APIAP__;
        } else if (process.env.RUNTIME_APIAP) {
          console.log('[API CONFIG] Using existing server-side APIAP from process.env with length:', process.env.RUNTIME_APIAP.length);
          // Sync global with process.env
          global.__APIAP__ = process.env.RUNTIME_APIAP;
        } else {
          console.log('[API CONFIG] No APIAP available in headers, global state, or process.env');
          console.log('[API CONFIG] Available headers:', Object.keys(req.headers).join(', '));
          return res.status(401).json({ error: 'No valid API key found. Please authenticate first.' });
        }
      }
      
      // Always call setServerSideApiap to ensure all sources are synced
      if (global.__APIAP__) {
        setServerSideApiap(global.__APIAP__);
      }
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('[API CONFIG] Error in API configuration:', error);
      return res.status(500).json({ error: 'Internal server error in API configuration' });
    }
  };
}; 