import { ATLAS_RADIUS_FULL, atlasFontSizes, atlasPalette } from '../../../theme';
import { playbackHex } from './color';
import { formatCoords, formatUtc } from './track';
import type { PlaybackChapter, PlaybackStat, PlaybackStop, PlaybackTag } from './types';

export interface PlaybackBriefing {
  title?: string;
  subtitle?: string;
  stats?: PlaybackStat[];
  tags?: PlaybackTag[];
  chapters?: PlaybackChapter[];
  stops: PlaybackStop[];
  stopLabel: string;
}

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

/** The briefing opens in a blank tab, so asset paths need the app's origin. */
const src = (url: string) => escape(new URL(url, window.location.href).href);

/** Printed on paper, so it always uses the light palette. */
const p = atlasPalette.light;
const px = (size: keyof typeof atlasFontSizes) => `${atlasFontSizes[size]}px`;

const STYLES = `
  * { box-sizing: border-box; }
  body { margin: 32px; color: ${p.text}; font: ${px('sm')}/1.45 'Inter Variable', Inter, system-ui, sans-serif; }
  h1 { margin: 0; font-size: ${px('xl')}; }
  h2 { display: flex; align-items: center; gap: 8px; margin: 24px 0 4px; font-size: ${px('md')}; }
  .muted { color: ${p.textSecondary}; }
  .tag { margin-inline-start: 8px; padding: 1px 8px; border: 1px solid currentColor; border-radius: ${ATLAS_RADIUS_FULL}px; font-size: ${px('xxs')}; vertical-align: middle; }
  .stats { display: flex; gap: 32px; margin: 16px 0 0; }
  .stats dt { color: ${p.textSecondary}; font-size: ${px('xxs')}; }
  .stats dd { margin: 0; font-size: ${px('lg')}; font-weight: 600; }
  .chapter { break-inside: avoid; }
  .icon { height: 16px; }
  .stops { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 12px; }
  .stop { break-inside: avoid; font-size: ${px('xxs')}; }
  .stop img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; background: ${p.background}; }
  .stop b { display: block; margin-top: 4px; font-size: ${px('xs')}; }
  footer { margin-top: 32px; color: ${p.textSecondary}; font-size: ${px('xxs')}; }
  @page { margin: 16mm; }
  @media print { body { margin: 0; } }
`;

function stopHtml(stop: PlaybackStop) {
  const image = stop.image
    ? `<img src="${src(stop.image.url)}" alt="">`
    : `<div class="muted" style="aspect-ratio:1;display:grid;place-items:center;border:1px dashed ${p.textSecondary};border-radius:4px;padding:8px;text-align:center">${escape(stop.imageNote ?? 'No image')}</div>`;
  return `<div class="stop">${image}<b>${escape(stop.title)}</b><span class="muted">${escape(formatUtc(stop.t))}<br>${escape(formatCoords(stop.lat, stop.lon))}</span></div>`;
}

/** The story as a printable page: header, stats, then each chapter's summary and stop images. */
export function briefingHtml({ title, subtitle, stats = [], tags = [], chapters = [], stops, stopLabel }: PlaybackBriefing) {
  const groups = chapters.length
    ? chapters.map((chapter, i) => ({
        chapter,
        stops: stops.filter((stop) => stop.t >= chapter.start && stop.t < (chapters[i + 1]?.start ?? Infinity)),
      }))
    : [{ chapter: null, stops }];
  const body = groups
    .map(({ chapter, stops: items }) => {
      const heading = chapter
        ? `<h2>${chapter.icon ? `<img class="icon" src="${src(chapter.icon.default.url)}" alt="">` : ''}${escape(chapter.title)}</h2><div class="muted">${escape(chapter.summary)}</div>`
        : `<h2>${escape(`${items.length} ${stopLabel}s`)}</h2>`;
      return `<section class="chapter">${heading}${items.length ? `<div class="stops">${items.map(stopHtml).join('')}</div>` : ''}</section>`;
    })
    .join('');
  const tagHtml = tags.map((tag) => `<span class="tag" style="color:${p[tag.color]}">${escape(tag.label)}</span>`).join('');
  const statHtml = stats
    .map((stat) => `<div><dt>${escape(stat.label)}</dt><dd style="color:${playbackHex(stat.color ?? 'text', 'light')}">${escape(stat.value)}</dd></div>`)
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escape(title ?? 'Briefing')}</title><style>${STYLES}</style></head><body>
    <h1>${escape(title ?? 'Briefing')}${tagHtml}</h1>
    ${subtitle ? `<div class="muted">${escape(subtitle)}</div>` : ''}
    ${statHtml ? `<dl class="stats">${statHtml}</dl>` : ''}
    ${body}
    <footer>Exported from Atlas · ${escape(formatUtc(Date.now()))}</footer>
  </body></html>`;
}

/** Opens the briefing in a new tab and starts printing once its images load, so it can be saved as a PDF. */
export function printBriefing(briefing: PlaybackBriefing) {
  const tab = window.open('', '_blank');
  if (!tab) return false;
  tab.document.write(briefingHtml(briefing));
  tab.document.close();
  const images = [...tab.document.images];
  Promise.all(images.map((img) => (img.complete ? null : new Promise((done) => (img.onload = img.onerror = done))))).then(
    () => tab.print(),
  );
  return true;
}
