import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, './')
    },
    setupFiles: ['./__tests__/setup.ts'],
    hookTimeout: 30000,
  }
})
