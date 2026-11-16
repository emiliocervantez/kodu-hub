/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/kodu-hub/',
  plugins: [vue()],
  // Tests assume a Tallinn device.
  test: { env: { TZ: 'Europe/Tallinn' } },
})
