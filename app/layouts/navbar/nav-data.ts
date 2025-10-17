import config from '~/config';
import type { SiteConfigSocial } from '~/types/config';

export type NavLink = {
  label: string;
  pathname: string;
};

type SocialLinkIcon =
  | 'home'
  | 'github'
  | 'telegram'
  | 'linkedin'
  | 'x'
  | 'leetcode'
  | 'youtube'
  | 'bluesky'
  | 'figma';

export type SocialLink = {
  label: string;
  url: string;
  icon: SocialLinkIcon;
};

type SocialLinkDescriptor = {
  label: string;
  icon: SocialLinkIcon;
  key: keyof SiteConfigSocial;
  resolveUrl: (value: string) => string;
};

const SOCIAL_LINK_DESCRIPTORS: ReadonlyArray<SocialLinkDescriptor> = [
  {
    label: 'Blog',
    icon: 'home',
    key: 'blog',
    resolveUrl: value => value,
  },
  {
    label: 'Github',
    icon: 'github',
    key: 'github',
    resolveUrl: value => `https://github.com/${value}`,
  },
  {
    label: 'Telegram',
    icon: 'telegram',
    key: 'telegram',
    resolveUrl: value => `https://t.me/${value}`,
  },
  {
    label: 'LinkedIn',
    icon: 'linkedin',
    key: 'linkedin',
    resolveUrl: value => `https://www.linkedin.com/in/${value}/`,
  },
  {
    label: 'X',
    icon: 'x',
    key: 'x',
    resolveUrl: value => `https://x.com/${value}`,
  },
  {
    label: 'LeetCode',
    icon: 'leetcode',
    key: 'leetcode',
    resolveUrl: value => `https://leetcode.com/u/${value}`,
  },
  {
    label: 'YouTube',
    icon: 'youtube',
    key: 'youtube',
    resolveUrl: value => `https://www.youtube.com/${value}`,
  },
  {
    label: 'Bluesky',
    icon: 'bluesky',
    key: 'bluesky',
    resolveUrl: value => `https://bsky.app/profile/${value}`,
  },
  {
    label: 'Figma',
    icon: 'figma',
    key: 'figma',
    resolveUrl: value => `https://www.figma.com/${value}`,
  },
];

export const navLinks: ReadonlyArray<NavLink> = [
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

export const socialLinks: ReadonlyArray<SocialLink> = SOCIAL_LINK_DESCRIPTORS.flatMap(
  ({ key, label, resolveUrl, icon }) => {
    const value = config.social[key];

    if (!value) {
      return [];
    }

    return [
      {
        label,
        url: resolveUrl(value),
        icon,
      },
    ];
  }
);
