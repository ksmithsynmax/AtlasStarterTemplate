import {
  Card,
  colorsTuple,
  createTheme,
  defaultVariantColorsResolver,
  getThemeColor,
  Tooltip,
  virtualColor,
  type CSSVariablesResolver,
  type MantineColorsTuple,
  type VariantColorsResolver,
} from '@mantine/core';
import { mixHex } from './color';
import { atlasPalette, atlasTokenOrder, atlasVar, cssMix, type AtlasToken } from './palette';

const { light, dark } = atlasPalette;

const themeColorTokens = [
  'primary',
  'secondary',
  'accent1',
  'accent2',
  'accent3',
  'success',
  'warning',
  'error',
] as const satisfies readonly AtlasToken[];

/**
 * Every Atlas color is a flat 10-shade tuple so Mantine can never pick a
 * shade outside the palette. Tokens that differ per scheme become virtual
 * colors that switch with the color scheme.
 */
function buildColors() {
  const colors: Record<string, MantineColorsTuple> = {};

  for (const token of themeColorTokens) {
    if (light[token] === dark[token]) {
      colors[token] = colorsTuple(light[token]);
      continue;
    }
    colors[`${token}Light`] = colorsTuple(light[token]);
    colors[`${token}Dark`] = colorsTuple(dark[token]);
    colors[token] = virtualColor({ name: token, light: `${token}Light`, dark: `${token}Dark` });
  }

  // Mantine's own components read surfaces, borders and muted text from the
  // gray (light) and dark (dark) scales, so both are rebuilt from the palette.
  // Borders and hovers are Text mixed into Card, matching the Figma strokes.
  // Gray is also scheme-aware because `color="gray"` filled/light variants
  // read gray shades in dark mode too.
  const grayScale = (p: typeof light): MantineColorsTuple => [
    p.background,
    p.background,
    mixHex(p.text, 6, p.card),
    mixHex(p.text, 10, p.card),
    mixHex(p.text, 10, p.card),
    p.textSecondary,
    p.textSecondary,
    p.textSecondary,
    p.text,
    p.text,
  ];
  colors.grayLight = grayScale(light);
  colors.grayDark = grayScale(dark);
  colors.gray = virtualColor({ name: 'gray', light: 'grayLight', dark: 'grayDark' });
  colors.dark = [
    dark.text,
    dark.text,
    dark.textSecondary,
    dark.textSecondary,
    mixHex(dark.text, 10, dark.card),
    mixHex(dark.text, 6, dark.card),
    dark.card,
    dark.background,
    dark.background,
    dark.background,
  ];

  return colors;
}

const variantColorResolver: VariantColorsResolver = (input) => {
  const base = defaultVariantColorsResolver(input);
  const color = getThemeColor(input.color, input.theme);

  if (input.variant === 'filled') {
    return {
      ...base,
      hover: cssMix(atlasVar('text'), 15, color),
      color: atlasVar('card'),
      hoverColor: atlasVar('card'),
    };
  }

  if (input.variant === 'light') {
    return {
      ...base,
      background: cssMix(color, 14, 'transparent'),
      hover: cssMix(color, 20, 'transparent'),
      color,
      hoverColor: color,
    };
  }

  if (input.variant === 'subtle') {
    const tint = input.color === 'gray' ? atlasVar('text') : color;
    return {
      ...base,
      hover: cssMix(tint, 8, 'transparent'),
      color: tint,
      hoverColor: tint,
    };
  }

  return base;
};

function schemeVariables(scheme: typeof light) {
  const atlasVars = Object.fromEntries(
    atlasTokenOrder.map((token) => [`--atlas-${token}`, scheme[token]]),
  );

  return {
    ...atlasVars,
    '--atlas-border': cssMix(scheme.text, 10, 'transparent'),
    '--atlas-card-border': cssMix(scheme.text, 8, 'transparent'),
    '--atlas-divider': cssMix(scheme.text, 6, 'transparent'),

    '--mantine-color-body': scheme.card,
    '--mantine-color-text': scheme.text,
    '--mantine-color-bright': scheme.text,
    '--mantine-color-dimmed': scheme.textSecondary,
    '--mantine-color-placeholder': scheme.textSecondary,
    '--mantine-color-anchor': scheme.primary,
    '--mantine-color-error': scheme.error,
    '--mantine-color-success': scheme.success,
    '--mantine-color-default': scheme.card,
    '--mantine-color-default-color': scheme.text,
    '--mantine-color-default-hover': mixHex(scheme.text, 6, scheme.card),
    '--mantine-color-default-border': mixHex(scheme.text, 10, scheme.card),
  };
}

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: schemeVariables(light),
  dark: schemeVariables(dark),
});

export const theme = createTheme({
  colors: buildColors(),
  primaryColor: 'primary',
  white: light.card,
  black: light.text,
  fontFamily: "'Inter Variable', Inter, system-ui, -apple-system, sans-serif",
  headings: { fontFamily: "'Inter Variable', Inter, system-ui, -apple-system, sans-serif" },
  radius: { xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '16px' },
  defaultRadius: 'md',
  variantColorResolver,
  components: {
    Card: Card.extend({
      defaultProps: { radius: 'lg', padding: 20, withBorder: true },
      styles: { root: { borderColor: atlasVar('card-border') } },
    }),
    Tooltip: Tooltip.extend({
      styles: { tooltip: { backgroundColor: atlasVar('text'), color: atlasVar('card') } },
    }),
  },
});
