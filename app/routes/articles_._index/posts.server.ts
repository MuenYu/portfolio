import type { ArticleSummary, ArticleModule } from '~/types/articles';
import { formatTimecode, readingTime } from '~/utils/timecode';

type ArticleTextModule = {
  default: string;
};

export async function getPosts(): Promise<ArticleSummary[]> {
  const modules = import.meta.glob<ArticleModule>('../articles.*.mdx', { eager: true });

  const posts = await Promise.all(
    Object.entries(modules).map(async ([file, post]) => {
      const slug = file.replace('../articles.', '').replace(/\.mdx$/, '');

      const text = (await import(`../articles.${slug}.mdx?raw`)) as ArticleTextModule;
      const readTime = readingTime(text.default);
      const timecode = formatTimecode(readTime);

      return {
        slug,
        timecode,
        frontmatter: post.frontmatter,
      } satisfies ArticleSummary;
    })
  );

  return sortBy(
    posts.filter(x => x.frontmatter?.category === 'biography'),
    post => post.frontmatter.date,
    'desc'
  );
}

type SortDirection = 'asc' | 'desc';
type SortValue = string | number | Date;

function sortBy<T>(arr: T[], key: (item: T) => SortValue, dir: SortDirection = 'asc'): T[] {
  return arr.sort((a, b) => {
    const res = compare(key(a), key(b));
    return dir === 'asc' ? res : -res;
  });
}

function compare(a: SortValue, b: SortValue): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
