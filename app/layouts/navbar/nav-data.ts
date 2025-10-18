import config from '~/config.json';

const socialValue = (key: string) => config.social[key] ?? '';

export const navLinks = [
  {
    label: 'Projects',
    pathname: '/#project-1',
  },
  {
    label: 'About',
    pathname: '/#about',
  },
  {
    label: 'Biography',
    pathname: '/articles',
  },
  {
    label: 'Contact',
    pathname: '/contact',
  },
];

export const socialLinks = [
  {
    label: 'Blog',
    url: `${socialValue('blog')}`,
    icon: 'home',
  },
  {
    label: 'Github',
    url: `https://github.com/${socialValue('github')}`,
    icon: 'github',
  },
  {
    label: 'Telegram',
    url: `https://t.me/${socialValue('telegram')}`,
    icon: 'telegram',
  },
  {
    label: 'LinkedIn',
    url: `https://www.linkedin.com/in/${socialValue('linkedin')}/`,
    icon: 'linkedin',
  },
  {
    label: 'X',
    url: `https://x.com/${socialValue('x')}`,
    icon: 'x',
  },
  {
    label: 'LeetCode',
    url: `https://leetcode.com/u/${socialValue('leetcode')}`,
    icon: 'leetcode',
  },
  {
    label: 'YouTube',
    url: `https://www.youtube.com/${socialValue('youtube')}`,
    icon: 'youtube',
  },
  {
    label: 'Bluesky',
    url: `https://bsky.app/profile/${socialValue('bluesky')}`,
    icon: 'bluesky',
  },
  {
    label: 'Figma',
    url: `https://www.figma.com/${socialValue('figma')}`,
    icon: 'figma',
  },
].filter(x => {
  const flag = socialValue(x.label.toLowerCase());
  // Filter out social links that are not in config.json
  return flag !== undefined && flag.length > 0;
});
