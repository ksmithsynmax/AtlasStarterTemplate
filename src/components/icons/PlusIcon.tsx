import type { SVGProps } from 'react';

export interface PlusIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Width and height in px. */
  size?: number;
}

/** Plus glyph. Strokes with `currentColor`, so set `color` to theme it. */
export function PlusIcon({ size = 18, ...props }: PlusIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3.75 9H14.25" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
      <path d="M9 3.75V14.25" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
    </svg>
  );
}
