import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Creator } from '../types';
import { MOCK_CREATOR } from '../services/mockData';

interface AuthContextType {
  creator: Creator | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [creator, setCreator] = useState<Creator | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - en production, faire appel à l'API
    if (email && password) {
      setCreator(MOCK_CREATOR);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCreator(null);
  };

  return (
    <AuthContext.Provider
      value={{
        creator,
        isAuthenticated: !!creator,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
