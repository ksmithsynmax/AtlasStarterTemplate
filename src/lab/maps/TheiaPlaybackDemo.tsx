import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PlaybackPlaceholder, TrackPlayback } from '../../components/map';
import { loadTheiaPlayback, XU_HAI_6, type TheiaPlayback } from './theiaPlayback';

/** Page padding left under the playback when it fills the window. */
const BOTTOM_GAP = 24;
const MIN_HEIGHT = 560;
const MAX_HEIGHT = 900;

/** Fills the window from where the playback starts on the page, so the player shows without scrolling. */
function useWindowFit() {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  useLayoutEffect(() => {
    const measure = () => {
      if (ref.current) setTop(Math.round(ref.current.getBoundingClientRect().top + window.scrollY));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);
  return { ref, height: `clamp(${MIN_HEIGHT}px, 100dvh - ${top + BOTTOM_GAP}px, ${MAX_HEIGHT}px)` };
}

/** XU HAI 6's path, loaded live from the shared Theia dashboard. */
export function TheiaPlaybackDemo() {
  const [playback, setPlayback] = useState<TheiaPlayback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const { ref, height } = useWindowFit();

  useEffect(() => {
    const controller = new AbortController();
    loadTheiaPlayback(XU_HAI_6, controller.signal)
      .then(setPlayback)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : String(reason));
      });
    return () => controller.abort();
  }, [attempt]);

  return (
    <div ref={ref} style={{ width: '100%' }}>
      {playback ? (
        <TrackPlayback {...playback} stopLabel="detection" subjectLabel="vessel" height={height} shareParam="at" />
      ) : (
        <PlaybackPlaceholder
          height={height}
          error={error}
          label="Loading XU HAI 6 from SynMax…"
          onRetry={() => (setError(null), setAttempt((n) => n + 1))}
        />
      )}
    </div>
  );
}
