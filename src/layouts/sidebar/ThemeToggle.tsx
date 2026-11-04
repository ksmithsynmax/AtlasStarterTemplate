import {
  ActionIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
  type FloatingPosition,
} from '@mantine/core';
import { MoonIcon, SunIcon } from '../../components/icons';

export function ThemeToggle({ tooltipPosition = 'right' }: { tooltipPosition?: FloatingPosition }) {
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('dark');
  const nextScheme = scheme === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${nextScheme} mode`;

  return (
    <Tooltip label={label} position={tooltipPosition}>
      <ActionIcon variant="subtle" color="gray" size={40} aria-label={label} onClick={() => setColorScheme(nextScheme)}>
        {scheme === 'dark' ? <MoonIcon /> : <SunIcon />}
      </ActionIcon>
    </Tooltip>
  );
}
