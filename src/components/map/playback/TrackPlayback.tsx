import '../maplibre';
import { FlyToInterpolator, MapView, type MapViewState as DeckViewState } from '@deck.gl/core';
import { PathStyleExtension, type PathStyleExtensionProps } from '@deck.gl/extensions';
import { PathLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';
import { ActionIcon, Button, Select, Slider, Tooltip, useComputedColorScheme } from '@mantine/core';
import { useClipboard, useElementSize } from '@mantine/hooks';
import { Check, FastBackward, Link01, Play, SkipBack, SkipForward, XClose } from '@untitledui/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Map } from 'react-map-gl/maplibre';
import { atlasPalette, atlasVar, ATLAS_RADIUS_FULL } from '../../../theme';
import { IconButton } from '../../ui';
import { HALO_RADIUS, productIconLayers, type IconLayerItem } from '../icons';
import type { MapViewState } from '../types';
import { courseAt, formatUtc, inGap, nearestLon, positionAt, trackRuns, wrapLon, type RunKind, type TrackRun } from './track';
import { playbackCss, playbackHex, playbackRgba } from './color';
import { PlaybackStory } from './PlaybackStory';
import classes from './TrackPlayback.module.css';
import type {
  PlaybackBadge,
  PlaybackColor,
  PlaybackChapter,
  PlaybackFrame,
  PlaybackMarker,
  PlaybackMoment,
  PlaybackStat,
  PlaybackStop,
  PlaybackTag,
  TrackGap,
  TrackPoint,
} from './types';
import { usePlaybackClock } from './usePlaybackClock';

const BASEMAP = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};

const RUN_STYLE: Record<RunKind, { color: PlaybackColor; dash: [number, number] }> = {
  genuine: { color: 'primary', dash: [0, 0] },
  spoofed: { color: 'accent1', dash: [7, 5] },
  gap: { color: 'textSecondary', dash: [1, 6] },
};

const SPEEDS = [0.5, 1, 2, 4].map((days) => ({
  value: String(days),
  label: `${days} d/s`,
}));
const SLIDER_STEPS = 1000;
const FOLLOW_ZOOM = 4;
const FOLLOW_EASE = 0.08;
const UNREACHED_ALPHA = 80;
/** The current position's halo tint, about 25%: softer than the product maps' selection halo. */
const HALO_FILL_ALPHA = 64;
/** Once on, the follow button steps back to the hover halo's white treatment; Mantine sets its colors inline. */
const FOLLOWING_STYLE = {
  '--button-bg': 'color-mix(in srgb, var(--atlas-text) 25%, var(--atlas-card))',
  '--button-hover': 'color-mix(in srgb, var(--atlas-text) 30%, var(--atlas-card))',
  '--button-color': 'var(--atlas-text)',
  '--button-bd': '1px solid var(--atlas-text)',
} as React.CSSProperties;
const MARKER_ICONS = 'marker-icons';
/** Markers this close in time to a stop belong to it and give way to its halo. */
const STOP_MARKER_WINDOW_MS = 36e5;

/** Below this width the story panel moves under the map. */
const NARROW_WIDTH = 760;
/** Share of `height` the map keeps when the story is stacked under it. */
const NARROW_STAGE = 0.7;

/** A shared time this close to a stop opens on the stop. Links round to the minute. */
const SHARE_MATCH_MS = 60e3;

/** Zoom a picked stop flies to, unless already closer. */
const STOP_ZOOM = 3;

const at = (lon: number, lat: number): [number, number] => [wrapLon(lon), lat];

/** Centres the (unwrapped) track and zooms to fit it, with some margin. */
function fitTrack(track: TrackPoint[], width: number, height: number, minZoom: number): DeckViewState {
  const lons = track.map((point) => point.lon);
  const lats = track.map((point) => point.lat);
  const [west, east] = [Math.min(...lons), Math.max(...lons)];
  const [south, north] = [Math.min(...lats), Math.max(...lats)];
  const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const zoomX = Math.log2((width * 360) / (512 * Math.max(east - west, 1) * 1.2));
  const zoomY = Math.log2((height * 2 * Math.PI) / (512 * Math.max(mercY(north) - mercY(south), 0.01) * 1.6));
  return {
    longitude: (west + east) / 2,
    latitude: (south + north) / 2,
    zoom: Math.max(minZoom, Math.min(zoomX, zoomY, FOLLOW_ZOOM)),
  };
}

const dashed = [new PathStyleExtension({ dash: true })];

interface MapLabel {
  position: [number, number];
  text: string;
  anchor: 'start' | 'middle' | 'end';
  offset: [number, number];
}

export interface TrackPlaybackProps {
  /** Sorted by time, with unwrapped longitudes. */
  track: TrackPoint[];
  gaps?: TrackGap[];
  /** Sorted by time. */
  stops: PlaybackStop[];
  /** Story chapters, sorted by start. The timeline lists stops flat when omitted. */
  chapters?: PlaybackChapter[];
  markers: PlaybackMarker[];
  /** Card, labels and status for the current moment. */
  describe: (moment: PlaybackMoment) => PlaybackFrame;
  /** Fits the whole track when omitted. */
  initialViewState?: MapViewState;
  /** Story panel heading, e.g. the vessel name. */
  title?: string;
  subtitle?: string;
  badge?: PlaybackBadge;
  /** Marks the current stop: its map halo and its timeline card. Usually the domain accent. */
  accent?: PlaybackColor;
  /** Headline numbers under the title. */
  stats?: PlaybackStat[];
  tags?: PlaybackTag[];
  /** What a stop is called in the controls, e.g. "detection". */
  stopLabel?: string;
  /** What the follow button tracks, e.g. "vessel" for "Follow vessel". */
  subjectLabel?: string;
  /** Line color per run kind, e.g. a product's AIS color for genuine runs. */
  runColors?: Partial<Record<RunKind, PlaybackColor>>;
  /**
   * Total height, KPI row included: px, or any CSS length, e.g. `"100%"` to fill a
   * dashboard cell. The map and story panel take what the KPI row leaves. Width fills the parent.
   */
  height?: number | string;
  /**
   * URL search param that holds a shared moment, e.g. "at" for `?at=2026-02-09T16:42Z`.
   * When set, the playback opens at that moment and shows a copy-link button.
   */
  shareParam?: string;
}

/**
 * Replays a track in sped-up time on the shared deck.gl basemap. The played path draws
 * over a faded full track, markers light up as they're reached, and playback pauses on each stop.
 */
export function TrackPlayback({
  track,
  gaps = [],
  stops,
  chapters,
  markers,
  describe,
  initialViewState,
  title,
  subtitle,
  badge,
  accent = 'text',
  stats,
  tags,
  stopLabel = 'stop',
  subjectLabel = 'track',
  runColors,
  height = 600,
  shareParam,
}: TrackPlaybackProps) {
  const scheme = useComputedColorScheme('dark');
  const palette = atlasPalette[scheme];
  const start = track[0].t;
  const end = track[track.length - 1].t;
  const clock = usePlaybackClock({ start, end, stops });
  const [active, setActive] = useState(false);
  const [follow, setFollow] = useState(false);
  const [viewState, setViewState] = useState<DeckViewState>(initialViewState ?? { longitude: 0, latitude: 20, zoom: 1 });
  const [minZoom, setMinZoom] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const fitted = useRef(initialViewState !== undefined);
  const interacting = useRef(false);
  const flyingUntil = useRef(0);
  const views = useMemo(() => new MapView({ repeat: true }), []);
  const { ref: rootRef, width: rootWidth } = useElementSize();
  const narrow = rootWidth > 0 && rootWidth < NARROW_WIDTH;

  const position = positionAt(track, clock.t);
  const moment: PlaybackMoment = {
    t: clock.t,
    lon: position.lon,
    lat: position.lat,
    spoofed: track[Math.min(position.index + 1, track.length - 1)].spoofed,
    inGap: inGap(gaps, clock.t),
  };
  const frame = active ? describe(moment) : null;
  const stop = clock.activeStop === null ? null : stops[clock.activeStop];

  const fullRuns = useMemo(() => trackRuns(track, gaps), [track, gaps]);
  const playedRuns = active ? trackRuns(track, gaps, position) : [];
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  /** The stop a marker belongs to: the nearest one in time, if it's within the stop window. */
  const stopOf = (marker: PlaybackMarker | undefined) => {
    if (!marker) return null;
    let best: number | null = null;
    stops.forEach((item, index) => {
      const gap = Math.abs(item.t - marker.t);
      if (gap <= STOP_MARKER_WINDOW_MS && (best === null || gap < Math.abs(stops[best].t - marker.t))) best = index;
    });
    return best;
  };
  const hoveredMapStop = hoveredId ? stopOf(markers.find((marker) => marker.id === hoveredId)) : null;
  const iconMarkers = useMemo(() => markers.filter((marker) => marker.icon), [markers]);
  const dotMarkers = useMemo(() => markers.filter((marker) => !marker.icon), [markers]);
  const reached = (marker: PlaybackMarker) => !active || marker.t <= clock.t + 60e3;
  const heading = courseAt(track, position.index);

  useEffect(() => {
    if (!follow || !clock.playing || stop || interacting.current || performance.now() < flyingUntil.current) return;
    setViewState((view) => {
      const lon = nearestLon(position.lon, view.longitude);
      return {
        ...view,
        longitude: view.longitude + (lon - view.longitude) * FOLLOW_EASE,
        latitude: view.latitude + (position.lat - view.latitude) * FOLLOW_EASE,
      };
    });
  }, [follow, clock.playing, clock.t, stop, position.lon, position.lat]);

  // Zooming out stops where one world fills the width, so the track never shows twice.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height: stageHeight } = entry.contentRect;
      if (width === 0) return;
      const floor = Math.log2(width / 512);
      setMinZoom(floor);
      if (!fitted.current) {
        fitted.current = true;
        setViewState(fitTrack(track, width, stageHeight, floor));
      } else setViewState((view) => (view.zoom < floor ? { ...view, zoom: floor } : view));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [track]);

  const activate = () => setActive(true);
  const clipboard = useClipboard({ timeout: 1500 });

  // Opens at a shared moment: on its stop if there's one there, otherwise at that time.
  useEffect(() => {
    if (!shareParam) return;
    const shared = Date.parse(new URLSearchParams(window.location.search).get(shareParam) ?? '');
    if (!Number.isFinite(shared) || shared < start || shared > end) return;
    const index = stops.findIndex((item) => Math.abs(item.t - shared) < SHARE_MATCH_MS);
    const where = index >= 0 ? stops[index] : positionAt(track, shared);
    fitted.current = true;
    setActive(true);
    if (index >= 0) clock.goTo(index);
    else clock.seek(shared);
    setViewState((view) => ({
      ...view,
      longitude: where.lon,
      latitude: where.lat,
      zoom: STOP_ZOOM,
    }));
    // Only on mount: later changes to the URL come from this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyMomentLink = () => {
    if (!shareParam) return;
    const url = new URL(window.location.href);
    url.searchParams.set(shareParam, new Date(clock.t).toISOString().slice(0, 16) + 'Z');
    clipboard.copy(url.toString());
  };

  const flyTo = (lon: number, lat: number, zoom: number) => {
    flyingUntil.current = performance.now() + 900;
    setViewState((view) => ({
      ...view,
      longitude: nearestLon(lon, view.longitude),
      latitude: lat,
      zoom: Math.max(view.zoom, zoom),
      transitionDuration: 900,
      transitionInterpolator: new FlyToInterpolator(),
    }));
  };

  const selectStop = (index: number) => {
    activate();
    clock.goTo(index);
    flyTo(stops[index].lon, stops[index].lat, STOP_ZOOM);
  };

  const selectChapter = (index: number) => {
    if (!chapters) return;
    activate();
    clock.seek(chapters[index].start);
    const where = positionAt(track, chapters[index].start);
    flyTo(where.lon, where.lat, STOP_ZOOM);
  };

  const passed = active ? stops.findLastIndex((item) => item.t <= clock.t) : -1;
  const current = clock.activeStop ?? (passed < 0 ? null : passed);
  const currentChapter = chapters?.findLastIndex((chapter) => chapter.start <= clock.t) ?? -1;
  const fraction = (time: number) => Math.min(1, Math.max(0, (time - start) / (end - start)));

  const toggleFollow = (on: boolean) => {
    setFollow(on);
    if (on && active) flyTo(position.lon, position.lat, FOLLOW_ZOOM);
  };

  const exit = () => {
    clock.reset();
    setActive(false);
    setFollow(false);
  };

  const layers = (() => {
    const rgba = (color: PlaybackColor, alpha = 255) => playbackRgba(color, scheme, alpha);
    const runLayer = (id: string, data: TrackRun[], width: number, alpha: number) =>
      new PathLayer<TrackRun, PathStyleExtensionProps<TrackRun>>({
        id,
        data,
        getPath: (run) => run.path,
        getColor: (run) => rgba(runColors?.[run.kind] ?? RUN_STYLE[run.kind].color, alpha),
        getDashArray: (run) => RUN_STYLE[run.kind].dash,
        dashJustified: true,
        widthUnits: 'pixels',
        getWidth: width,
        capRounded: true,
        jointRounded: true,
        wrapLongitude: true,
        extensions: dashed,
      });

    const vessel = at(position.lon, position.lat);
    const companionLon = frame?.companion ? nearestLon(frame.companion.lon, position.lon) : 0;
    const companion = frame?.companion ? at(companionLon, frame.companion.lat) : null;
    const positionIcons: IconLayerItem[] = [];
    const positionDots: { position: [number, number]; color: PlaybackColor }[] = [];
    if (companion && frame?.companion) {
      if (frame.companion.icon) {
        positionIcons.push({
          id: 'companion',
          position: companion,
          icon: frame.companion.icon,
          heading: frame.companion.heading ?? heading,
        });
      } else
        positionDots.push({
          position: companion,
          color: frame.companion.color,
        });
    }
    if (frame?.vesselIcon) {
      positionIcons.push({
        id: 'vessel',
        position: vessel,
        icon: frame.vesselIcon,
        heading,
      });
    } else if (frame) positionDots.push({ position: vessel, color: frame.vesselColor });

    // At a stop, the vessel or companion sitting on it gets the halo.
    const haloTarget = stop
      ? positionIcons.reduce<IconLayerItem | null>((nearest, item) => {
          const gap = (item: IconLayerItem) => Math.hypot(nearestLon(item.position[0], stop.lon) - stop.lon, item.position[1] - stop.lat);
          return !nearest || gap(item) < gap(nearest) ? item : nearest;
        }, null)
      : null;
    if (haloTarget) haloTarget.halo = true;
    const underHalo = (marker: PlaybackMarker) =>
      haloTarget !== null && stop !== null && Math.abs(marker.t - stop.t) <= STOP_MARKER_WINDOW_MS;

    const labelGap = haloTarget ? 24 : 14;
    const labels: MapLabel[] = [];
    if (frame)
      labels.push({
        position: vessel,
        text: frame.vesselLabel,
        anchor: 'start',
        offset: [labelGap, 0],
      });
    if (companion && frame?.companion) {
      labels.push(
        {
          position: companion,
          text: frame.companion.label,
          anchor: 'end',
          offset: [-labelGap, 0],
        },
        {
          position: at((position.lon + companionLon) / 2, (vessel[1] + companion[1]) / 2),
          text: frame.companion.linkLabel,
          anchor: 'middle',
          offset: [0, 0],
        },
      );
    }

    // Hovering a timeline card or the stop's icon on the map rings the same spot.
    const hovered = hoveredCard ?? hoveredMapStop;
    const hoveredStop = hovered !== null && hovered !== clock.activeStop ? stops[hovered] : null;
    return [
      runLayer('track', fullRuns, 2, active ? 40 : 180),
      runLayer('played', playedRuns, 3, 245),
      // Under the markers so the hovered icon draws on top; the backdrop hides the track beneath.
      ...(hoveredStop
        ? [
            new ScatterplotLayer<PlaybackStop>({
              id: 'hover-backdrop',
              data: [hoveredStop],
              radiusUnits: 'pixels',
              getPosition: (item) => at(item.lon, item.lat),
              getRadius: HALO_RADIUS,
              getFillColor: rgba('card'),
            }),
            new ScatterplotLayer<PlaybackStop>({
              id: 'hover-ring',
              data: [hoveredStop],
              radiusUnits: 'pixels',
              getPosition: (item) => at(item.lon, item.lat),
              getRadius: HALO_RADIUS,
              getFillColor: rgba('text', HALO_FILL_ALPHA),
              stroked: true,
              lineWidthUnits: 'pixels',
              getLineWidth: 2,
              getLineColor: rgba('text'),
            }),
          ]
        : []),
      new ScatterplotLayer<PlaybackMarker>({
        id: 'markers',
        data: dotMarkers,
        pickable: true,
        radiusUnits: 'pixels',
        getPosition: (marker) => at(marker.lon, marker.lat),
        getRadius: 5,
        getFillColor: (marker) => rgba(marker.color, reached(marker) ? 255 : UNREACHED_ALPHA),
        stroked: true,
        lineWidthUnits: 'pixels',
        getLineWidth: 1,
        getLineColor: rgba('background'),
        updateTriggers: { getFillColor: [active, clock.t, scheme] },
      }),
      ...productIconLayers(
        MARKER_ICONS,
        iconMarkers
          .filter((marker) => !underHalo(marker))
          .map((marker) => ({
            id: marker.id,
            position: at(marker.lon, marker.lat),
            icon: marker.icon!,
            heading: marker.heading,
            alpha: reached(marker) ? 255 : UNREACHED_ALPHA,
            tooltip: marker.tooltip,
          })),
        { hoveredId, pickable: true },
      ),
      stop &&
        !haloTarget &&
        new ScatterplotLayer<PlaybackStop>({
          id: 'stop-ring',
          data: [stop],
          radiusUnits: 'pixels',
          getPosition: (item) => at(item.lon, item.lat),
          getRadius: 17,
          filled: false,
          stroked: true,
          lineWidthUnits: 'pixels',
          getLineWidth: 3,
          getLineColor: rgba(accent),
        }),
      companion &&
        new PathLayer<[number, number][], PathStyleExtensionProps<[number, number][]>>({
          id: 'companion-link',
          data: [
            [
              [position.lon, position.lat],
              [companionLon, companion[1]],
            ],
          ],
          getPath: (path: [number, number][]) => path,
          wrapLongitude: true,
          getColor: rgba('text', 230),
          getDashArray: [4, 4],
          widthUnits: 'pixels',
          getWidth: 1.5,
          extensions: dashed,
        }),
      ...productIconLayers('position-icons', positionIcons, {
        haloBackdrop: palette.card,
        haloColor: playbackHex(accent, scheme),
        haloFillAlpha: HALO_FILL_ALPHA,
      }),
      positionDots.length > 0 &&
        new ScatterplotLayer<{
          position: [number, number];
          color: PlaybackColor;
        }>({
          id: 'positions',
          data: positionDots,
          radiusUnits: 'pixels',
          getPosition: (item) => item.position,
          getRadius: 7,
          getFillColor: (item) => rgba(item.color),
          stroked: true,
          lineWidthUnits: 'pixels',
          getLineWidth: 2,
          getLineColor: rgba('text'),
        }),
      labels.length > 0 &&
        new TextLayer<MapLabel>({
          id: 'labels',
          data: labels,
          getPosition: (label) => label.position,
          getText: (label) => label.text,
          getTextAnchor: (label) => label.anchor,
          getPixelOffset: (label) => label.offset,
          getAlignmentBaseline: 'center',
          getSize: 10,
          fontFamily: 'Inter Variable, sans-serif',
          fontWeight: 600,
          getColor: rgba('text'),
          background: true,
          getBackgroundColor: rgba('card', 235),
          backgroundPadding: [6, 3],
        }),
    ];
  })();

  const status = !active
    ? `Press play to replay the path. Playback pauses at each ${stopLabel}.`
    : stop
      ? null
      : frame?.status;

  const onKeyDown = (event: React.KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, [role="slider"], [role="listbox"], [role="dialog"]')) return;
    if (event.key === ' ' && !target.closest('button')) {
      event.preventDefault();
      activate();
      clock.toggle();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      activate();
      clock.next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      activate();
      clock.previous();
    }
  };

  return (
    <div
      className={classes.frame}
      data-narrow={narrow || undefined}
      style={
        {
          '--playback-accent': playbackCss(accent),
          height: narrow ? undefined : height,
        } as React.CSSProperties
      }
    >
      {stats && stats.length > 0 && (
        <dl
          className={classes.kpis}
          style={
            {
              '--kpi-lead': Math.max(1, stats.length - 1),
            } as React.CSSProperties
          }
        >
          {stats.map((stat) => (
            <div key={stat.label} className={classes.kpi}>
              <dd className={classes.kpiValue} style={stat.color && { color: playbackCss(stat.color) }}>
                {stat.value}
              </dd>
              <dt className={classes.kpiLabel}>{stat.label}</dt>
            </div>
          ))}
        </dl>
      )}
      {/* Focusable so the shortcuts work after clicking the map: Space plays or pauses, arrows step between stops. */}
      <div
        ref={rootRef}
        className={classes.root}
        data-narrow={narrow || undefined}
        style={
          narrow
            ? ({
                '--stage-height': `calc(${typeof height === 'number' ? `${height}px` : height} * ${NARROW_STAGE})`,
              } as React.CSSProperties)
            : undefined
        }
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className={classes.stage}>
          <div ref={stage} className={classes.map}>
            <DeckGL
              views={views}
              viewState={{ ...viewState, minZoom }}
              onViewStateChange={({ viewState: next }) => setViewState(next as DeckViewState)}
              onInteractionStateChange={(state) => {
                interacting.current = Boolean(state.isDragging || state.isPanning || state.isZooming);
                // Moving the map yourself hands the camera back to you, as in map apps.
                if (interacting.current) setFollow(false);
              }}
              controller
              layers={layers}
              onHover={({ object, layer }) => {
                const id =
                  layer?.id === MARKER_ICONS || layer?.id === 'markers' ? ((object as { id?: string } | undefined)?.id ?? null) : null;
                if (id !== hoveredId) setHoveredId(id);
              }}
              onClick={({ object, layer }) => {
                if (layer?.id !== MARKER_ICONS && layer?.id !== 'markers') return;
                const id = (object as { id?: string } | undefined)?.id;
                const index = stopOf(markers.find((marker) => marker.id === id));
                if (index !== null) selectStop(index);
              }}
              getCursor={({ isHovering, isDragging }) => (isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab')}
              getTooltip={({ object }) =>
                object &&
                'tooltip' in object && {
                  text: (object as PlaybackMarker).tooltip,
                  style: {
                    padding: '4px 8px',
                    borderRadius: 'var(--mantine-radius-sm)',
                    border: '1px solid var(--atlas-tooltip-border)',
                    backgroundColor: 'var(--atlas-tooltip-bg)',
                    color: 'var(--atlas-tooltip-color)',
                    fontSize: 'var(--mantine-font-size-xs)',
                    whiteSpace: 'pre-line',
                  },
                }
              }
            >
              <Map mapStyle={BASEMAP[scheme]} attributionControl={false} />
            </DeckGL>
            {active && (
              <Button
                size="xs"
                radius={ATLAS_RADIUS_FULL}
                color={atlasVar('primary')}
                className={classes.follow}
                style={follow ? FOLLOWING_STYLE : undefined}
                aria-pressed={follow}
                onClick={() => toggleFollow(!follow)}
              >
                {follow ? `Following ${subjectLabel}` : `Follow ${subjectLabel}`}
              </Button>
            )}
          </div>

          <div className={classes.controls}>
            <p className={classes.status}>
              {stop ? (
                <>
                  <b style={{ color: playbackCss(stop.color) }}>{stop.title}</b> · {stop.detail}
                </>
              ) : (
                status
              )}
            </p>
            {chapters && chapters.length > 0 && (
              <div className={classes.strip} aria-label="Chapters">
                {chapters.map((chapter, index) => {
                  const until = chapters[index + 1]?.start ?? end;
                  return (
                    <Tooltip key={chapter.id} label={chapter.title} openDelay={150}>
                      <button
                        type="button"
                        className={classes.segment}
                        data-active={(active && currentChapter === index) || undefined}
                        style={
                          {
                            left: `${fraction(chapter.start) * 100}%`,
                            width: `${(fraction(until) - fraction(chapter.start)) * 100}%`,
                            '--segment-color': playbackCss(chapter.color),
                          } as React.CSSProperties
                        }
                        aria-label={`Go to chapter: ${chapter.title}`}
                        onClick={() => selectChapter(index)}
                      />
                    </Tooltip>
                  );
                })}
                {stops.map((item) => (
                  <span
                    key={item.id}
                    className={classes.tick}
                    style={{
                      left: `${fraction(item.t) * 100}%`,
                      backgroundColor: playbackCss(item.color),
                    }}
                  />
                ))}
              </div>
            )}
            <Slider
              className={classes.slider}
              size="sm"
              min={0}
              max={SLIDER_STEPS}
              label={null}
              value={Math.round((SLIDER_STEPS * (clock.t - start)) / (end - start))}
              onChange={(step) => {
                activate();
                clock.seek(start + ((end - start) * step) / SLIDER_STEPS);
              }}
              aria-label="Playback position"
            />
            <div className={classes.controlRow}>
              <IconButton
                label="Back to start"
                icon={<FastBackward size={16} fill="currentColor" />}
                onClick={() => (activate(), clock.reset())}
              />
              <IconButton
                label={`Previous ${stopLabel}`}
                icon={<SkipBack size={16} fill="currentColor" />}
                onClick={() => (activate(), clock.previous())}
              />
              <ActionIcon
                size={40}
                radius={ATLAS_RADIUS_FULL}
                color={atlasVar('primary')}
                className={classes.play}
                aria-label={clock.playing ? 'Pause' : 'Play'}
                onClick={() => (activate(), clock.toggle())}
              >
                {clock.playing ? <PauseIcon /> : <Play size={18} fill="currentColor" />}
              </ActionIcon>
              <IconButton
                label={`Next ${stopLabel}`}
                icon={<SkipForward size={16} fill="currentColor" />}
                onClick={() => (activate(), clock.next())}
              />
              <span className={classes.clock}>{active ? formatUtc(clock.t) : '--'}</span>
              <Select
                className={classes.speed}
                size="xs"
                w={92}
                data={SPEEDS}
                value={String(clock.speed)}
                onChange={(value) => value && clock.setSpeed(Number(value))}
                allowDeselect={false}
                aria-label="Playback speed"
              />
              {shareParam && active && (
                <IconButton
                  label={clipboard.copied ? 'Link copied' : 'Copy link to this moment'}
                  icon={clipboard.copied ? <Check size={16} /> : <Link01 size={16} />}
                  onClick={copyMomentLink}
                />
              )}
              <IconButton label="Exit playback" icon={<XClose size={16} />} onClick={exit} />
            </div>
          </div>
        </div>

        <PlaybackStory
          title={title}
          subtitle={subtitle}
          badge={badge}
          stats={stats}
          tags={tags}
          stops={stops}
          current={current}
          atStop={stop !== null}
          t={clock.t}
          frame={frame}
          stopLabel={stopLabel}
          chapters={chapters}
          highlighted={hoveredMapStop}
          onHover={setHoveredCard}
          onSelect={selectStop}
          onSelectChapter={selectChapter}
        />
      </div>
    </div>
  );
}

/** Filled pause bars to match the filled play icon; the icon set only has outline pause icons. */
function PauseIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x={5} y={4} width={5} height={16} rx={1.5} />
      <rect x={14} y={4} width={5} height={16} rx={1.5} />
    </svg>
  );
}
