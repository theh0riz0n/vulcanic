import { useState, useEffect } from 'react';
import axios from 'axios';
import { useApiap } from '@/context/ApiapContext';

type DateRange = {
  startDate: string;
  endDate: string;
};

export const useVulcanData = (type: 'lessons' | 'exams' | 'attendance' | 'grades' | 'homework' | 'substitutions', dateRange?: DateRange) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { refreshApiap } = useApiap();

  useEffect(() => {
    let isMounted = true;
    let cancelTokenSource = axios.CancelToken.source();
    
    const fetchData = async (retry = false) => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        let response;
        let apiUrl = '';
        
        switch (type) {
          case 'lessons':
            if (!dateRange) throw new Error('Date range is required for lessons');
            apiUrl = `/api/vulcan/lessons?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
            console.log(`[DEBUG] Fetching lessons: ${apiUrl}`);
            response = await axios.get(apiUrl, {
              cancelToken: cancelTokenSource.token
            });
            break;
            
          case 'exams':
            if (!dateRange) throw new Error('Date range is required for exams');
            apiUrl = `/api/vulcan/exams?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
            console.log(`[DEBUG] Fetching exams: ${apiUrl}`);
            response = await axios.get(apiUrl, {
              cancelToken: cancelTokenSource.token
            });
            break;
            
          case 'attendance':
            if (!dateRange) throw new Error('Date range is required for attendance');
            apiUrl = `/api/vulcan/attendance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
            console.log(`[DEBUG] Fetching attendance: ${apiUrl}`);
            response = await axios.get(apiUrl, {
              cancelToken: cancelTokenSource.token
            });
            break;
            
          case 'grades':
            apiUrl = '/api/vulcan/grades';
            console.log(`[DEBUG] Fetching grades: ${apiUrl}`);
            response = await axios.get(apiUrl, {
              cancelToken: cancelTokenSource.token
            });
            break;
            
          case 'homework':
            if (!dateRange) throw new Error('Date range is required for homework');
            apiUrl = `/api/vulcan/homework?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
            console.log(`[DEBUG] Fetching homework: ${apiUrl}`);
            response = await axios.get(apiUrl, {
              cancelToken: cancelTokenSource.token
            });
            break;
            
          case 'substitutions':
            if (!dateRange) throw new Error('Date range is required for substitutions');
            apiUrl = `/api/vulcan/substitutions?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
            console.log(`[DEBUG] Fetching substitutions: ${apiUrl}`);
            response = await axios.get(apiUrl, {
              cancelToken: cancelTokenSource.token
            });
            break;
            
          default:
            throw new Error(`Unsupported data type: ${type}`);
        }
        
        // Only process response if component is still mounted
        if (isMounted) {
          console.log(`[DEBUG] API response for ${type}:`, response);
          
          if (response.data && Array.isArray(response.data)) {
            setData(response.data);
          } else if (response.data && response.data.Envelope && Array.isArray(response.data.Envelope)) {
            console.log(`[DEBUG] Extracted array from Envelope for ${type}`);
            setData(response.data.Envelope);
          } else {
            console.warn(`[DEBUG] Unexpected API response format for ${type}:`, response.data);
            setData([]);
          }
        }
      } catch (err: any) {
        // Only process errors if component is still mounted
        if (!isMounted) return;
        
        // Ignore canceled requests
        if (axios.isCancel(err)) {
          console.log(`[DEBUG] ${type} request canceled:`, err.message);
          return;
        }
        
        console.error(`[DEBUG] Error fetching ${type} data:`, err);
        console.error(`[DEBUG] Error details:`, err.response?.data || err.message);
        
        // Check if error is due to invalid API key or authentication
        const errorMessage = err.response?.data?.error || err.message || '';
        const isApiKeyError = 
          errorMessage.includes('API key') || 
          errorMessage.includes('APIAP') || 
          errorMessage.includes('authenticate') || 
          errorMessage.includes('auth') ||
          (err.response?.status === 401);
        
        // If API key error and not already retrying, try to refresh the APIAP
        if (isApiKeyError && !retry && isMounted) {
          console.log('[DEBUG] Authentication error detected, attempting to refresh APIAP...');
          try {
            const refreshed = await refreshApiap();
            if (refreshed && isMounted) {
              console.log('[DEBUG] APIAP refreshed successfully, retrying API call...');
              // Retry the API call with the refreshed token
              return fetchData(true);
            } else if (isMounted) {
              console.error('[DEBUG] Failed to refresh APIAP');
              setError(new Error('Your authentication has expired. Please log out and log in again.'));
            }
          } catch (refreshError) {
            if (isMounted) {
              console.error('[DEBUG] Error during APIAP refresh:', refreshError);
              setError(new Error('Your authentication has expired. Please log out and log in again.'));
            }
          }
        } else if (isMounted) {
          setError(new Error(errorMessage || `Failed to fetch ${type} data`));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Start the data fetch
    fetchData().catch(err => {
      // Handle any uncaught errors in the async function
      if (isMounted && !axios.isCancel(err)) {
        console.error(`[DEBUG] Uncaught error in ${type} data fetch:`, err);
        setError(new Error(`An unexpected error occurred: ${err.message}`));
        setIsLoading(false);
      }
    });
    
    // Cleanup function
    return () => {
      // Set mounted flag to false first
      isMounted = false;
      
      try {
        // Then cancel any in-flight requests
        cancelTokenSource.cancel('Component unmounted');
        // Don't log the cancellation to avoid the "Component unmounted" error in the UI
      } catch (err) {
        // Silently handle any errors during cleanup
        console.error(`[DEBUG] Error during ${type} request cleanup:`, err);
      }
    };
  }, [type, dateRange?.startDate, dateRange?.endDate, refreshApiap]);

  return { data, isLoading, error };
};

// Хук для получения данных текущей недели
export const useCurrentWeekData = (type: 'lessons' | 'exams' | 'attendance' | 'homework' | 'substitutions') => {
  const getExtendedWeekRange = (): DateRange => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday is 1, Sunday is 0.

    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - diff);

    const extendedStart = new Date(currentMonday);
    extendedStart.setDate(currentMonday.getDate() - 7);

    const extendedEnd = new Date(currentMonday);
    extendedEnd.setDate(currentMonday.getDate() + 20); // Monday + 6 (end of week) + 7 (next week) + 7 (buffer)

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const result = {
      startDate: formatDate(extendedStart),
      endDate: formatDate(extendedEnd),
    };
    
    console.log(`[DEBUG] ${type} - Requesting data for extended date range:`, result);
    
    return result;
  };
  
  const dateRange = getExtendedWeekRange();
  const result = useVulcanData(type, dateRange);
  
  // Отладка: вывод результата API запроса
  if (result.data) {
    console.log(`[DEBUG] ${type} - Received ${result.data.length} items from API`);
  } else if (result.error) {
    console.error(`[DEBUG] ${type} - API Error:`, result.error);
  } else {
    console.log(`[DEBUG] ${type} - Loading data...`);
  }
  
  return result;
};

// Хук для получения данных на текущий месяц
export const useCurrentMonthData = (type: 'lessons' | 'exams' | 'attendance' | 'homework' | 'substitutions') => {
  const getCurrentMonthRange = (): DateRange => {
    const now = new Date();
    
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay),
    };
  };
  
  const dateRange = getCurrentMonthRange();
  return useVulcanData(type, dateRange);
}; 

export const useCurrentDayData= (type: 'lessons' | 'exams' | 'attendance' | 'homework' | 'substitutions') => {
  const getCurrentDayRange = (): DateRange => {
    const now = new Date();

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const dateStr = formatDate(now);
    
    return {
      startDate: dateStr,
      endDate: dateStr,
    };
  };
  
  const dateRange = getCurrentDayRange();
  return useVulcanData(type, dateRange);
};
