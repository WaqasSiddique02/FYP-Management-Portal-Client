'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, getUserData, removeToken } from '../utils/token';
import { AuthState, User } from '../types/auth.types';

interface AuthContextType extends AuthState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Initialize auth state from localStorage
    const storedToken = getToken();
    const storedUser = getUserData();

    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    setTokenState(null);
    removeToken();
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    error,
    setUser,
    setToken: setTokenState,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};