import { Box } from '@mantine/core';
import type { ReactNode } from 'react';
import { atlasFontSizes, atlasTint, atlasVar, type AtlasToken } from '../../theme';

export interface IconTileProps {
  color: AtlasToken;
  children: ReactNode;
  /** Width and height in px. */
  size?: number;
}

/** Rounded square with a soft tint of a palette color; the icon inside uses the full color. */
export function IconTile({ color, children, size = 28 }: IconTileProps) {
  return (
    <Box
      w={size}
      h={size}
      bg={atlasTint(color)}
      c={atlasVar(color)}
      bdrs="sm"
      fz={atlasFontSizes.xs}
      fw={600}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      {children}
    </Box>
  );
}
