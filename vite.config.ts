import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, './statics')),
          dest: '',
        },
      ],
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.landcover100.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
