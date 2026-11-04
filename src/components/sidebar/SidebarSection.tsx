import { AccordionChevron, Collapse, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactNode } from 'react';
import classes from './Sidebar.module.css';

export interface SidebarSectionProps {
  title: string;
  defaultOpened?: boolean;
  children: ReactNode;
}

/** Small muted heading that collapses its content, e.g. "Projects". */
export function SidebarSection({ title, defaultOpened = true, children }: SidebarSectionProps) {
  const [opened, { toggle }] = useDisclosure(defaultOpened);

  return (
    <div>
      <UnstyledButton className={classes.sectionHeader} onClick={toggle} aria-expanded={opened}>
        {title}
        <AccordionChevron
          size={12}
          className={classes.chevron}
          style={{ transform: opened ? undefined : 'rotate(-90deg)' }}
        />
      </UnstyledButton>
      <Collapse expanded={opened}>{children}</Collapse>
    </div>
  );
}
