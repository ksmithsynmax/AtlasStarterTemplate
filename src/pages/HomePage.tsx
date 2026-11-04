import { Card, Text, Title } from '@mantine/core';

export function HomePage() {
  return (
    <Card>
      <Title order={2} fz={20}>
        Atlas prototype
      </Title>
      <Text fz={13} c="dimmed" mt={4}>
        Features will be built here. Components and tokens live in the profile menu under Design system.
      </Text>
    </Card>
  );
}
