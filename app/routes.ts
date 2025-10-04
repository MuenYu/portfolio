import { relative } from '@react-router/dev/routes';

const { route, index } = relative('app/routes');

export default [
  index('home/route.ts'),
  route('contact', 'contact/route.ts'),
  route('api/set-theme', 'api.set-theme.ts'),
  route('articles', 'articles/route.tsx', [
    index('articles_._index/route.tsx'),
    route('luxuryescapes', 'articles.luxuryescapes.mdx'),
    route('profile', 'articles.profile.mdx'),
    route('sagi', 'articles.sagi.mdx'),
    route('vincents', 'articles.vincents.mdx'),
  ]),
  route('*', '$.tsx'),
];
