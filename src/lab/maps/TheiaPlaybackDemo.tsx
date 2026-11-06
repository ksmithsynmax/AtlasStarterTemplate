import { Center, Loader, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { TrackPlayback } from '../../components/map';
import { atlasVar } from '../../theme';
import { loadTheiaPlayback, XU_HAI_6, type TheiaPlayback } from './theiaPlayback';

const HEIGHT = 600;
const PACIFIC_VIEW = { longitude: 205, latitude: 20, zoom: 1.5 };

/** XU HAI 6's path, loaded live from the shared Theia dashboard. */
export function TheiaPlaybackDemo() {
  const [playback, setPlayback] = useState<TheiaPlayback | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    loadTheiaPlayback(XU_HAI_6, controller.signal)
      .then(setPlayback)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : String(reason));
      });
    return () => controller.abort();
  }, []);

  if (!playback) {
    return (
      <Center h={HEIGHT}>
        <Stack align="center" gap={8}>
          {!error && <Loader size="sm" />}
          <Text fz="sm" c={atlasVar(error ? 'error' : 'textSecondary')}>
            {error ?? 'Loading XU HAI 6 from SynMax…'}
          </Text>
        </Stack>
      </Center>
    );
  }

  return <TrackPlayback {...playback} stopLabel="detection" initialViewState={PACIFIC_VIEW} height={HEIGHT} />;
}
