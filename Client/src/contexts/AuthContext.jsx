import React, { createContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const [token, setToken] = useState(cookies.token || '');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
    let errorMessage = defaultMessage;
    const responseData = error.response?.data;
    
    if (responseData) {
      const detail = responseData.detail;
      if (detail) {
        if (detail.error) {
          try {
            // Extraction de la partie JSON après le premier ':' 
            const innerErrorParts = detail.error.split(/:(.+)/);
            const innerErrorStr = innerErrorParts[1]?.trim();
            
            if (innerErrorStr) {
              // Correction des guillemets pour un JSON valide
              const validJson = innerErrorStr.replace(/'/g, '"');
              const innerError = JSON.parse(validJson);
              errorMessage = innerError.message || detail.message || errorMessage;
            } else {
              errorMessage = detail.message || errorMessage;
            }
          } catch (e) {
            // En cas d'échec du parsing, utiliser le message de base
            errorMessage = detail.message || detail.error || errorMessage;
          }
        } else {
          errorMessage = detail.message || errorMessage;
        }
      } else {
        errorMessage = responseData.error || errorMessage;
      }
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    return errorMessage;
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/user/signin`, credentials);
      
      if (data.access_token) {
        setToken(data.access_token);
        setCookie('token', data.access_token, { path: '/' });
        return true;
      }
      return false;
    } catch (error) {
      setError(getErrorMessage(error, 'Login failed'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/user/signup`, userData);
      return true;
    } catch (error) {
      setError(getErrorMessage(error, 'Échec de l\'inscription'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/auth/google`, {
        token: response.credential
      });

      if (data.access_token) {
        setToken(data.access_token);
        setCookie('token', data.access_token, { path: '/' });
        return true;
      }
      return false;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to authenticate with Google');
      setError(`Google login failed: ${message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Appel à l'API de déconnexion
      await axios.post(`${API_URL}/user/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Nettoyage des données locales
      setToken('');
      setUser(null);
      removeCookie('token', { path: '/' });
      return true;
    } catch (error) {
      setError(getErrorMessage(error, 'Logout failed'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        signup,
        logout,
        handleGoogleLogin,
        isAuthenticated: !!token,
        isLoading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};