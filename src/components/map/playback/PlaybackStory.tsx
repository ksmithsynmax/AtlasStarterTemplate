import { Tooltip } from "@mantine/core";
import { Download01, Expand01, Image01 } from "@untitledui/icons";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ATLAS_RADIUS_FULL, atlasVar } from "../../../theme";
import { FilterPills, IconButton } from "../../ui";
import { printBriefing } from "./briefing";
import { playbackCss } from "./color";
import { formatUtc } from "./track";
import classes from "./PlaybackStory.module.css";
import { StopImageViewer } from "./StopImageViewer";

const ALL = "all";
/** Space kept between the scrolled-to card and the list's edges, in px. */
const REVEAL_MARGIN = 12;
import type {
  PlaybackBadge,
  PlaybackChapter,
  PlaybackFrame,
  PlaybackStat,
  PlaybackStop,
  PlaybackTag,
} from "./types";

export interface PlaybackStoryProps {
  title?: string;
  subtitle?: string;
  badge?: PlaybackBadge;
  /** Shown above the map by `TrackPlayback`; here only for the briefing. */
  stats?: PlaybackStat[];
  tags?: PlaybackTag[];
  stops: PlaybackStop[];
  /** Stop being held, or the last one passed. */
  current: number | null;
  /** True while paused on `current`. */
  atStop: boolean;
  t: number;
  frame: PlaybackFrame | null;
  stopLabel: string;
  /** Groups the stops under headlines. The current chapter is open; the rest show only their summary. */
  chapters?: PlaybackChapter[];
  /** Stop whose map marker is hovered. */
  highlighted?: number | null;
  onHover?: (index: number | null) => void;
  onSelect: (index: number) => void;
  onSelectChapter: (index: number) => void;
}

/** Side panel for a playback: the current moment with its imagery, then the story as chapters of stops. */
export function PlaybackStory({
  title,
  subtitle,
  badge,
  stats = [],
  tags = [],
  stops,
  current,
  atStop,
  t,
  frame,
  stopLabel,
  chapters = [],
  highlighted = null,
  onHover,
  onSelect,
  onSelectChapter,
}: PlaybackStoryProps) {
  const list = useRef<HTMLDivElement>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const images = useMemo(() => stops.filter((stop) => stop.image), [stops]);
  const shown = current === null ? null : stops[current];

  // The current stop's card opens to show its image and the live moment, in place of a separate panel.
  const linkedRows =
    !!frame && frame.rows.length > 1 && frame.rows.every((row) => row.icon);
  const details = shown && frame && (
    <div className={classes.details} aria-live="polite">
      {shown.image ? (
        <figure className={classes.figure}>
          <button
            type="button"
            className={classes.heroButton}
            aria-label="Enlarge image"
            onClick={() => setViewing(images.indexOf(shown))}
          >
            <img
              className={classes.hero}
              src={shown.image.url}
              alt={`${shown.title}, ${shown.image.caption}`}
            />
            <span className={classes.enlarge}>
              <Expand01 size={14} />
            </span>
          </button>
          <figcaption className={classes.caption}>
            {shown.image.source ?? shown.image.caption}
          </figcaption>
        </figure>
      ) : (
        atStop && (
          <div className={classes.noImage}>
            <Image01 size={20} />
            <span>{shown.imageNote ?? "No image for this stop."}</span>
          </div>
        )
      )}
      {linkedRows ? (
        <ol className={classes.places}>
          {frame.rows.map((row, index) => (
            <Fragment key={row.label}>
              {index > 0 && (
                <li className={classes.link}>
                  {index === 1 && frame.callout && (
                    <span>
                      <span
                        className={classes.calloutValue}
                        style={{ color: playbackCss(frame.callout.color ?? "text") }}
                      >
                        {frame.callout.value}
                      </span>{" "}
                      <span className={classes.calloutLabel}>{frame.callout.label}</span>
                    </span>
                  )}
                </li>
              )}
              <li className={classes.place}>
                <img className={classes.placeIcon} src={row.icon!.default.url} alt="" />
                <div>
                  <div className={classes.placeLabel}>{row.label}</div>
                  <div className={classes.rowTitle}>{row.title}</div>
                  {row.subtitle && (
                    <div className={classes.rowSubtitle}>{row.subtitle}</div>
                  )}
                </div>
              </li>
            </Fragment>
          ))}
        </ol>
      ) : (
        <>
          {frame.callout && (
            <div
              className={classes.callout}
              style={{ color: playbackCss(frame.callout.color ?? "text") }}
            >
              <span className={classes.calloutValue}>{frame.callout.value}</span>
              <span className={classes.calloutLabel}>{frame.callout.label}</span>
            </div>
          )}
          {frame.rows.map((row) => (
            <div key={row.label} className={classes.row}>
              <div
                className={classes.rowLabel}
                style={{ color: playbackCss(row.color ?? "textSecondary") }}
              >
                {row.label}
              </div>
              <div className={classes.rowTitle}>{row.title}</div>
              {row.subtitle && (
                <div className={classes.rowSubtitle}>{row.subtitle}</div>
              )}
            </div>
          ))}
        </>
      )}
      {frame.note && <div className={classes.note}>{frame.note}</div>}
    </div>
  );
  const currentChapter = frame
    ? chapters.findLastIndex((chapter) => chapter.start <= t)
    : -1;

  const [filter, setFilter] = useState(ALL);
  const kindOf = (stop: PlaybackStop) => stop.kind ?? stop.title;
  const filters = useMemo(() => {
    const counts = new Map<string, number>();
    for (const stop of stops)
      counts.set(kindOf(stop), (counts.get(kindOf(stop)) ?? 0) + 1);
    return [
      { value: ALL, label: `All ${stops.length}` },
      ...[...counts].map(([kind, count]) => ({
        value: kind,
        label: `${kind} ${count}`,
      })),
    ];
  }, [stops]);
  const filtering = filter !== ALL;

  const groups = useMemo(() => {
    const all = stops
      .map((_, index) => index)
      .filter((index) => filter === ALL || kindOf(stops[index]) === filter);
    if (chapters.length === 0) return [{ chapter: null, indices: all }];
    return chapters.map((chapter, i) => {
      const until = chapters[i + 1]?.start ?? Infinity;
      return {
        chapter,
        indices: all.filter(
          (index) => stops[index].t >= chapter.start && stops[index].t < until,
        ),
      };
    });
  }, [chapters, stops, filter]);

  // The rail runs down the visible cards in time order and fills to the clock in each card's chapter color.
  const rail = useMemo(() => {
    const rows: { key: string; t: number; color: string }[] = [];
    groups.forEach(({ chapter, indices }, groupIndex) => {
      if (filtering && indices.length === 0) return;
      const open = !chapter || groupIndex === currentChapter || filtering;
      if (chapter)
        rows.push({
          key: `c-${chapter.id}`,
          t: chapter.start,
          color: playbackCss(chapter.color),
        });
      if (!open) return;
      for (const index of indices) {
        rows.push({
          key: `s-${stops[index].id}`,
          t: stops[index].t,
          color: playbackCss(chapter?.color ?? stops[index].color),
        });
      }
    });
    const progress = frame ? t : -Infinity;
    const latest = rows.findLastIndex((row) => progress >= row.t);
    return new Map<string, RailPoint>(
      rows.map((row, i) => {
        const next = rows[i + 1];
        const span = next ? next.t - row.t : 0;
        const fill = !next
          ? 0
          : span <= 0
            ? progress >= next.t
              ? 1
              : 0
            : (progress - row.t) / span;
        return [
          row.key,
          {
            color: row.color,
            reached: progress >= row.t,
            latest: i === latest,
            fill: Math.min(1, Math.max(0, fill)),
            last: !next,
          },
        ];
      }),
    );
  }, [groups, filtering, currentChapter, stops, frame, t]);

  // Scrolls only the list; scrollIntoView would scroll the page too.
  useEffect(() => {
    const container = list.current;
    const stop = container?.querySelector<HTMLElement>("[data-current]");
    const target =
      stop ?? container?.querySelector<HTMLElement>("[data-active] button");
    if (!container || !target) return;
    const reveal = () => {
      const top =
        target.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop -
        REVEAL_MARGIN;
      const bottom = top + target.offsetHeight + 2 * REVEAL_MARGIN;
      // A chapter header, or a card taller than the list, goes to the top so what follows shows below it.
      if (top < container.scrollTop || !stop || bottom - top > container.clientHeight)
        container.scrollTo({ top, behavior: "smooth" });
      else if (bottom > container.scrollTop + container.clientHeight) {
        container.scrollTo({
          top: bottom - container.clientHeight,
          behavior: "smooth",
        });
      }
    };
    reveal();
    if (!stop) return;
    // The current card grows once its image loads.
    const seen = { height: stop.offsetHeight };
    const observer = new ResizeObserver(() => {
      if (stop.offsetHeight === seen.height) return;
      seen.height = stop.offsetHeight;
      reveal();
    });
    observer.observe(stop);
    return () => observer.disconnect();
  }, [current, currentChapter]);

  return (
    <aside className={classes.root} aria-label="Playback story">
      {(title || subtitle) && (
        <header className={classes.header}>
          <div className={classes.titleRow}>
            <div className={classes.identity}>
              <div className={classes.nameRow}>
                {title && <div className={classes.title}>{title}</div>}
                {badge && (
                  <Tooltip label={badge.label} openDelay={150}>
                    <span
                      className={classes.badge}
                      role="img"
                      aria-label={badge.label}
                      tabIndex={0}
                    >
                      {badge.symbol}
                    </span>
                  </Tooltip>
                )}
              </div>
              {subtitle && <div className={classes.subtitle}>{subtitle}</div>}
            </div>
            {tags.map((tag) => (
              <span
                key={tag.label}
                className={classes.tag}
                style={
                  {
                    "--tag-color": atlasVar(tag.color),
                    borderRadius: ATLAS_RADIUS_FULL,
                  } as React.CSSProperties
                }
              >
                {tag.label}
              </span>
            ))}
            <span className={classes.export}>
              <IconButton
                label="Export briefing (PDF)"
                icon={<Download01 size={16} />}
                size={32}
                round
                onClick={() =>
                  printBriefing({
                    title,
                    subtitle,
                    stats,
                    tags,
                    chapters,
                    stops,
                    stopLabel,
                  })
                }
              />
            </span>
          </div>
        </header>
      )}

      <div className={classes.timelineLabel}>Event timeline</div>
      {filters.length > 2 && (
        <div className={classes.filters}>
          <FilterPills
            size="xs"
            value={filter}
            onChange={setFilter}
            options={filters}
            aria-label={`Filter ${stopLabel}s`}
          />
        </div>
      )}
      <div ref={list} className={classes.timeline}>
        {groups.map(({ chapter, indices }, groupIndex) => {
          const isCurrent = groupIndex === currentChapter;
          // While filtering, every chapter with a match opens and the rest hide.
          if (filtering && indices.length === 0) return null;
          const open = !chapter || isCurrent || filtering;
          return (
            <section
              key={chapter?.id ?? "all"}
              className={classes.chapter}
              data-active={(chapter && isCurrent) || undefined}
              data-future={
                (chapter &&
                  currentChapter >= 0 &&
                  groupIndex > currentChapter) ||
                undefined
              }
              style={
                chapter
                  ? ({
                      "--chapter-color": playbackCss(chapter.color),
                    } as React.CSSProperties)
                  : undefined
              }
            >
              {chapter && (
                <div className={classes.railRow}>
                  <Rail point={rail.get(`c-${chapter.id}`)} large />
                  <button
                    type="button"
                    className={classes.chapterHeader}
                    aria-expanded={open}
                    onClick={() => onSelectChapter(groupIndex)}
                  >
                    <span className={classes.chapterTitle}>
                      {chapter.icon ? (
                        <img
                          className={classes.chapterIcon}
                          src={chapter.icon.default.url}
                          alt=""
                        />
                      ) : (
                        <span className={classes.chapterDot} />
                      )}
                      {chapter.title}
                      <span className={classes.chapterCount}>
                        {indices.length > 0
                          ? `${indices.length} ${stopLabel}${indices.length === 1 ? "" : "s"}`
                          : ""}
                      </span>
                    </span>
                    <span className={classes.chapterSummary}>
                      {chapter.summary}
                    </span>
                  </button>
                </div>
              )}
              {open && indices.length > 0 && (
                <ol className={chapter ? classes.chapterStops : classes.stops}>
                  {indices.map((index) => (
                    <li key={stops[index].id} className={classes.railRow}>
                      <Rail point={rail.get(`s-${stops[index].id}`)} />
                      <StopCard
                        stop={stops[index]}
                        current={index === current}
                        future={current === null || index > current}
                        highlighted={index === highlighted}
                        details={index === current ? details : undefined}
                        onClick={() => onSelect(index)}
                        onHover={(on) => onHover?.(on ? index : null)}
                      />
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>

      <StopImageViewer
        stops={images}
        index={viewing}
        onChange={setViewing}
        onGoTo={(stop) => onSelect(stops.indexOf(stop))}
      />
    </aside>
  );
}

interface StopCardProps {
  stop: PlaybackStop;
  current: boolean;
  future: boolean;
  highlighted: boolean;
  /** Shown under the header, in place of the thumbnail, e.g. the current stop's image. */
  details?: React.ReactNode;
  onClick: () => void;
  onHover: (on: boolean) => void;
}

function StopCard({
  stop,
  current,
  future,
  highlighted,
  details,
  onClick,
  onHover,
}: StopCardProps) {
  return (
    <div
      className={classes.item}
      data-current={current || undefined}
      data-future={future || undefined}
      data-highlighted={highlighted || undefined}
      data-expanded={details ? true : undefined}
      style={{ "--stop-color": playbackCss(stop.color) } as React.CSSProperties}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <button
        type="button"
        className={classes.itemHead}
        onClick={onClick}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
      >
        {!details &&
          (stop.image ? (
            <img
              className={classes.thumb}
              src={stop.image.url}
              alt=""
              loading="lazy"
            />
          ) : (
            <span className={classes.thumb}>
              <Image01 size={16} />
            </span>
          ))}
        <span className={classes.itemText}>
          <span className={classes.itemTitle}>
            {stop.icon ? (
              <img
                className={classes.eventIcon}
                src={stop.icon.default.url}
                alt=""
              />
            ) : (
              <span className={classes.eventDot} />
            )}
            {stop.title}
          </span>
          <span className={classes.itemDate}>{formatUtc(stop.t)}</span>
        </span>
      </button>
      {details}
    </div>
  );
}

interface RailPoint {
  color: string;
  /** The clock has passed this card's start. */
  reached: boolean;
  /** The last card the clock has reached; its circle pulses once on arrival. */
  latest: boolean;
  /** Share of the line to the next card that's filled, 0–1. */
  fill: number;
  last: boolean;
}

/** Progress rail beside a timeline card: a circle where the card starts and a line to the next card. */
function Rail({ point, large }: { point?: RailPoint; large?: boolean }) {
  return (
    <span
      className={classes.rail}
      aria-hidden
      data-large={large || undefined}
      data-reached={point?.reached || undefined}
      data-latest={point?.latest || undefined}
      data-last={!point || point.last || undefined}
      style={
        {
          "--rail-color": point?.color,
          "--rail-fill": point?.fill ?? 0,
        } as React.CSSProperties
      }
    >
      <span className={classes.railNode} />
    </span>
  );
}
