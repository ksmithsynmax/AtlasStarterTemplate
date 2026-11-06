import {
  distanceKm,
  formatCoords,
  formatUtc,
  type PlaybackFrame,
  type PlaybackMarker,
  type PlaybackMoment,
  type PlaybackStop,
  type TrackGap,
  type TrackPoint,
} from '../../components/map';
import { fetchPublicDataset } from '../../data/synmaxPublic';

/** Dataset rows repeat once per world copy; `copy` 0 is the original. */
interface TrackRow {
  part: 'genuine' | 'spoofed';
  ts: string;
  lat: number;
  lon: number;
  copy: number;
}

interface DetectionRow {
  object_id_int: number;
  detection_class: 'AIS On' | 'Dark' | 'Spoofing' | 'Unattributed';
  vessel_name: string;
  imo: string;
  mmsi: string;
  flag: string;
  dimensions: string;
  acquired_str: string;
  lat: number;
  lon: number;
  copy: number;
}

interface Detection {
  id: number;
  dark: boolean;
  acquired: string;
  t: number;
  lat: number;
  lon: number;
}

/** A Theia vessel story from a shared dashboard, plus the analyst's annotations. */
export interface TheiaPlaybackSource {
  shareToken: string;
  datasets: { track: number; detections: number; spoofing: number };
  /** AIS reception gaps, which are not spoofing. */
  gaps: TrackGap[];
  /** Where the vessel was confirmed in the end, e.g. by a high-resolution image. */
  berth?: { t: number; lat: number; lon: number; name: string; source: string; title: string; detail: string };
  /** From this time until the next dark detection there's no imagery of the vessel. */
  noImageryFrom?: number;
  /** QC'd claimed-to-actual distances (km) by detection id, used within 30 minutes of the detection. */
  distanceOverrides?: Record<string, number>;
  /** Plain-language sea area for a position. */
  area: (lat: number, lon: number) => string;
}

export interface TheiaPlayback {
  track: TrackPoint[];
  gaps: TrackGap[];
  stops: PlaybackStop[];
  markers: PlaybackMarker[];
  describe: (moment: PlaybackMoment) => PlaybackFrame;
}

const HOUR_MS = 36e5;
const DAY_MS = 864e5;

/** Parses "2025-12-06 04:00 UTC", "2025-12-06 04:00" and "2026-02-02" as UTC. */
function parseUtc(value: string) {
  const s = value.replace(' UTC', '').trim();
  if (s.length <= 10) return Date.parse(`${s}T00:00:00Z`);
  return Date.parse(`${s.replace(' ', 'T')}${s.length <= 16 ? ':00' : ''}Z`);
}

const markerTooltip = (row: DetectionRow, kind: string) =>
  [`${row.vessel_name || 'Unidentified'} · ${kind}`, `IMO ${row.imo} · MMSI ${row.mmsi} · ${row.flag}`, row.acquired_str].join('\n');

export async function loadTheiaPlayback(source: TheiaPlaybackSource, signal?: AbortSignal): Promise<TheiaPlayback> {
  const { shareToken, datasets, gaps, berth, noImageryFrom, distanceOverrides = {}, area } = source;
  const [trackRows, detectionRows, spoofRows] = await Promise.all([
    fetchPublicDataset<TrackRow>(shareToken, datasets.track, { signal }),
    fetchPublicDataset<DetectionRow>(shareToken, datasets.detections, { signal }),
    fetchPublicDataset<DetectionRow>(shareToken, datasets.spoofing, { signal }),
  ]);

  const seen = new Set<number>();
  const track = trackRows
    .filter((row) => row.copy === 0)
    .map((row) => ({ t: parseUtc(row.ts), lat: row.lat, lon: row.lon, spoofed: row.part === 'spoofed' }))
    .filter((point) => Number.isFinite(point.t))
    .sort((a, b) => a.t - b.t || Number(a.spoofed) - Number(b.spoofed))
    .filter((point) => !seen.has(point.t) && Boolean(seen.add(point.t)));
  const start = track[0].t;
  const end = track[track.length - 1].t;
  const spoofingStart = track.find((point) => point.spoofed)?.t ?? Infinity;

  const detectionsCopy = detectionRows.filter((row) => row.copy === 0);
  const detections: Detection[] = detectionsCopy
    .map((row) => ({
      id: row.object_id_int,
      dark: row.detection_class === 'Dark',
      acquired: row.acquired_str,
      t: parseUtc(row.acquired_str),
      lat: row.lat,
      lon: row.lon,
    }))
    .filter((d) => d.t >= start && d.t <= end + DAY_MS)
    .sort((a, b) => a.t - b.t);

  // One stop per satellite pass (detections within an hour), showing the dark one if any.
  const passes: { t: number; items: Detection[] }[] = [];
  for (const d of detections) {
    const pass = passes.at(-1);
    if (pass && d.t - pass.t <= HOUR_MS) pass.items.push(d);
    else passes.push({ t: d.t, items: [d] });
  }
  const stops: PlaybackStop[] = passes.map(({ t, items }) => {
    const shown = items.find((d) => d.dark) ?? items[0];
    return {
      id: String(shown.id),
      t,
      lon: shown.lon,
      lat: shown.lat,
      color: shown.dark ? 'accent2' : 'primary',
      title: shown.dark ? 'Dark detection' : 'AIS On detection',
      detail: `${shown.acquired}${items.length > 1 ? ` · ${items.length} detections in this satellite pass` : ''}`,
    };
  });
  if (berth && berth.t >= start && berth.t <= end) {
    stops.push({ id: 'berth', t: berth.t, lon: berth.lon, lat: berth.lat, color: 'success', title: berth.title, detail: berth.detail });
    stops.sort((a, b) => a.t - b.t);
  }

  const markers: PlaybackMarker[] = [
    ...detectionsCopy.map((row) => ({
      id: `det-${row.object_id_int}`,
      t: parseUtc(row.acquired_str),
      lon: row.lon,
      lat: row.lat,
      color: row.detection_class === 'Dark' ? ('accent2' as const) : ('primary' as const),
      tooltip: markerTooltip(row, row.detection_class === 'Dark' ? 'Dark (no AIS at this position)' : 'AIS On'),
    })),
    ...spoofRows
      .filter((row) => row.copy === 0)
      .map((row) => ({
        id: `spoof-${row.object_id_int}`,
        t: parseUtc(row.acquired_str),
        lon: row.lon,
        lat: row.lat,
        color: 'accent1' as const,
        tooltip: markerTooltip(row, 'Spoofing (ghost signal)'),
      })),
  ];

  const isBerth = (lat: number, lon: number) => {
    const wrapped = ((lon + 540) % 360) - 180;
    return berth !== undefined && Math.abs(lat - berth.lat) < 0.02 && Math.abs(wrapped - berth.lon) < 0.05;
  };

  /** Where satellites last saw the vessel while its AIS was spoofed. */
  const actualAt = (t: number) => {
    if (berth && t >= berth.t) return { lat: berth.lat, lon: berth.lon, name: berth.name, source: berth.source, detection: null };
    const last = detections.findLast((d) => d.dark && d.t <= t);
    if (!last || last.t < spoofingStart) return null;
    if (noImageryFrom !== undefined && last.t < noImageryFrom && t >= noImageryFrom) return null;
    return {
      lat: last.lat,
      lon: last.lon,
      name: isBerth(last.lat, last.lon) && berth ? berth.name : area(last.lat, last.lon),
      source: `${t - last.t < DAY_MS ? 'Dark detection' : 'Last dark detection'} ${formatUtc(last.t)}`,
      detection: last,
    };
  };

  const describe = (moment: PlaybackMoment): PlaybackFrame => {
    const claimed = { title: area(moment.lat, moment.lon), subtitle: formatCoords(moment.lat, moment.lon) };
    if (!moment.spoofed) {
      return {
        rows: [{ label: 'Position (AIS)', color: 'primary', ...claimed }],
        note: moment.inGap ? 'AIS reception gap, not spoofing.' : 'AIS matches: no spoofing.',
        vesselLabel: moment.inGap ? 'AIS not received' : 'AIS broadcast position',
        vesselColor: moment.inGap ? 'textSecondary' : 'primary',
        status: moment.inGap ? 'AIS reception gap. Not spoofing.' : 'AIS on: track as broadcast.',
      };
    }
    const actual = actualAt(moment.t);
    const status = 'AIS spoofed. Pink is the false position broadcast on AIS; orange is where satellites last saw the vessel.';
    const base = { vesselLabel: 'AIS broadcast position (false)', vesselColor: 'accent1' as const, status };
    if (!actual) {
      return {
        ...base,
        rows: [
          { label: 'Claimed (AIS)', color: 'accent1', ...claimed },
          { label: 'Actual (satellite)', color: 'accent2', title: 'No imagery detection' },
        ],
      };
    }
    const override = actual.detection && distanceOverrides[String(actual.detection.id)];
    const km = Math.round(
      override && Math.abs(moment.t - actual.detection.t) <= HOUR_MS / 2
        ? override
        : distanceKm(moment.lat, moment.lon, actual.lat, actual.lon),
    ).toLocaleString();
    return {
      ...base,
      rows: [
        { label: 'Claimed (AIS)', color: 'accent1', ...claimed },
        { label: 'Actual (satellite)', color: 'accent2', title: actual.name, subtitle: `${formatCoords(actual.lat, actual.lon)} · ${actual.source}` },
      ],
      note: `${km} km between the claimed and actual position.`,
      companion: { lon: actual.lon, lat: actual.lat, color: 'accent2', label: `Actual: ${actual.name}`, linkLabel: `${km} km apart` },
    };
  };

  return { track, gaps, stops, markers, describe };
}

/** Sea areas along XU HAI 6's route, from the production dashboard. */
function xuHai6Area(lat: number, rawLon: number) {
  const lon = ((rawLon + 540) % 360) - 180;
  if (lon > 0) {
    if (lon < 109 && lat < 22) return 'Gulf of Tonkin';
    if (lat < 22.6 && lon < 117.6) return 'South China Sea';
    if (lat < 25.6 && lon < 121) return 'Taiwan Strait';
    if (lat >= 38.5 && lon < 118.3) return 'Bohai Bay, off Tianjin, China';
    if (lat >= 37 && lon < 122.3) return 'Bohai Sea';
    if (lat >= 33 && lon < 126) return 'Yellow Sea';
    if (lon < 126) return 'East China Sea';
    if (lon < 130.5 && lat >= 33 && lat < 36) return 'Korea Strait';
    return 'North Pacific Ocean';
  }
  if (lon > -80.2 && lon < -79.3 && lat > 8.8 && lat < 9.45) return 'Panama Canal';
  if (lon < -100) return 'North Pacific Ocean';
  if (lon < -92) return 'Pacific, off Mexico';
  if (lat < 9.2 && lon < -77.5) return 'Pacific, off Central America';
  if (lon > -62 && lat < 10) return lat < 8 ? 'Off Guyana' : 'Atlantic, approaching Guyana';
  if (lon < -82 && lat > 21.5) return 'Off Mariel / Havana, Cuba';
  return 'Caribbean Sea';
}

/** XU HAI 6 path dashboard (Theia), shared at agents.synmax.com/public/dashboard/f6602405-…. */
export const XU_HAI_6: TheiaPlaybackSource = {
  shareToken: 'f6602405-5be9-4803-83ca-7b377c94df04',
  datasets: { track: 18, detections: 19, spoofing: 20 },
  gaps: [{ start: Date.parse('2025-12-09T15:15:35Z'), end: Date.parse('2025-12-10T00:48:18Z') }],
  berth: {
    t: Date.parse('2026-02-19T00:00:00Z'),
    lat: 23.005,
    lon: -82.764,
    name: 'Mariel, Cuba',
    source: 'Berthed (19 Feb Satellogic image)',
    title: 'High-resolution image',
    detail: '19 Feb 2026 · Satellogic NewSat-38 (70 cm) shows XU HAI 6 berthed at Mariel, Cuba',
  },
  noImageryFrom: Date.parse('2026-02-04T00:00:00Z'),
  distanceOverrides: { '284308500': 535 },
  area: xuHai6Area,
};
