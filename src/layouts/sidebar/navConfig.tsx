import type { ReactNode } from 'react';
import { AgentConnectorIcon, ChatIcon, DatabaseIcon, DatasetIcon, MapIcon, SearchIcon, VisualizationIcon } from '../../components/icons';

export interface NavItem {
  label: string;
  icon: ReactNode;
  children?: NavItem[];
}

/** Single letters are placeholders until the real icons are supplied. */
export const searchItem: NavItem = { label: 'Search', icon: <SearchIcon /> };

export const primaryNavItems: NavItem[] = [
  { label: 'Agent Connectors', icon: <AgentConnectorIcon /> },
  { label: 'Datalinks', icon: <DatabaseIcon /> },
  { label: 'Datasets', icon: <DatasetIcon /> },
  {
    label: 'Visualizations',
    icon: <VisualizationIcon />,
    children: [
      { label: 'Hormuz daily detections & vessel counts', icon: <VisualizationIcon size={16} /> },
      { label: 'Strait of Hormuz – Satellite coverage', icon: <MapIcon size={16} /> },
    ],
  },
];

export const chatIcon: ReactNode = <ChatIcon />;
