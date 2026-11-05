import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipContentProps } from 'recharts';
import { ChartCard, type ChartCardProps } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';
import { seriesColor } from './chartStyles';
import { formatCompact } from './format';
import type { ValueFormatter } from './types';
import { atlasRadius, type AtlasToken } from '../../theme';
import classes from './DonutChart.module.css';

export interface DonutSlice {
  label: string;
  value: number;
  color?: AtlasToken;
}

export interface DonutChartProps extends Omit<ChartCardProps, 'legend' | 'children'> {
  data: DonutSlice[];
  /** Caption under the total in the middle of the ring, e.g. "Sessions". */
  totalLabel?: string;
  valueFormatter?: ValueFormatter;
}

/** Ring chart with a centered total; legend entries show each slice's share. */
export function DonutChart({ data, totalLabel, valueFormatter = formatCompact, ...card }: DonutChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  const slices = data.map((slice, i) => ({
    ...slice,
    fill: seriesColor({ ...slice, key: slice.label }, i),
    share: total ? Math.round((slice.value / total) * 100) : 0,
  }));

  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const slice = payload?.[0]?.payload as (typeof slices)[number] | undefined;
    if (!active || !slice) return null;
    return (
      <ChartTooltip
        rows={[{ label: slice.label, color: slice.fill, value: `${valueFormatter(slice.value)} · ${slice.share}%` }]}
      />
    );
  };

  return (
    <ChartCard {...card} legend={slices.map((s) => ({ label: `${s.label} ${s.share}%`, color: s.fill }))}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip content={renderTooltip} />
          <Pie
            data={slices}
            dataKey="value"
            nameKey="label"
            innerRadius="70%"
            outerRadius="92%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={4}
            cornerRadius={atlasRadius.md}
            stroke="none"
            isAnimationActive={false}
          >
            {slices.map((s) => (
              <Cell key={s.label} fill={s.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className={classes.center}>
        <div className={classes.total}>{valueFormatter(total)}</div>
        {totalLabel && <div className={classes.totalLabel}>{totalLabel}</div>}
      </div>
    </ChartCard>
  );
}
