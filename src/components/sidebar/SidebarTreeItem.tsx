import { Collapse, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ChevronRight } from '@untitledui/icons';
import type { ReactNode } from 'react';
import classes from './Sidebar.module.css';

export interface SidebarTreeItemProps {
  label: string;
  count?: number;
  defaultOpened?: boolean;
  children?: ReactNode;
}

/** Expandable tree row with a chevron and trailing count, e.g. a datalink and its tables. */
export function SidebarTreeItem({ label, count, defaultOpened = false, children }: SidebarTreeItemProps) {
  const [opened, { toggle }] = useDisclosure(defaultOpened);

  return (
    <div>
      <UnstyledButton className={classes.treeItem} onClick={toggle} aria-expanded={opened}>
        <ChevronRight size={16} className={classes.treeChevron} data-opened={opened || undefined} />
        <span className={classes.label}>{label}</span>
        {count !== undefined && <span className={classes.treeCount}>{count}</span>}
      </UnstyledButton>
      {children && <Collapse expanded={opened}>{children}</Collapse>}
    </div>
  );
}
