import type { SVGProps } from 'react';

export interface VisualizationIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Width and height in px. */
  size?: number;
}

/** Line chart on axes. Strokes with `currentColor`, so set `color` to theme it. */
export function VisualizationIcon({ size = 18, ...props }: VisualizationIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M2.25 2.25V15.75H15.75"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M5.25 10.5L8.25 7.5L10.5 9.75L14.25 5.25"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
