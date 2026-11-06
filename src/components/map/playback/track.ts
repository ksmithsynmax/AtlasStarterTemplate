import type { TrackGap, TrackPoint } from './types';

export type RunKind = 'genuine' | 'spoofed' | 'gap';

export interface TrackRun {
  kind: RunKind;
  path: [number, number][];
}

export interface TrackPosition {
  /** Index of the last point at or before the time. */
  index: number;
  lon: number;
  lat: number;
}

export const DAY_MS = 864e5;

/** Interpolated position at time `t`; `track` must be sorted by time. */
export function positionAt(track: TrackPoint[], t: number): TrackPosition {
  const last = track.length - 1;
  if (t <= track[0].t) return { index: 0, lon: track[0].lon, lat: track[0].lat };
  if (t >= track[last].t) return { index: last, lon: track[last].lon, lat: track[last].lat };
  let lo = 0;
  let hi = last;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (track[mid].t <= t) lo = mid;
    else hi = mid;
  }
  const a = track[lo];
  const b = track[hi];
  const f = (t - a.t) / (b.t - a.t);
  return { index: lo, lon: a.lon + (b.lon - a.lon) * f, lat: a.lat + (b.lat - a.lat) * f };
}

export const inGap = (gaps: TrackGap[], t: number) => gaps.some((gap) => t > gap.start && t < gap.end);

const kindOf = (gaps: TrackGap[], a: TrackPoint, b: TrackPoint): RunKind =>
  gaps.some((gap) => b.t > gap.start && a.t < gap.end) ? 'gap' : b.spoofed ? 'spoofed' : 'genuine';

/** Splits the track into same-kind runs, up to `until` (the whole track by default). */
export function trackRuns(track: TrackPoint[], gaps: TrackGap[], until?: TrackPosition): TrackRun[] {
  const runs: TrackRun[] = [];
  const end = until ? until.index : track.length - 1;
  const add = (kind: RunKind, from: [number, number], to: [number, number]) => {
    const current = runs.at(-1);
    if (current?.kind === kind) current.path.push(to);
    else runs.push({ kind, path: [from, to] });
  };
  for (let i = 0; i < end; i++) {
    add(kindOf(gaps, track[i], track[i + 1]), [track[i].lon, track[i].lat], [track[i + 1].lon, track[i + 1].lat]);
  }
  if (until && end < track.length - 1) {
    add(kindOf(gaps, track[end], track[end + 1]), [track[end].lon, track[end].lat], [until.lon, until.lat]);
  }
  return runs;
}

/** Shifts `lon` by whole turns so it sits nearest `reference`. */
export const nearestLon = (lon: number, reference: number) => lon + 360 * Math.round((reference - lon) / 360);

/** Great-circle distance in km. */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const r = Math.PI / 180;
  const h =
    Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

/** "08 Dec 2025 03:02 UTC" */
export function formatUtc(t: number) {
  const d = new Date(t);
  return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

/** "21.67°N 114.94°E", wrapping the longitude back into ±180. */
export function formatCoords(lat: number, lon: number) {
  const wrapped = ((lon + 540) % 360) - 180;
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(wrapped).toFixed(2)}°${wrapped >= 0 ? 'E' : 'W'}`;
}
