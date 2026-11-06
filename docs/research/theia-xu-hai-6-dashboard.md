# Theia dashboard: XU HAI 6 path (auto play)

Source: [public dashboard](https://agents.synmax.com/public/dashboard/f6602405-5be9-4803-83ca-7b377c94df04), with share token `f6602405-5be9-4803-83ca-7b377c94df04`.

## How production dashboards are defined

- `GET {api}/public/dashboard/{shareToken}` returns the dashboard: `components`, `params` and map `templates`. Here `api` is `https://api.atlas-prod.synmax.com`.
- `GET {api}/public/dataset/{id}/data?share_token=…&limit=…` returns `{ columns, data: [row objects], total_rows }`.
  - The web app can also load Parquet through `/public/dataset/{id}/signed_url`.
- Component types: `text`, `kpi` (SQL like `SELECT COUNT(*) … FROM dataset_13`), `script` (the `intel-map`) and the detail, legend and timeline panels.
- Map templates are `type: map`, `subtype: deckgl`, with:
  - `basemap: "dark"`, `projection: "mercator"` and an `initial_view_state`.
  - A legend config.
  - `layers[]` that pick out data with `dataset_id` and `filter_expression`.

## Theia map layers

| Layer | Type | Data |
|---|---|---|
| AIS track (as broadcast) | polyline, `#00A3E3`, grouped by `path_id`, ordered by `ord` | ds 17, `part == 'genuine'` |
| AIS track (spoofed positions) | polyline, `#FF6D99`, dashed `[6,4]` | ds 17, `part == 'spoofed'` |
| AIS On, Unattributed, STS, Spoofing (Ghost Signal), Dark (AIS Off) | icon layers, size 22, PNG icons | detections |

Tooltips use `tooltip_fields` (for example label, ts and speed).

## Data shapes

- **Detections (ds 13, 41 rows):**
  - Fields: `object_id_int`, `detection_class` (`AIS On` 35, `Dark` 6), `icon_type`, `vessel_name`, `imo`, `mmsi`, `flag`, `ship_type`, `dimensions`, `provider`, `acquired_str`, `lat`, `lon`, `heading`.
  - Sanctions fields: `is_sanctioned`, `sanctioned_by`, `sanctions_*`.
  - Second-vessel fields for ship-to-ship transfers: `vessel_2`, `imo_2` and so on.
  - Also `img_data`, a satellite image chip, plus `ais_status`, `spoofing_vessel` and `sts_flag`.
- **Spoofing (ds 14, 27 rows):** same fields, with `detection_class: Spoofing`.
- **Track (ds 17, 2,041 points):** `path_id`, `part` (genuine or spoofed), `seg`, `ord`, `ts`, `lat`, `lon`, `speed`, `label`.

## Path playback (`intel-map` script)

- The playback is a `script` component built on **Leaflet**, not deck.gl. It reads ds 18 (track), ds 19 (detections), ds 20 (spoofing) and ds 21 (STS, empty), plus ds 13 and 14 for image chips.
- Datasets 18–21 repeat every row once per world copy (`copy` is -720, -360, 0 or 360), and longitudes are unwrapped, so copy 0 runs from 107° to 302°.
- How it behaves:
  - The played path draws over a faded full track: as-broadcast in blue, spoofed in pink dashes, and a reception gap in the Taiwan Strait (9 Dec 15:15 to 10 Dec 00:48) as dots.
  - It pauses 2.5 s at each satellite pass, which groups detections within 1 h and shows the dark one if any. There's also a hand-added 19 Feb Satellogic stop at Mariel.
  - While AIS is spoofed, the card shows the claimed (AIS) against the actual (last dark detection) position and the km between them, with a dashed link on the map.
  - Controls: back to start, previous and next detection, play, a time slider, a speed of 0.5 to 4 days per second, Follow, and exit.
- Analyst annotations are hard-coded in the script: the gap times, the Mariel berth, "no imagery 4–8 Feb", and a QC'd 535 km distance for detection 284308500.
- Our version is `TrackPlayback` (shared core) plus `src/lab/maps/theiaPlayback.ts` (Theia adapter, XU HAI 6 config). It loads live from the public API in the Lab.
- Imagery: every detection row (ds 13 and 19) has `img_data`, a public 192×192 PNG chip URL with a token, plus `provider` (planetscope, Sentinel1, Sentinel2). Spoofing rows (ds 14 and 20) have no image. The 19 Feb Satellogic berth image is only described in the dashboard's text; there's no image file for it in the data.
- Production shows the imagery in a card below the map. Ours puts it in a story panel beside the map:
  - The latest image, large, with the claimed-vs-actual readout.
  - Every stop as a timeline with its image thumbnail. Clicking a stop jumps the playback there and flies the map to it.
  - The map can't zoom out past one world copy, so the route never shows twice.
- Storytelling pass (Nov 2026), all in the shared playback core with Theia specifics passed in as data:
  - **Chapters:** the adapter splits the track where its state changes (AIS on, reception gap, spoofed, berthed). Each chapter has a one-line summary, such as "6 dark detections place the vessel up to 3,201 km away". Only the current chapter opens; the rest fold to their summary.
  - **Chapter strip:** above the slider there's one colored segment per chapter (click to jump) and a tick per detection.
  - **Summary:** tracked days, dark detections, days spoofed, farthest claimed-vs-actual distance, and a sanctions tag from `is_sanctioned`.
  - **Callout:** while spoofed, the distance shows large in the Now card.
  - **Linking:** hovering a card rings its spot on the map; hovering or clicking a map detection highlights or jumps to its card.
  - **Imagery:** clicking the image opens a lightbox (arrow keys step through every image). The chips are only 192 px, so they're soft at that size.
  - **Other:** Space and arrow keys control playback, playback eases into each stop, a shared link (`?at=2026-02-09T16:42Z`) opens at a moment, filter pills show one detection kind, narrow dashboards stack the panel under the map, and "Export briefing" opens a print-ready page to save as PDF.
- Not done yet: a video or GIF export (needs map frame capture), and a map snapshot in the briefing.

## Takeaways for the Theia kit

- The pieces every Theia map needs: a vessel track line, a spoofed-track line, detection icons by class (rotated by `heading`) and a detection detail card with the image chip and sanctions info.
- Layer definitions are data-driven (dataset, filter, style). Our `AtlasMap` kits should take the same config shape so production templates map onto them directly.
