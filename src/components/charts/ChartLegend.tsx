import type { LegendItem } from './types';
import classes from './ChartCard.module.css';

export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className={classes.legend}>
      {items.map((item) => (
        <li key={item.label} className={classes.legendItem}>
          <span className={classes.legendSwatch} style={{ backgroundColor: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
