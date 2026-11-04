import type { ReactNode } from 'react';
import type { TooltipContentProps } from 'recharts';
import { ChartTooltip } from './ChartTooltip';

interface SeriesTooltipOptions {
  series: { key: string; label: string; color: string }[];
  formatLabel?: (label: string) => ReactNode;
  formatValue?: (value: number, key: string) => ReactNode;
}

/**
 * Recharts `content` renderer that maps the hovered payload back to Atlas
 * series, so labels and swatch colors match the legend (area payloads would
 * otherwise report their gradient URL as the color).
 */
export function seriesTooltip({ series, formatLabel, formatValue }: SeriesTooltipOptions) {
  return function SeriesTooltipContent({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload?.length) return null;

    const rows = series.flatMap((s) => {
      const entry = payload.find((p) => p.dataKey === s.key);
      if (!entry || typeof entry.value !== 'number') return [];
      return [{ label: s.label, color: s.color, value: formatValue?.(entry.value, s.key) ?? entry.value }];
    });

    return <ChartTooltip label={formatLabel ? formatLabel(String(label)) : label} rows={rows} />;
  };
}
