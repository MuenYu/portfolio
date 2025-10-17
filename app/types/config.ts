export interface SiteConfigSocial {
  bluesky: string;
  figma: string;
  github: string;
  telegram: string;
  blog: string;
  x: string;
  linkedin: string;
  leetcode: string;
  youtube: string;
  twitter?: string;
}

export interface SiteConfigProjectButton {
  text: string;
  link: string;
}

export interface SiteConfigProjectModel {
  srcSet: string;
  placeholder: string;
}

export interface SiteConfigProject {
  title: string;
  description: string;
  buttons: SiteConfigProjectButton[];
  models: SiteConfigProjectModel[];
}

export interface SiteConfigProfileImage {
  placeholder: string;
  normal: string;
  large: string;
}

export interface SiteConfigProfile {
  greeting: string;
  paragraphs: string[];
  img: SiteConfigProfileImage;
}

export interface SiteConfig {
  name: string;
  role: string;
  disciplines: string[];
  url: string;
  social: SiteConfigSocial;
  projects: SiteConfigProject[];
  profile: SiteConfigProfile;
  ascii: string;
}
