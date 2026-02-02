import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getStoredUser, getStoredToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredToken();
      const storedUser = getStoredUser();
      
      if (token && storedUser) {
        // Ensure userType is set for consistency
        if (!storedUser.userType && storedUser.role) {
          storedUser.userType = storedUser.role;
        }
        setUser(storedUser);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials.email, credentials.password, 'customer');
      
      const userData = response.data?.user || response.user;
      const token = response.data?.token || response.token;
      
      if (userData && !userData.profilePhoto) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.profilePhoto) {
          userData.profilePhoto = storedUser.profilePhoto;
        }
      }
      
      if (userData && !userData.userType && userData.role) {
        userData.userType = userData.role;
      }
      
      // Store user and token in localStorage
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      setUser(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.registerCustomer(userData);
      
      const userDataFromResponse = response.data?.user || response.user;
      const token = response.data?.token || response.token;
      
      // Ensure userType is set for consistency
      if (userDataFromResponse && !userDataFromResponse.userType && userDataFromResponse.role) {
        userDataFromResponse.userType = userDataFromResponse.role;
      }
      // Store user and token in localStorage
      if (userDataFromResponse) {
        localStorage.setItem('user', JSON.stringify(userDataFromResponse));
      }
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      setUser(userDataFromResponse);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userLocation');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
