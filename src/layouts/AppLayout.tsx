import { AppShell, Box } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { Outlet } from 'react-router';
import classes from './AppLayout.module.css';
import { SidebarPanel } from './sidebar/SidebarPanel';
import { SidebarRail } from './sidebar/SidebarRail';

const RAIL_WIDTH = 64;
const PANEL_WIDTH = 320;

export function AppLayout() {
  const [expanded, setExpanded] = useLocalStorage({ key: 'atlas-sidebar-expanded', defaultValue: false });

  return (
    <AppShell navbar={{ width: expanded ? PANEL_WIDTH : RAIL_WIDTH, breakpoint: 0 }} padding={24}>
      <AppShell.Navbar className={classes.navbar} withBorder={false}>
        {expanded ? (
          <SidebarPanel onCollapse={() => setExpanded(false)} />
        ) : (
          <SidebarRail onExpand={() => setExpanded(true)} />
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Box maw={1424} mx="auto">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
