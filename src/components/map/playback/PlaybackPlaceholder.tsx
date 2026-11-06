import { Button, Loader } from '@mantine/core';
import { AlertCircle } from '@untitledui/icons';
import { atlasVar } from '../../../theme';
import classes from './TrackPlayback.module.css';

export interface PlaybackPlaceholderProps {
  /** Matches the playback's height so the layout doesn't jump when it loads. */
  height?: number | string;
  error?: string | null;
  /** Loading message, e.g. "Loading XU HAI 6 from SynMax…". */
  label: string;
  onRetry?: () => void;
}

/** Stand-in for a `TrackPlayback` while its data loads or after it fails. */
export function PlaybackPlaceholder({ height = 600, error, label, onRetry }: PlaybackPlaceholderProps) {
  return (
    <div className={classes.placeholder} style={{ height }} role={error ? 'alert' : 'status'}>
      {error ? <AlertCircle size={20} color={atlasVar('error')} /> : <Loader size="sm" />}
      <span>{error ? `Couldn't load the playback. ${error}` : label}</span>
      {error && onRetry && (
        <Button size="xs" variant="light" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
