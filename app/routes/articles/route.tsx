import { Outlet, useLoaderData } from 'react-router';
import { MDXProvider } from '@mdx-js/react';
import { Post, postMarkdown } from '~/layouts/post';
import { baseMeta } from '~/utils/meta';
import { formatTimecode, readingTime } from '~/utils/timecode';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import type { ArticleLoaderData, ArticleModule } from '~/types/articles';

type ArticleTextModule = {
  default: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const slug = new URL(request.url).pathname.split('/').filter(Boolean).at(-1);

  if (!slug || slug === 'articles') {
    return null;
  }

  const modules = import.meta.glob<ArticleModule>('../articles.*.mdx');
  const moduleKey = `../articles.${slug}.mdx`;
  const moduleLoader = modules[moduleKey];

  if (!moduleLoader) {
    throw new Response('Not found', { status: 404 });
  }

  const module = await moduleLoader();
  const text = (await import(`../articles.${slug}.mdx?raw`)) as ArticleTextModule;
  const readTime = readingTime(text.default);
  // const ogImage = `${config.url}/static/${slug}-og.jpg`;

  const payload: ArticleLoaderData = {
    // ogImage,
    frontmatter: module.frontmatter,
    timecode: formatTimecode(readTime),
  };

  return Response.json(payload);
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const { title, abstract } = data.frontmatter;
  // return baseMeta({ title, description: abstract, prefix: '', ogImage: data.ogImage });
  return baseMeta({ title, description: abstract, prefix: '' });
};

export default function Articles() {
  const data = useLoaderData<ArticleLoaderData | null>();

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
