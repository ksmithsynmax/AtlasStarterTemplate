import { AccordionChevron, ActionIcon, Button, Divider, ScrollArea, Tooltip } from '@mantine/core';
import { useState } from 'react';
import { PlusIcon, SynMaxLogo } from '../../components/icons';
import {
  SidebarEmptyState,
  SidebarGroup,
  SidebarListItem,
  SidebarNavItem,
  SidebarSection,
} from '../../components/sidebar';
import { primaryNavItems, searchItem, sessionsIcon } from './navConfig';
import { ProfileMenu } from './ProfileMenu';
import { sampleSessions } from './sampleSessions';
import classes from './Sidebar.module.css';
import { ThemeToggle } from './ThemeToggle';

/** Expanded sidebar with labels, projects and sessions. */
export function SidebarPanel({ onCollapse }: { onCollapse: () => void }) {
  const [activeSessionId, setActiveSessionId] = useState(sampleSessions[0]?.id);

  return (
    <div className={classes.panel}>
      <div className={classes.panelHeader}>
        <SynMaxLogo className={classes.wordmark} aria-label="SynMax Intelligence" role="img" />
        <Tooltip label="Collapse sidebar" position="right">
          <ActionIcon variant="subtle" color="gray" size={32} aria-label="Collapse sidebar" onClick={onCollapse}>
            <AccordionChevron size={14} style={{ transform: 'rotate(90deg)' }} />
          </ActionIcon>
        </Tooltip>
      </div>

      <div className={classes.panelCreate}>
        <Button fullWidth size="lg" radius={999} fz={16} fw={500} leftSection={<PlusIcon />}>
          Create New Session
        </Button>
      </div>

      <ScrollArea className={classes.panelBody} scrollbarSize={6} type="hover">
        <nav className={classes.panelSection}>
          {primaryNavItems.map((item) => (
            <div key={item.label}>
              <SidebarNavItem icon={item.icon} label={item.label} />
              {item.children?.map((child) => (
                <SidebarNavItem key={child.label} nested icon={child.icon} label={child.label} />
              ))}
            </div>
          ))}
        </nav>

        <Divider className={classes.divider} />

        <div className={classes.panelSection}>
          <SidebarNavItem icon={searchItem.icon} label={searchItem.label} />
          <SidebarSection title="Projects">
            <SidebarEmptyState>No projects</SidebarEmptyState>
          </SidebarSection>
        </div>

        <Divider className={classes.divider} />

        <div className={classes.panelSection}>
          <SidebarSection title="Sessions">
            <SidebarGroup icon={sessionsIcon} label="Ongoing" count={sampleSessions.length}>
              {sampleSessions.map((session) => (
                <SidebarListItem
                  key={session.id}
                  title={session.title}
                  description={session.updated}
                  active={session.id === activeSessionId}
                  onClick={() => setActiveSessionId(session.id)}
                />
              ))}
            </SidebarGroup>
          </SidebarSection>
        </div>
      </ScrollArea>

      <div className={classes.panelFooter}>
        <ProfileMenu position="top-start" />
        <ThemeToggle tooltipPosition="top" />
      </div>
    </div>
  );
}
