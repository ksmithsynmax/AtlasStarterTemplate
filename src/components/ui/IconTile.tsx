import { Box } from '@mantine/core';
import type { ReactNode } from 'react';
import { atlasFontSizes, atlasPalette, atlasVar, type AtlasToken } from '../../theme';

export interface IconTileProps {
  color: AtlasToken;
  children: ReactNode;
  /** Width and height in px. */
  size?: number;
}

/** Rounded square filled with a palette color; the icon inside is white (light-mode Card) in both schemes. */
export function IconTile({ color, children, size = 28 }: IconTileProps) {
  return (
    <Box
      w={size}
      h={size}
      bg={atlasVar(color)}
      c={atlasPalette.light.card}
      bdrs="sm"
      fz={atlasFontSizes.xs}
      fw={600}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      {children}
    </Box>
  );
}
