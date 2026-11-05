import type { SVGProps } from 'react';

export interface PlusIconProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'strokeWidth'> {
  /** Width and height in px. */
  size?: number;
  /** Line thickness in viewBox units (the icon is drawn on an 18px grid). */
  strokeWidth?: number;
}

/** Plus glyph. Strokes with `currentColor`, so set `color` to theme it. */
export function PlusIcon({ size = 18, strokeWidth = 1.125, ...props }: PlusIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3.75 9H14.25" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
      <path d="M9 3.75V14.25" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
    </svg>
  );
}
