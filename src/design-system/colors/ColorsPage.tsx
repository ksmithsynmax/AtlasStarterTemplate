import { Stack, useComputedColorScheme } from '@mantine/core';
import { AccessibilityCard } from './AccessibilityCard';
import { PaletteCard } from './PaletteCard';

export function ColorsPage() {
  const scheme = useComputedColorScheme('dark');

  return (
    <Stack gap={24}>
      <PaletteCard scheme={scheme} />
      <AccessibilityCard scheme={scheme} />
    </Stack>
  );
}
