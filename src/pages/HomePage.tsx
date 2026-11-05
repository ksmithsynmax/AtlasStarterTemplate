import { Card, Text, Title } from '@mantine/core';
import { NewSessionView } from '../features/new-session/NewSessionView';
import { useSessionTabsContext } from '../layouts/useSessionTabs';

export function HomePage() {
  const { activeTab, start } = useSessionTabsContext();

  if (activeTab?.kind === 'new') {
    return <NewSessionView key={activeTab.id} onSubmit={(prompt) => start(activeTab.id, prompt)} />;
  }

  return (
    <Card>
      <Title order={2}>Atlas prototype</Title>
      <Text fz="sm" c="dimmed" mt={4}>
        Features will be built here. Components and tokens live in the profile menu under Design system.
      </Text>
    </Card>
  );
}
