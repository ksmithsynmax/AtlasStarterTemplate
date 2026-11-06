import { useLocalStorage } from '@mantine/hooks';
import type { AtlasToken } from '../theme';
import { domainAccent, type AtlasDomain } from './products';

/** `atlas` keeps dashboards on the Atlas primary; a domain gives them its accent. */
export type DashboardTheme = 'atlas' | AtlasDomain;

export const dashboardThemes: { value: DashboardTheme; label: string }[] = [
  { value: 'atlas', label: 'Atlas' },
  { value: 'maritime', label: 'Maritime (Theia)' },
  { value: 'energy', label: 'Energy (Hyperion)' },
];

export function useDashboardTheme() {
  return useLocalStorage<DashboardTheme>({ key: 'atlas-dashboard-theme', defaultValue: 'atlas' });
}

/** Accent for dashboard areas, or undefined to keep the Atlas primary. */
export function useDashboardAccent(): AtlasToken | undefined {
  const [dashboardTheme] = useDashboardTheme();
  return dashboardTheme === 'atlas' ? undefined : domainAccent[dashboardTheme];
}
