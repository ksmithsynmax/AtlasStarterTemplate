import type { SVGProps } from 'react';

export interface SearchIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Width and height in px. */
  size?: number;
}

/** Magnifying glass. Strokes with `currentColor`, so set `color` to theme it. */
export function SearchIcon({ size = 18, ...props }: SearchIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M15.75 15.75L13.1251 13.125M15 8.625C15 12.1458 12.1458 15 8.625 15C5.10418 15 2.25 12.1458 2.25 8.625C2.25 5.10418 5.10418 2.25 8.625 2.25C12.1458 2.25 15 5.10418 15 8.625Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
