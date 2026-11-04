import { atlasSeriesColor, atlasVar, cssMix } from '../../theme';
import type { ChartSeries, LegendItem } from './types';

/** Series color: explicit token if given, otherwise the Atlas series order. */
export function seriesColor(series: ChartSeries, index: number): string {
  return series.color ? atlasVar(series.color) : atlasSeriesColor(index);
}

export function seriesLegend(series: ChartSeries[]): LegendItem[] {
  return series.map((s, i) => ({ label: s.label, color: seriesColor(s, i) }));
}

export const chartMargin = { top: 8, right: 12, bottom: 0, left: 0 };

/**
 * Round 0-based axis ticks (steps of 1, 2, 2.5 or 5 × 10ⁿ) covering `max` in
 * about `intervals` steps, e.g. 4.7K over 3 → 0, 2K, 4K, 6K.
 */
export function niceTicks(max: number, intervals: number): number[] {
  if (max <= 0) return [0];
  const raw = max / intervals;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  const count = Math.ceil(max / step);
  return Array.from({ length: count + 1 }, (_, i) => i * step);
}

export function maxOf<T extends object>(data: T[], keys: string[], stacked = false): number {
  return data.reduce((max, row) => {
    const values = keys.map((k) => Number((row as Record<string, unknown>)[k]) || 0);
    return Math.max(max, stacked ? values.reduce((a, b) => a + b, 0) : Math.max(...values));
  }, 0);
}

const tick = { fill: atlasVar('textSecondary'), fontSize: 12 };

export const xAxisProps = {
  axisLine: false,
  tickLine: false,
  tick,
  tickMargin: 4,
  interval: 'preserveStart',
} as const;

export const yAxisProps = {
  axisLine: false,
  tickLine: false,
  tick,
  tickMargin: 8,
  width: 'auto',
} as const;

export const gridProps = {
  vertical: false,
  stroke: atlasVar('card-border'),
  strokeDasharray: '4 4',
} as const;

export const lineCursor = { stroke: atlasVar('border') };
export const barCursor = { fill: cssMix(atlasVar('text'), 4, 'transparent') };
