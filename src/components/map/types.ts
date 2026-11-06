import type { AtlasToken } from '../../theme';

/** Something you can click on the map: a ship detection, a well pad, a site. */
export interface MapFeature {
  id: string;
  /** Key into the map's `kinds`, e.g. "detection" or "wellPad". */
  kind: string;
  name: string;
  /** [longitude, latitude] */
  position: [number, number];
  /** Shown in the detail card, in order. */
  properties: Record<string, string | number>;
}

/** How one kind of feature is drawn and labelled. */
export interface MapFeatureKind {
  label: string;
  color: AtlasToken;
  /** Dot radius in px. */
  radius?: number;
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}
