import { atlasVar, hexToRgb, type AtlasScheme, atlasPalette } from '../../../theme';
import type { PlaybackColor } from './types';

const isHex = (color: PlaybackColor): color is `#${string}` => color.startsWith('#');

/** CSS value for a playback color; tokens follow the color scheme. */
export const playbackCss = (color: PlaybackColor) => (isHex(color) ? color : atlasVar(color));

/** Hex for a playback color in `scheme`. */
export const playbackHex = (color: PlaybackColor, scheme: AtlasScheme) =>
  isHex(color) ? color : atlasPalette[scheme][color];

/** deck.gl RGBA for a playback color in `scheme`. */
export const playbackRgba = (
  color: PlaybackColor,
  scheme: AtlasScheme,
  alpha = 255,
): [number, number, number, number] => [...hexToRgb(playbackHex(color, scheme)), alpha];
