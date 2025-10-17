import type { ThemeContextValue } from '~/components/theme-provider/theme-provider';
import type { ArticleListData } from './articles';

export type ThemePreference = ThemeContextValue['theme'];

export const themePreferences = ['dark', 'light'] as const satisfies readonly ThemePreference[];

export const isThemePreference = (value: unknown): value is ThemePreference =>
  typeof value === 'string' && themePreferences.includes(value as ThemePreference);

export interface RootLoaderData {
  canonicalUrl: string;
  theme: ThemePreference;
}

export interface CloudflareEnv {
  SESSION_SECRET?: string;
}

export interface CloudflareContext<Env extends CloudflareEnv = CloudflareEnv> {
  cloudflare: {
    env: Env;
  };
}

export interface ContactEnv extends CloudflareEnv {
  ACCESSTOKEN: string;
  SERVICE_ID: string;
  TEMPLATE_ID: string;
  USER_ID: string;
}

export interface ContactActionErrors {
  email?: string;
  message?: string;
}

export interface ContactActionData {
  errors?: ContactActionErrors;
  success?: boolean;
}

export interface SetThemeActionData {
  status: 'success';
}

export type ArticlesIndexLoaderData = ArticleListData;
