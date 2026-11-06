import { Avatar, Menu, UnstyledButton, type FloatingPosition } from '@mantine/core';
import { Check } from '@untitledui/icons';
import { useNavigate } from 'react-router';
import { designSystemSections } from '../../design-system/sections';
import { dashboardThemes, useDashboardTheme } from '../../lab/dashboardTheme';
import { ATLAS_RADIUS_FULL } from '../../theme';
import { currentUser, userInitial } from './currentUser';
import classes from './Sidebar.module.css';

export function ProfileMenu({ position = 'right-end' }: { position?: FloatingPosition }) {
  const navigate = useNavigate();
  const [dashboardTheme, setDashboardTheme] = useDashboardTheme();

  return (
    <Menu position={position} offset={12} width={200}>
      <Menu.Target>
        <UnstyledButton className={classes.avatarButton} aria-label={`Profile menu for ${currentUser.name}`}>
          <Avatar size={32} radius={ATLAS_RADIUS_FULL} classNames={{ placeholder: classes.avatar }}>
            {userInitial(currentUser.name)}
          </Avatar>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Design system</Menu.Label>
        {designSystemSections.map((section) => (
          <Menu.Item key={section.path} onClick={() => navigate(section.path)}>
            {section.label}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Label>Prototyping</Menu.Label>
        <Menu.Item onClick={() => navigate('/lab')}>Component Lab</Menu.Item>
        <Menu.Divider />
        <Menu.Label>Dashboard theme</Menu.Label>
        {dashboardThemes.map((option) => (
          <Menu.Item
            key={option.value}
            closeMenuOnClick={false}
            rightSection={option.value === dashboardTheme ? <Check size={16} /> : null}
            aria-checked={option.value === dashboardTheme}
            role="menuitemradio"
            onClick={() => setDashboardTheme(option.value)}
          >
            {option.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
