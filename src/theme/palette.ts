/**
 * Atlas V2 approved palette. These 12 tokens per color scheme are the only
 * colors the prototype may use; everything else (borders, hovers, series 8–21)
 * is derived from them by mixing.
 */
export type AtlasToken =
  | 'background'
  | 'card'
  | 'primary'
  | 'secondary'
  | 'accent1'
  | 'accent2'
  | 'accent3'
  | 'success'
  | 'warning'
  | 'error'
  | 'text'
  | 'textSecondary';

export type AtlasScheme = 'light' | 'dark';

export const atlasPalette: Record<AtlasScheme, Record<AtlasToken, string>> = {
  light: {
    background: '#F0F1F2',
    card: '#FFFFFF',
    primary: '#047D95',
    secondary: '#9057D5',
    accent1: '#FA4A95',
    accent2: '#EB6330',
    accent3: '#4865F8',
    success: '#06A96E',
    warning: '#C78802',
    error: '#E5484D',
    text: '#0A0E19',
    textSecondary: '#424750',
  },
  dark: {
    background: '#0A0E19',
    card: '#1A2133',
    primary: '#059FBD',
    secondary: '#9057D5',
    accent1: '#FA4A95',
    accent2: '#EB6330',
    accent3: '#4865F8',
    success: '#07C881',
    warning: '#F5B800',
    error: '#E5484D',
    text: '#F5F7FA',
    textSecondary: '#9AA1AD',
  },
};

export const atlasTokenLabels: Record<AtlasToken, string> = {
  background: 'Background',
  card: 'Card',
  primary: 'Primary',
  secondary: 'Secondary',
  accent1: 'Accent 1',
  accent2: 'Accent 2',
  accent3: 'Accent 3 · Maritime',
  success: 'Success · Energy',
  warning: 'Warning',
  error: 'Error',
  text: 'Text',
  textSecondary: 'Secondary text',
};

export const atlasTokenOrder = Object.keys(atlasTokenLabels) as AtlasToken[];

/** Series 1–7 in order; series 8–21 reuse these mixed toward Text. */
export const atlasSeriesTokens = [
  'primary',
  'secondary',
  'accent1',
  'accent2',
  'accent3',
  'success',
  'warning',
] as const satisfies readonly AtlasToken[];

/** Share of Text mixed into a series color for each block of 7 series. */
export const atlasSeriesTextMix = [0, 35, 60] as const;

export const ATLAS_MAX_SERIES = atlasSeriesTokens.length * atlasSeriesTextMix.length;

/** Text mixed toward transparent, from the Figma spec; defined in `theme.ts`. */
export const atlasDerivedMix = {
  'chart-title': 85,
  legend: 70,
  border: 10,
  'card-border': 8,
  hover: 8,
  divider: 6,
} as const;

export type AtlasDerivedToken = keyof typeof atlasDerivedMix;

export const atlasVar = (token: AtlasToken | AtlasDerivedToken) => `var(--atlas-${token})`;

/** CSS `color-mix` of `percent`% of `a` into `b`, in sRGB like the Figma spec. */
export const cssMix = (a: string, percent: number, b: string) =>
  `color-mix(in srgb, ${a} ${percent}%, ${b})`;

/**
 * Chart color for a 0-based series index, as a CSS value that follows the
 * active color scheme. Callers should group anything past
 * `ATLAS_MAX_SERIES` into a single "Other" series.
 */
export function atlasSeriesColor(index: number): string {
  const token = atlasSeriesTokens[index % atlasSeriesTokens.length];
  const textMix = atlasSeriesTextMix[Math.min(Math.floor(index / atlasSeriesTokens.length), 2)];
  return textMix === 0 ? atlasVar(token) : cssMix(atlasVar('text'), textMix, atlasVar(token));
}
