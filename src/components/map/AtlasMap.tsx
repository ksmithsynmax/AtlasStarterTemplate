import './maplibre';
import { ScatterplotLayer } from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';
import { useComputedColorScheme } from '@mantine/core';
import { XClose } from '@untitledui/icons';
import { useMemo, useState } from 'react';
import { Map } from 'react-map-gl/maplibre';
import { atlasPalette, hexToRgb, type AtlasToken } from '../../theme';
import { IconButton, StatusDot } from '../ui';
import classes from './AtlasMap.module.css';
import { productIconLayers } from './icons';
import type { MapFeature, MapFeatureKind, MapViewState } from './types';

/** Free CARTO vector basemaps; swap for an Atlas-styled basemap once production's provider is confirmed. */
const BASEMAP = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};

const ICON_LAYER = 'feature-icons';

/** The kind's icon at legend size, or its colored dot. */
function KindSymbol({ kind, dotSize }: { kind: MapFeatureKind; dotSize?: number }) {
  if (!kind.icon) return <StatusDot color={kind.color} size={dotSize} />;
  return <img className={classes.kindIcon} src={kind.icon.default.url} alt="" />;
}

export interface AtlasMapProps {
  features: MapFeature[];
  kinds: Record<string, MapFeatureKind>;
  initialViewState: MapViewState;
  /** Height in px. Width fills the parent. */
  height?: number;
  onSelect?: (feature: MapFeature | null) => void;
}

/**
 * Shared deck.gl map core. Products supply their features and kinds (a "layer kit");
 * the core handles the basemap, theming, hover tooltip, click selection, legend and detail card.
 */
export function AtlasMap({ features, kinds, initialViewState, height = 560, onSelect }: AtlasMapProps) {
  const scheme = useComputedColorScheme('dark');
  const palette = atlasPalette[scheme];
  const [selected, setSelected] = useState<MapFeature | null>(null);

  const select = (feature: MapFeature | null) => {
    setSelected(feature);
    onSelect?.(feature);
  };

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dotFeatures = useMemo(() => features.filter((feature) => !kinds[feature.kind]?.icon), [features, kinds]);
  const iconFeatures = useMemo(
    () =>
      features.flatMap((feature) => {
        const icon = kinds[feature.kind]?.icon;
        return icon ? [{ ...feature, icon }] : [];
      }),
    [features, kinds],
  );

  const layers = useMemo(() => {
    const rgb = (token: AtlasToken) => hexToRgb(palette[token]);
    return [
      new ScatterplotLayer<MapFeature>({
        id: 'features',
        data: dotFeatures,
        pickable: true,
        radiusUnits: 'pixels',
        getPosition: (feature) => feature.position,
        getRadius: (feature) => (kinds[feature.kind]?.radius ?? 5) + (feature.id === selected?.id ? 3 : 0),
        getFillColor: (feature) => [...rgb(kinds[feature.kind]?.color ?? 'primary'), 220],
        stroked: true,
        lineWidthUnits: 'pixels',
        getLineWidth: (feature) => (feature.id === selected?.id ? 2 : 1),
        getLineColor: (feature) => [...rgb(feature.id === selected?.id ? 'text' : 'background'), 255],
        autoHighlight: true,
        highlightColor: [...rgb('text'), 90],
        updateTriggers: { getRadius: selected?.id, getLineWidth: selected?.id, getLineColor: [selected?.id, scheme] },
      }),
      ...productIconLayers(
        ICON_LAYER,
        iconFeatures.map((feature) => (feature.id === selected?.id ? { ...feature, halo: true } : feature)),
        { hoveredId, pickable: true, haloBackdrop: palette.card },
      ),
    ];
  }, [dotFeatures, iconFeatures, kinds, palette, scheme, selected, hoveredId]);

  return (
    <div className={classes.root} style={{ height }}>
      <DeckGL
        initialViewState={initialViewState}
        controller
        layers={layers}
        onClick={(info) => select((info.object as MapFeature | undefined) ?? null)}
        onHover={({ object, layer }) => {
          const id = layer?.id === ICON_LAYER ? ((object as MapFeature | undefined)?.id ?? null) : null;
          if (id !== hoveredId) setHoveredId(id);
        }}
        getCursor={({ isHovering, isDragging }) => (isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab')}
        getTooltip={({ object }) =>
          object && {
            text: (object as MapFeature).name,
            style: {
              padding: '4px 8px',
              borderRadius: 'var(--mantine-radius-sm)',
              border: '1px solid var(--atlas-tooltip-border)',
              backgroundColor: 'var(--atlas-tooltip-bg)',
              color: 'var(--atlas-tooltip-color)',
              fontSize: 'var(--mantine-font-size-xs)',
            },
          }
        }
      >
        <Map mapStyle={BASEMAP[scheme]} attributionControl={false} />
      </DeckGL>

      <ul className={classes.legend}>
        {Object.entries(kinds).map(([key, kind]) => (
          <li key={key}>
            <KindSymbol kind={kind} />
            {kind.label}
          </li>
        ))}
      </ul>

      {selected && (
        <aside className={classes.detail} aria-label={`${selected.name} details`}>
          <div className={classes.detailHeader}>
            <div className={classes.detailTitle}>
              <span>{selected.name}</span>
              <span className={classes.detailKind}>
                {kinds[selected.kind] ? (
                  <KindSymbol kind={kinds[selected.kind]} dotSize={6} />
                ) : (
                  <StatusDot color="primary" size={6} />
                )}
                {kinds[selected.kind]?.label ?? selected.kind}
              </span>
            </div>
            <IconButton label="Close details" icon={<XClose size={14} />} size={24} onClick={() => select(null)} />
          </div>
          <dl className={classes.properties}>
            {Object.entries(selected.properties).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      )}
    </div>
  );
}
