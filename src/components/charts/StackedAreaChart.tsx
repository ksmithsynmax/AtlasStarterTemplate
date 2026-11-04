import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AreaGradient } from './AreaGradient';
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
import { formatCompact } from './format';
import type { ChartSeries, ValueFormatter } from './types';

export interface StackedAreaChartProps<T extends object> extends Omit<ChartCardProps, 'legend' | 'children'> {
  data: T[];
  xKey: keyof T & string;
  /** Stacked bottom to top in the given order. */
  series: ChartSeries<keyof T & string>[];
  valueFormatter?: ValueFormatter;
  xFormatter?: (value: string) => string;
  /** Y axis ticks; defaults to round steps from 0 that cover the stacked total. */
  yTicks?: number[];
}

/** Areas stacked on top of each other to show a total and its parts. */
export function StackedAreaChart<T extends object>({
  data,
  xKey,
  series,
  valueFormatter = formatCompact,
  xFormatter,
  yTicks,
  ...card
}: StackedAreaChartProps<T>) {
  const id = useId();
  const colored = series.map((s, i) => ({ ...s, color: seriesColor(s, i), gradientId: `${id}-${i}` }));
  const ticks = yTicks ?? niceTicks(maxOf(data, series.map((s) => s.key), true), 3);

  return (
    <ChartCard {...card} legend={seriesLegend(series)}>
      <ResponsiveContainer>
        <AreaChart data={data as Record<string, unknown>[]} margin={chartMargin}>
          <defs>
            {colored.map((s) => (
              <AreaGradient key={s.key} id={s.gradientId} color={s.color} from={0.7} to={0.15} />
            ))}
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey as string} {...xAxisProps} tickFormatter={xFormatter} interval={0} />
          <YAxis {...yAxisProps} ticks={ticks} domain={[0, ticks.at(-1)!]} tickFormatter={valueFormatter} />
          <Tooltip
            cursor={lineCursor}
            content={seriesTooltip({
              series: [...colored].reverse(),
              formatLabel: xFormatter,
              formatValue: valueFormatter,
            })}
          />
          {colored.map((s) => (
            <Area
              key={s.key}
              dataKey={s.key as string}
              name={s.label}
              stackId="stack"
              type="monotone"
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#${s.gradientId})`}
              fillOpacity={0.6}
              activeDot={{ r: 4, strokeWidth: 0, fill: s.color }}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
