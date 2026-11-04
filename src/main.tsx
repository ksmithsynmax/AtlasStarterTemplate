import '@fontsource-variable/inter';
import '@mantine/core/styles.css';
import './theme/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router';
import { router } from './router';
import { cssVariablesResolver, theme } from './theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="dark"
    >
      <RouterProvider router={router} />
    </MantineProvider>
  </StrictMode>,
);
