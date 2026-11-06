import type { AtlasToken } from '../../theme';

/** One map icon image, such as a product's detection icon. */
export interface MapIcon {
  url: string;
  /** Native size in px; drawn at this size unless scaled. */
  width: number;
  height: number;
  /** Drawn pointing north, so it can be rotated to a heading. */
  rotates?: boolean;
}

/** An icon and its optional hover variant. */
export interface MapIconSet {
  /** The icon's own fill as hex, used for its halo. Product icons keep their product colors. */
  color: string;
  default: MapIcon;
  hover?: MapIcon;
}

/** Something you can click on the map: a ship detection, a well pad, a site. */
export interface MapFeature {
  id: string;
  /** Key into the map's `kinds`, e.g. "detection" or "wellPad". */
  kind: string;
  name: string;
  /** [longitude, latitude] */
  position: [number, number];
  /** Degrees clockwise from north, for icons that rotate. */
  heading?: number;
  /** Shown in the detail card, in order. */
  properties: Record<string, string | number>;
}

/** How one kind of feature is drawn and labelled. */
export interface MapFeatureKind {
  label: string;
  color: AtlasToken;
  /** Dot radius in px. */
  radius?: number;
  /** Product icon drawn instead of a dot. */
  icon?: MapIconSet;
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}
