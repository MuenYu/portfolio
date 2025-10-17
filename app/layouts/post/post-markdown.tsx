import { Children, isValidElement, type ComponentPropsWithoutRef, type ReactElement } from 'react';
import { Link as RouterLink } from 'react-router';
import { Code } from '~/components/code';
import { Heading } from '~/components/heading';
import { Icon } from '~/components/icon';
import { Link } from '~/components/link';
import { List, ListItem } from '~/components/list';
import { Text } from '~/components/text';
import styles from './post-markdown.module.css';
import type { MDXComponents } from 'mdx/types';

type PostHeadingLinkProps = {
  id: string;
};

const PostHeadingLink = ({ id }: PostHeadingLinkProps) => {
  return (
    <RouterLink className={styles.headingLink} to={`#${id}`} aria-label="Link to heading">
      <Icon icon="link" />
    </RouterLink>
  );
};

type PostHeadingProps = ComponentPropsWithoutRef<typeof Heading> & {
  id?: string;
};

const PostH1 = ({ children, id, ...rest }: PostHeadingProps) => (
  <Heading className={styles.heading} id={id} level={2} as="h1" {...rest}>
    <PostHeadingLink id={id} />
    {children}
  </Heading>
);

const PostH2 = ({ children, id, ...rest }: PostHeadingProps) => (
  <Heading className={styles.heading} id={id} level={3} as="h2" {...rest}>
    <PostHeadingLink id={id} />
    {children}
  </Heading>
);

const PostH3 = ({ children, id, ...rest }: PostHeadingProps) => (
  <Heading className={styles.heading} id={id} level={4} as="h3" {...rest}>
    <PostHeadingLink id={id} />
    {children}
  </Heading>
);

const PostH4 = ({ children, id, ...rest }: PostHeadingProps) => (
  <Heading className={styles.heading} id={id} level={5} as="h4" {...rest}>
    <PostHeadingLink id={id} />
    {children}
  </Heading>
);

type PostParagraphProps = ComponentPropsWithoutRef<typeof Text>;

const PostParagraph = ({ children, ...rest }: PostParagraphProps): ReactElement => {
  const hasSingleChild = Children.count(children) === 1;
  const firstChild = Children.toArray(children)[0];

  // Prevent `img` being wrapped in `p`
  if (hasSingleChild && isValidElement(firstChild) && firstChild.type === PostImage) {
    return firstChild;
  }

  return (
    <Text className={styles.paragraph} size="l" as="p" {...rest}>
      {children}
    </Text>
  );
};

type PostLinkProps = ComponentPropsWithoutRef<typeof Link>;

const PostLink = ({ ...props }: PostLinkProps) => <Link {...props} />;

type PostListProps = ComponentPropsWithoutRef<typeof List>;

const PostUl = ({ children, ...rest }: PostListProps) => {
  return (
    <List className={styles.list} {...rest}>
      {children}
    </List>
  );
};

const PostOl = ({ children, ...rest }: PostListProps) => {
  return (
    <List className={styles.list} ordered {...rest}>
      {children}
    </List>
  );
};

type PostListItemProps = ComponentPropsWithoutRef<typeof ListItem>;

const PostLi = ({ children, ...props }: PostListItemProps) => {
  return <ListItem {...props}>{children}</ListItem>;
};

type PostCodeProps = ComponentPropsWithoutRef<'code'>;

const PostCode = ({ children, ...rest }: PostCodeProps) => (
  <code className={styles.code} {...rest}>
    {children}
  </code>
);

type PostPreProps = ComponentPropsWithoutRef<typeof Code>;

const PostPre = (props: PostPreProps) => {
  return (
    <div className={styles.pre}>
      <Code {...props} />
    </div>
  );
};

type PostBlockquoteProps = ComponentPropsWithoutRef<'blockquote'>;

const PostBlockquote = (props: PostBlockquoteProps) => {
  return <blockquote className={styles.blockquote} {...props} />;
};

type PostHrProps = ComponentPropsWithoutRef<'hr'>;

const PostHr = (props: PostHrProps) => {
  return <hr className={styles.hr} {...props} />;
};

type PostStrongProps = ComponentPropsWithoutRef<'strong'>;

const PostStrong = (props: PostStrongProps) => {
  return <strong className={styles.strong} {...props} />;
};

type PostImageProps = ComponentPropsWithoutRef<'img'>;

const PostImage = ({ src, alt, width, height, ...rest }: PostImageProps) => {
  return (
    <img
      className={styles.image}
      src={src}
      loading="lazy"
      alt={alt}
      width={width}
      height={height}
      {...rest}
    />
  );
};

type EmbedProps = {
  src: string;
};

const Embed = ({ src }: EmbedProps) => {
  return (
    <div className={styles.embed}>
      <iframe src={src} loading="lazy" title="Embed" />
    </div>
  );
};

export const postMarkdown: MDXComponents = {
  h1: PostH1,
  h2: PostH2,
  h3: PostH3,
  h4: PostH4,
  p: PostParagraph,
  a: PostLink,
  ul: PostUl,
  ol: PostOl,
  li: PostLi,
  pre: PostPre,
  code: PostCode,
  blockquote: PostBlockquote,
  hr: PostHr,
  img: PostImage,
  strong: PostStrong,
  Embed,
};
