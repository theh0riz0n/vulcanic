import { useState } from 'react';
import { useApiap } from '@/context/ApiapContext';

// Custom hook for making API calls to the Vulcan API endpoints
export function useVulcanAPI() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useApiap();
  
  // Helper function to construct request with auth headers
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get authentication headers (including APIAP)
      const headers = {
        ...getAuthHeaders(),
        ...options.headers,
      };
      
      // Make request with authentication
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API returned status ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error(`API request error (${url}):`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch lessons for a date range
  const getLessons = async (startDate: string, endDate: string) => {
    return makeAuthenticatedRequest(
      `/api/vulcan/lessons?startDate=${startDate}&endDate=${endDate}`
    );
  };
  
  // Fetch homework for a date range
  const getHomework = async (startDate: string, endDate: string) => {
    return makeAuthenticatedRequest(
      `/api/vulcan/homework?startDate=${startDate}&endDate=${endDate}`
    );
  };
  
  // Fetch exams for a date range
  const getExams = async (startDate: string, endDate: string) => {
    return makeAuthenticatedRequest(
      `/api/vulcan/exams?startDate=${startDate}&endDate=${endDate}`
    );
  };
  
  // Fetch attendance for a date range
  const getAttendance = async (startDate: string, endDate: string) => {
    return makeAuthenticatedRequest(
      `/api/vulcan/attendance?startDate=${startDate}&endDate=${endDate}`
    );
  };
  
  // Fetch grades
  const getGrades = async () => {
    return makeAuthenticatedRequest('/api/vulcan/grades');
  };
  
  return {
    loading,
    error,
    getLessons,
    getHomework,
    getExams,
    getAttendance,
    getGrades,
  };
} 