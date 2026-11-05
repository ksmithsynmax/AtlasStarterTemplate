import { AccordionChevron, Collapse, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactNode } from 'react';
import { atlasVar, type AtlasToken } from '../../theme';
import { SidebarEmptyState } from './SidebarEmptyState';
import classes from './Sidebar.module.css';

export interface SidebarNavGroupProps {
  icon: ReactNode;
  label: string;
  /** Tints the icon, e.g. Primary to show the section is active. */
  iconColor?: AtlasToken;
  /** Shown at the end of the row, e.g. a status dot. */
  rightSection?: ReactNode;
  /** Buttons revealed on hover or focus, e.g. `SidebarRowAction`s. */
  actions?: ReactNode;
  defaultOpened?: boolean;
  /** Shown when there are no children. */
  emptyLabel?: string;
  children?: ReactNode;
}

/** Nav row that toggles a nested list of items when clicked. */
export function SidebarNavGroup({
  icon,
  label,
  iconColor,
  rightSection,
  actions,
  defaultOpened = false,
  emptyLabel,
  children,
}: SidebarNavGroupProps) {
  const [opened, { toggle }] = useDisclosure(defaultOpened);
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <div>
      <div className={classes.groupRow} data-with-actions={actions ? true : undefined}>
        <UnstyledButton className={classes.row} onClick={toggle} aria-expanded={opened}>
          <span className={classes.icon} style={iconColor ? { color: atlasVar(iconColor) } : undefined}>
            {icon}
          </span>
          <span className={classes.label}>{label}</span>
          {rightSection && <span className={classes.rightSection}>{rightSection}</span>}
          <AccordionChevron
            size={14}
            className={classes.chevron}
            style={{ transform: opened ? 'rotate(180deg)' : undefined }}
          />
        </UnstyledButton>
        {actions && <div className={classes.rowActions}>{actions}</div>}
      </div>
      <Collapse expanded={opened}>
        {hasChildren ? children : emptyLabel && <SidebarEmptyState>{emptyLabel}</SidebarEmptyState>}
      </Collapse>
    </div>
  );
}
