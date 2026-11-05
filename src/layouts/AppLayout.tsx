import { AppShell, Box } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { Outlet, useNavigate } from 'react-router';
import { ChatIcon } from '../components/icons';
import { TabBar } from '../components/tabs';
import classes from './AppLayout.module.css';
import { SidebarPanel } from './sidebar/SidebarPanel';
import { SidebarRail } from './sidebar/SidebarRail';
import { SessionTabsContext, useSessionTabs } from './useSessionTabs';

const RAIL_WIDTH = 64;
const PANEL_WIDTH = 320;
const TAB_BAR_HEIGHT = 36;

export function AppLayout() {
  const [expanded, setExpanded] = useLocalStorage({ key: 'atlas-sidebar-expanded', defaultValue: false });
  const sessionTabs = useSessionTabs();
  const navigate = useNavigate();

  const createSession = () => {
    sessionTabs.create();
    navigate('/');
  };

  const selectTab = (id: string) => {
    sessionTabs.select(id);
    navigate('/');
  };

  return (
    <SessionTabsContext.Provider value={sessionTabs}>
      <AppShell
        layout="alt"
        header={{ height: TAB_BAR_HEIGHT }}
        navbar={{ width: expanded ? PANEL_WIDTH : RAIL_WIDTH, breakpoint: 0 }}
        padding={24}
      >
        <AppShell.Header className={classes.header} withBorder={false}>
          <TabBar
            tabs={sessionTabs.tabs.map((tab) => ({ ...tab, icon: <ChatIcon size={14} /> }))}
            activeId={sessionTabs.activeId}
            onSelect={selectTab}
            onClose={sessionTabs.close}
          />
        </AppShell.Header>

        <AppShell.Navbar className={classes.navbar} withBorder={false}>
          {expanded ? (
            <SidebarPanel onCollapse={() => setExpanded(false)} onCreate={createSession} />
          ) : (
            <SidebarRail onExpand={() => setExpanded(true)} onCreate={createSession} />
          )}
        </AppShell.Navbar>

        <AppShell.Main>
          <Box maw={1424} mx="auto">
            <Outlet />
          </Box>
        </AppShell.Main>
      </AppShell>
    </SessionTabsContext.Provider>
  );
}
