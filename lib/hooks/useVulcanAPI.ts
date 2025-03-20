import { useState } from 'react';
import { useApiap } from '@/context/ApiapContext';
// usevulcanapi
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
      const authHeaders = getAuthHeaders();
      
      // Create a Map to store normalized headers
      const headerMap = new Map<string, string>();
      
      // Helper function to normalize header name
      const normalizeHeaderName = (name: string): string => name.toLowerCase();
      
      // Helper function to set a header with case-insensitive deduplication
      const setNormalizedHeader = (name: string, value: string | null | undefined) => {
        if (value !== undefined && value !== null) {
          headerMap.set(normalizeHeaderName(name), String(value));
        }
      };
      
      // Process auth headers first, but skip Content-Type
      Object.entries(authHeaders).forEach(([key, value]) => {
        if (normalizeHeaderName(key) !== 'content-type') {
          setNormalizedHeader(key, value);
        }
      });
      
      // Process input headers, which should take precedence over auth headers
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            setNormalizedHeader(key, value);
          });
        } else if (typeof options.headers === 'object') {
          Object.entries(options.headers).forEach(([key, value]) => {
            setNormalizedHeader(key, value);
          });
        }
      }
      
      // Set default Content-Type only if no Content-Type header exists
      if (!headerMap.has('content-type')) {
        headerMap.set('content-type', 'application/json');
      }
      
      // Create final Headers object with deduplicated values
      const headers = new Headers();
      headerMap.forEach((value, key) => {
        // Preserve proper header casing for well-known headers
        const properCase = key === 'content-type' ? 'Content-Type' : 
                         key === 'x-apiap' ? 'X-APIAP' : key;
        headers.set(properCase, value);
      });
      
      // Check for X-APIAP header
      const hasApiapHeader = headerMap.has('x-apiap');
      const apiapValue = headerMap.get('x-apiap');
      const isValidApiapHeader = hasApiapHeader && apiapValue && apiapValue.trim() !== '';
      
      console.log('Making authenticated request:', 
        isValidApiapHeader ? 'X-APIAP header is present and valid' : 'X-APIAP header is missing or invalid');
      
      if (!isValidApiapHeader) {
        throw new Error('X-APIAP header is required and must not be empty');
      }
      
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