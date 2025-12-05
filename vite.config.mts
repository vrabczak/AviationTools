import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import packageJson from './package.json' with { type: 'json' };

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const homepagePath = packageJson.homepage
    ? `${new URL(packageJson.homepage).pathname.replace(/\/$/, '')}/`
    : '/';
  const base = env.PUBLIC_PATH || homepagePath;

  return {
    base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      sourcemap: true,
    },
    plugins: [
      react(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'service-worker.ts',
        manifest: false,
        includeAssets: ['assets/images/ATicon.png', 'assets/images/ATiconTransparent.png'],
      }),
    ],
  };
});
