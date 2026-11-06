import type { MapFeature, MapFeatureKind, MapViewState } from '../../components/map';
import type { AtlasProduct } from '../products';

export interface MapKit {
  kinds: Record<string, MapFeatureKind>;
  features: MapFeature[];
  initialViewState: MapViewState;
}

/** Deterministic pseudo-random numbers so sample maps look the same on every load. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

type Box = { west: number; south: number; east: number; north: number };

function scatter(
  seed: number,
  count: number,
  box: Box,
  make: (index: number, random: () => number) => Omit<MapFeature, 'position'>,
): MapFeature[] {
  const random = seeded(seed);
  return Array.from({ length: count }, (_, index) => ({
    ...make(index, random),
    position: [box.west + random() * (box.east - box.west), box.south + random() * (box.north - box.south)],
  }));
}

const pick = <T,>(items: T[], random: () => number) => items[Math.floor(random() * items.length)];

const HORMUZ: Box = { west: 55.6, south: 25.5, east: 57.3, north: 27.0 };
const HAYNESVILLE: Box = { west: -94.2, south: 31.7, east: -93.2, north: 32.6 };
const PERMIAN: Box = { west: -103.6, south: 31.2, east: -101.6, north: 32.8 };
const GULF_COAST: Box = { west: -97.4, south: 27.8, east: -89.8, north: 30.2 };

/** Every product map opens on the whole world; users zoom into their area. */
const WORLD_VIEW: MapViewState = { longitude: 10, latitude: 20, zoom: 1.4 };

const OPERATORS = ['Comstock', 'Aethon', 'Expand Energy', 'BPX', 'Sabine O&G'];

/** Sample data per product until real feeds and kits exist. Vulcan and BasinIQ are placeholders. */
export const sampleMapKits: Record<AtlasProduct, MapKit> = {
  theia: {
    initialViewState: WORLD_VIEW,
    kinds: {
      detection: { label: 'Satellite detection', color: 'primary' },
      dark: { label: 'AIS dark event', color: 'warning', radius: 6 },
      sts: { label: 'Possible STS transfer', color: 'accent2', radius: 7 },
    },
    features: [
      ...scatter(11, 60, HORMUZ, (index, random) => ({
        id: `det-${index}`,
        kind: 'detection',
        name: `Detection ${4300 + index}`,
        properties: {
          Type: pick(['Tanker', 'Cargo', 'Tug', 'Unclassified'], random),
          Length: `${Math.round(60 + random() * 260)} m`,
          Source: pick(['PlanetScope', 'Sentinel-1', 'Sentinel-2'], random),
        },
      })),
      ...scatter(23, 14, HORMUZ, (index, random) => ({
        id: `dark-${index}`,
        kind: 'dark',
        name: `Dark event ${900 + index}`,
        properties: { 'Hours dark': (random() * 60).toFixed(1), 'Last AIS': pick(['Tanker', 'Cargo'], random) },
      })),
      ...scatter(37, 5, HORMUZ, (index) => ({
        id: `sts-${index}`,
        kind: 'sts',
        name: `STS candidate ${index + 1}`,
        properties: { Vessels: 2, Detected: `${26 + index} Oct` },
      })),
    ],
  },
  hyperion: {
    initialViewState: WORLD_VIEW,
    kinds: {
      wellPad: { label: 'Well pad', color: 'success' },
      rig: { label: 'Active rig', color: 'warning', radius: 7 },
    },
    features: [
      ...scatter(41, 70, HAYNESVILLE, (index, random) => ({
        id: `pad-${index}`,
        kind: 'wellPad',
        name: `Pad HV-${120 + index}`,
        properties: {
          Operator: pick(OPERATORS, random),
          Wells: Math.ceil(random() * 8),
          Status: pick(['Producing', 'Completing', 'Drilled, uncompleted'], random),
        },
      })),
      ...scatter(53, 9, HAYNESVILLE, (index, random) => ({
        id: `rig-${index}`,
        kind: 'rig',
        name: `Rig ${index + 1}`,
        properties: { Operator: pick(OPERATORS, random), 'Days on site': Math.ceil(random() * 40) },
      })),
    ],
  },
  vulcan: {
    initialViewState: WORLD_VIEW,
    kinds: { site: { label: 'Sample site (placeholder)', color: 'success' } },
    features: scatter(67, 18, GULF_COAST, (index, random) => ({
      id: `vulcan-${index}`,
      kind: 'site',
      name: `Site ${index + 1}`,
      properties: { Status: pick(['Under construction', 'Operating'], random) },
    })),
  },
  basiniq: {
    initialViewState: WORLD_VIEW,
    kinds: { site: { label: 'Sample site (placeholder)', color: 'success' } },
    features: scatter(79, 40, PERMIAN, (index, random) => ({
      id: `basiniq-${index}`,
      kind: 'site',
      name: `Site ${index + 1}`,
      properties: { Operator: pick(OPERATORS, random) },
    })),
  },
};
