import { useState, useEffect } from 'react';
import axios from 'axios';
import { useApiap } from '@/context/ApiapContext';

type DateRange = {
  startDate: string;
  endDate: string;
};

export const useVulcanData = (type: 'lessons' | 'exams' | 'attendance' | 'grades' | 'homework', dateRange?: DateRange) => {
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
export const useCurrentWeekData = (type: 'lessons' | 'exams' | 'attendance' | 'homework') => {
  const getExtendedWeekRange = (): DateRange => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Если сегодня воскресенье, разница 6 дней
    
    // Начало текущей недели (понедельник)
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - diff);
    currentMonday.setHours(0, 0, 0, 0);
    
    // Конец текущей недели (воскресенье)
    const currentSunday = new Date(currentMonday);
    currentSunday.setDate(currentMonday.getDate() + 6);
    currentSunday.setHours(23, 59, 59, 999);
    
    // Расширенный диапазон: неделя назад
    const extendedStart = new Date(currentMonday);
    extendedStart.setDate(currentMonday.getDate() - 7);
    
    // Расширенный диапазон: неделя вперед
    const extendedEnd = new Date(currentSunday);
    extendedEnd.setDate(currentSunday.getDate() + 7);
    
    const result = {
      startDate: extendedStart.toISOString().split('T')[0],
      endDate: extendedEnd.toISOString().split('T')[0],
    };
    
    // Отладка: вывод диапазона дат для API запроса
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
export const useCurrentMonthData = (type: 'lessons' | 'exams' | 'attendance' | 'homework') => {
  const getCurrentMonthRange = (): DateRange => {
    const now = new Date();
    
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: firstDay.getFullYear() + '-' + String(firstDay.getMonth() + 1).padStart(2, '0') + '-' + String(firstDay.getDate()).padStart(2, '0'),
      endDate: lastDay.getFullYear() + '-' + String(lastDay.getMonth() + 1).padStart(2, '0') + '-' + String(lastDay.getDate()).padStart(2, '0'),
    };
  };
  
  const dateRange = getCurrentMonthRange();
  return useVulcanData(type, dateRange);
}; 

export const useCurrentDayData= (type: 'lessons' | 'exams' | 'attendance' | 'homework') => {
  const getCurrentDayRange = (): DateRange => {
    const now = new Date();
    
    const firstDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    console.log(`[DEBUG] ${type} - Requesting data for extended date range:`, firstDay);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    console.log(`[DEBUG] ${type} - Requesting data for extended date range:`, lastDay);
    console.log(firstDay.getFullYear() + '-' + String(firstDay.getMonth() + 1).padStart(2, '0') + '-' + String(firstDay.getDate()).padStart(2, '0'));
    console.log(lastDay.getFullYear() + '-' + String(lastDay.getMonth() + 1).padStart(2, '0') + '-' + String(lastDay.getDate()).padStart(2, '0'));
    
    // Original dates without time offset
    return {
      startDate: firstDay.getFullYear() + '-' + String(firstDay.getMonth() + 1).padStart(2, '0') + '-' + String(firstDay.getDate()).padStart(2, '0'),
      endDate: lastDay.getFullYear() + '-' + String(lastDay.getMonth() + 1).padStart(2, '0') + '-' + String(lastDay.getDate()).padStart(2, '0'),
    };

    // Subtract 1 hour from dates
    
    // return {
    //   startDate: firstDay.getFullYear() + '-' + String(firstDay.getMonth() + 1).padStart(2, '0') + '-' + String(firstDay.getDate()).padStart(2, '0'),
    //   endDate: lastDay.getFullYear() + '-' + String(lastDay.getMonth() + 1).padStart(2, '0') + '-' + String(lastDay.getDate()).padStart(2, '0'),
    // };
  };
  
  const dateRange = getCurrentDayRange();
  return useVulcanData(type, dateRange);
}; 