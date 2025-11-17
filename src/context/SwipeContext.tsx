import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, Match, Quote } from '../types';
import { MOCK_PROJECTS } from '../services/mockData';

interface SwipeContextType {
  projects: Project[];
  matches: Match[];
  quotes: Quote[];
  likeProject: (projectId: string) => void;
  passProject: (projectId: string) => void;
  submitQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'status'>) => void;
  getMatchedProjects: () => Project[];
}

const SwipeContext = createContext<SwipeContextType | undefined>(undefined);

export const SwipeProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [matches, setMatches] = useState<Match[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [passedProjects, setPassedProjects] = useState<string[]>([]);

  const likeProject = (projectId: string) => {
    // Créer un match
    const newMatch: Match = {
      id: `match-${Date.now()}`,
      projectId,
      creatorId: 'current-creator', // En production, utiliser l'ID du créateur connecté
      createdAt: new Date().toISOString(),
      hasQuote: false,
    };
    setMatches([...matches, newMatch]);
  };

  const passProject = (projectId: string) => {
    setPassedProjects([...passedProjects, projectId]);
  };

  const submitQuote = (quoteData: Omit<Quote, 'id' | 'createdAt' | 'status'>) => {
    const newQuote: Quote = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setQuotes([...quotes, newQuote]);

    // Mettre à jour le match pour indiquer qu'un devis a été soumis
    setMatches(
      matches.map((match) =>
        match.projectId === quoteData.projectId
          ? { ...match, hasQuote: true }
          : match
      )
    );
  };

  const getMatchedProjects = () => {
    const matchedProjectIds = matches.map((match) => match.projectId);
    return projects.filter((project) => matchedProjectIds.includes(project.id));
  };

  // Filtrer les projets pour ne montrer que ceux qui n'ont pas été likés ou passés
  const availableProjects = projects.filter(
    (project) =>
      !matches.some((match) => match.projectId === project.id) &&
      !passedProjects.includes(project.id)
  );

  return (
    <SwipeContext.Provider
      value={{
        projects: availableProjects,
        matches,
        quotes,
        likeProject,
        passProject,
        submitQuote,
        getMatchedProjects,
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
