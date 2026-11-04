import type { ReactNode } from 'react';
import { DatabaseIcon, SearchIcon } from '../../components/icons';

export interface NavItem {
  label: string;
  icon: ReactNode;
  children?: NavItem[];
}

/** Single letters are placeholders until the real icons are supplied. */
export const searchItem: NavItem = { label: 'Search', icon: <SearchIcon /> };

export const primaryNavItems: NavItem[] = [
  { label: 'Agent Connectors', icon: 'A' },
  { label: 'Datalinks', icon: <DatabaseIcon /> },
  { label: 'Datasets', icon: 'D' },
  {
    label: 'Visualizations',
    icon: 'V',
    children: [
      { label: 'Hormuz daily detections & vessel counts', icon: 'V' },
      { label: 'Strait of Hormuz – Satellite coverage', icon: 'M' },
    ],
  },
];

export const sessionsIcon: ReactNode = 'C';
