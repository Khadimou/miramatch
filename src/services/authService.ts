import * as SecureStore from 'expo-secure-store';
import { AuthResponse, LoginCredentials, Creator } from '../types';

const TOKEN_KEY = 'mira_match_token';
const USER_KEY = 'mira_match_user';

// Configuration API - À remplacer par votre vraie URL backend
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const authService = {
  /**
   * Connexion de l'utilisateur seller
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          userType: 'seller', // Spécifier qu'on veut se connecter en tant que seller
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de connexion');
      }

      const data: AuthResponse = await response.json();

      // Vérifier que l'utilisateur est bien un seller
      if (!data.user.sellerType) {
        throw new Error('Ce compte n\'est pas un compte créateur');
      }

      // Sauvegarder le token et l'utilisateur
      await this.saveToken(data.token);
      await this.saveUser(data.user);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Sauvegarder le token JWT dans le Keychain
   */
  async saveToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Save token error:', error);
      throw error;
    }
  },

  /**
   * Récupérer le token JWT
   */
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  /**
   * Sauvegarder l'utilisateur
   */
  async saveUser(user: Creator): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Save user error:', error);
      throw error;
    }
  },

  /**
   * Récupérer l'utilisateur sauvegardé
   */
  async getUser(): Promise<Creator | null> {
    try {
      const userStr = await SecureStore.getItemAsync(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  /**
   * Vérifier si le token est valide (auto-login)
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Verify token error:', error);
      return false;
    }
  },

  /**
   * Rafraîchir le token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      await this.saveToken(data.token);

      return data.token;
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  },

  /**
   * Récupérer les headers d'authentification pour les requêtes API
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },
};
