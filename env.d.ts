/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module '*.css?url' {
  const href: string;
  export default href;
}

declare module '*.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types';
  const MDXComponent: (props: MDXProps) => JSX.Element;
  export default MDXComponent;
  export const frontmatter: Record<string, unknown>;
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

interface ConfigProjectButton {
  readonly text: string;
  readonly link: string;
}

interface ConfigProjectModel {
  readonly srcSet: string;
  readonly placeholder?: string;
}

interface ConfigProject {
  readonly title: string;
  readonly description: string;
  readonly buttons: readonly ConfigProjectButton[];
  readonly models: readonly ConfigProjectModel[];
}

interface ConfigProfileImage {
  readonly placeholder: string;
  readonly normal: string;
  readonly large: string;
}

interface ConfigProfile {
  readonly greeting: string;
  readonly paragraphs: readonly string[];
  readonly img: ConfigProfileImage;
}

interface SiteConfig {
  readonly name: string;
  readonly role: string;
  readonly disciplines: readonly string[];
  readonly url: string;
  readonly social: Readonly<Record<string, string>>;
  readonly projects: readonly ConfigProject[];
  readonly profile: ConfigProfile;
  readonly ascii: string;
}

declare module '~/config.json' {
  const value: SiteConfig;
  export default value;
}
