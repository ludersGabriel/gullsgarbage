import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({ projects: ['./tsconfig.json'] }),
    // MUST come before react()
    tanstackStart(),
    // Deployment runtime: bundle the server with Nitro, targeted at Bun.
    // The app model (routes, loaders, server functions) stays unchanged —
    // only the server packaging/preset differs.
    nitro({ preset: 'bun' }),
    viteReact(),
    tailwindcss(),
  ],
})
