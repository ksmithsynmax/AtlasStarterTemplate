import { Avatar, Menu, UnstyledButton, type FloatingPosition } from '@mantine/core';
import { useNavigate } from 'react-router';
import { designSystemSections } from '../../design-system/sections';
import { ATLAS_RADIUS_FULL } from '../../theme';
import { currentUser, userInitial } from './currentUser';
import classes from './Sidebar.module.css';

export function ProfileMenu({ position = 'right-end' }: { position?: FloatingPosition }) {
  const navigate = useNavigate();

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
      </Menu.Dropdown>
    </Menu>
  );
}
