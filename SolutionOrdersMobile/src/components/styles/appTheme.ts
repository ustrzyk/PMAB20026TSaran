export const appColors = {
  background: '#0f172a',

  surface: '#111827',
  surfaceDark: '#0f172a',
  surfaceLight: '#1e293b',

  border: '#334155',
  borderDark: '#1e293b',

  text: '#f8fafc',
  textMuted: '#cbd5e1',
  textSoft: '#94a3b8',
  textDisabled: '#64748b',

  primary: '#f97316',
  primaryDark: '#431407',
  primaryLight: '#fed7aa',

  success: '#16a34a',
  successDark: '#052e16',
  successLight: '#bbf7d0',

  danger: '#ef4444',
  dangerDark: '#7f1d1d',
  dangerLight: '#fecaca',

  info: '#38bdf8',
  blue: '#2563eb',
  blueDark: '#1e3a8a',
  blueLight: '#dbeafe',

  purple: '#a855f7',
  purpleDark: '#581c87',
  purpleLight: '#f3e8ff',

  warning: '#facc15',
  warningDark: '#422006',
} as const;

export const appSpacing = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 14,
  section: 16,
  large: 18,
  screen: 16,
  bottom: 32,
} as const;

export const appRadius = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  card: 18,
  hero: 22,
  round: 999,
} as const;

export const appFontSize = {
  tiny: 11,
  small: 12,
  normal: 13,
  body: 14,
  input: 15,
  button: 16,
  section: 18,
  title: 27,
} as const;

export const appFontWeight = {
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

export const appOpacity = {
  disabled: 0.65,
  muted: 0.5,
} as const;