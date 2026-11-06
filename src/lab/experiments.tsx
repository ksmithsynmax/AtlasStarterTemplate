import type { ReactNode } from 'react';
import { AtlasMap } from '../components/map';
import { sampleMapKits } from './maps/sampleKits';
import { TheiaPlaybackDemo } from './maps/TheiaPlaybackDemo';
import { atlasProducts, type AtlasProduct } from './products';

export interface LabExperiment {
  id: string;
  title: string;
  /** What it's for and what we're testing. */
  description: string;
  /** Products that use it. Omit when every product does, e.g. a shared map control. */
  products?: AtlasProduct[];
  status: 'exploring' | 'ready';
  /** Spans the full row with no stage padding, e.g. maps. */
  wide?: boolean;
  render: () => ReactNode;
}

const MAP_NOTES: Record<AtlasProduct, string> = {
  theia: 'Satellite detections, AIS dark events and possible STS transfers in the Strait of Hormuz.',
  hyperion: 'Well pads and active rigs in the Haynesville.',
  vulcan: 'Placeholder sites until we know what Vulcan maps.',
  basiniq: 'Placeholder sites in the Permian until we know what BasinIQ maps.',
};

/** Dashboard components under test. Add new experiments to the top of this list. */
export const labExperiments: LabExperiment[] = [
  {
    id: 'theia-playback',
    title: 'Vessel path playback',
    description:
      "Replays XU HAI 6's AIS path from the shared Theia dashboard, loaded live from SynMax. Pauses at each satellite detection and shows claimed vs. actual position while AIS is spoofed.",
    products: ['theia'],
    status: 'exploring',
    wide: true,
    render: () => <TheiaPlaybackDemo />,
  },
  ...atlasProducts.map((product) => ({
    id: `${product.id}-map`,
    title: `${product.label} map`,
    description: `deck.gl map on the shared core. ${MAP_NOTES[product.id]} Click a point for details.`,
    products: [product.id],
    status: 'exploring' as const,
    wide: true,
    render: () => <AtlasMap {...sampleMapKits[product.id]} />,
  })),
];
