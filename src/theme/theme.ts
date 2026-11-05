import {
  Card,
  colorsTuple,
  createTheme,
  defaultVariantColorsResolver,
  getThemeColor,
  ScrollArea,
  Tooltip,
  virtualColor,
  type CSSVariablesResolver,
  type MantineColorsTuple,
  type VariantColorsResolver,
} from '@mantine/core';
import { mixHex } from './color';
import { atlasDerivedMix, atlasPalette, atlasTokenOrder, atlasVar, cssMix, type AtlasToken } from './palette';
import { atlasFontSizes, atlasRadius, px } from './scale';

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

/** Share of Text mixed into a filled color on hover. */
const FILLED_HOVER_MIX = 15;

const variantColorResolver: VariantColorsResolver = (input) => {
  const base = defaultVariantColorsResolver(input);
  const color = getThemeColor(input.color, input.theme);

  if (input.variant === 'filled') {
    return {
      ...base,
      hover: cssMix(atlasVar('text'), FILLED_HOVER_MIX, color),
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
    const gray = input.color === 'gray';
    const tint = gray ? atlasVar('text') : color;
    return {
      ...base,
      hover: gray ? atlasVar('hover') : cssMix(tint, atlasDerivedMix.hover, 'transparent'),
      color: tint,
      hoverColor: tint,
    };
  }

  return base;
};

function schemeVariables(scheme: typeof light, overrides: Record<string, string> = {}) {
  const atlasVars = Object.fromEntries(
    atlasTokenOrder.map((token) => [`--atlas-${token}`, scheme[token]]),
  );

  return {
    ...atlasVars,
    ...Object.fromEntries(
      Object.entries(atlasDerivedMix).map(([token, mix]) => [`--atlas-${token}`, cssMix(scheme.text, mix, 'transparent')]),
    ),
    ...overrides,

    '--atlas-primary-hover': cssMix(scheme.text, FILLED_HOVER_MIX, scheme.primary),

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
  light: schemeVariables(light, {
    '--atlas-tooltip-bg': light.text,
    '--atlas-tooltip-color': light.card,
    '--atlas-tooltip-border': 'transparent',
  }),
  dark: schemeVariables(dark, {
    '--atlas-hover': dark.card,
    '--atlas-tooltip-bg': dark.card,
    '--atlas-tooltip-color': dark.text,
    '--atlas-tooltip-border': cssMix(dark.text, atlasDerivedMix.border, 'transparent'),
  }),
});

export const theme = createTheme({
  colors: buildColors(),
  primaryColor: 'primary',
  white: light.card,
  black: light.text,
  fontFamily: "'Inter Variable', Inter, system-ui, -apple-system, sans-serif",
  headings: {
    fontFamily: "'Inter Variable', Inter, system-ui, -apple-system, sans-serif",
    sizes: {
      h1: { fontSize: px(atlasFontSizes.xl) },
      h2: { fontSize: px(atlasFontSizes.lg) },
      h3: { fontSize: px(atlasFontSizes.md) },
      h4: { fontSize: px(atlasFontSizes.sm) },
      h5: { fontSize: px(atlasFontSizes.xs) },
      h6: { fontSize: px(atlasFontSizes.xxs) },
    },
  },
  // Mantine also reads xs and xl internally, so they clamp to the ends of the scale.
  radius: {
    xs: px(atlasRadius.sm),
    sm: px(atlasRadius.sm),
    md: px(atlasRadius.md),
    lg: px(atlasRadius.lg),
    xl: px(atlasRadius.lg),
  },
  fontSizes: Object.fromEntries(Object.entries(atlasFontSizes).map(([key, value]) => [key, px(value)])),
  defaultRadius: 'md',
  variantColorResolver,
  components: {
    Card: Card.extend({
      defaultProps: { radius: 'lg', padding: 20, withBorder: true },
      styles: { root: { borderColor: atlasVar('card-border') } },
    }),
    ScrollArea: ScrollArea.extend({
      defaultProps: { scrollbarSize: 4 },
      styles: {
        scrollbar: { padding: 0, backgroundColor: 'transparent' },
        thumb: { backgroundColor: atlasVar('card') },
      },
    }),
    Tooltip: Tooltip.extend({
      styles: {
        tooltip: {
          backgroundColor: 'var(--atlas-tooltip-bg)',
          color: 'var(--atlas-tooltip-color)',
          border: '1px solid var(--atlas-tooltip-border)',
        },
      },
    }),
  },
});
