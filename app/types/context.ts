import type { AppLoadContext } from 'react-router';

export interface PortfolioEnv {
  readonly SESSION_SECRET: string;
  readonly SERVICE_ID: string;
  readonly TEMPLATE_ID: string;
  readonly USER_ID: string;
  readonly ACCESSTOKEN: string;
}

export interface PortfolioContext extends AppLoadContext {
  readonly cloudflare: {
    readonly env: PortfolioEnv;
  };
}
