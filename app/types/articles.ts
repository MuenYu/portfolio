import type { ComponentType } from 'react';

export type ArticleCategory = 'biography' | (string & {});

export interface ArticleFrontmatter {
  title: string;
  abstract: string;
  date: string;
  banner?: string;
  featured?: boolean;
  category?: ArticleCategory;
}

export interface ArticleSummary {
  slug: string;
  frontmatter: ArticleFrontmatter;
  timecode: string;
}

export interface ArticleListData {
  posts: ArticleSummary[];
  featured: ArticleSummary;
}

export interface ArticleLoaderData {
  frontmatter: ArticleFrontmatter;
  timecode: string;
}

export interface ArticleModule {
  default: ComponentType;
  frontmatter: ArticleFrontmatter;
}
