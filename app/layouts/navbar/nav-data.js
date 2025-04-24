import config from '~/config.json';

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
    url: `${config.social.blog}`,
    icon: 'home',
  },
  {
    label: 'Github',
    url: `https://github.com/${config.social.github}`,
    icon: 'github',
  },
  {
    label: 'Telegram',
    url: `https://t.me/${config.social.telegram}`,
    icon: 'telegram',
  },
  {
    label: 'LinkedIn',
    url: `https://www.linkedin.com/in/${config.social.linkedin}/`,
    icon: 'linkedin',
  },
  {
    label: 'X',
    url: `https://x.com/${config.social.x}`,
    icon: 'x',
  },
  {
    label: 'LeetCode',
    url: `https://leetcode.com/u/${config.social.leetcode}`,
    icon: 'leetcode',
  },
  {
    label: 'YouTube',
    url: `https://www.youtube.com/${config.social.youtube}`,
    icon: 'youtube',
  },
  {
    label: 'Bluesky',
    url: `https://bsky.app/profile/${config.social.bluesky}`,
    icon: 'bluesky',
  },
  {
    label: 'Figma',
    url: `https://www.figma.com/${config.social.figma}`,
    icon: 'figma',
  },
].filter(x=> {
  const flag = config.social[x.label.toLowerCase()];
  // Filter out social links that are not in config.json
  return flag !== undefined && flag.length > 0;
});
