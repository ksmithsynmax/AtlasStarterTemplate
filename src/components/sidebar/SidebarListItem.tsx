import { UnstyledButton } from '@mantine/core';
import classes from './Sidebar.module.css';

export interface SidebarListItemProps {
  title: string;
  description?: string;
  active?: boolean;
  onClick?: () => void;
}

/** Two-line list entry, e.g. a session with its last-updated time. */
export function SidebarListItem({ title, description, active, onClick }: SidebarListItemProps) {
  return (
    <UnstyledButton className={classes.listItem} data-active={active || undefined} onClick={onClick}>
      <div className={classes.listTitle}>{title}</div>
      {description && <div className={classes.listDescription}>{description}</div>}
    </UnstyledButton>
  );
}
