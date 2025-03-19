import { useState, useEffect } from 'react';
import axios from 'axios';

type DateRange = {
  startDate: string;
  endDate: string;
};

export const useVulcanData = (type: 'lessons' | 'exams' | 'attendance' | 'grades' | 'homework', dateRange?: DateRange) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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
            response = await axios.get(apiUrl);
            break;
            
          case 'exams':
            if (!dateRange) throw new Error('Date range is required for exams');
            apiUrl = `/api/vulcan/exams?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
            console.log(`[DEBUG] Fetching exams: ${apiUrl}`);
            response = await axios.get(apiUrl);
            break;
            
          case 'attendance':
            if (!dateRange) throw new Error('Date range is required for attendance');
            apiUrl = `/api/vulcan/attendance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
            console.log(`[DEBUG] Fetching attendance: ${apiUrl}`);
            response = await axios.get(apiUrl);
            break;
            
          case 'grades':
            apiUrl = '/api/vulcan/grades';
            console.log(`[DEBUG] Fetching grades: ${apiUrl}`);
            response = await axios.get(apiUrl);
            break;
            
          case 'homework':
            if (!dateRange) throw new Error('Date range is required for homework');
            apiUrl = `/api/vulcan/homework?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
            console.log(`[DEBUG] Fetching homework: ${apiUrl}`);
            response = await axios.get(apiUrl);
            break;
            
          default:
            throw new Error(`Unsupported data type: ${type}`);
        }
        
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
      } catch (err: any) {
        console.error(`[DEBUG] Error fetching ${type} data:`, err);
        console.error(`[DEBUG] Error details:`, err.response?.data || err.message);
        setError(new Error(err.response?.data?.error || err.message || `Failed to fetch ${type} data`));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [type, dateRange?.startDate, dateRange?.endDate]);

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