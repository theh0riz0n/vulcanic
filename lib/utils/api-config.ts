import { NextApiRequest, NextApiResponse } from 'next';
import { getUserData } from './auth-utils';
import { setServerSideApiap } from './api-client';

/**
 * Centralized API configuration handler
 * This ensures that all API routes have access to the APIAP data
 */
export const withApiConfig = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get APIAP from request headers if available
      const apiapFromHeader = req.headers['x-apiap'] as string;
      
      // If APIAP was passed in header, use it
      if (apiapFromHeader) {
        console.log('[API CONFIG] APIAP provided in request header with length:', apiapFromHeader.length);
        global.__APIAP__ = apiapFromHeader;
      } else {
        // Check if we already have a server-side APIAP cache
        if (global.__APIAP__) {
          console.log('[API CONFIG] Using existing server-side APIAP cache with length:', global.__APIAP__.length);
        } else {
          console.log('[API CONFIG] No APIAP available in headers or global state');
        }
      }
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('[API CONFIG] Error in API configuration:', error);
      return res.status(500).json({ error: 'Internal server error in API configuration' });
    }
  };
}; 