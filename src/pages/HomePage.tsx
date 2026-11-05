import { Card, Text, Title } from '@mantine/core';
import { NewSessionView } from '../features/new-session/NewSessionView';
import { SessionView } from '../features/session/SessionView';
import { useSessionTabsContext } from '../layouts/useSessionTabs';

export function HomePage() {
  const { activeTab, start } = useSessionTabsContext();

  if (activeTab?.kind === 'new') {
    return <NewSessionView key={activeTab.id} onSubmit={(prompt) => start(activeTab.id, prompt)} />;
  }

  if (activeTab?.kind === 'session') {
    return <SessionView key={activeTab.id} sessionId={activeTab.id} title={activeTab.label} />;
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
