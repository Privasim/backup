// JobRisk Visual Governance Spec (light mode only)
// Independent from global styles. Deterministic values for SSR.

export type Emphasis = 'primary' | 'neutral' | 'success' | 'warning' | 'error';

export interface Palette {
  background: string;
  surface: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  brand: string;
  brandAlt: string;
  success: string;
  warning: string;
  error: string;
  neutral: string;
}

export interface Spec {
  palette: Palette;
  spacing: {
    xs: number; // 4
    sm: number; // 8
    md: number; // 12
    lg: number; // 16
  };
  radius: {
    sm: number; // 6
    md: number; // 10
  };
  elevation: {
    cardShadow: string;
  };
  typography: {
    title: number;
    heading: number;
    subheading: number;
    body: number;
    label: number;
  };
  kpi: {
    valueWeight: number;
  };
  chart: {
    gridOpacity: number;
    tickColor: string;
  };
}

const spec: Spec = Object.freeze({
  palette: {
    background: '#fafafa',
    surface: '#ffffff',
    card: '#ffffff',
    border: '#EAEAEA',
    textPrimary: '#1F2937', // slate-800
    textSecondary: '#6B7280', // slate-500
    brand: '#EC4899', // pink-500
    brandAlt: '#F472B6', // pink-400
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    neutral: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
  radius: { sm: 6, md: 10 },
  elevation: { cardShadow: '0 8px 24px rgba(0,0,0,0.06)' },
  typography: {
    title: 20,
    heading: 16,
    subheading: 14,
    body: 13,
    label: 12,
  },
  kpi: { valueWeight: 600 },
  chart: { gridOpacity: 0.15, tickColor: '#E5E7EB' },
});

export function getDesignSpec(): Spec { return spec; }

export function emphasisColor(e: Emphasis): string {
  const { palette } = spec;
  switch (e) {
    case 'success': return palette.success;
    case 'warning': return palette.warning;
    case 'error': return palette.error;
    case 'neutral': return palette.neutral;
    case 'primary':
    default: return palette.brand;
  }
}

export const formatters = {
  percent(v: number): string { return `${Math.round(v)}%`; },
  number(v: number): string { return new Intl.NumberFormat('en-US').format(v); },
};
