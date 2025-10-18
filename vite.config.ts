import { reactRouter } from '@react-router/dev/vite';
import { cloudflareDevProxy as reactRouterCloudflareDevProxy } from '@react-router/dev/vite/cloudflare';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import rehypeImgSize from 'rehype-img-size';
import rehypeSlug from 'rehype-slug';
import rehypePrism from '@mapbox/rehype-prism';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

type DefineRoute = (path: string, file: string, options?: { index?: boolean }) => void;

type DefineRoutes = (callback: (route: DefineRoute) => void) => void;

export default defineConfig({
  assetsInclude: ['**/*.glb', '**/*.hdr', '**/*.glsl'],
  build: {
    assetsInlineLimit: 1024,
  },
  server: {
    port: 7777,
  },
  plugins: [
    mdx({
      rehypePlugins: [[rehypeImgSize, { dir: 'public' }], rehypeSlug, rehypePrism],
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      providerImportSource: '@mdx-js/react',
    }),
    reactRouterCloudflareDevProxy(),
    reactRouter({
      routes(defineRoutes: DefineRoutes) {
        defineRoutes((route: DefineRoute) => {
          route('/', 'routes/home/route.tsx', { index: true });
        });
      },
    }),
    tsconfigPaths(),
  ],
});
