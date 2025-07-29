// Enhanced color palette inspired by iOS, Linear, and Notion
export default {
  dark: {
    // Backgrounds - Rich blacks with subtle warmth
    background: '#0A0A0B',
    backgroundSecondary: '#111113',
    card: '#1A1A1D',
    surface: '#1F1F23',
    surfaceElevated: '#252529',
    
    // Text hierarchy
    text: '#FFFFFF',
    textSecondary: '#E5E5E7',
    subtext: '#9CA3AF',
    textTertiary: '#6B7280',
    
    // Borders and separators
    border: '#2A2A2E',
    borderLight: '#1F1F23',
    separator: '#333338',
    
    // Brand colors - Refined pastels
    primary: '#8B7CF6', // Refined purple
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',
    
    secondary: '#06B6D4', // Refined cyan
    secondaryLight: '#22D3EE',
    secondaryDark: '#0891B2',
    
    // Accent colors
    accent: '#F59E0B', // Warm amber
    accentLight: '#FCD34D',
    accentDark: '#D97706',
    
    // Status colors
    success: '#10B981',
    successLight: '#34D399',
    warning: '#F59E0B',
    error: '#EF4444',
    errorLight: '#F87171',
    
    // Interactive states
    hover: '#252529',
    pressed: '#2A2A2E',
    focus: '#8B7CF6',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.8)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',
    
    // Gradients
    gradientPrimary: ['#8B7CF6', '#06B6D4'],
    gradientSecondary: ['#06B6D4', '#10B981'],
    gradientAccent: ['#F59E0B', '#EF4444'],
  }
};

// Design tokens for consistent spacing, typography, and effects
export const DesignTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  typography: {
    sizes: {
      xs: 11,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
      display: 32,
      hero: 40,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 12,
    },
  },
};