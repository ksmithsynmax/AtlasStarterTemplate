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

## Theia icon set

- Source: the "SynMax Detections" sheet in Figma ([node 107:8](https://www.figma.com/design/jV6UQKIKA4c8lWUR7lnN2N/project-atlas-sonsistent-components?node-id=107-8&m=dev)), with columns Default, Hover, Selected, Playback (1.5×), Playback (original) and Sanctioned.
- In the repo: `src/assets/map-icons/theia/`, with Default and Hover only so far. Similar Ships has no Hover yet. `src/lab/maps/theiaIcons.ts` maps them to `icon_type` and `detection_class`.
- Ship hulls rotate to the detection heading. The diamond (spoofed position) and square (STS) icons don't rotate.
- The shared core draws product icons with `productIconLayer` (`src/components/map/icons.ts`). A map kind or playback marker with an `icon` draws it instead of a dot.
- Every icon draws at one size, 16 px tall: map markers, the moving vessel in playback, and selected items. We dropped the Figma sheet's 1.5× playback size so icons never change size.
- Playback shows the moving vessel as AIS when AIS is genuine, Spoofing Ship when spoofed, and Dark for the actual satellite position.
- The selected item, or the one at the current playback stop, gets a halo: a 2 px border in the icon's color, a fill of that color at low opacity, and a solid backdrop so lines underneath don't show through.
- Icons keep Theia's own colors (green, blue, orange, pink, purple). They aren't Atlas tokens yet, so the icon colors and the track and card colors don't fully match.

## Dashboard theme by domain

- The Atlas shell (sidebar, tabs, chat) always uses the Atlas teal primary. Dashboards can take their domain's accent instead: blue (`accent3`) for Maritime and green (`success`) for Energy, the same colors as the Lab's product tags. Charts follow: the domain color becomes series 1 and teal takes the domain color's old slot (Maritime: series 5, Energy: series 6), so all seven base series stay distinct.
- It's keyed by domain, not product, so Hyperion, Vulcan and BasinIQ share green.
- The accent replaces the primary color for controls only (sliders, play buttons, checkboxes, primary buttons). Data colors such as AIS green or dark orange don't change.
- For testing it's a global switch in the profile menu (Dashboard theme: Atlas, Maritime, Energy). Real sessions don't know their product yet, so later the template's domain should set it.
- Watch for: green controls next to green "good" data in Energy, and the blue next to Theia's light-detection blue.

## Open questions

- Basemap provider in production (Mapbox, MapLibre, other)? The prototype hides the CARTO/OpenStreetMap credit; anything customer-facing needs it back in some form.
- Which deck.gl layers each product uses today, and their icon assets.
- What Vulcan and BasinIQ show on their maps.
- Sample data (or a schema) per product.
