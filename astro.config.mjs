// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// 添加 MDX 支持以处理文章
export default defineConfig({
  site: 'https://gao20250409.github.io',
  base: '/',
  integrations: [
    mdx(),
  ],
});
