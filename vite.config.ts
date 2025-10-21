import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        // 支持JSX
        isCustomElement: (tag) => tag.includes('-')
      }
    }
  })],
  server: {
    port: 5173
  },
  esbuild: {
    jsx: 'preserve',
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
})
