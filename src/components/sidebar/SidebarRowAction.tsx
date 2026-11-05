import { ActionIcon, Tooltip } from '@mantine/core';
import type { MouseEvent, ReactNode } from 'react';
import classes from './Sidebar.module.css';

export interface SidebarRowActionProps {
  /** Accessible name, also shown as the tooltip. */
  label: string;
  icon: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/** Small icon button shown on a sidebar row while it is hovered or focused, e.g. "Add" or "More". */
export function SidebarRowAction({ label, icon, onClick }: SidebarRowActionProps) {
  return (
    <Tooltip label={label} position="top">
      <ActionIcon
        variant="transparent"
        size={24}
        radius="sm"
        className={classes.rowAction}
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          onClick?.(event);
        }}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );
}
