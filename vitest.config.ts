import { defineConfig, coverageConfigDefaults } from 'vitest/config';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '#types': path.resolve(__dirname, './src/types'),
      '#helpers': path.resolve(__dirname, './src/helpers'),
      '#helpers/database': path.resolve(__dirname, './src/helpers/database.ts'),
      '#url-shortener': path.resolve(__dirname, './src/url-shortener.ts'),
    },
  },
  test: {
    name: 'ssb-url-shortener',
    isolate: false,
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    setupFiles: 'tests/setup.ts',
    silent: 'passed-only',
    coverage: {
      provider: 'v8',
      exclude: ['**/index.ts', ...coverageConfigDefaults.exclude],
    },
  },
});
