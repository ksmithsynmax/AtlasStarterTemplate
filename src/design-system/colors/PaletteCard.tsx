import { Box, Card, SimpleGrid, Text } from '@mantine/core';
import {
  atlasPalette,
  atlasTokenLabels,
  atlasTokenOrder,
  atlasVar,
  type AtlasScheme,
} from '../../theme';

interface PaletteCardProps {
  scheme: AtlasScheme;
}

/** The 12 approved Atlas colors for the active scheme, with hex codes. */
export function PaletteCard({ scheme }: PaletteCardProps) {
  const palette = atlasPalette[scheme];

  return (
    <Card>
      <Text fz={13} mb={16}>
        Atlas V2 · {scheme === 'dark' ? 'Dark' : 'Light'} mode palette
      </Text>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing={8} verticalSpacing={12}>
        {atlasTokenOrder.map((token) => (
          <div key={token}>
            <Box
              h={32}
              bg={atlasVar(token)}
              bdrs="sm"
              bd={`1px solid ${atlasVar('border')}`}
            />
            <Text fz={11} mt={4}>
              {atlasTokenLabels[token]}
            </Text>
            <Text fz={11} c="dimmed">
              {palette[token]}
            </Text>
          </div>
        ))}
      </SimpleGrid>
    </Card>
  );
}
