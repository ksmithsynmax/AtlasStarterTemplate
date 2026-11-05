import { AppShell, Box } from '@mantine/core';
import { useDisclosure, useHotkeys, useLocalStorage } from '@mantine/hooks';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { ChatIcon } from '../components/icons';
import { SearchModal } from '../components/search';
import { TabBar } from '../components/tabs';
import classes from './AppLayout.module.css';
import { sampleSearchResults } from './sidebar/sampleSearchResults';
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
  const { pathname } = useLocation();
  /** Open sessions run edge to edge: docked chat beside the dashboard. */
  const fullBleed = pathname === '/' && sessionTabs.activeTab?.kind === 'session';
  const [searchOpened, search] = useDisclosure(false);
  useHotkeys([['mod+K', search.open]]);

  const createSession = () => {
    sessionTabs.create();
    navigate('/');
  };

  const openSession = (session: { id: string; title: string }) => {
    sessionTabs.open(session.id, session.title);
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
        padding={fullBleed ? 0 : 24}
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
            <SidebarPanel
              onCollapse={() => setExpanded(false)}
              onCreate={createSession}
              onSearch={search.open}
              activeSessionId={sessionTabs.activeId}
              onOpenSession={openSession}
            />
          ) : (
            <SidebarRail onExpand={() => setExpanded(true)} onCreate={createSession} onSearch={search.open} />
          )}
        </AppShell.Navbar>

        <SearchModal
          opened={searchOpened}
          onClose={search.close}
          results={sampleSearchResults}
          onSelect={(result) => {
            if (result.kind === 'session') openSession(result);
          }}
        />

        <AppShell.Main>
          {fullBleed ? (
            <Outlet />
          ) : (
            <Box maw={1424} mx="auto">
              <Outlet />
            </Box>
          )}
        </AppShell.Main>
      </AppShell>
    </SessionTabsContext.Provider>
  );
}
