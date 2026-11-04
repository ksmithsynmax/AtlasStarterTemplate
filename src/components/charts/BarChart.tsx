import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard, type ChartCardProps } from './ChartCard';
import { seriesTooltip } from './seriesTooltip';
import {
  barCursor,
  chartMargin,
  gridProps,
  maxOf,
  niceTicks,
  seriesColor,
  seriesLegend,
  xAxisProps,
  yAxisProps,
} from './chartStyles';
import { formatCompact } from './format';
import type { ChartSeries, ValueFormatter } from './types';

export interface BarChartProps<T extends object> extends Omit<ChartCardProps, 'legend' | 'children'> {
  data: T[];
  /** Category field shown on the x axis. */
  xKey: keyof T & string;
  series: ChartSeries<keyof T & string>[];
  valueFormatter?: ValueFormatter;
  xFormatter?: (value: string) => string;
  /** Stack series instead of grouping them side by side. */
  stacked?: boolean;
  /** Y axis ticks; defaults to round steps from 0 that cover the data. */
  yTicks?: number[];
}

/** Grouped (or stacked) vertical bar chart over categories. */
export function BarChart<T extends object>({
  data,
  xKey,
  series,
  valueFormatter = formatCompact,
  xFormatter,
  stacked = false,
  yTicks,
  ...card
}: BarChartProps<T>) {
  const colored = series.map((s, i) => ({ ...s, color: seriesColor(s, i) }));
  const ticks = yTicks ?? niceTicks(maxOf(data, series.map((s) => s.key), stacked), 4);

  return (
    <ChartCard {...card} legend={seriesLegend(series)}>
      <ResponsiveContainer>
        <RechartsBarChart data={data as Record<string, unknown>[]} margin={chartMargin} barSize={17} barGap={4}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey as string} {...xAxisProps} tickFormatter={xFormatter} />
          <YAxis {...yAxisProps} ticks={ticks} domain={[0, ticks.at(-1)!]} tickFormatter={valueFormatter} />
          <Tooltip
            cursor={barCursor}
            content={seriesTooltip({ series: colored, formatLabel: xFormatter, formatValue: valueFormatter })}
          />
          {colored.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key as string}
              name={s.label}
              fill={s.color}
              stackId={stacked ? 'stack' : undefined}
              radius={!stacked || i === colored.length - 1 ? [4, 4, 0, 0] : 0}
              isAnimationActive={false}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
