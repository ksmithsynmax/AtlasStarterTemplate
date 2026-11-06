import { Modal } from '@mantine/core';
import { ChevronLeft, ChevronRight } from '@untitledui/icons';
import { useEffect } from 'react';
import { atlasVar } from '../../../theme';
import { IconButton } from '../../ui';
import { formatCoords, formatUtc } from './track';
import classes from './StopImageViewer.module.css';
import type { PlaybackStop } from './types';

export interface StopImageViewerProps {
  /** Stops that have an image, in story order. */
  stops: PlaybackStop[];
  /** Index into `stops`, or null when closed. */
  index: number | null;
  onChange: (index: number | null) => void;
  /** Jumps the playback to the stop being viewed. */
  onGoTo: (stop: PlaybackStop) => void;
}

/** Large view of a stop's image with its details. Arrow keys step through the story's images. */
export function StopImageViewer({ stops, index, onChange, onGoTo }: StopImageViewerProps) {
  const stop = index === null ? null : stops[index];
  const step = (by: number) => index !== null && onChange((index + by + stops.length) % stops.length);

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') onChange((index - 1 + stops.length) % stops.length);
      if (event.key === 'ArrowRight') onChange((index + 1) % stops.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, stops.length, onChange]);

  return (
    <Modal
      opened={stop !== null}
      onClose={() => onChange(null)}
      size={440}
      radius="lg"
      centered
      title={
        stop && (
          <span className={classes.title}>
            {stop.icon && <img className={classes.icon} src={stop.icon.default.url} alt="" />}
            <span style={{ color: atlasVar('text') }}>{stop.title}</span>
          </span>
        )
      }
    >
      {stop?.image && (
        <>
          <img className={classes.image} src={stop.image.url} alt={`${stop.title}, ${stop.image.caption}`} />
          <dl className={classes.details}>
            <div>
              <dt>Captured</dt>
              <dd>{formatUtc(stop.t)}</dd>
            </div>
            <div>
              <dt>Position</dt>
              <dd>{formatCoords(stop.lat, stop.lon)}</dd>
            </div>
            {stop.image.source && (
              <div>
                <dt>Source</dt>
                <dd>{stop.image.source}</dd>
              </div>
            )}
          </dl>
          <div className={classes.footer}>
            <IconButton label="Previous image" icon={<ChevronLeft size={16} />} onClick={() => step(-1)} />
            <span className={classes.count}>
              {index! + 1} of {stops.length}
            </span>
            <IconButton label="Next image" icon={<ChevronRight size={16} />} onClick={() => step(1)} />
            <button type="button" className={classes.goTo} onClick={() => (onGoTo(stop), onChange(null))}>
              Show on map
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
