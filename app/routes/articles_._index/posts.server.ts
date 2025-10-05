import { formatTimecode, readingTime } from '~/utils/timecode';

export async function getPosts() {
  const modules = import.meta.glob('../articles.*.mdx', { eager: true });

  const posts = await Promise.all(
    Object.entries(modules).map(async ([file, post]) => {
      const slug = file.replace('../articles.', '').replace(/\.mdx$/, '');

      const text = await import(`../articles.${slug}.mdx?raw`);
      const readTime = readingTime(text.default);
      const timecode = formatTimecode(readTime);

      return {
        slug,
        timecode,
        frontmatter: post.frontmatter,
      };
    })
  );

  return sortBy(
    posts.filter(x => x.frontmatter?.category === 'biography'),
    post => post.frontmatter.date,
    'desc'
  );
}

function sortBy(arr, key, dir = 'asc') {
  return arr.sort((a, b) => {
    const res = compare(key(a), key(b));
    return dir === 'asc' ? res : -res;
  });
}

function compare(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
