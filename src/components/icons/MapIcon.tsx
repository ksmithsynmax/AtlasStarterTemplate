import type { SVGProps } from 'react';

export interface MapIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Width and height in px. */
  size?: number;
}

/** Folded map. Strokes with `currentColor`, so set `color` to theme it. */
export function MapIcon({ size = 18, ...props }: MapIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9 18L2 22V6L9 2M9 18L16 22M9 18V2M16 22L22 18V2L16 6M16 22V6M16 6L9 2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
