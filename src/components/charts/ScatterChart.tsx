import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart as RechartsScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  type ScatterShapeProps,
  type TooltipContentProps,
} from 'recharts';
import { ChartCard, type ChartCardProps } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';
import { chartMargin, gridProps, lineCursor, seriesColor, xAxisProps, yAxisProps } from './chartStyles';
import { formatCompact } from './format';
import type { ValueFormatter } from './types';
import type { AtlasToken } from '../../theme';

export interface ScatterPoint {
  x: number;
  y: number;
}

export interface ScatterSeries {
  label: string;
  points: ScatterPoint[];
  color?: AtlasToken;
}

export interface ScatterChartProps extends Omit<ChartCardProps, 'legend' | 'children'> {
  series: ScatterSeries[];
  xFormatter?: ValueFormatter;
  yFormatter?: ValueFormatter;
  xDomain?: [number, number];
  yDomain?: [number, number];
  xTicks?: number[];
}

const DOT_RADIUS = 4.5;

/** Point cloud with one color per segment. */
export function ScatterChart({
  series,
  xFormatter = formatCompact,
  yFormatter = formatCompact,
  xDomain,
  yDomain,
  xTicks,
  ...card
}: ScatterChartProps) {
  const colored = series.map((s, i) => ({ ...s, key: s.label, color: seriesColor({ ...s, key: s.label }, i) }));

  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const entry = payload?.[0];
    if (!active || !entry) return null;
    const point = entry.payload as ScatterPoint;
    const segment = colored.find((s) => s.points.includes(point));
    return (
      <ChartTooltip
        label={segment?.label}
        rows={[
          { label: 'x', color: segment?.color ?? 'transparent', value: xFormatter(point.x) },
          { label: 'y', color: segment?.color ?? 'transparent', value: yFormatter(point.y) },
        ]}
      />
    );
  };

  return (
    <ChartCard {...card} legend={colored.map(({ label, color }) => ({ label, color }))}>
      <ResponsiveContainer>
        <RechartsScatterChart margin={chartMargin}>
          <CartesianGrid {...gridProps} />
          <XAxis
            type="number"
            dataKey="x"
            {...xAxisProps}
            domain={xDomain ?? ['auto', 'auto']}
            ticks={xTicks}
            tickFormatter={xFormatter}
          />
          <YAxis type="number" dataKey="y" {...yAxisProps} domain={yDomain ?? ['auto', 'auto']} tickFormatter={yFormatter} />
          <Tooltip cursor={{ ...lineCursor, strokeDasharray: '4 4' }} content={renderTooltip} />
          {colored.map((s) => (
            <Scatter
              key={s.label}
              name={s.label}
              data={s.points}
              isAnimationActive={false}
              shape={({ cx, cy }: ScatterShapeProps) => (
                <circle cx={cx} cy={cy} r={DOT_RADIUS} fill={s.color} fillOpacity={0.85} />
              )}
            />
          ))}
        </RechartsScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
