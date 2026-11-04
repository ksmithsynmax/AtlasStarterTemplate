import { useId } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AreaGradient } from './AreaGradient';
import { ChartCard, type ChartCardProps } from './ChartCard';
import { seriesTooltip } from './seriesTooltip';
import { chartMargin, gridProps, lineCursor, maxOf, niceTicks, seriesColor, xAxisProps, yAxisProps } from './chartStyles';
import { formatCompact, formatShortDate } from './format';
import type { ChartSeries, ValueFormatter } from './types';

export interface DualAxisChartProps<T extends object> extends Omit<ChartCardProps, 'legend' | 'children'> {
  data: T[];
  /** Field holding an ISO date string. */
  xKey: keyof T & string;
  /** Plotted as a filled area against the left axis. */
  left: ChartSeries<keyof T & string>;
  /** Plotted as a line against the right axis. */
  right: ChartSeries<keyof T & string>;
  leftFormatter?: ValueFormatter;
  rightFormatter?: ValueFormatter;
  leftTicks?: number[];
  rightTicks?: number[];
}

/** Area on the left axis plus a line on the right axis, over dates. */
export function DualAxisChart<T extends object>({
  data,
  xKey,
  left,
  right,
  leftFormatter = formatCompact,
  rightFormatter = formatCompact,
  leftTicks,
  rightTicks,
  ...card
}: DualAxisChartProps<T>) {
  const gradientId = useId();
  const lTicks = leftTicks ?? niceTicks(maxOf(data, [left.key]), 3);
  const rTicks = rightTicks ?? niceTicks(maxOf(data, [right.key]), 4);
  const leftColor = seriesColor(left, 0);
  const rightColor = seriesColor(right, 1);
  const formatters: Record<string, ValueFormatter> = { [left.key]: leftFormatter, [right.key]: rightFormatter };

  return (
    <ChartCard
      {...card}
      legend={[
        { label: left.label, color: leftColor },
        { label: right.label, color: rightColor },
      ]}
    >
      <ResponsiveContainer>
        <ComposedChart data={data as Record<string, unknown>[]} margin={chartMargin}>
          <defs>
            <AreaGradient id={gradientId} color={leftColor} from={0.35} to={0} />
          </defs>
          <CartesianGrid {...gridProps} yAxisId="left" />
          <XAxis dataKey={xKey as string} {...xAxisProps} tickFormatter={formatShortDate} minTickGap={24} />
          <YAxis
            yAxisId="left"
            {...yAxisProps}
            ticks={lTicks}
            domain={[0, lTicks.at(-1)!]}
            tickFormatter={leftFormatter}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            {...yAxisProps}
            ticks={rTicks}
            domain={[0, rTicks.at(-1)!]}
            tickFormatter={rightFormatter}
          />
          <Tooltip
            cursor={lineCursor}
            content={seriesTooltip({
              series: [
                { ...left, color: leftColor },
                { ...right, color: rightColor },
              ],
              formatLabel: formatShortDate,
              formatValue: (value, key) => formatters[key](value),
            })}
          />
          <Area
            yAxisId="left"
            dataKey={left.key as string}
            name={left.label}
            type="monotone"
            stroke={leftColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            fillOpacity={0.6}
            activeDot={{ r: 4, strokeWidth: 0, fill: leftColor }}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            dataKey={right.key as string}
            name={right.label}
            type="monotone"
            stroke={rightColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: rightColor }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
