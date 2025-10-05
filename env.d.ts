/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css?url' {
  const href: string;
  export default href;
}

declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types';
  const MDXComponent: (props: MDXProps) => JSX.Element;
  export default MDXComponent;
  export const frontmatter: Record<string, unknown>;
}

declare module '*.glb' {
  const glbSrc: string;
  export default glbSrc;
}

declare module '*.hdr' {
  const hdrSrc: string;
  export default hdrSrc;
}

declare module '*.glsl' {
  const glslSrc: string;
  export default glslSrc;
}

declare module '*.woff2' {
  const fontSrc: string;
  export default fontSrc;
}

declare module '*.svg?url' {
  const svgHref: string;
  export default svgHref;
}

declare module '*.png?url' {
  const pngHref: string;
  export default pngHref;
}
