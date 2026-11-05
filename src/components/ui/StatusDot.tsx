import { Box } from '@mantine/core';
import { ATLAS_RADIUS_FULL, atlasVar, type AtlasToken } from '../../theme';

export interface StatusDotProps {
  color?: AtlasToken;
  /** Diameter in px. */
  size?: number;
  /** Accessible status text, e.g. "Connected". */
  label?: string;
}

/** Small filled circle signalling a status such as connected or active. */
export function StatusDot({ color = 'primary', size = 8, label }: StatusDotProps) {
  return (
    <Box
      component="span"
      w={size}
      h={size}
      bg={atlasVar(color)}
      bdrs={ATLAS_RADIUS_FULL}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ display: 'inline-block', flexShrink: 0 }}
    />
  );
}
