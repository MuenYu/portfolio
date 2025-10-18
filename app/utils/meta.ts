import type { MetaDescriptor } from 'react-router';
import config from '~/config.json';

const { name, url, twitter } = config;
const defaultOgImage = `${url}/preview.png`;

interface BaseMetaArgs {
  title?: string;
  description?: string;
  prefix?: string;
  ogImage?: string;
}

export function baseMeta({
  title,
  description,
  prefix = name,
  ogImage = defaultOgImage,
}: BaseMetaArgs): MetaDescriptor[] {
  const titleText = [prefix, title].filter(Boolean).join(' | ');
  const descriptionText = description ?? '';

  return [
    { title: titleText },
    { name: 'description', content: descriptionText },
    { name: 'author', content: name },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:alt', content: 'Banner for the site' },
    { property: 'og:image:width', content: '1280' },
    { property: 'og:image:height', content: '800' },
    { property: 'og:title', content: titleText },
    { property: 'og:site_name', content: name },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: url },
    { property: 'og:description', content: descriptionText },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:description', content: descriptionText },
    { property: 'twitter:title', content: titleText },
    { property: 'twitter:site', content: url },
    { property: 'twitter:creator', content: twitter },
    { property: 'twitter:image', content: ogImage },
  ];
}
