import { baseMeta } from '~/utils/meta';
import { getPosts } from './posts.server';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import type { ArticlesIndexLoaderData } from '~/types/routes';

export async function loader({}: LoaderFunctionArgs) {
  const allPosts = await getPosts();
  const featured = allPosts.filter(post => post.frontmatter.featured)[0];
  const posts = allPosts.filter(post => featured?.slug !== post.slug);

  const payload: ArticlesIndexLoaderData = { posts, featured };

  return Response.json(payload);
}

export const meta: MetaFunction = () => {
  return baseMeta({
    title: 'Articles',
    description:
      'A collection of technical design and development articles. May contain incoherent ramblings.',
  });
};

export { Articles as default } from './articles';
