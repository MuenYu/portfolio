import config from '~/config.json';

type NavLink = {
  label: string;
  pathname: string;
};

type SocialLink = {
  label: string;
  url: string;
  icon: string;
};

export const navLinks: NavLink[] = [
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

const social = config.social;

const socialLinksData: Array<SocialLink | null> = [
  social.blog
    ? {
        label: 'Blog',
        url: social.blog,
        icon: 'home',
      }
    : null,
  social.github
    ? {
        label: 'Github',
        url: `https://github.com/${social.github}`,
        icon: 'github',
      }
    : null,
  social.telegram
    ? {
        label: 'Telegram',
        url: `https://t.me/${social.telegram}`,
        icon: 'telegram',
      }
    : null,
  social.linkedin
    ? {
        label: 'LinkedIn',
        url: `https://www.linkedin.com/in/${social.linkedin}/`,
        icon: 'linkedin',
      }
    : null,
  social.x
    ? {
        label: 'X',
        url: `https://x.com/${social.x}`,
        icon: 'x',
      }
    : null,
  social.leetcode
    ? {
        label: 'LeetCode',
        url: `https://leetcode.com/u/${social.leetcode}`,
        icon: 'leetcode',
      }
    : null,
  social.youtube
    ? {
        label: 'YouTube',
        url: `https://www.youtube.com/${social.youtube}`,
        icon: 'youtube',
      }
    : null,
  social.bluesky
    ? {
        label: 'Bluesky',
        url: `https://bsky.app/profile/${social.bluesky}`,
        icon: 'bluesky',
      }
    : null,
  social.figma
    ? {
        label: 'Figma',
        url: `https://www.figma.com/${social.figma}`,
        icon: 'figma',
      }
    : null,
];

export const socialLinks = socialLinksData.filter(
  (link): link is SocialLink => link !== null
);
