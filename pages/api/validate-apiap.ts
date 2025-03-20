import { validateApiap } from '@/lib/utils/auth-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { setServerSideApiap } from '@/lib/utils/api-client';

/**
 * API endpoint to validate APIAP strings
 * This is used during authentication to verify that the APIAP is valid
 * and can connect to the Vulcan API
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiap } = req.body;

    // Check if apiap is provided
    if (!apiap) {
      return res.status(400).json({
        error: 'Missing APIAP string in request body'
      });
    }

    // Basic validation - Check if the APIAP string seems correctly formatted
    if (typeof apiap !== 'string' || apiap.trim() === '') {
      return res.status(400).json({
        error: 'Invalid APIAP format. The string must be a non-empty string'
      });
    }

    // Basic validation - Check if the APIAP string is HTML-like
    if (!apiap.startsWith('<html>')) {
      return res.status(400).json({
        error: 'Invalid APIAP format. The string must start with <html>'
      });
    }

    // Basic validation - Check for input element
    if (!apiap.includes('<input id="ap" type="hidden" value="')) {
      return res.status(400).json({
        error: 'Invalid APIAP format. The string must contain an input element with id="ap" and type="hidden"'
      });
    }

    // Basic validation - Check for closing HTML
    if (!apiap.includes('</body></html>')) {
      return res.status(400).json({
        error: 'Invalid APIAP format. The string must end with </body></html>'
      });
    }

    // Log only the length of the APIAP string to avoid sensitive data in logs
    console.log('Validating APIAP string of length:', apiap.length);

    // Validate the API key - this also stores it in global.__APIAP__ and process.env.RUNTIME_APIAP
    const isValid = await validateApiap(apiap);

    if (isValid) {
      // The APIAP is now stored in both global.__APIAP__ and process.env.RUNTIME_APIAP directly by validateApiap
      console.log('APIAP validated and ready for API requests');
      
      // Double ensure that setServerSideApiap is called to persist across serverless function restarts
      if (global.__APIAP__) {
        setServerSideApiap(global.__APIAP__);
      }
      
      return res.status(200).json({ success: true });
    }

    return res.status(401).json({
      error: 'Invalid API key. Please check the APIAP string and try again.'
    });
  } catch (error) {
    console.error('Error validating APIAP:', error);
    return res.status(500).json({
      error: 'Failed to validate APIAP. Please try again.'
    });
  }
} 