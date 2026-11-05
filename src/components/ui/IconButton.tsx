import { ActionIcon, Tooltip, type FloatingPosition } from '@mantine/core';
import type { ReactNode } from 'react';
import { ATLAS_RADIUS_FULL } from '../../theme';
import classes from './IconButton.module.css';

export interface IconButtonProps {
  /** Accessible name, also shown as the tooltip. */
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  /** Square size in px. */
  size?: number;
  /** Circular with a border, e.g. the composer's send button. */
  round?: boolean;
  tooltipPosition?: FloatingPosition;
}

/**
 * Quiet icon-only button for card surfaces. Hovers with the Border token, since
 * `--atlas-hover` matches the card color in dark mode.
 */
export function IconButton({ label, icon, onClick, size = 28, round, tooltipPosition = 'top' }: IconButtonProps) {
  return (
    <Tooltip label={label} position={tooltipPosition}>
      <ActionIcon
        variant="transparent"
        size={size}
        radius={round ? ATLAS_RADIUS_FULL : 'sm'}
        className={classes.button}
        data-round={round || undefined}
        aria-label={label}
        onClick={onClick}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );
}
