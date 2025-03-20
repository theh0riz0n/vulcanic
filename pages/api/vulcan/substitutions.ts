import { NextApiRequest, NextApiResponse } from 'next';
import { getChangedLessons } from '@/lib/utils/api-client';
import { withApiConfig } from '@/lib/utils/api-config';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("[API DEBUG] Substitutions API called with query:", req.query);
    
    // Debug global state and process.env APIAP state for debugging
    console.log("[API DEBUG] Checking APIAP states:", {
      globalState: global.__APIAP__ ? `Found with length ${global.__APIAP__.length}` : "Not found",
      processEnvState: process.env.RUNTIME_APIAP ? `Found with length ${process.env.RUNTIME_APIAP.length}` : "Not found"
    });
    
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      console.error("[API DEBUG] Missing required parameters startDate or endDate");
      return res.status(400).json({ error: 'Требуются параметры startDate и endDate' });
    }
    
    // Implement retry logic for API requests
    let attempts = 0;
    const maxAttempts = 2;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`[API DEBUG] Fetching substitutions for date range: ${startDate} to ${endDate} (Attempt ${attempts + 1}/${maxAttempts})`);
        const substitutions = await getChangedLessons(startDate as string, endDate as string);
        
        if (substitutions && Array.isArray(substitutions)) {
          console.log(`[API DEBUG] Received ${substitutions.length} substitutions`);
          if (substitutions.length > 0) {
            console.log("[API DEBUG] Sample substitution:", substitutions[0]);
          }
        } else {
          console.log("[API DEBUG] Unexpected response format:", substitutions);
        }
        
        return res.status(200).json(substitutions);
      } catch (error) {
        lastError = error;
        console.error(`[API DEBUG] Error in substitutions API (Attempt ${attempts + 1}/${maxAttempts}):`, error);
        
        // Check if error is related to API key issues
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isApiKeyError = 
          errorMessage.includes('No valid API key') || 
          errorMessage.includes('API key not found') || 
          errorMessage.includes('Failed to connect to Vulcan API');
        
        if (isApiKeyError) {
          console.log('[API DEBUG] API key error detected, retrying with fresh global/process state sync');
          
          // If we have process.env APIAP but not global, sync them
          if (!global.__APIAP__ && process.env.RUNTIME_APIAP) {
            console.log('[API DEBUG] Restoring global.__APIAP__ from process.env.RUNTIME_APIAP');
            global.__APIAP__ = process.env.RUNTIME_APIAP;
          }
          
          // If we have global APIAP but not process.env, sync them
          if (global.__APIAP__ && !process.env.RUNTIME_APIAP) {
            console.log('[API DEBUG] Restoring process.env.RUNTIME_APIAP from global.__APIAP__');
            process.env.RUNTIME_APIAP = global.__APIAP__;
          }
        }
        
        attempts++;
        
        // If this is not the last attempt, wait 1 second before retrying
        if (attempts < maxAttempts) {
          console.log('[API DEBUG] Waiting 1 second before retry...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // If we've exhausted retries, return the last error
    console.error('[API DEBUG] All retry attempts failed');
    return res.status(500).json({ 
      error: 'Ошибка при получении данных о заменах. Пожалуйста, выйдите из системы и войдите снова.' 
    });
  } catch (error) {
    console.error('[API DEBUG] Unhandled error in substitutions API:', error);
    return res.status(500).json({ 
      error: 'Ошибка при получении данных о заменах. Пожалуйста, попробуйте еще раз.' 
    });
  }
}

export default withApiConfig(handler); 