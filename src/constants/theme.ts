// Thème et constantes pour MIRA MATCH - Design moderne 2025

export const COLORS = {
  // Gradients vibrants
  gradientStart: '#FF6B9D',    // Rose vif
  gradientMiddle: '#C371F5',   // Violet
  gradientEnd: '#6C5CE7',      // Bleu violet

  // Couleurs principales
  primary: '#FF6B9D',          // Rose principal
  primaryDark: '#E85A8B',      // Rose foncé
  secondary: '#6C5CE7',        // Violet
  accent: '#00D9C1',           // Turquoise éclatant

  // Status
  success: '#00E096',          // Vert moderne
  warning: '#FFC107',          // Orange vif
  danger: '#FF6B6B',           // Rouge

  // Backgrounds
  background: '#FAFBFF',       // Blanc cassé avec teinte violette
  backgroundDark: '#1A1B2E',   // Fond sombre
  card: '#FFFFFF',
  cardGlass: 'rgba(255, 255, 255, 0.9)', // Glassmorphism

  // Text
  textPrimary: '#1A1B2E',      // Presque noir
  textSecondary: '#6B7280',    // Gris moderne
  textLight: '#9CA3AF',        // Gris clair
  textWhite: '#FFFFFF',

  // Overlays
  overlay: 'rgba(26, 27, 46, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',

  // Borders
  border: '#E5E7EB',           // Bordure subtile
  borderLight: '#F3F4F6',

  // Interactions
  like: '#00E096',             // Vert éclatant pour like
  nope: '#FF6B6B',             // Rouge pour pass
  superLike: '#FFD700',        // Or pour super like

  // Shadows
  shadow: '#000000',
  white: '#FFFFFF',
  black: '#000000',
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Font sizes
  fontXs: 12,
  fontSm: 14,
  fontMd: 16,
  fontLg: 20,
  fontXl: 24,
  fontXxl: 32,

  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,

  // Icons
  iconSm: 20,
  iconMd: 24,
  iconLg: 32,
  iconXl: 48,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

// Gradients modernes
export const GRADIENTS = {
  primary: ['#FF6B9D', '#C371F5', '#6C5CE7'],
  secondary: ['#6C5CE7', '#4F46E5'],
  success: ['#00E096', '#00C9A7'],
  warm: ['#FF6B9D', '#FF8E53'],
  cool: ['#00D9C1', '#6C5CE7'],
  gold: ['#FFD700', '#FFA500'],
};

// Glassmorphism styles
export const GLASS = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
};
