import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type TooltipContentProps,
} from 'recharts';
import { atlasVar } from '../../theme';
import { ChartCard, type ChartCardProps } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';
import { barCursor, chartMargin, gridProps, xAxisProps, yAxisProps } from './chartStyles';
import { formatCurrency, formatShortDate } from './format';
import type { ValueFormatter } from './types';

export interface Candle {
  /** ISO date string. */
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CandlestickChartProps extends Omit<ChartCardProps, 'legend' | 'children'> {
  data: Candle[];
  valueFormatter?: ValueFormatter;
  domain?: [number, number];
  ticks?: number[];
}

const BODY_WIDTH = 7;
const upColor = atlasVar('success');
const downColor = atlasVar('error');

/**
 * Draws one candle inside the bar slot Recharts reserves for the [low, high]
 * range: a 1px wick across the whole range and a body from open to close.
 * Up candles are hollow (card-filled), down candles are solid.
 */
function CandleShape({ x, y, width, height, payload }: BarShapeProps) {
  const candle = payload as Candle;
  const range = candle.high - candle.low;
  if (range <= 0 || height == null || y == null || x == null || width == null) return null;

  const pxPerUnit = height / range;
  const up = candle.close >= candle.open;
  const color = up ? upColor : downColor;
  const bodyTop = y + (candle.high - Math.max(candle.open, candle.close)) * pxPerUnit;
  const bodyHeight = Math.max(Math.abs(candle.close - candle.open) * pxPerUnit, 1);
  const cx = x + width / 2;

  return (
    <g>
      <line x1={cx} x2={cx} y1={y} y2={y + height} stroke={color} />
      <rect
        x={cx - BODY_WIDTH / 2}
        y={bodyTop}
        width={BODY_WIDTH}
        height={bodyHeight}
        rx={2}
        fill={up ? atlasVar('card') : color}
        stroke={color}
      />
    </g>
  );
}

/** Open/high/low/close price chart. */
export function CandlestickChart({
  data,
  valueFormatter = formatCurrency,
  domain,
  ticks,
  ...card
}: CandlestickChartProps) {
  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const candle = payload?.[0]?.payload as Candle | undefined;
    if (!active || !candle) return null;
    const color = candle.close >= candle.open ? upColor : downColor;
    return (
      <ChartTooltip
        label={formatShortDate(candle.date)}
        rows={(['open', 'high', 'low', 'close'] as const).map((field) => ({
          label: field[0].toUpperCase() + field.slice(1),
          color,
          value: valueFormatter(candle[field]),
        }))}
      />
    );
  };

  return (
    <ChartCard
      {...card}
      legend={[
        { label: 'Up', color: upColor },
        { label: 'Down', color: downColor },
      ]}
    >
      <ResponsiveContainer>
        <ComposedChart data={data} margin={chartMargin}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="date" {...xAxisProps} tickFormatter={formatShortDate} minTickGap={24} />
          <YAxis {...yAxisProps} domain={domain ?? ['auto', 'auto']} ticks={ticks} tickFormatter={valueFormatter} />
          <Tooltip cursor={barCursor} content={renderTooltip} />
          <Bar
            dataKey={(c: Candle) => [c.low, c.high]}
            shape={CandleShape}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
