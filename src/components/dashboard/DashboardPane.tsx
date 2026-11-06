import { ScrollArea } from '@mantine/core';
import type { ReactNode } from 'react';
import { primaryAccentVars, type AtlasToken } from '../../theme';
import classes from './DashboardPane.module.css';

export interface DashboardPaneProps {
  title?: string;
  /** Header controls, e.g. `IconButton`s and a primary button. */
  actions?: ReactNode;
  /** Replaces the primary color inside the pane, e.g. a domain's accent. */
  accent?: AtlasToken;
  children: ReactNode;
}

/** Full-height dashboard area: titled header with actions above a scrolling column of cards. */
export function DashboardPane({ title = 'Dashboard', actions, accent, children }: DashboardPaneProps) {
  return (
    <section className={classes.pane} aria-label={title} style={accent && primaryAccentVars(accent)}>
      <header className={classes.header}>
        <h2 className={classes.title}>{title}</h2>
        {actions && <div className={classes.actions}>{actions}</div>}
      </header>
      <ScrollArea className={classes.body} type="hover">
        <div className={classes.cards}>{children}</div>
      </ScrollArea>
    </section>
  );
}
