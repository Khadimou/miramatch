import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Match, Quote } from '../types';
import { MOCK_PROJECTS } from '../services/mockData';
import { authService } from '../services/authService';

interface SwipeContextType {
  projects: Project[];
  matches: Match[];
  quotes: Quote[];
  likeProject: (projectId: string) => Promise<void>;
  passProject: (projectId: string) => Promise<void>;
  submitQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  getMatchedProjects: () => Project[];
  isLoading: boolean;
  refreshProjects: () => Promise<void>;
}

const SwipeContext = createContext<SwipeContextType | undefined>(undefined);

// Mode développement : utiliser les mock data au lieu du backend
const USE_MOCK_DATA = false; // Backend activé

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const SwipeProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [passedProjects, setPassedProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les projets et matches au démarrage seulement si un token existe
  useEffect(() => {
    const checkAndLoad = async () => {
      const token = await authService.getToken();
      if (token) {
        loadProjects();
        loadMatches();
      } else {
        setIsLoading(false);
      }
    };

    checkAndLoad();
  }, []);

  const loadMatches = async () => {
    try {
      console.log('[SwipeContext] Loading matches...');

      if (USE_MOCK_DATA) {
        // Mode mock - pas de matches à charger
        return;
      }

      // Charger les matches depuis l'API
      const headers = await authService.getAuthHeaders();
      const url = `${API_URL}/projects/matches`;
      console.log('[SwipeContext] Fetching matches:', url);

      const response = await fetch(url, {
        headers,
      });

      console.log('[SwipeContext] Matches response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[SwipeContext] Matches loaded:', data.length);
        setMatches(data);
      } else {
        const errorText = await response.text();
        console.error('Error loading matches - Status:', response.status);
        console.error('Error loading matches - Response:', errorText);
      }
    } catch (error) {
      console.error('Load matches error:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
    }
  };

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      console.log('[SwipeContext] API_URL:', API_URL);

      if (USE_MOCK_DATA) {
        // Mode mock
        setProjects(MOCK_PROJECTS);
      } else {
        // Charger depuis l'API
        const headers = await authService.getAuthHeaders();
        const url = `${API_URL}/projects/available`;
        console.log('[SwipeContext] Fetching:', url);

        const response = await fetch(url, {
          headers,
        });

        console.log('[SwipeContext] Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[SwipeContext] Projects loaded:', data.length);
          setProjects(data);
        } else {
          const errorText = await response.text();
          console.error('Error loading projects - Status:', response.status);
          console.error('Error loading projects - Response:', errorText);
          // Fallback sur les mocks en cas d'erreur
          setProjects(MOCK_PROJECTS);
        }
      }
    } catch (error) {
      console.error('Load projects error:', error);
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      // Fallback sur les mocks en cas d'erreur
      setProjects(MOCK_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProjects = async () => {
    await loadProjects();
  };

  const likeProject = async (projectId: string) => {
    try {
      console.log('[SwipeContext] Liking project:', projectId);

      if (USE_MOCK_DATA) {
        // Mode mock
        const newMatch: Match = {
          id: `match-${Date.now()}`,
          projectId,
          creatorId: 'current-creator',
          createdAt: new Date().toISOString(),
          hasQuote: false,
        };
        setMatches([...matches, newMatch]);
      } else {
        // Mode production : appel API
        const headers = await authService.getAuthHeaders();
        const url = `${API_URL}/projects/${projectId}/like`;
        console.log('[SwipeContext] POST:', url);

        const response = await fetch(url, {
          method: 'POST',
          headers,
        });

        console.log('[SwipeContext] Like response status:', response.status);

        if (response.ok) {
          console.log('[SwipeContext] Project liked successfully');
          // Rafraîchir les projets et matches
          await loadProjects();
          await loadMatches();
        } else {
          const errorText = await response.text();
          console.error('Error liking project - Status:', response.status);
          console.error('Error liking project - Response:', errorText);
        }
      }
    } catch (error) {
      console.error('Like project error:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
    }
  };

  const passProject = async (projectId: string) => {
    try {
      if (USE_MOCK_DATA) {
        // Mode mock
        setPassedProjects([...passedProjects, projectId]);
      } else {
        // Mode production : appel API
        const headers = await authService.getAuthHeaders();
        const response = await fetch(`${API_URL}/projects/${projectId}/pass`, {
          method: 'POST',
          headers,
        });

        if (response.ok) {
          // Rafraîchir les projets pour retirer celui-ci de la liste
          await loadProjects();
        } else {
          console.error('Error passing project:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Pass project error:', error);
    }
  };

  const submitQuote = async (quoteData: Omit<Quote, 'id' | 'createdAt' | 'status'>) => {
    try {
      if (USE_MOCK_DATA) {
        // Mode mock
        const newQuote: Quote = {
          ...quoteData,
          id: `quote-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        setQuotes([...quotes, newQuote]);

        setMatches(
          matches.map((match) =>
            match.projectId === quoteData.projectId
              ? { ...match, hasQuote: true }
              : match
          )
        );
      } else {
        // Mode production : appel API
        const headers = await authService.getAuthHeaders();
        const response = await fetch(`${API_URL}/quotes`, {
          method: 'POST',
          headers,
          body: JSON.stringify(quoteData),
        });

        if (response.ok) {
          const newQuote = await response.json();
          setQuotes([...quotes, newQuote]);

          // Rafraîchir les matches pour mettre à jour hasQuote
          await loadMatches();
        } else {
          console.error('Error submitting quote:', response.statusText);
          throw new Error('Erreur lors de la soumission du devis');
        }
      }
    } catch (error) {
      console.error('Submit quote error:', error);
      throw error;
    }
  };

  const getMatchedProjects = () => {
    // Retourner directement les projets inclus dans les matches (depuis le backend)
    return matches.map((match) => match.project).filter((project): project is Project => project !== undefined);
  };

  return (
    <SwipeContext.Provider
      value={{
        projects, // Le backend filtre déjà les projets likés/passés
        matches,
        quotes,
        likeProject,
        passProject,
        submitQuote,
        getMatchedProjects,
        isLoading,
        refreshProjects,
      }}
    >
      {children}
    </SwipeContext.Provider>
  );
};

export const useSwipe = () => {
  const context = useContext(SwipeContext);
  if (!context) {
    throw new Error('useSwipe must be used within SwipeProvider');
  }
  return context;
};
