import type { AtlasToken } from '../../../theme';
import type { MapIconSet } from '../types';

/**
 * An Atlas token, or a product's own color as hex where the map must match its icons,
 * e.g. Theia's AIS green.
 */
export type PlaybackColor = AtlasToken | `#${string}`;

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
  color: PlaybackColor;
  /** Shown in the status line while paused here. */
  title: string;
  detail: string;
  /** Short type name the timeline filters by, e.g. "Dark". Stops without one filter by title. */
  kind?: string;
  /** Product icon for the stop's event, e.g. a detection icon. */
  icon?: MapIconSet;
  /** Imagery of the stop, e.g. a satellite image chip. */
  image?: { url: string; caption: string; source?: string };
  /** Shown instead of an image, e.g. why there isn't one. */
  imageNote?: string;
}

/** A headline number for the whole story, e.g. "Days spoofed". */
export interface PlaybackStat {
  label: string;
  value: string;
  color?: PlaybackColor;
  /** Shown beside the label, e.g. the detection type it counts. */
  icon?: MapIconSet;
}

/** A short status label beside the title, e.g. sanctions status. */
export interface PlaybackTag {
  label: string;
  color: AtlasToken;
}

/** A symbol before the title that names itself on hover, e.g. a vessel's flag. */
export interface PlaybackBadge {
  symbol: string;
  label: string;
}

/** A stretch of the story under one headline, e.g. "AIS spoofed". It runs until the next chapter starts. */
export interface PlaybackChapter {
  id: string;
  start: number;
  title: string;
  /** One or two plain-language sentences. */
  summary: string;
  color: PlaybackColor;
  icon?: MapIconSet;
}

/** A point on the map that lights up once playback reaches it. */
export interface PlaybackMarker {
  id: string;
  t: number;
  lon: number;
  lat: number;
  /** Dot color when there's no icon. */
  color: PlaybackColor;
  icon?: MapIconSet;
  /** Degrees clockwise from north. */
  heading?: number;
  tooltip: string;
}

export interface PlaybackCardRow {
  label: string;
  /** Label color. Unused with `icon`, which marks the row instead. */
  color?: PlaybackColor;
  /** When every row has one, the rows read as linked places, e.g. claimed vs. actual position. */
  icon?: MapIconSet;
  title: string;
  subtitle?: string;
}

/** What the position card and map annotations show at one moment. */
export interface PlaybackFrame {
  /**
   * The number that matters most right now, shown large, e.g. how far a spoofed position is off.
   * With linked rows it sits on the link between the first two.
   */
  callout?: { value: string; label: string; color?: PlaybackColor };
  rows: PlaybackCardRow[];
  note?: string;
  /** Second position joined to the vessel by a dashed line, e.g. where satellites actually saw it. */
  companion?: {
    lon: number;
    lat: number;
    color: PlaybackColor;
    icon?: MapIconSet;
    /** Degrees clockwise from north; the vessel's course when omitted. */
    heading?: number;
    label: string;
    linkLabel: string;
  } | null;
  vesselLabel: string;
  vesselColor: PlaybackColor;
  /** Drawn at 1.5× and turned to the vessel's course; a dot when omitted. */
  vesselIcon?: MapIconSet;
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
