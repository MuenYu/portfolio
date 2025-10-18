import { formatTimecode, readingTime } from '~/utils/timecode';

export interface ArticleFrontmatter {
  readonly title: string;
  readonly abstract: string;
  readonly date: string;
  readonly featured?: boolean;
  readonly banner?: string;
  readonly category?: string;
}

export interface ArticlePost {
  readonly slug: string;
  readonly timecode: string;
  readonly frontmatter: ArticleFrontmatter;
}

interface ArticleModule {
  readonly frontmatter: ArticleFrontmatter;
}

interface RawArticleModule {
  readonly default: string;
}

type SortDirection = 'asc' | 'desc';

export async function getPosts(): Promise<ArticlePost[]> {
  const modules = import.meta.glob<ArticleModule>('../articles.*.mdx', { eager: true });

  const posts = await Promise.all(
    Object.entries(modules).map(async ([file, post]) => {
      const slug = file.replace('../articles.', '').replace(/\.mdx$/, '');

      const textModule = (await import(`../articles.${slug}.mdx?raw`)) as RawArticleModule;
      const readTime = readingTime(textModule.default);
      const timecode = formatTimecode(readTime);

      return {
        slug,
        timecode,
        frontmatter: post.frontmatter,
      } satisfies ArticlePost;
    })
  );

  return sortBy(
    posts.filter(post => post.frontmatter.category === 'biography'),
    post => post.frontmatter.date,
    'desc'
  );
}

function sortBy<T, U extends string | number | Date>(
  arr: T[],
  key: (value: T) => U,
  dir: SortDirection = 'asc'
): T[] {
  return arr.sort((a, b) => {
    const res = compare(key(a), key(b));
    return dir === 'asc' ? res : -res;
  });
}

function compare(a: string | number | Date, b: string | number | Date): number {
  const aComparable = a instanceof Date ? a.getTime() : a;
  const bComparable = b instanceof Date ? b.getTime() : b;

  if (aComparable < bComparable) return -1;
  if (aComparable > bComparable) return 1;
  return 0;
}
