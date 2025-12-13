import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import svgLoader from 'vite-svg-loader';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [vue(), tailwindcss(), svgLoader()],
    esbuild: {
      drop: ['console', 'debugger'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
