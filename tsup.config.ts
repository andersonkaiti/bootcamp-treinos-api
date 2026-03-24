import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'],
  clean: true,
  minify: true,
  format: ['esm'],
})
