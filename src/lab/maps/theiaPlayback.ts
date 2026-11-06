import {
  distanceKm,
  formatCoords,
  formatUtc,
  positionAt,
  type PlaybackChapter,
  type PlaybackFrame,
  type PlaybackMarker,
  type PlaybackMoment,
  type PlaybackStat,
  type PlaybackStop,
  type PlaybackTag,
  type PlaybackBadge,
  type PlaybackColor,
  type TrackGap,
  type TrackPlaybackProps,
  type TrackPoint,
} from '../../components/map';
import { fetchPublicDataset } from '../../data/synmaxPublic';
import { theiaDetectionType, theiaIcons } from './theiaIcons';

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
  icon_type?: string;
  heading?: number | null;
  vessel_name: string;
  ship_type: string;
  provider: string;
  /** Satellite image chip URL. */
  img_data: string;
  imo: string;
  mmsi: string;
  flag: string;
  dimensions: string;
  is_sanctioned?: 'YES' | 'NO';
  sanctioned_by?: string;
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
  heading?: number;
  image?: PlaybackStop['image'];
}

type ChapterKind = 'genuine' | 'gap' | 'spoofed' | 'berthed';

const PROVIDERS: Record<string, string> = { planetscope: 'PlanetScope', Sentinel1: 'Sentinel-1', Sentinel2: 'Sentinel-2' };

/** A Theia vessel story from a shared dashboard, plus the analyst's annotations. */
export interface TheiaPlaybackSource {
  shareToken: string;
  datasets: { track: number; detections: number; spoofing: number };
  /** AIS reception gaps, which are not spoofing. */
  gaps: TrackGap[];
  /** Where the vessel was confirmed in the end, e.g. by a high-resolution image. */
  berth?: {
    t: number;
    lat: number;
    lon: number;
    name: string;
    source: string;
    title: string;
    detail: string;
    /** Chapter summary, as a sentence. */
    summary: string;
    /** Why the confirming image isn't shown. */
    imageNote?: string;
  };
  /** From this time until the next dark detection there's no imagery of the vessel. */
  noImageryFrom?: number;
  /** QC'd claimed-to-actual distances (km) by detection id, used within 30 minutes of the detection. */
  distanceOverrides?: Record<string, number>;
  /** Plain-language sea area for a position. */
  area: (lat: number, lon: number) => string;
}

export interface TheiaPlayback {
  title: string;
  subtitle: string;
  badge?: PlaybackBadge;
  accent: PlaybackColor;
  stats: PlaybackStat[];
  tags: PlaybackTag[];
  track: TrackPoint[];
  gaps: TrackGap[];
  chapters: PlaybackChapter[];
  stops: PlaybackStop[];
  markers: PlaybackMarker[];
  describe: (moment: PlaybackMoment) => PlaybackFrame;
  runColors: TrackPlaybackProps['runColors'];
}

/** Theia's AIS green, from its AIS icon, so the track, timeline and icons match. */
const AIS_COLOR = '#00EB6C' as const;
/** Theia's spoofing pink, from the spoofing icons. */
const SPOOF_COLOR = '#FF6D99' as const;
/** Theia's dark detection orange, from the dark detection icons. */
const DARK_COLOR = '#FFA500' as const;
const HOUR_MS = 36e5;
const DAY_MS = 864e5;

/** Parses "2025-12-06 04:00 UTC", "2025-12-06 04:00" and "2026-02-02" as UTC. */
function parseUtc(value: string) {
  const s = value.replace(' UTC', '').trim();
  if (s.length <= 10) return Date.parse(`${s}T00:00:00Z`);
  return Date.parse(`${s.replace(' ', 'T')}${s.length <= 16 ? ':00' : ''}Z`);
}

/** Theia's flag field is a demonym; maps it to the ISO code and country name. */
const FLAGS: Record<string, [code: string, country: string]> = {
  Chinese: ['CN', 'China'],
  Panamanian: ['PA', 'Panama'],
  Liberian: ['LR', 'Liberia'],
  Marshallese: ['MH', 'Marshall Islands'],
  Maltese: ['MT', 'Malta'],
  Russian: ['RU', 'Russia'],
  Iranian: ['IR', 'Iran'],
  Greek: ['GR', 'Greece'],
  Singaporean: ['SG', 'Singapore'],
};

function flagBadge(flag: string): PlaybackBadge | undefined {
  const [code, country] = FLAGS[flag] ?? [];
  if (!code) return flag ? { symbol: '⚑', label: `${flag} flag` } : undefined;
  // Regional indicator letters render as the country's flag emoji.
  const symbol = String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
  return { symbol, label: `Flag: ${country}` };
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
      heading: row.heading ?? undefined,
      image: row.img_data
        ? {
            url: row.img_data,
            caption: `${PROVIDERS[row.provider] ?? row.provider} · ${row.acquired_str}`,
            source: PROVIDERS[row.provider] ?? row.provider,
          }
        : undefined,
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
      color: shown.dark ? DARK_COLOR : AIS_COLOR,
      title: shown.dark ? 'Dark detection' : 'AIS',
      kind: shown.dark ? 'Dark' : 'AIS On',
      detail: `${shown.acquired}${items.length > 1 ? ` · ${items.length} detections in this satellite pass` : ''}`,
      icon: shown.dark ? theiaIcons.dark : theiaIcons.ais,
      image: shown.image,
    };
  });
  if (berth && berth.t >= start && berth.t <= end) {
    stops.push({
      id: 'berth',
      t: berth.t,
      lon: berth.lon,
      lat: berth.lat,
      color: AIS_COLOR,
      title: berth.title,
      detail: berth.detail,
      kind: 'High-res',
      icon: theiaIcons.dark,
      imageNote: berth.imageNote,
    });
    stops.sort((a, b) => a.t - b.t);
  }

  const markers: PlaybackMarker[] = [
    ...detectionsCopy.map((row) => ({
      id: `det-${row.object_id_int}`,
      t: parseUtc(row.acquired_str),
      lon: row.lon,
      lat: row.lat,
      color: row.detection_class === 'Dark' ? DARK_COLOR : AIS_COLOR,
      icon: row.detection_class === 'AIS On' ? theiaIcons.ais : theiaIcons[theiaDetectionType(row)],
      heading: row.heading ?? undefined,
      tooltip: markerTooltip(row, row.detection_class === 'Dark' ? 'Dark (no AIS at this position)' : 'AIS On'),
    })),
    ...spoofRows
      .filter((row) => row.copy === 0)
      .map((row) => ({
        id: `spoof-${row.object_id_int}`,
        t: parseUtc(row.acquired_str),
        lon: row.lon,
        lat: row.lat,
        color: SPOOF_COLOR,
        icon: theiaIcons.spoofedPosition,
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
      // Only worth saying when the sighting is older than the card's own detection.
      source: t - last.t < DAY_MS ? undefined : `Last seen ${formatUtc(last.t)}`,
      detection: last,
    };
  };

  const describe = (moment: PlaybackMoment): PlaybackFrame => {
    const claimed = { title: area(moment.lat, moment.lon), subtitle: formatCoords(moment.lat, moment.lon) };
    if (!moment.spoofed) {
      return {
        rows: [{ label: 'Position (AIS)', color: AIS_COLOR, ...claimed }],
        note: moment.inGap ? 'AIS reception gap, not spoofing.' : 'AIS matches: no spoofing.',
        vesselLabel: moment.inGap ? 'AIS not received' : 'AIS broadcast position',
        vesselColor: moment.inGap ? 'textSecondary' : AIS_COLOR,
        vesselIcon: moment.inGap ? theiaIcons.unattributed : theiaIcons.ais,
        status: moment.inGap ? 'AIS reception gap. Not spoofing.' : 'AIS on: track as broadcast.',
      };
    }
    const actual = actualAt(moment.t);
    const status = 'AIS spoofed. Pink is the false position broadcast on AIS; orange is where satellites last saw the vessel.';
    const base = {
      vesselLabel: 'AIS broadcast position (false)',
      vesselColor: SPOOF_COLOR,
      vesselIcon: theiaIcons.spoofingShip,
      status,
    };
    if (!actual) {
      return {
        ...base,
        rows: [
          { label: 'Claimed (AIS)', icon: theiaIcons.spoofingShip, ...claimed },
          { label: 'Actual (satellite)', icon: theiaIcons.dark, title: 'No satellite detection yet' },
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
        { label: 'Claimed (AIS)', icon: theiaIcons.spoofingShip, ...claimed },
        {
          label: 'Actual (satellite)',
          icon: theiaIcons.dark,
          title: actual.name,
          subtitle: [formatCoords(actual.lat, actual.lon), actual.source].filter(Boolean).join(' · '),
        },
      ],
      callout: { value: `${km} km`, label: 'apart' },
      companion: { lon: actual.lon, lat: actual.lat, color: DARK_COLOR, icon: theiaIcons.dark,
        heading: actual.detection?.heading,
        label: `Actual: ${actual.name}`, linkLabel: `${km} km apart` },
    };
  };

  const claimedKm = (d: Detection) => {
    const claimed = positionAt(track, d.t);
    return distanceOverrides[String(d.id)] ?? distanceKm(claimed.lat, claimed.lon, d.lat, d.lon);
  };

  // A chapter starts wherever the track changes state; the berth closes the story.
  const marks: { t: number; kind: ChapterKind }[] = [{ t: start, kind: 'genuine' }];
  for (let i = 1; i < track.length; i++) {
    if (track[i].spoofed !== track[i - 1].spoofed) marks.push({ t: track[i].t, kind: track[i].spoofed ? 'spoofed' : 'genuine' });
  }
  for (const gap of gaps) {
    const resumes = track.find((point) => point.t >= gap.end);
    marks.push({ t: gap.start, kind: 'gap' }, { t: gap.end, kind: resumes?.spoofed ? 'spoofed' : 'genuine' });
  }
  if (berth && berth.t >= start && berth.t <= end) marks.push({ t: berth.t, kind: 'berthed' });
  marks.sort((a, b) => a.t - b.t);
  const lastMark = berth ? marks.findIndex((mark) => mark.kind === 'berthed') : -1;
  const spans = (lastMark < 0 ? marks : marks.slice(0, lastMark + 1))
    .filter((mark, i, all) => i === 0 || mark.kind !== all[i - 1].kind)
    .map((mark, i, all) => ({ ...mark, end: all[i + 1]?.t ?? end }));

  const chapters = spans.map(({ t, end: until, kind }): PlaybackChapter => {
    const from = positionAt(track, t);
    const to = positionAt(track, until);
    const [fromArea, toArea] = [area(from.lat, from.lon), area(to.lat, to.lon)];
    const route = fromArea === toArea ? fromArea : `${fromArea} to ${toArea.replace(/^Off /, 'off ')}`;
    const passes = stops.filter((item) => item.t >= t && item.t < until).length;
    const dark = detections.filter((d) => d.dark && d.t >= t && d.t < until);
    const id = `${kind}-${t}`;
    if (kind === 'gap') {
      const hours = Math.round((until - t) / HOUR_MS);
      return { id, start: t, title: 'AIS reception gap', color: 'textSecondary', icon: theiaIcons.unattributed,
        summary: `No AIS received for ${hours} h near ${fromArea}. A reception gap, not spoofing.` };
    }
    if (kind === 'spoofed') {
      const farthest = Math.max(0, ...dark.map(claimedKm));
      const seen = dark.length > 0
        ? `${dark.length} dark ${dark.length === 1 ? 'detection places' : 'detections place'} the vessel up to ${Math.round(farthest).toLocaleString()} km away.`
        : 'No satellite detections of the vessel in this stretch.';
      return { id, start: t, title: 'AIS spoofed', color: SPOOF_COLOR, icon: theiaIcons.spoofingShip,
        summary: `AIS broadcasts a false track (${route}). ${seen}` };
    }
    if (kind === 'berthed' && berth) {
      return { id, start: t, title: `Confirmed at ${berth.name}`, color: AIS_COLOR, icon: theiaIcons.dark,
        summary: berth.summary };
    }
    return { id, start: t, title: 'AIS on', color: AIS_COLOR, icon: theiaIcons.ais,
      summary: `Broadcasting normally, ${route}. ${passes} satellite ${passes === 1 ? 'pass matches' : 'passes match'} the AIS track.` };
  });

  let spoofedMs = 0;
  for (let i = 1; i < track.length; i++) if (track[i].spoofed) spoofedMs += track[i].t - track[i - 1].t;
  const darkWhileSpoofed = detections.filter((d) => d.dark && d.t >= spoofingStart);
  const farthest = Math.max(0, ...darkWhileSpoofed.map(claimedKm));
  const days = (ms: number) => `${Math.round(ms / DAY_MS)} d`;
  const stats: PlaybackStat[] = [
    { label: 'Tracked', value: days(end - start) },
    { label: 'Dark detections', value: String(detections.filter((d) => d.dark).length), color: DARK_COLOR },
    { label: 'Spoofed', value: days(spoofedMs), color: SPOOF_COLOR },
    { label: 'Farthest off', value: farthest > 0 ? `${Math.round(farthest).toLocaleString()} km` : '–' },
  ];

  const vessel = detectionsCopy[0];
  // Only a sanction is worth a tag; "not sanctioned" is the norm.
  const tags: PlaybackTag[] =
    vessel?.is_sanctioned === 'YES'
      ? [{ label: `Sanctioned${vessel.sanctioned_by ? ` · ${vessel.sanctioned_by}` : ''}`, color: 'error' }]
      : [];
  return {
    title: vessel?.vessel_name || 'Unidentified vessel',
    subtitle: vessel ? `${vessel.ship_type} · IMO ${vessel.imo}` : '',
    badge: vessel && flagBadge(vessel.flag),
    // Maritime's domain blue.
    accent: 'accent3',
    stats,
    tags,
    track,
    gaps,
    chapters,
    stops,
    markers,
    describe,
    runColors: { genuine: AIS_COLOR, spoofed: SPOOF_COLOR },
  };
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
    summary: 'A 70 cm Satellogic image shows XU HAI 6 berthed at Mariel while its AIS still claims to be elsewhere.',
    imageNote: "The Satellogic image isn't in the shared dashboard's data yet.",
  },
  noImageryFrom: Date.parse('2026-02-04T00:00:00Z'),
  distanceOverrides: { '284308500': 535 },
  area: xuHai6Area,
};
