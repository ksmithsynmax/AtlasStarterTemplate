import { useEffect, useRef, useState } from 'react';
import { DAY_MS } from './track';

const EASE_MS = 500;
const MIN_EASE_RATE = 0.2;

export interface PlaybackClockOptions {
  start: number;
  end: number;
  /** Times to pause on, sorted. */
  stops: { t: number }[];
  /** How long each stop holds, in ms of real time. */
  holdMs?: number;
}

/**
 * Sped-up clock for replaying a time range. Speed is in days per second.
 * Playback pauses on each stop for `holdMs`, and the active stop stays set while it holds.
 */
export function usePlaybackClock({ start, end, stops, holdMs = 2500 }: PlaybackClockOptions) {
  const [t, setT] = useState(start);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeStop, setActiveStop] = useState<number | null>(null);
  const clock = useRef({ t: start, next: 0, hold: 0 });

  useEffect(() => {
    if (!playing) return;
    const timing = { last: performance.now(), frame: 0 };
    const tick = (now: number) => {
      const dt = Math.min(250, now - timing.last);
      timing.last = now;
      const c = clock.current;
      if (c.hold > 0) {
        c.hold -= dt;
        if (c.hold <= 0) setActiveStop(null);
      } else {
        const stop = stops[c.next];
        let rate = (speed * DAY_MS) / 1000;
        // Slows into each stop over its last EASE_MS of real time, so the pause doesn't land abruptly.
        if (stop) {
          const remaining = (stop.t - c.t) / rate;
          if (remaining < EASE_MS) rate *= Math.max(MIN_EASE_RATE, remaining / EASE_MS);
        }
        const nextT = c.t + dt * rate;
        if (stop && nextT >= stop.t) {
          c.t = stop.t;
          c.hold = holdMs;
          setActiveStop(c.next);
          c.next++;
        } else {
          c.t = Math.min(nextT, end);
          if (c.t >= end) setPlaying(false);
        }
        setT(c.t);
      }
      timing.frame = requestAnimationFrame(tick);
    };
    timing.frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(timing.frame);
  }, [playing, speed, stops, end, holdMs]);

  const seek = (time: number) => {
    const c = clock.current;
    c.t = Math.max(start, Math.min(end, time));
    c.hold = 0;
    const next = stops.findIndex((stop) => stop.t > c.t);
    c.next = next < 0 ? stops.length : next;
    setT(c.t);
    setActiveStop(null);
  };

  const arrive = (index: number) => {
    const c = clock.current;
    c.t = stops[index].t;
    c.next = index + 1;
    c.hold = holdMs;
    setT(c.t);
    setActiveStop(index);
  };

  const toggle = () => {
    if (!playing && clock.current.t >= end) seek(start);
    setPlaying(!playing);
  };

  const next = () => {
    if (clock.current.next < stops.length) arrive(clock.current.next);
  };

  const previous = () => {
    const index = stops.findLastIndex((stop) => stop.t < clock.current.t - 1);
    if (index >= 0) arrive(index);
    else seek(start);
  };

  const reset = () => {
    setPlaying(false);
    seek(start);
  };

  return { t, playing, speed, activeStop, setSpeed, seek, goTo: arrive, toggle, next, previous, reset };
}
