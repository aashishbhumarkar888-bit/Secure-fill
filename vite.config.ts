import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const extensionAssetCopyPlugin = (isExtensionBuild: boolean) => ({
  name: 'copy-extension-assets',
  async writeBundle() {
    if (!isExtensionBuild) {
      return;
    }

    const outDir = path.resolve(__dirname, 'dist');
    const iconsDir = path.join(outDir, 'icons');
    const extensionIconDir = path.resolve(__dirname, 'extension', 'icons');
    const popupSourcePath = path.resolve(__dirname, 'extension', 'popup', 'popup.html');

    await fs.promises.mkdir(iconsDir, { recursive: true });
    await fs.promises.copyFile(
      path.resolve(__dirname, 'extension', 'manifest.json'),
      path.join(outDir, 'manifest.json')
    );

    const allowedExtensions = new Set(['.png', '.svg', '.webp', '.jpg', '.jpeg']);
    const iconFiles = await fs.promises.readdir(extensionIconDir);
    await Promise.all(
      iconFiles
        .filter((fileName) => allowedExtensions.has(path.extname(fileName).toLowerCase()))
        .map(async (fileName) => {
          const sourcePath = path.join(extensionIconDir, fileName);
          const targetPath = path.join(iconsDir, fileName);
          await fs.promises.copyFile(sourcePath, targetPath);
        })
    );

    if (await fs.promises.access(popupSourcePath).then(() => true).catch(() => false)) {
      await fs.promises.copyFile(popupSourcePath, path.join(outDir, 'popup.html'));
    }
  },
});

export default defineConfig(({ mode }) => {
  const isExtensionBuild =
    mode === 'extension' ||
    process.env.BUILD_EXTENSION === 'true' ||
    (process.env.npm_lifecycle_event?.includes('extension') ?? false);

  const baseConfig = {
    plugins: [react(), tailwindcss(), extensionAssetCopyPlugin(isExtensionBuild)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? false : {},
    },
  };

  if (isExtensionBuild) {
    const extensionInput: Record<string, string> = {
      background: path.resolve(__dirname, 'extension/background/background.ts'),
      content: path.resolve(__dirname, 'extension/content/content.ts'),
      popup: path.resolve(__dirname, 'extension/popup/popup.html'),
    };

    return {
      ...baseConfig,
      build: {
        minify: 'esbuild' as const,
        target: 'ES2022',
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
          input: extensionInput,
          output: {
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]',
          },
        },
      },
    };
  }

  return {
    ...baseConfig,
    build: {
      target: 'ES2022',
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
      },
    },
  };
});
