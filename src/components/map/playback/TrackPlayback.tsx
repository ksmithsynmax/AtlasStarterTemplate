import '../maplibre';
import { FlyToInterpolator, MapView, type MapViewState as DeckViewState } from '@deck.gl/core';
import { PathStyleExtension, type PathStyleExtensionProps } from '@deck.gl/extensions';
import { PathLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';
import { ActionIcon, Checkbox, Select, Slider, useComputedColorScheme } from '@mantine/core';
import { FastBackward, PauseCircle, PlayCircle, SkipBack, SkipForward, XClose } from '@untitledui/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Map } from 'react-map-gl/maplibre';
import { atlasPalette, atlasVar, ATLAS_RADIUS_FULL, hexToRgb, type AtlasToken } from '../../../theme';
import { IconButton } from '../../ui';
import type { MapViewState } from '../types';
import { formatUtc, inGap, nearestLon, positionAt, trackRuns, type RunKind, type TrackRun } from './track';
import classes from './TrackPlayback.module.css';
import type { PlaybackFrame, PlaybackMarker, PlaybackMoment, PlaybackStop, TrackGap, TrackPoint } from './types';
import { usePlaybackClock } from './usePlaybackClock';

const BASEMAP = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};

const RUN_STYLE: Record<RunKind, { color: AtlasToken; dash: [number, number] }> = {
  genuine: { color: 'primary', dash: [0, 0] },
  spoofed: { color: 'accent1', dash: [7, 5] },
  gap: { color: 'textSecondary', dash: [1, 6] },
};

const SPEEDS = [0.5, 1, 2, 4].map((days) => ({ value: String(days), label: `${days} d/s` }));
const SLIDER_STEPS = 1000;
const FOLLOW_ZOOM = 4;
const FOLLOW_EASE = 0.08;

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
  markers: PlaybackMarker[];
  /** Card, labels and status for the current moment. */
  describe: (moment: PlaybackMoment) => PlaybackFrame;
  initialViewState: MapViewState;
  /** What a stop is called in the controls, e.g. "detection". */
  stopLabel?: string;
  /** Height in px. Width fills the parent. */
  height?: number;
}

/**
 * Replays a track in sped-up time on the shared deck.gl basemap. The played path draws
 * over a faded full track, markers light up as they're reached, and playback pauses on each stop.
 */
export function TrackPlayback({
  track,
  gaps = [],
  stops,
  markers,
  describe,
  initialViewState,
  stopLabel = 'stop',
  height = 560,
}: TrackPlaybackProps) {
  const scheme = useComputedColorScheme('dark');
  const palette = atlasPalette[scheme];
  const start = track[0].t;
  const end = track[track.length - 1].t;
  const clock = usePlaybackClock({ start, end, stops });
  const [active, setActive] = useState(false);
  const [follow, setFollow] = useState(false);
  const [viewState, setViewState] = useState<DeckViewState>(initialViewState);
  const interacting = useRef(false);
  const flyingUntil = useRef(0);
  const views = useMemo(() => new MapView({ repeat: true }), []);

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

  const activate = () => setActive(true);

  const toggleFollow = (on: boolean) => {
    setFollow(on);
    if (!on || !active) return;
    flyingUntil.current = performance.now() + 900;
    setViewState((view) => ({
      ...view,
      longitude: nearestLon(position.lon, view.longitude),
      latitude: position.lat,
      zoom: Math.max(view.zoom, FOLLOW_ZOOM),
      transitionDuration: 900,
      transitionInterpolator: new FlyToInterpolator(),
    }));
  };

  const exit = () => {
    clock.reset();
    setActive(false);
    setFollow(false);
  };

  const layers = (() => {
    const rgba = (token: AtlasToken, alpha = 255): [number, number, number, number] => [...hexToRgb(palette[token]), alpha];
    const runLayer = (id: string, data: TrackRun[], width: number, alpha: number) =>
      new PathLayer<TrackRun, PathStyleExtensionProps<TrackRun>>({
        id,
        data,
        getPath: (run) => run.path,
        getColor: (run) => rgba(RUN_STYLE[run.kind].color, alpha),
        getDashArray: (run) => RUN_STYLE[run.kind].dash,
        dashJustified: true,
        widthUnits: 'pixels',
        getWidth: width,
        capRounded: true,
        jointRounded: true,
        extensions: dashed,
      });

    const vessel: [number, number] = [position.lon, position.lat];
    const companion = frame?.companion
      ? ([nearestLon(frame.companion.lon, position.lon), frame.companion.lat] as [number, number])
      : null;
    const labels: MapLabel[] = [];
    if (frame) labels.push({ position: vessel, text: frame.vesselLabel, anchor: 'start', offset: [14, 0] });
    if (companion && frame?.companion) {
      labels.push(
        { position: companion, text: frame.companion.label, anchor: 'end', offset: [-14, 0] },
        {
          position: [(vessel[0] + companion[0]) / 2, (vessel[1] + companion[1]) / 2],
          text: frame.companion.linkLabel,
          anchor: 'middle',
          offset: [0, 0],
        },
      );
    }

    return [
      runLayer('track', fullRuns, 2, active ? 40 : 180),
      runLayer('played', playedRuns, 3, 245),
      new ScatterplotLayer<PlaybackMarker>({
        id: 'markers',
        data: markers,
        pickable: true,
        radiusUnits: 'pixels',
        getPosition: (marker) => [marker.lon, marker.lat],
        getRadius: 5,
        getFillColor: (marker) => rgba(marker.color, active && marker.t > clock.t + 60e3 ? 80 : 255),
        stroked: true,
        lineWidthUnits: 'pixels',
        getLineWidth: 1,
        getLineColor: rgba('background'),
        updateTriggers: { getFillColor: [active, clock.t, scheme] },
      }),
      stop &&
        new ScatterplotLayer<PlaybackStop>({
          id: 'stop-ring',
          data: [stop],
          radiusUnits: 'pixels',
          getPosition: (item) => [item.lon, item.lat],
          getRadius: 17,
          filled: false,
          stroked: true,
          lineWidthUnits: 'pixels',
          getLineWidth: 3,
          getLineColor: (item) => rgba(item.color),
        }),
      companion &&
        new PathLayer<[number, number][], PathStyleExtensionProps<[number, number][]>>({
          id: 'companion-link',
          data: [[vessel, companion]],
          getPath: (path: [number, number][]) => path,
          getColor: rgba('text', 230),
          getDashArray: [4, 4],
          widthUnits: 'pixels',
          getWidth: 1.5,
          extensions: dashed,
        }),
      frame &&
        new ScatterplotLayer<{ position: [number, number]; color: AtlasToken }>({
          id: 'positions',
          data: [
            ...(companion && frame.companion ? [{ position: companion, color: frame.companion.color }] : []),
            { position: vessel, color: frame.vesselColor },
          ],
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

  return (
    <div className={classes.root} style={{ height }}>
      <DeckGL
        views={views}
        viewState={viewState}
        onViewStateChange={({ viewState: next }) => setViewState(next as DeckViewState)}
        onInteractionStateChange={(state) => {
          interacting.current = Boolean(state.isDragging || state.isPanning || state.isZooming);
        }}
        controller
        layers={layers}
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

      {frame && (
        <aside className={classes.card} aria-live="polite">
          <div className={classes.cardDate}>{formatUtc(clock.t)}</div>
          {frame.rows.map((row) => (
            <div key={row.label} className={classes.row}>
              <div className={classes.rowLabel} style={{ color: atlasVar(row.color) }}>
                {row.label}
              </div>
              <div className={classes.rowTitle}>{row.title}</div>
              {row.subtitle && <div className={classes.rowSubtitle}>{row.subtitle}</div>}
            </div>
          ))}
          {frame.note && <div className={classes.note}>{frame.note}</div>}
        </aside>
      )}

      <div className={classes.controls}>
        <p className={classes.status}>
          {stop ? (
            <>
              <b style={{ color: atlasVar(stop.color) }}>{stop.title}</b> · {stop.detail}
            </>
          ) : (
            status
          )}
        </p>
        <div className={classes.controlRow}>
          <IconButton label="Back to start" icon={<FastBackward size={16} />} onClick={() => (activate(), clock.reset())} />
          <IconButton label={`Previous ${stopLabel}`} icon={<SkipBack size={16} />} onClick={() => (activate(), clock.previous())} />
          <ActionIcon
            variant="transparent"
            size={32}
            radius={ATLAS_RADIUS_FULL}
            c={atlasVar('primary')}
            aria-label={clock.playing ? 'Pause' : 'Play'}
            onClick={() => (activate(), clock.toggle())}
          >
            {clock.playing ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
          </ActionIcon>
          <IconButton label={`Next ${stopLabel}`} icon={<SkipForward size={16} />} onClick={() => (activate(), clock.next())} />
          <span className={classes.clock}>{active ? formatUtc(clock.t) : '--'}</span>
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
          <Select
            size="xs"
            w={92}
            data={SPEEDS}
            value={String(clock.speed)}
            onChange={(value) => value && clock.setSpeed(Number(value))}
            allowDeselect={false}
            aria-label="Playback speed"
          />
          <Checkbox size="xs" label="Follow" checked={follow} onChange={(event) => toggleFollow(event.currentTarget.checked)} />
          <IconButton label="Exit playback" icon={<XClose size={16} />} onClick={exit} />
        </div>
      </div>
    </div>
  );
}
