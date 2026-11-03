import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Tauri serves the built files from dist/; the dev server uses a fixed port Tauri expects.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  base: './',
  build: { target: 'es2022', outDir: 'dist', chunkSizeWarningLimit: 2000 },
  worker: { format: 'es' },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
} as never);
