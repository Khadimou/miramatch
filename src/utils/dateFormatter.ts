/**
 * Formate une date de façon intelligente
 * @param dateString - Date ISO ou string
 * @returns String formaté de façon lisible
 */
export const formatDeadline = (dateString: string | undefined): string => {
  if (!dateString) return 'Non spécifié';

  const date = new Date(dateString);
  const now = new Date();

  // Calculer la différence en jours
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Si c'est dépassé
  if (diffDays < 0) {
    return `Dépassé (${formatDate(date)})`;
  }

  // Si c'est aujourd'hui
  if (diffDays === 0) {
    return "Aujourd'hui";
  }

  // Si c'est demain
  if (diffDays === 1) {
    return 'Demain';
  }

  // Si c'est dans moins de 7 jours
  if (diffDays < 7) {
    return `Dans ${diffDays} jours`;
  }

  // Si c'est dans moins de 30 jours
  if (diffDays < 30) {
    return `Le ${formatDate(date)} (${diffDays} jours)`;
  }

  // Si c'est plus loin
  return `Le ${formatDate(date)}`;
};

/**
 * Formate une date au format français
 * @param date - Date object
 * @returns Date formatée (ex: "15 mars 2025")
 */
const formatDate = (date: Date): string => {
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Formate une date de façon courte
 * @param dateString - Date ISO ou string
 * @returns Date formatée (ex: "15/03/2025")
 */
export const formatShortDate = (dateString: string | undefined): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Formate une date pour un badge (format court et intelligent)
 * @param dateString - Date ISO ou string
 * @returns String formaté pour badge (ex: "Dans 5j", "15 mars")
 */
export const formatBadgeDate = (dateString: string | undefined): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();

  // Calculer la différence en jours
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const months = ['janv', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
  const day = date.getDate();
  const month = months[date.getMonth()];

  // Si c'est dépassé
  if (diffDays < 0) {
    return 'Dépassé';
  }

  // Si c'est aujourd'hui
  if (diffDays === 0) {
    return "Auj.";
  }

  // Si c'est demain
  if (diffDays === 1) {
    return 'Demain';
  }

  // Si c'est dans moins de 7 jours
  if (diffDays < 7) {
    return `${diffDays}j`;
  }

  // Sinon format court jour + mois
  return `${day} ${month}`;
};
