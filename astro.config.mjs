// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import UnoCSS from '@unocss/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(),
    react(),
    vue(),
    tailwind({
      applyBaseStyles: false, // 避免与 UnoCSS 冲突
    }),
    UnoCSS({
      injectReset: true,
    }),
  ],
});
