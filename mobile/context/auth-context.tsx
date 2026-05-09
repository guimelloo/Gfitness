import React, { createContext, useState, useEffect } from 'react';
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { ApiService } from '../services/api-service';
import { API_ENDPOINTS } from '../services/api-config';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'COACH';
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignout: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isSignout: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useState<{
    isLoading: boolean;
    isSignout: boolean;
    user: User | null;
    userToken?: string;
  }>({
    isLoading: true,
    isSignout: false,
    user: null,
  });

  const saveAuthData = async (token: string, user: User): Promise<void> => {
    // Try to save to AsyncStorage in the background, but don't block if it fails
    try {
      // Wait a bit longer for native modules to initialize
      await new Promise(r => setTimeout(r, 1000));
      
      console.log('[Auth] Attempting to save to AsyncStorage...');
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      console.log('[Auth] Successfully saved auth data to AsyncStorage');
    } catch (error) {
      // Log the error but don't throw - allow app to continue without persistent storage
      console.warn('[Auth] AsyncStorage persistence failed:', error);
      console.warn('[Auth] App will work but tokens will not persist across app restarts');
    }
  };

  useEffect(() => {
    // Use InteractionManager to defer AsyncStorage access until after initial render
    const task = InteractionManager.runAfterInteractions(async () => {
      try {
        let userToken: string | null = null;
        let userData: string | null = null;
        let retries = 0;
        
        // Retry AsyncStorage access if it fails initially
        while (retries < 5) {
          try {
            userToken = await AsyncStorage.getItem('userToken');
            userData = await AsyncStorage.getItem('userData');
            break; // Success
          } catch (error) {
            retries++;
            if (retries < 5) {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 300));
            } else {
              throw error;
            }
          }
        }
        
        if (userToken && userData) {
          api.setToken(userToken);
          dispatch({
            isLoading: false,
            isSignout: false,
            user: JSON.parse(userData),
            userToken,
          });
        } else {
          dispatch({
            isLoading: false,
            isSignout: true,
            user: null,
          });
        }
      } catch (e) {
        console.error('Error restoring token:', e);
        // Even if AsyncStorage fails, continue without token
        dispatch({
          isLoading: false,
          isSignout: true,
          user: null,
        });
      }
    });

    return () => task.cancel();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('[Auth] Starting login with email:', email);
      const response = await api.post<{
        accessToken: string;
        user: User;
      }>(API_ENDPOINTS.LOGIN, { email, password });

      if (!response.accessToken || !response.user) {
        throw new Error('Invalid response from server');
      }

      // Set token immediately so app can function
      api.setToken(response.accessToken);

      // Update state immediately to log user in
      dispatch({
        isLoading: false,
        isSignout: false,
        user: response.user,
        userToken: response.accessToken,
      });

      // Attempt to save to AsyncStorage in background (non-blocking)
      saveAuthData(response.accessToken, response.user).catch(err => {
        console.warn('[Auth] Background persistence failed:', err);
      });
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('[Auth] Starting registration with email:', email);
      const response = await api.post<{
        accessToken: string;
        user: User;
      }>(API_ENDPOINTS.REGISTER, { name, email, password });

      console.log('[Auth] Registration response received:', { user: response.user });

      if (!response.accessToken || !response.user) {
        throw new Error('Invalid response from server');
      }

      // Set token immediately so app can function
      api.setToken(response.accessToken);

      // Update state immediately to log user in
      dispatch({
        isLoading: false,
        isSignout: false,
        user: response.user,
        userToken: response.accessToken,
      });

      // Attempt to save to AsyncStorage in background (non-blocking)
      saveAuthData(response.accessToken, response.user).catch(err => {
        console.warn('[Auth] Background persistence failed:', err);
      });
    } catch (error) {
      console.error('[Auth] Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear state immediately
      api.clearToken();
      
      dispatch({
        isLoading: false,
        isSignout: true,
        user: null,
      });

      // Try to clear AsyncStorage in background (non-blocking)
      try {
        await new Promise(r => setTimeout(r, 500));
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        console.log('[Auth] Successfully cleared auth data from AsyncStorage');
      } catch (error) {
        console.warn('[Auth] AsyncStorage clear failed:', error);
        // Continue anyway - state is already cleared
      }
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoading: state.isLoading,
        isSignout: state.isSignout,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
