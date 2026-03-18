/* eslint-disable no-console */
/**
 * Professional API Client with Interceptors
 */

import axios from 'axios';

// Create axios instance with configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Response Interceptor - Handle response data and errors
 */
apiClient.interceptors.response.use(
  response => {
    // Handle non-JSON responses (text, HTML, etc.)
    if (response.headers['content-type'] && !response.headers['content-type'].includes('json')) {
      console.warn('[API] Non-JSON response received', {
        contentType: response.headers['content-type'],
        url: response.config.url
      });
    }

    // Log success in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[API] ${response.config.method.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }

    // Return response data or response object if no data
    return response.data || response;
  },
  error => {
    // Handle error responses - check if response exists
    let errorData = {};
    let errorMessage = 'An error occurred';

    if (error.response) {
      // Server responded with error status
      errorData = error.response.data || {};
      
      // Handle non-JSON error responses
      if (typeof errorData === 'string') {
        errorMessage = errorData; // Plain text error
      } else if (typeof errorData === 'object') {
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      }
    } else if (error.message) {
      // Network error or request error
      errorMessage = error.message;
    }

    const errorCode = (errorData.error?.code || errorData.code) || 'UNKNOWN_ERROR';
    const status = error.response?.status;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        status,
        code: errorCode,
        message: errorMessage,
        url: error.config?.url,
        data: errorData,
        type: error.message
      });
    }

    // Handle specific error cases
    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        break;
      case 403:
        // Forbidden - user doesn't have permission
        errorMessage = 'You do not have permission to perform this action';
        break;
      case 422:
      case 400:
        // Validation error
        break;
      case 429:
        errorMessage = 'Too many requests. Please try again later.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = 'Server error. Please try again later.';
        break;
      default:
        if (!error.response) {
          errorMessage = 'Network error. Please check your connection.';
        }
    }

    // Return error object with consistent structure
    return Promise.reject({
      message: errorMessage,
      code: errorCode,
      status,
      details: typeof errorData === 'object' ? (errorData.error?.details || null) : errorData,
      originalError: error
    });
  }
);

/**
 * Request Interceptor - Add auth token and set headers
 */
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  error => Promise.reject(error)
);

export default apiClient;
