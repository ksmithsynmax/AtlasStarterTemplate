interface AreaGradientProps {
  id: string;
  color: string;
  from: number;
  to: number;
}

/** Vertical fade used under Atlas area fills; render inside a chart's `<defs>`. */
export function AreaGradient({ id, color, from, to }: AreaGradientProps) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={color} stopOpacity={from} />
      <stop offset="1" stopColor={color} stopOpacity={to} />
    </linearGradient>
  );
}
