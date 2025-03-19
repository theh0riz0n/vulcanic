import type { NextApiRequest, NextApiResponse } from 'next';
import { validateApiap } from '@/lib/utils/auth-utils';

type ResponseData = {
  success: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { apiap } = req.body;

    // Check if apiap is provided
    if (!apiap) {
      return res.status(400).json({ 
        success: false, 
        error: 'API key is required' 
      });
    }
    
    // Basic validation - Check if the APIAP string seems correctly formatted
    if (typeof apiap !== 'string' || apiap.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'API key is required and must be a non-empty string.'
      });
    }
    
    // Check for required HTML format
    if (!apiap.startsWith('<html>')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid APIAP format. The string must start with <html>'
      });
    }
    
    // Check for required input element
    if (!apiap.includes('<input id="ap" type="hidden" value="')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid APIAP format. The string must contain an input element with id="ap" and type="hidden"'
      });
    }
    
    // Check for closing HTML tags
    if (!apiap.includes('</body></html>')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid APIAP format. The string must end with </body></html>'
      });
    }

    // Log only the length of the APIAP string to avoid sensitive data in logs
    console.log('Validating APIAP string of length:', apiap.length);
    
    // Validate the API key - this also stores it in global.__APIAP__
    const isValid = await validateApiap(apiap);
    console.log('Validation result:', isValid);

    if (isValid) {
      // The APIAP is now stored in global.__APIAP__ directly by validateApiap
      console.log('APIAP validated and ready for API requests');
      
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid API key. Please check the APIAP string and try again.' 
      });
    }
  } catch (error) {
    console.error('API validation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      success: false, 
      error: `Failed to validate API key: ${errorMessage}. Please try again.` 
    });
  }
} 