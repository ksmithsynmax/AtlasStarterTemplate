import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pre-bundle these together so react-map-gl and our worker setup share one maplibre instance.
  optimizeDeps: { include: ['maplibre-gl', 'react-map-gl/maplibre'] },
})
