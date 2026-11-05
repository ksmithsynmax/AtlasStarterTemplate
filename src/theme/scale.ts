/**
 * Approved sizing rules. Use these keys (or the matching Mantine props like
 * `radius="md"` / `fz="sm"`) instead of raw pixel values.
 */
export const atlasRadius = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

/** Fully rounded shapes (pills, circles) are the one exception to the radius scale. */
export const ATLAS_RADIUS_FULL = 999;

export const atlasFontSizes = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

export type AtlasRadius = keyof typeof atlasRadius;
export type AtlasFontSize = keyof typeof atlasFontSizes;

export const px = (value: number) => `${value}px`;
