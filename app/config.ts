import configJson from './config.json';
import type { SiteConfig } from './types/config';

const config: SiteConfig = configJson satisfies SiteConfig;

export default config;
