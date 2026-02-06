import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    rolldownOptions: {
      input: {
        main: 'index.html',
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
})
