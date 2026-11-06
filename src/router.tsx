import { Navigate, createBrowserRouter } from 'react-router';
import { DesignSystemLayout } from './design-system/DesignSystemLayout';
import { ChartsPage } from './design-system/charts/ChartsPage';
import { ColorsPage } from './design-system/colors/ColorsPage';
import { FoundationsPage } from './design-system/foundations/FoundationsPage';
import { LabPage } from './lab/LabPage';
import { AppLayout } from './layouts/AppLayout';
import { HomePage } from './pages/HomePage';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'lab', element: <LabPage /> },
      {
        path: 'design-system',
        element: <DesignSystemLayout />,
        children: [
          { index: true, element: <Navigate to="colors" replace /> },
          { path: 'colors', element: <ColorsPage /> },
          { path: 'foundations', element: <FoundationsPage /> },
          { path: 'charts', element: <ChartsPage /> },
        ],
      },
    ],
  },
]);
