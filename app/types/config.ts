export type ProjectButton = {
  text: string;
  link: string;
};

export type ProjectModel = {
  srcSet: string;
  placeholder: string;
};

export type Project = {
  title: string;
  description: string;
  buttons: ProjectButton[];
  models: ProjectModel[];
};

export type ProfileImage = {
  placeholder: string;
  normal: string;
  large: string;
};

export type ProfileContent = {
  greeting: string;
  paragraphs: string[];
  img: ProfileImage;
};

export type SocialLinks = {
  blog?: string;
  github?: string;
  telegram?: string;
  linkedin?: string;
  x?: string;
  leetcode?: string;
  youtube?: string;
  bluesky?: string;
  figma?: string;
};

export type Config = {
  name: string;
  role: string;
  disciplines: string[];
  url: string;
  social: SocialLinks;
  projects: Project[];
  profile: ProfileContent;
  ascii: string;
  twitter?: string;
};
