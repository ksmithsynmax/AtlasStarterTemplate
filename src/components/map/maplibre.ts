import 'maplibre-gl/dist/maplibre-gl.css';
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

/*
 * maplibre finds its tile worker next to its own module URL. Vite pre-bundles maplibre into
 * `.vite/deps`, where the worker doesn't exist, so tiles never load. Point it at a bundled copy.
 */
setWorkerUrl(workerUrl);
