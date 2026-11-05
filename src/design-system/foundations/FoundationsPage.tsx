import { Box, Card, Group, Stack, Text } from '@mantine/core';
import { ATLAS_RADIUS_FULL, atlasFontSizes, atlasRadius, atlasVar, type AtlasFontSize } from '../../theme';

const radiusSamples = [
  ...Object.entries(atlasRadius).map(([key, value]) => ({ key, value, label: `${value}px` })),
  { key: 'full', value: ATLAS_RADIUS_FULL, label: 'Pills & circles only' },
];

export function FoundationsPage() {
  return (
    <Stack gap={24}>
      <Card>
        <Text fz="md" fw={600}>
          Border radius
        </Text>
        <Text fz="xs" c="dimmed" mt={4} mb={20}>
          Only these values. Use radius="sm" | "md" | "lg" on Mantine components.
        </Text>
        <Group gap={24}>
          {radiusSamples.map((sample) => (
            <div key={sample.key}>
              <Box
                w={88}
                h={56}
                bg={atlasVar('background')}
                bd={`1px solid ${atlasVar('border')}`}
                style={{ borderRadius: sample.value }}
              />
              <Text fz="sm" fw={500} mt={8}>
                {sample.key}
              </Text>
              <Text fz="xs" c="dimmed">
                {sample.label}
              </Text>
            </div>
          ))}
        </Group>
      </Card>

      <Card>
        <Text fz="md" fw={600}>
          Font sizes
        </Text>
        <Text fz="xs" c="dimmed" mt={4} mb={20}>
          Only these values. Use fz="xxs" through fz="xl" on Mantine components.
        </Text>
        <Stack gap={16}>
          {(Object.entries(atlasFontSizes) as [AtlasFontSize, number][]).map(([key, value]) => (
            <Group key={key} gap={24} wrap="nowrap" align="baseline">
              <Text fz="xs" c="dimmed" w={88} style={{ flexShrink: 0 }}>
                {key} · {value}px
              </Text>
              <Text fz={key} lineClamp={1}>
                The quick brown fox jumps over the lazy dog
              </Text>
            </Group>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
