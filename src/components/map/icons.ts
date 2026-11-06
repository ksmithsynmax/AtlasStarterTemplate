import { IconLayer, ScatterplotLayer } from '@deck.gl/layers';
import { hexToRgb } from '../../theme';
import type { MapIcon, MapIconSet } from './types';

/** Icons are rasterised at this multiple of their native size so they stay sharp on retina screens. */
const RASTER_SCALE = 4;

/** Every product icon draws at this height: on the map, in playback and inside a halo. */
const ICON_PX = 16;
export const HALO_RADIUS = 18;
const HALO_FILL_ALPHA = 102;

export interface IconLayerItem {
  id: string;
  position: [number, number];
  icon: MapIconSet;
  heading?: number;
  /** 0–255. */
  alpha?: number;
  /** Ring in the icon's color around a smaller icon, for the selected or current item. */
  halo?: boolean;
}

const iconFor = (item: IconLayerItem, hoveredId: string | null): MapIcon =>
  (item.id === hoveredId && item.icon.hover) || item.icon.default;

/** deck.gl layers for product icons: halos, hover variants, heading rotation and fading. */
export function productIconLayers<T extends IconLayerItem>(
  id: string,
  data: T[],
  {
    hoveredId = null,
    pickable = false,
    haloBackdrop,
    haloColor,
    haloFillAlpha = HALO_FILL_ALPHA,
  }: {
    hoveredId?: string | null;
    pickable?: boolean;
    /** Opaque color under the halo tint, so lines and markers beneath don't show through. */
    haloBackdrop?: string;
    /** Hex ring and tint color; each icon's own color when omitted. */
    haloColor?: string;
    /** Tint strength, 0–255. */
    haloFillAlpha?: number;
  } = {},
) {
  const haloed = data.filter((item) => item.halo);
  return [
    haloed.length > 0 &&
      haloBackdrop !== undefined &&
      new ScatterplotLayer<T>({
        id: `${id}-halo-backdrop`,
        data: haloed,
        radiusUnits: 'pixels',
        getPosition: (item) => item.position,
        getRadius: HALO_RADIUS,
        getFillColor: [...hexToRgb(haloBackdrop), 255],
      }),
    haloed.length > 0 &&
      new ScatterplotLayer<T>({
        id: `${id}-halo`,
        data: haloed,
        radiusUnits: 'pixels',
        getPosition: (item) => item.position,
        getRadius: HALO_RADIUS,
        getFillColor: (item) => [...hexToRgb(haloColor ?? item.icon.color), haloFillAlpha],
        stroked: true,
        lineWidthUnits: 'pixels',
        getLineWidth: 2,
        getLineColor: (item) => [...hexToRgb(haloColor ?? item.icon.color), 255],
      }),
    new IconLayer<T>({
      id,
      data,
      pickable,
      // An <img> keeps the SVG vector, so it rasterises sharply at RASTER_SCALE; the default ImageBitmap
      // decodes at the SVG's native size and is upscaled (blurry).
      loadOptions: { image: { type: 'image' } },
      sizeUnits: 'pixels',
      getPosition: (item) => item.position,
      getIcon: (item) => {
        const icon = iconFor(item, hoveredId);
        return {
          id: icon.url,
          url: icon.url,
          width: icon.width * RASTER_SCALE,
          height: icon.height * RASTER_SCALE,
          mask: false,
        };
      },
      getSize: ICON_PX,
      getAngle: (item) => (iconFor(item, hoveredId).rotates ? -(item.heading ?? 0) : 0),
      getColor: (item) => [255, 255, 255, item.alpha ?? 255],
      updateTriggers: { getIcon: hoveredId, getAngle: hoveredId },
    }),
  ];
}
