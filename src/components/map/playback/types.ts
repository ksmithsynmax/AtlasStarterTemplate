import type { AtlasToken } from '../../../theme';

/**
 * One reported position. Longitudes are unwrapped (they may run past ±180)
 * so a track that crosses the date line stays one continuous line.
 */
export interface TrackPoint {
  /** Epoch ms. */
  t: number;
  lon: number;
  lat: number;
  /** The broadcast position is false, e.g. AIS spoofing. */
  spoofed: boolean;
}

/** A stretch with no reports, drawn dotted. */
export interface TrackGap {
  start: number;
  end: number;
}

/** A moment playback pauses on, such as a satellite pass. */
export interface PlaybackStop {
  id: string;
  t: number;
  lon: number;
  lat: number;
  color: AtlasToken;
  /** Shown in the status line while paused here. */
  title: string;
  detail: string;
}

/** A point on the map that lights up once playback reaches it. */
export interface PlaybackMarker {
  id: string;
  t: number;
  lon: number;
  lat: number;
  color: AtlasToken;
  tooltip: string;
}

export interface PlaybackCardRow {
  label: string;
  color: AtlasToken;
  title: string;
  subtitle?: string;
}

/** What the position card and map annotations show at one moment. */
export interface PlaybackFrame {
  rows: PlaybackCardRow[];
  note?: string;
  /** Second position joined to the vessel by a dashed line, e.g. where satellites actually saw it. */
  companion?: { lon: number; lat: number; color: AtlasToken; label: string; linkLabel: string } | null;
  vesselLabel: string;
  vesselColor: AtlasToken;
  /** Status line text when not paused on a stop. */
  status: string;
}

export interface PlaybackMoment {
  t: number;
  lon: number;
  lat: number;
  spoofed: boolean;
  inGap: boolean;
}
