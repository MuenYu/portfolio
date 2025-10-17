declare module '@mapbox/rehype-prism' {
  import type { Plugin } from 'unified';
  const rehypePrism: Plugin;
  export default rehypePrism;
}

declare module 'yargs' {
  const yargs: any;
  export default yargs;
  export type Argv<T = unknown> = any;
  export type CamelCaseKey<T> = any;
  export type PositionalOptions = any;
  export type Options = any;
  export type ArgumentsCamelCase<T> = any;
  export type InferredOptionTypes<T> = any;
  export type Alias = any;
}

declare module '@cloudflare/workers-shared' {
  export type RouterConfig = any;
  export type AssetConfig = any;
}

declare module '@cloudflare/containers-shared' {
  export type ContainerNormalizedConfig = any;
}

declare module 'devtools-protocol/types/protocol-mapping' {
  namespace ProtocolMapping {
    type Events = Record<string, unknown>;
  }
  export type ProtocolMapping = {
    Events: ProtocolMapping.Events;
  };
  const protocolMapping: ProtocolMapping;
  export default protocolMapping;
}

declare module 'three-stdlib' {
  const threeStdlib: any;
  export default threeStdlib;
}

declare module 'three-stdlib/*' {
  const threeStdlib: any;
  export default threeStdlib;
}

declare module 'three/examples/jsm/shaders/*' {
  const shader: any;
  export default shader;
}

declare module 'rollup' {
  export interface SourceDescription {
    code: string;
    map?: any;
  }
}

declare module '@cspotcode/source-map-support' {
  interface InstallOptions {
    environment?: 'node' | 'browser';
    hookRequire?: boolean;
    handleUncaughtExceptions?: boolean;
  }
  export function install(options?: InstallOptions): void;
  export function resetRetrieveHandlers(): void;
}

declare module 'cloudflare' {
  const Cloudflare: any;
  export default Cloudflare;
}

declare module '*build/server' {
  const build: unknown;
  export = build;
}
