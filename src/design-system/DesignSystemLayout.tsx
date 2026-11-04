import { Stack, Tabs, Text, Title } from '@mantine/core';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { designSystemSections } from './sections';

/** Internal reference for the prototype's components; reached from the app menu. */
export function DesignSystemLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <Stack gap={24}>
      <div>
        <Title order={2} fz={20}>
          Design system
        </Title>
        <Text fz={13} c="dimmed">
          Atlas V2 tokens and components used across the prototype.
        </Text>
      </div>
      <Tabs value={pathname} onChange={(value) => value && navigate(value)}>
        <Tabs.List>
          {designSystemSections.map((section) => (
            <Tabs.Tab key={section.path} value={section.path}>
              {section.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <Outlet />
    </Stack>
  );
}
