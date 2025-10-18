import { baseMeta } from '~/utils/meta';
import { getPosts, type ArticlePost } from './posts.server';

interface LoaderData {
  readonly posts: ArticlePost[];
  readonly featured: ArticlePost;
}

export async function loader(): Promise<Response> {
  const allPosts = await getPosts();
  const featured = allPosts.find(post => post.frontmatter.featured);

  if (!featured) {
    throw new Error('Unable to find featured article.');
  }

  const posts = allPosts.filter(post => featured.slug !== post.slug);

  const responseBody = { posts, featured } satisfies LoaderData;

  return Response.json(responseBody);
}

export function meta() {
  return baseMeta({
    title: 'Articles',
    description:
      'A collection of technical design and development articles. May contain incoherent ramblings.',
  });
}

export { Articles as default } from './articles';
