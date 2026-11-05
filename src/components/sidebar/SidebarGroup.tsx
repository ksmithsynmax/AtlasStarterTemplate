import { AccordionChevron, Collapse, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactNode } from 'react';
import { CountBadge } from '../ui';
import classes from './Sidebar.module.css';

export interface SidebarGroupProps {
  icon: ReactNode;
  label: string;
  count?: number;
  defaultOpened?: boolean;
  children: ReactNode;
}

/** Full-size row with an icon and count that collapses a list, e.g. "Ongoing". */
export function SidebarGroup({ icon, label, count, defaultOpened = true, children }: SidebarGroupProps) {
  const [opened, { toggle }] = useDisclosure(defaultOpened);

  return (
    <div>
      <UnstyledButton className={classes.row} onClick={toggle} aria-expanded={opened}>
        <span className={classes.icon}>{icon}</span>
        <span className={classes.label}>{label}</span>
        {count !== undefined && <CountBadge count={count} />}
        <AccordionChevron
          size={14}
          className={classes.chevron}
          style={{ transform: opened ? 'rotate(180deg)' : undefined }}
        />
      </UnstyledButton>
      <Collapse expanded={opened}>{children}</Collapse>
    </div>
  );
}
