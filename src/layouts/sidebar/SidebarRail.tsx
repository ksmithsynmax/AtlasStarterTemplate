import { ActionIcon, Tooltip, UnstyledButton } from '@mantine/core';
import { PlusIcon, SynMaxIconLogo } from '../../components/icons';
import { SidebarNavItem } from '../../components/sidebar';
import { primaryNavItems, searchItem } from './navConfig';
import { ProfileMenu } from './ProfileMenu';
import classes from './Sidebar.module.css';
import { ThemeToggle } from './ThemeToggle';

/** Collapsed 64px sidebar: icons only, the logo expands it. */
export function SidebarRail({ onExpand }: { onExpand: () => void }) {
  return (
    <div className={classes.rail}>
      <Tooltip label="Expand sidebar" position="right">
        <UnstyledButton className={classes.logoButton} aria-label="Expand sidebar" onClick={onExpand}>
          <SynMaxIconLogo />
        </UnstyledButton>
      </Tooltip>

      <Tooltip label="Create New Session" position="right">
        <ActionIcon size={40} radius={20} className={classes.railCreate} aria-label="Create New Session">
          <PlusIcon />
        </ActionIcon>
      </Tooltip>

      <nav className={classes.railItems}>
        {[searchItem, ...primaryNavItems].map((item) => (
          <SidebarNavItem key={item.label} collapsed icon={item.icon} label={item.label} />
        ))}
      </nav>

      <div className={classes.railFooter}>
        <ProfileMenu />
        <ThemeToggle />
      </div>
    </div>
  );
}
