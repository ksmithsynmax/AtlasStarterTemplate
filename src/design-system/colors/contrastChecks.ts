import {
  atlasSeriesTextMix,
  atlasSeriesTokens,
  atlasTokenLabels,
  mixHex,
  type AtlasToken,
} from '../../theme';

type Palette = Record<AtlasToken, string>;

export interface ContrastCheck {
  check: string;
  usedFor: string;
  needs: number;
  /** Text preview shows "Aa"; mark preview shows a chart stroke. */
  preview: 'text' | 'mark';
  foreground: (p: Palette) => string;
  background: (p: Palette) => string;
}

export interface ContrastSection {
  title: string;
  description: string;
  checks: ContrastCheck[];
}

const TEXT_MIN = 4.5;
const MARK_MIN = 3;

const textCheck = (
  check: string,
  usedFor: string,
  foreground: ContrastCheck['foreground'],
  background: ContrastCheck['background'],
): ContrastCheck => ({ check, usedFor, needs: TEXT_MIN, preview: 'text', foreground, background });

const markCheck = (
  check: string,
  usedFor: string,
  foreground: ContrastCheck['foreground'],
): ContrastCheck => ({
  check,
  usedFor,
  needs: MARK_MIN,
  preview: 'mark',
  foreground,
  background: (p) => p.card,
});

export const contrastSections: ContrastSection[] = [
  {
    title: 'Text',
    description: 'WCAG 1.4.3: 4.5:1 for text.',
    checks: [
      textCheck('Text on page', 'Page title, menus', (p) => p.text, (p) => p.background),
      textCheck('Text on card', 'Tooltip values, donut total', (p) => p.text, (p) => p.card),
      textCheck('Chart titles', 'Text at 85% on card', (p) => mixHex(p.text, 85, p.card), (p) => p.card),
      textCheck('Legend labels', 'Text at 70% on card', (p) => mixHex(p.text, 70, p.card), (p) => p.card),
      textCheck('Secondary text on card', 'Axis labels, captions, notes', (p) => p.textSecondary, (p) => p.card),
      textCheck(
        'Secondary text on page',
        'Control labels, swatch hex codes',
        (p) => p.textSecondary,
        (p) => p.background,
      ),
      textCheck('Primary button', 'Card color on Primary', (p) => p.card, (p) => p.primary),
    ],
  },
  {
    title: 'Chart marks',
    description: 'WCAG 1.4.11: 3:1 for lines, bars, slices and candles against the card.',
    checks: [
      ...atlasSeriesTokens.map((token, i) =>
        markCheck(atlasTokenLabels[token], `Series ${i + 1}`, (p) => p[token]),
      ),
      markCheck(atlasTokenLabels.error, 'Candle down, alerts', (p) => p.error),
    ],
  },
  {
    title: 'Shaded series',
    description:
      'Past 7 series, charts reuse the same 7 colors mixed toward Text instead of adding new ones: ' +
      'series 8–14 mix in 35% Text, series 15–21 mix in 60%. In CSS: color-mix(in srgb, var(--text) 35%, ' +
      "var(--primary)). That's lighter in dark mode and deeper in light mode, and the same 3:1 applies. " +
      'Past 21 series, the smallest are grouped into "Other".',
    checks: atlasSeriesTextMix.slice(1).flatMap((textMix, block) =>
      atlasSeriesTokens.map((token, i) =>
        markCheck(
          `${atlasTokenLabels[token]} + ${textMix}% Text`,
          `Series ${(block + 1) * atlasSeriesTokens.length + i + 1}`,
          (p) => mixHex(p.text, textMix, p[token]),
        ),
      ),
    ),
  },
];
