import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      EVOLUTION_API_KEY: 'test-key',
    },
  },
})
