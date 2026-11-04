import type { SVGProps } from 'react';

export interface MoonIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Width and height in px. */
  size?: number;
}

/** Crescent moon. Strokes with `currentColor`, so set `color` to theme it. */
export function MoonIcon({ size = 18, ...props }: MoonIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13.2701 12.5766C14.4215 12.5766 15.515 12.3286 16.5 11.8832C15.2688 14.6057 12.529 16.5 9.34673 16.5C5.0131 16.5 1.5 12.9869 1.5 8.65327C1.5 5.47102 3.39432 2.73122 6.11683 1.5C5.67135 2.48505 5.42337 3.57851 5.42337 4.7299C5.42337 9.06353 8.93647 12.5766 13.2701 12.5766Z"
        strokeWidth="1.45833"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
