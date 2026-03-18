/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // Fetch current user info
  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await apiClient.get('/auth/me');
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      // If unauthorized, clear token
      if (err.status === 401) {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch user when token changes
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Login function
  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/auth/login', {
        username,
        password
      });

      const { token: newToken, user: userData } = response;

      // Store token
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/auth/register', userData);
      return { success: true, user: response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const response = await apiClient.post('/auth/refresh', {});
      const { token: newToken } = response;
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      return true;
    } catch (err) {
      logout();
      return false;
    }
  }, [logout]);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: !!token && !!user,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
