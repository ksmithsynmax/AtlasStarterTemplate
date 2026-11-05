import { AccordionChevron, ActionIcon, Button, Divider, ScrollArea, Tooltip } from '@mantine/core';
import { KebabIcon, PlusIcon, SynMaxLogo } from '../../components/icons';
import {
  SidebarEmptyState,
  SidebarGroup,
  SidebarListItem,
  SidebarNavGroup,
  SidebarNavItem,
  SidebarRowAction,
  SidebarSection,
  SidebarTreeItem,
} from '../../components/sidebar';
import { CountBadge, StatusDot } from '../../components/ui';
import { ATLAS_RADIUS_FULL } from '../../theme';
import {
  agentConnectors,
  chatIcon,
  datalinks,
  primaryNavItems,
  projectIcon,
  sampleProjects,
  scheduledIcon,
  searchItem,
} from './navConfig';
import { ProfileMenu } from './ProfileMenu';
import { sampleScheduledSessions, sampleSessions, type Session } from './sampleSessions';
import classes from './Sidebar.module.css';
import { ThemeToggle } from './ThemeToggle';

/** Expanded sidebar with labels, projects and sessions. */
export function SidebarPanel({
  onCollapse,
  onCreate,
  onSearch,
  activeSessionId,
  onOpenSession,
}: {
  onCollapse: () => void;
  onCreate: () => void;
  onSearch: () => void;
  activeSessionId?: string;
  onOpenSession: (session: Session) => void;
}) {
  const connectedCount = agentConnectors.sources.filter((source) => source.connected).length;

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
        <Button fullWidth size="lg" radius={ATLAS_RADIUS_FULL} fz="md" fw={500} leftSection={<PlusIcon strokeWidth={2} />} onClick={onCreate}>
          Create New Session
        </Button>
      </div>

      <ScrollArea className={classes.panelBody} type="hover">
        <nav className={classes.panelSection}>
          <SidebarNavGroup
            icon={agentConnectors.icon}
            label={agentConnectors.label}
            iconColor={connectedCount > 0 ? 'primary' : undefined}
            rightSection={connectedCount > 0 && <StatusDot label="Sources connected" />}
            emptyLabel={agentConnectors.emptyLabel}
          >
            {agentConnectors.sources.map((source) => (
              <SidebarListItem
                key={source.id}
                nested
                title={source.title}
                description={source.description}
                leftSection={<StatusDot color={source.connected ? 'primary' : 'textSecondary'} />}
              />
            ))}
          </SidebarNavGroup>
          <SidebarNavGroup icon={datalinks.icon} label={datalinks.label} emptyLabel={datalinks.emptyLabel}>
            {datalinks.items.map((datalink) => (
              <SidebarTreeItem key={datalink.id} label={datalink.label} count={datalink.count} />
            ))}
          </SidebarNavGroup>
          {primaryNavItems.map((item) => (
            <SidebarNavGroup key={item.label} icon={item.icon} label={item.label} emptyLabel={item.emptyLabel}>
              {item.children?.map((child) => (
                <SidebarNavItem key={child.label} nested icon={child.icon} label={child.label} />
              ))}
            </SidebarNavGroup>
          ))}
        </nav>

        <Divider className={classes.divider} />

        <div className={classes.panelSection}>
          <SidebarNavItem icon={searchItem.icon} label={searchItem.label} onClick={onSearch} />
          <SidebarSection title="Projects">
            {sampleProjects.length > 0 ? (
              sampleProjects.map((project) => (
                <SidebarNavGroup
                  key={project.id}
                  icon={projectIcon}
                  label={project.label}
                  emptyLabel="No sessions in this project"
                  rightSection={<CountBadge count={project.sessions.length} />}
                  actions={
                    <>
                      <SidebarRowAction label="Add to project" icon={<PlusIcon size={16} strokeWidth={1.5} />} />
                      <SidebarRowAction label="More options" icon={<KebabIcon />} />
                    </>
                  }
                >
                  {project.sessions.map((session) => (
                    <SidebarListItem
                      key={session.id}
                      nested
                      title={session.title}
                      description={session.updated}
                      active={session.id === activeSessionId}
                      onClick={() => onOpenSession(session)}
                    />
                  ))}
                </SidebarNavGroup>
              ))
            ) : (
              <SidebarEmptyState>No projects</SidebarEmptyState>
            )}
          </SidebarSection>
        </div>

        <Divider className={classes.divider} />

        <div className={classes.panelSection}>
          <SidebarSection title="Sessions">
            <SidebarGroup icon={chatIcon} label="Ongoing" count={sampleSessions.length}>
              {sampleSessions.map((session) => (
                <SidebarListItem
                  key={session.id}
                  title={session.title}
                  description={session.updated}
                  active={session.id === activeSessionId}
                  onClick={() => onOpenSession(session)}
                />
              ))}
            </SidebarGroup>
            <SidebarGroup
              icon={scheduledIcon}
              label="Scheduled"
              count={sampleScheduledSessions.length}
              defaultOpened={false}
            >
              {sampleScheduledSessions.length > 0 ? (
                sampleScheduledSessions.map((session) => (
                  <SidebarListItem
                    key={session.id}
                    title={session.title}
                    description={session.updated}
                    active={session.id === activeSessionId}
                    onClick={() => onOpenSession(session)}
                  />
                ))
              ) : (
                <SidebarEmptyState>No scheduled sessions</SidebarEmptyState>
              )}
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
