import { relative } from '@react-router/dev/routes';

const { route, index } = relative('app/routes');

export default [
  index('home/route.js'),
  route('contact', 'contact/route.js'),
  route('api/set-theme', 'api.set-theme.js'),
  route('articles', 'articles/route.jsx', [
    index('articles_._index/route.jsx'),
    route('luxuryescapes', 'articles.luxuryescapes.mdx'),
    route('profile', 'articles.profile.mdx'),
    route('sagi', 'articles.sagi.mdx'),
    route('vincents', 'articles.vincents.mdx'),
  ]),
  route('*', '$.jsx'),
];
