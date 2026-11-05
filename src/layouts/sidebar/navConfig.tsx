import { Calendar } from '@untitledui/icons';
import type { ReactNode } from 'react';
import { AgentConnectorIcon, ChatIcon, DatabaseIcon, DatasetIcon, FolderIcon, MapIcon, SearchIcon, VisualizationIcon } from '../../components/icons';
import type { Session } from './sampleSessions';

export interface NavItem {
  label: string;
  icon: ReactNode;
  children?: NavItem[];
  /** Shown in the expanded sidebar when the item has no children. */
  emptyLabel?: string;
}

export interface ConnectedSource {
  id: string;
  title: string;
  description: string;
  connected: boolean;
}

export const agentConnectors = {
  label: 'Agent Connectors',
  icon: <AgentConnectorIcon />,
  emptyLabel: 'No sources connected yet',
  sources: [
    { id: 'agent-context', title: 'Shared Folder', description: 'agent-context (16 files)', connected: true },
    { id: 'calendar', title: 'Shared Folder', description: 'GlobalCalendarPrototypeTesting 3', connected: true },
    { id: 'design-skills', title: 'Shared Folder', description: 'DesignSkills', connected: true },
    { id: 'dashboard-generator', title: 'Shared Folder', description: 'DashboardGenerator (31 files)', connected: true },
  ] satisfies ConnectedSource[],
};

export interface Datalink {
  id: string;
  label: string;
  /** Number of tables in the datalink. */
  count: number;
}

export interface Project {
  id: string;
  label: string;
  /** Relative time of the latest change, e.g. "5h ago". */
  updated: string;
  sessions: Session[];
}

export const searchItem: NavItem = { label: 'Search', icon: <SearchIcon /> };

/** Sample data until real projects exist. */
export const sampleProjects: Project[] = [
  {
    id: 'testing-projects',
    label: 'Testing Projects',
    updated: '5h ago',
    sessions: [
      { id: 'p1-s1', title: 'Prompt regression checks', updated: '5h ago' },
      { id: 'p1-s2', title: 'Chart rendering edge cases', updated: '1 day ago' },
    ],
  },
  {
    id: 'midland-activity',
    label: 'Midland Activity',
    updated: '8h ago',
    sessions: [
      { id: 'p2-s1', title: 'Oil demand forecast for 2027 in Midland', updated: '8h ago' },
      { id: 'p2-s2', title: 'Midland Basin permit trends', updated: '2 days ago' },
      { id: 'p2-s3', title: 'Gas flaring by operator', updated: '4 days ago' },
    ],
  },
  {
    id: 'strait-of-hormuz',
    label: 'Strait of Hormuz Monitoring',
    updated: '1 day ago',
    sessions: [
      { id: 'p3-s1', title: 'Dark vessel detections – October', updated: '1 day ago' },
      { id: 'p3-s2', title: 'Tanker transit counts by flag', updated: '3 days ago' },
      { id: 'p3-s3', title: 'Satellite coverage gaps', updated: '1 week ago' },
      { id: 'p3-s4', title: 'Sanctioned fleet movements', updated: '2 weeks ago' },
    ],
  },
  {
    id: 'lng-exports',
    label: 'LNG Exports Q4',
    updated: '3 days ago',
    sessions: [{ id: 'p4-s1', title: 'Sabine Pass feedgas vs. exports', updated: '3 days ago' }],
  },
  { id: 'battery-storage', label: 'Battery Storage Research', updated: '2 weeks ago', sessions: [] },
];

export const projectIcon: ReactNode = <FolderIcon />;

/** Sample data until real datalinks exist. */
export const datalinks = {
  label: 'Datalinks',
  icon: <DatabaseIcon />,
  emptyLabel: 'No datalinks yet',
  items: [
    { id: 'dark-ship-theia', label: 'dark-ship_theia', count: 38 },
    { id: 'leviaton', label: 'leviaton', count: 3 },
    { id: 'hyperion-supply', label: 'hyperion_supply', count: 13 },
    { id: 'pipelines', label: 'pipelines', count: 4 },
    { id: 'vulcan', label: 'vulcan', count: 6 },
    { id: 'hyperion-prod', label: 'hyperion_prod', count: 42 },
    { id: 'atlas-ships-api', label: 'ATLAS Ships REST API', count: 5 },
    { id: 'theia-ais-api', label: 'Theia AIS ATLAS REST API', count: 8 },
    { id: 'user-8e9c48fb', label: 'user_8e9c48fb', count: 0 },
  ] satisfies Datalink[],
};

/** Children are sample data until real datasets and visualizations exist. */
export const primaryNavItems: NavItem[] = [
  {
    label: 'Datasets',
    icon: <DatasetIcon />,
    emptyLabel: 'No datasets yet',
    children: [
      { label: 'Permian wells 2026', icon: <DatasetIcon size={16} /> },
      { label: 'AIS vessel positions – Gulf', icon: <DatasetIcon size={16} /> },
      { label: 'LNG terminal utilization', icon: <DatasetIcon size={16} /> },
    ],
  },
  {
    label: 'Visualizations',
    icon: <VisualizationIcon />,
    emptyLabel: 'No visualizations yet',
    children: [
      { label: 'Hormuz daily detections & vessel counts', icon: <VisualizationIcon size={16} /> },
      { label: 'Strait of Hormuz – Satellite coverage', icon: <MapIcon size={16} /> },
    ],
  },
];

export const chatIcon: ReactNode = <ChatIcon />;

export const scheduledIcon: ReactNode = <Calendar size={18} />;
