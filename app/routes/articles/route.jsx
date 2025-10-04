import { Outlet, useLoaderData } from 'react-router';
import { MDXProvider } from '@mdx-js/react';
import { Post, postMarkdown } from '~/layouts/post';
import { baseMeta } from '~/utils/meta';
import { formatTimecode, readingTime } from '~/utils/timecode';

export async function loader({ request }) {
  const slug = new URL(request.url).pathname
    .split('/')
    .filter(Boolean)
    .at(-1);

  if (!slug || slug === 'articles') {
    return null;
  }

  const modules = import.meta.glob('../articles.*.mdx');
  const moduleKey = `../articles.${slug}.mdx`;

  if (!modules[moduleKey]) {
    throw new Response('Not found', { status: 404 });
  }

  const module = await modules[moduleKey]();
  const text = await import(`../articles.${slug}.mdx?raw`);
  const readTime = readingTime(text.default);
  // const ogImage = `${config.url}/static/${slug}-og.jpg`;

  return Response.json({
    // ogImage,
    frontmatter: module.frontmatter,
    timecode: formatTimecode(readTime),
  });
}

export function meta({ data }) {
  if (!data) return [];

  const { title, abstract } = data.frontmatter;
  // return baseMeta({ title, description: abstract, prefix: '', ogImage: data.ogImage });
  return baseMeta({ title, description: abstract, prefix: '' });
}

export default function Articles() {
  const data = useLoaderData();

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
