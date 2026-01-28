'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';
import { getStoredUser, setStoredUser } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  /** Register with biometric (used after ActionID capture on registration flow). */
  registerWithBiometric: (params: { email: string; csid?: string }) => Promise<AuthResponse>;
  /** Login with biometric (ActionID validate). */
  loginWithBiometric: (params: { email: string; csid: string }) => Promise<AuthResponse>;
  logout: () => void;
  enroll: (options?: { csid?: string }) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = getStoredUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setStoredUser(data.user);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
        }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setStoredUser(data.user);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  };

  const registerWithBiometric = async (params: {
    email: string;
    csid?: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: params.email,
          csid: params.csid,
        }),
      });
      const data: AuthResponse = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        setStoredUser(data.user);
      }
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  };

  const loginWithBiometric = async (params: { email: string; csid: string }): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: params.email, csid: params.csid }),
      });
      const data: AuthResponse = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        setStoredUser(data.user);
      }
      return data;
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const enroll = async (options?: { csid?: string }): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user?.email, csid: options?.csid }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setStoredUser(data.user);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setStoredUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        registerWithBiometric,
        loginWithBiometric,
        logout,
        enroll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
