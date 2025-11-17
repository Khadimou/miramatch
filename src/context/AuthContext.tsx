import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Creator } from '../types';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';

interface AuthContextType {
  creator: Creator | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-login au démarrage de l'app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Connexion au socket quand l'utilisateur est authentifié
  useEffect(() => {
    if (creator && !socketService.isConnected()) {
      connectSocket();
    } else if (!creator && socketService.isConnected()) {
      socketService.disconnect();
    }
  }, [creator]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await authService.getToken();

      if (token) {
        // Vérifier si le token est valide
        const isValid = await authService.verifyToken();

        if (isValid) {
          // Récupérer l'utilisateur sauvegardé
          const user = await authService.getUser();
          if (user) {
            setCreator(user);
          }
        } else {
          // Token invalide, essayer de le rafraîchir
          const newToken = await authService.refreshToken();
          if (newToken) {
            const user = await authService.getUser();
            if (user) {
              setCreator(user);
            }
          } else {
            // Échec du refresh, déconnexion
            await authService.logout();
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const connectSocket = async () => {
    try {
      await socketService.connect();
      console.log('Socket connected successfully');
    } catch (error) {
      console.error('Socket connection failed:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      setCreator(response.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      socketService.disconnect();
      setCreator(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const user = await authService.getUser();
      if (user) {
        setCreator(user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        creator,
        isAuthenticated: !!creator,
        isLoading,
        login,
        logout,
        refreshUser,
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
