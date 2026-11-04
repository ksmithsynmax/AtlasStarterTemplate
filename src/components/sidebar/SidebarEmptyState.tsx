import type { ReactNode } from 'react';
import classes from './Sidebar.module.css';

export function SidebarEmptyState({ children }: { children: ReactNode }) {
  return <div className={classes.empty}>{children}</div>;
}
