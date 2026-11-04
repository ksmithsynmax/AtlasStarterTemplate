import { ActionIcon, Tooltip, UnstyledButton } from '@mantine/core';
import type { ReactNode } from 'react';
import classes from './Sidebar.module.css';

export interface SidebarNavItemProps {
  icon: ReactNode;
  label: string;
  /** Icon-only button with a tooltip, for the collapsed rail. */
  collapsed?: boolean;
  /** Indented, smaller row for items under a parent. */
  nested?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({ icon, label, collapsed, nested, active, onClick }: SidebarNavItemProps) {
  if (collapsed) {
    return (
      <Tooltip label={label} position="right">
        <ActionIcon
          variant="subtle"
          color="gray"
          size={40}
          className={classes.railButton}
          aria-label={label}
          data-active={active || undefined}
          onClick={onClick}
        >
          {icon}
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <UnstyledButton
      className={classes.row}
      data-nested={nested || undefined}
      data-active={active || undefined}
      onClick={onClick}
    >
      <span className={classes.icon}>{icon}</span>
      <span className={classes.label}>{label}</span>
    </UnstyledButton>
  );
}
