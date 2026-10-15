import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Chemins relatifs : la version compilée s'ouvre depuis n'importe quel dossier.
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
