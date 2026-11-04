import type { Candle, DonutSlice, ScatterPoint } from '../../components/charts';

/** Seeded PRNG so the gallery renders the same data on every load. */
function random(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86_400_000;
const start = Date.UTC(2026, 0, 1);
const isoDay = (offset: number) => new Date(start + offset * DAY).toISOString().slice(0, 10);
const months = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(2026, i, 1)).toISOString().slice(0, 10));

const rand = random(7);
const wobble = (amount: number) => (rand() - 0.5) * 2 * amount;

export const trafficData = Array.from({ length: 61 }, (_, i) => ({
  date: isoDay(i),
  web: Math.round(3400 + Math.sin(i / 6) * 180 + wobble(120)),
  mobile: Math.round(2080 + Math.sin(i / 9) * 70 + wobble(60)),
  api: Math.round(4100 + (i / 60) * 500 + Math.sin(i / 4) * 160 + wobble(140)),
}));

export const visitorsData = months.slice(0, 8).map((month) => ({
  month,
  new: Math.round(1500 + wobble(90) + 60),
  returning: Math.round(3420 + wobble(70)),
}));

const cluster = (count: number, cx: number, cy: number, spreadX: number, spreadY: number): ScatterPoint[] =>
  Array.from({ length: count }, () => ({
    x: Math.round((cx + wobble(spreadX)) * 10) / 10,
    y: Math.round(cy + wobble(spreadY)),
  }));

export const segmentData = {
  a: cluster(40, 34, 2050, 14, 500),
  b: cluster(40, 85, 2700, 15, 650),
};

export const sessionsData: DonutSlice[] = [
  { label: 'API', value: 5282 },
  { label: 'Web', value: 4170 },
  { label: 'Desktop', value: 3058 },
  { label: 'Mobile', value: 1390 },
];

export const revenueData = Array.from({ length: 26 }, (_, i) => ({
  date: isoDay(i * 7),
  revenue: Math.round(53500 + Math.sin(i / 2) * 1200 + wobble(900)),
  conversion: Math.round((3.35 + Math.sin(i / 2.5) * 0.08 + wobble(0.06)) * 100) / 100,
}));

export const infrastructureData = months.map((month, i) => ({
  month,
  compute: Math.round(1050 - i * 12 + wobble(30)),
  storage: Math.round(1020 + wobble(30)),
  network: Math.round(1700 - i * 10 + wobble(40)),
  database: Math.round(1350 - i * 8 + wobble(40)),
}));

export const priceData: Candle[] = (() => {
  const path = (i: number) => {
    if (i < 10) return 193 - i * 0.6;
    if (i < 24) return 187 - (i - 10) * 2.2;
    if (i < 32) return 156 + wobble(2);
    return 156 + (i - 32) * 1.9;
  };
  let open = 193;
  return Array.from({ length: 40 }, (_, i) => {
    const close = Math.round((path(i + 1) + wobble(4)) * 10) / 10;
    const high = Math.max(open, close) + rand() * 3;
    const low = Math.min(open, close) - rand() * 3;
    const candle = { date: isoDay(i), open, high, low, close };
    open = close;
    return candle;
  });
})();
