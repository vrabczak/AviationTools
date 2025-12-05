import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import packageJson from './package.json';

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
