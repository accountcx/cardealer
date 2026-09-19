// 🧠 Mental Model: Design Tokens trung tâm chuẩn hóa nhận diện thương hiệu Hyundai (UI_SPEC.md)
// Cung cấp biến CSS và token màu sắc nhất quán cho cả Light Mode và Dark Mode trên toàn hệ thống

export const DESIGN_TOKENS = {
  colors: {
    // Brand Colors
    primary: '#002C6C',       // Hyundai Deep Blue
    primaryHover: '#001E4A',
    accent: '#0072CE',        // Electric Blue
    accentHover: '#005EA8',
    accentGlow: 'rgba(0, 114, 206, 0.35)',

    // Semantic Status Colors
    success: '#10B981',
    successBg: '#ECFDF5',
    successBgDark: 'rgba(16, 185, 129, 0.15)',
    successText: '#047857',
    successTextDark: '#34D399',

    danger: '#EF4444',
    dangerBg: '#FEF2F2',
    dangerBgDark: 'rgba(239, 68, 68, 0.15)',
    dangerText: '#B91C1C',
    dangerTextDark: '#F87171',

    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    warningBgDark: 'rgba(245, 158, 11, 0.15)',
    warningText: '#B45309',
    warningTextDark: '#FBBF24',

    // Neutral Surfaces - Dark Mode (Default for Admin)
    dark: {
      background: '#0B0F17',
      card: '#151D2A',
      cardBorder: '#222F3E',
      surfaceHover: '#1E293B',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
    },

    // Neutral Surfaces - Light Mode
    light: {
      background: '#F8FAFC',
      card: '#FFFFFF',
      cardBorder: '#E2E8F0',
      surfaceHover: '#F1F5F9',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#94A3B8',
    },
  },
  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    full: '9999px',
  },
  transitions: {
    default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export type ThemeMode = 'dark' | 'light';
