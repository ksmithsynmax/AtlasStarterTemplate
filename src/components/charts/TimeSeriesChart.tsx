import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard, type ChartCardProps } from './ChartCard';
import { seriesTooltip } from './seriesTooltip';
import {
  chartMargin,
  gridProps,
  lineCursor,
  maxOf,
  niceTicks,
  seriesColor,
  seriesLegend,
  xAxisProps,
  yAxisProps,
} from './chartStyles';
import { formatCompact, formatShortDate } from './format';
import type { ChartSeries, ValueFormatter } from './types';

export interface TimeSeriesChartProps<T extends object> extends Omit<ChartCardProps, 'legend' | 'children'> {
  data: T[];
  /** Field holding an ISO date string. */
  xKey: keyof T & string;
  series: ChartSeries<keyof T & string>[];
  valueFormatter?: ValueFormatter;
  /** Y axis ticks; defaults to round steps from 0 that cover the data. */
  yTicks?: number[];
}

/** Multi-series line chart over dates. */
export function TimeSeriesChart<T extends object>({
  data,
  xKey,
  series,
  valueFormatter = formatCompact,
  yTicks,
  ...card
}: TimeSeriesChartProps<T>) {
  const colored = series.map((s, i) => ({ ...s, color: seriesColor(s, i) }));
  const ticks = yTicks ?? niceTicks(maxOf(data, series.map((s) => s.key)), 3);

  return (
    <ChartCard {...card} legend={seriesLegend(series)}>
      <ResponsiveContainer>
        <LineChart data={data as Record<string, unknown>[]} margin={chartMargin}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey as string} {...xAxisProps} tickFormatter={formatShortDate} minTickGap={24} />
          <YAxis {...yAxisProps} ticks={ticks} domain={[0, ticks.at(-1)!]} tickFormatter={valueFormatter} />
          <Tooltip
            cursor={lineCursor}
            content={seriesTooltip({ series: colored, formatLabel: formatShortDate, formatValue: valueFormatter })}
          />
          {colored.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key as string}
              name={s.label}
              type="monotone"
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: s.color }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
