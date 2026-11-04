import { Navigate, createBrowserRouter } from 'react-router';
import { DesignSystemLayout } from './design-system/DesignSystemLayout';
import { ChartsPage } from './design-system/charts/ChartsPage';
import { ColorsPage } from './design-system/colors/ColorsPage';
import { AppLayout } from './layouts/AppLayout';
import { HomePage } from './pages/HomePage';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'design-system',
        element: <DesignSystemLayout />,
        children: [
          { index: true, element: <Navigate to="colors" replace /> },
          { path: 'colors', element: <ColorsPage /> },
          { path: 'charts', element: <ChartsPage /> },
        ],
      },
    ],
  },
]);
