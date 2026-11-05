import type { SVGProps } from 'react';

export interface AgentConnectorIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Width and height in px. */
  size?: number;
}

/** Lightning bolt with speed lines. Strokes with `currentColor`, so set `color` to theme it. */
export function AgentConnectorIcon({ size = 18, ...props }: AgentConnectorIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M2 4.66602H5.33333M2 7.99935H4.66667M2 11.3327H5.33333"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M10 1.33398L6 8.66732H8.66667L7.33333 14.6673L12.6667 6.66732H9.33333L11.3333 1.33398H10Z"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
