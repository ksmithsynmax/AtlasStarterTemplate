# Maps plan

Status: proposal, not built yet.

## What we know

- The production app builds its maps with deck.gl.
- Every product map has a lasso tool and features you can click: a ship detection (Theia), a well pad (Energy) and so on.
- Each product has its own filters, icons and variants.

## Proposed structure

1. **Map core (shared by every product)**
   - deck.gl over a basemap themed with Atlas tokens, in dark and light.
   - Toolbar: pan, select, lasso, layers, place search.
   - Click and lasso selection with a single contract, `onSelect(features)`.
   - Hover tooltip, legend, and a filter panel driven by a filter schema.
2. **Product layer kits**: one per product. Each kit has:
   - Layer factories (icons, points, paths, heatmaps).
   - Its icon set.
   - Legend entries.
   - Filter definitions.
   - A detail card for the selected feature.
3. **Product maps**: core plus kit, e.g. `TheiaMap` and `HyperionMap`.
   - **Variants** are presets: which layers are on, default filters and the starting view.

## Open questions

- Basemap provider in production (Mapbox, MapLibre, other)? The prototype hides the CARTO/OpenStreetMap credit; anything customer-facing needs it back in some form.
- Which deck.gl layers each product uses today, and their icon assets.
- What Vulcan and BasinIQ show on their maps.
- Sample data (or a schema) per product.
