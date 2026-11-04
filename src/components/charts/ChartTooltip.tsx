import type { ReactNode } from 'react';
import classes from './ChartCard.module.css';

export interface ChartTooltipRow {
  label: string;
  color: string;
  value: ReactNode;
}

interface ChartTooltipProps {
  label?: ReactNode;
  rows: ChartTooltipRow[];
}

/** Presentational tooltip shared by every Atlas chart. */
export function ChartTooltip({ label, rows }: ChartTooltipProps) {
  if (rows.length === 0) return null;

  return (
    <div className={classes.tooltip}>
      {label != null && <div className={classes.tooltipLabel}>{label}</div>}
      {rows.map((row) => (
        <div key={row.label} className={classes.tooltipRow}>
          <span className={classes.legendSwatch} style={{ backgroundColor: row.color }} />
          <span>{row.label}</span>
          <span className={classes.tooltipValue}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}
