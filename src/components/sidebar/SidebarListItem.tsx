import { UnstyledButton } from '@mantine/core';
import type { ReactNode } from 'react';
import classes from './Sidebar.module.css';

export interface SidebarListItemProps {
  title: string;
  description?: string;
  /** Shown beside the title, e.g. a status dot. */
  leftSection?: ReactNode;
  /** Indents the item to line up with its parent row's label. */
  nested?: boolean;
  active?: boolean;
  onClick?: () => void;
}

/** Two-line list entry, e.g. a session with its last-updated time. Static (no hover) without `onClick`. */
export function SidebarListItem({ title, description, leftSection, nested, active, onClick }: SidebarListItemProps) {
  const content = (
    <>
      {leftSection && <span className={classes.listLeft}>{leftSection}</span>}
      <span className={classes.listBody}>
        <span className={classes.listTitle}>{title}</span>
        {description && <span className={classes.listDescription}>{description}</span>}
      </span>
    </>
  );

  if (!onClick) {
    return (
      <div className={classes.listItem} data-nested={nested || undefined} data-static>
        {content}
      </div>
    );
  }

  return (
    <UnstyledButton
      className={classes.listItem}
      data-nested={nested || undefined}
      data-active={active || undefined}
      onClick={onClick}
    >
      {content}
    </UnstyledButton>
  );
}
