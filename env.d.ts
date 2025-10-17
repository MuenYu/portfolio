/// <reference types="vite/client" />

import type { ArticleFrontmatter } from './app/types/articles';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css?url' {
  const href: string;
  export default href;
}

declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types';
  const MDXComponent: (props: MDXProps) => JSX.Element;
  export default MDXComponent;
  export const frontmatter: ArticleFrontmatter;
}

declare module '*.glb' {
  const src: string;
  export default src;
}

declare module '*.hdr' {
  const src: string;
  export default src;
}

declare module '*.glsl' {
  const src: string;
  export default src;
}

declare module '*.woff2' {
  const src: string;
  export default src;
}

declare module '*.svg?url' {
  const href: string;
  export default href;
}

declare module '*.png?url' {
  const href: string;
  export default href;
}
