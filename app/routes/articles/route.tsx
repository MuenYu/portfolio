import { Outlet, useLoaderData } from 'react-router';
import { MDXProvider } from '@mdx-js/react';
import { Post, postMarkdown } from '~/layouts/post';
import { baseMeta } from '~/utils/meta';
import { formatTimecode, readingTime } from '~/utils/timecode';
import type { ArticleFrontmatter } from '../articles_._index/posts.server';

interface LoaderArgs {
  readonly request: Request;
}

interface ArticleModule {
  readonly frontmatter: ArticleFrontmatter;
}

interface LoaderData {
  readonly frontmatter: ArticleFrontmatter;
  readonly timecode: string;
}

interface RawArticleModule {
  readonly default: string;
}

export async function loader({ request }: LoaderArgs): Promise<Response | null> {
  const slug = new URL(request.url).pathname.split('/').filter(Boolean).at(-1);

  if (!slug || slug === 'articles') {
    return null;
  }

  const modules = import.meta.glob<ArticleModule>('../articles.*.mdx');
  const moduleKey = `../articles.${slug}.mdx`;
  const moduleResolver = modules[moduleKey];

  if (!moduleResolver) {
    return new Response('Not found', { status: 404 });
  }

  const module = await moduleResolver();
  const textModule = (await import(`../articles.${slug}.mdx?raw`)) as RawArticleModule;
  const readTime = readingTime(textModule.default);
  // const ogImage = `${config.url}/static/${slug}-og.jpg`;

  const data = {
    // ogImage,
    frontmatter: module.frontmatter,
    timecode: formatTimecode(readTime),
  } satisfies LoaderData;

  return Response.json(data);
}

export function meta({ data }: { data: LoaderData | null }) {
  if (!data) return [];

  const { title, abstract } = data.frontmatter;
  // return baseMeta({ title, description: abstract, prefix: '', ogImage: data.ogImage });
  return baseMeta({ title, description: abstract, prefix: '' });
}

export default function Articles() {
  const data = useLoaderData<LoaderData | null>();

  if (!data) {
    return <Outlet />;
  }

  const { frontmatter, timecode } = data;

  return (
    <MDXProvider components={postMarkdown}>
      <Post {...frontmatter} timecode={timecode}>
        <Outlet />
      </Post>
    </MDXProvider>
  );
}
