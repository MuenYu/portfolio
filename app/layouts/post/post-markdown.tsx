import {
  Children,
  isValidElement,
  type ComponentPropsWithoutRef,
  type DetailedHTMLProps,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { Link as RouterLink } from 'react-router';
import { classes } from '~/utils/style';
import { Code } from '~/components/code';
import { Heading } from '~/components/heading';
import { Icon } from '~/components/icon';
import { Link } from '~/components/link';
import { List, ListItem } from '~/components/list';
import { Text } from '~/components/text';
import styles from './post-markdown.module.css';

interface PostHeadingLinkProps {
  id?: string;
}

const PostHeadingLink = ({ id }: PostHeadingLinkProps): JSX.Element | null => {
  if (!id) {
    return null;
  }

  return (
    <RouterLink
      className={styles['headingLink']}
      to={`#${id}`}
      aria-label="Link to heading"
    >
      <Icon icon="link" />
    </RouterLink>
  );
};

type PostHeadingProps = Omit<ComponentPropsWithoutRef<typeof Heading>, 'level' | 'as'>;

const PostH1 = ({ children, id, className, ...rest }: PostHeadingProps): JSX.Element => (
  <Heading
    className={classes(styles['heading'], className ?? null)}
    id={id}
    level={2}
    as="h1"
    {...rest}
  >
    {id ? <PostHeadingLink id={id} /> : null}
    {children}
  </Heading>
);

const PostH2 = ({ children, id, className, ...rest }: PostHeadingProps): JSX.Element => (
  <Heading
    className={classes(styles['heading'], className ?? null)}
    id={id}
    level={3}
    as="h2"
    {...rest}
  >
    {id ? <PostHeadingLink id={id} /> : null}
    {children}
  </Heading>
);

const PostH3 = ({ children, id, className, ...rest }: PostHeadingProps): JSX.Element => (
  <Heading
    className={classes(styles['heading'], className ?? null)}
    id={id}
    level={4}
    as="h3"
    {...rest}
  >
    {id ? <PostHeadingLink id={id} /> : null}
    {children}
  </Heading>
);

const PostH4 = ({ children, id, className, ...rest }: PostHeadingProps): JSX.Element => (
  <Heading
    className={classes(styles['heading'], className ?? null)}
    id={id}
    level={5}
    as="h4"
    {...rest}
  >
    {id ? <PostHeadingLink id={id} /> : null}
    {children}
  </Heading>
);

type ParagraphProps = PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>;

const PostParagraph = ({ children, className, ...rest }: ParagraphProps): ReactNode => {
  const hasSingleChild = Children.count(children) === 1;
  const firstChild = Children.toArray(children)[0] ?? null;

  // Prevent `img` being wrapped in `p`
  if (hasSingleChild && isValidElement(firstChild) && firstChild.type === PostImage) {
    return firstChild;
  }

  return (
    <Text className={classes(styles['paragraph'], className)} size="l" as="p" {...rest}>
      {children}
    </Text>
  );
};

type PostLinkProps = ComponentPropsWithoutRef<typeof Link>;

const PostLink = (props: PostLinkProps): JSX.Element => <Link {...props} />;

type UnorderedListProps = PropsWithChildren<HTMLAttributes<HTMLUListElement>>;

const PostUl = ({ className, ...props }: UnorderedListProps): JSX.Element => {
  return <List className={classes(styles['list'], className)} {...props} />;
};

type OrderedListProps = PropsWithChildren<HTMLAttributes<HTMLOListElement>>;

const PostOl = ({ className, ...props }: OrderedListProps): JSX.Element => {
  return <List className={classes(styles['list'], className)} ordered {...props} />;
};

type ListItemProps = PropsWithChildren<HTMLAttributes<HTMLLIElement>>;

const PostLi = ({ children, ...props }: ListItemProps): JSX.Element => {
  return <ListItem {...props}>{children}</ListItem>;
};

type CodeProps = ComponentPropsWithoutRef<'code'>;

const PostCode = ({ children, ...rest }: CodeProps): JSX.Element => (
  <code className={styles['code']} {...rest}>
    {children}
  </code>
);

type PreProps = DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;

const PostPre = (props: PreProps): JSX.Element => {
  return (
    <div className={styles['pre']}>
      <Code {...props} />
    </div>
  );
};

type BlockquoteProps = DetailedHTMLProps<
  HTMLAttributes<HTMLQuoteElement>,
  HTMLQuoteElement
>;

const PostBlockquote = (props: BlockquoteProps): JSX.Element => {
  return <blockquote className={styles['blockquote']} {...props} />;
};

type HrProps = DetailedHTMLProps<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;

const PostHr = (props: HrProps): JSX.Element => {
  return <hr className={styles['hr']} {...props} />;
};

type StrongProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

const PostStrong = (props: StrongProps): JSX.Element => {
  return <strong className={styles['strong']} {...props} />;
};

type ImageProps = ImgHTMLAttributes<HTMLImageElement>;

const PostImage = ({ src, alt, width, height, ...rest }: ImageProps): JSX.Element => {
  return (
    <img
      className={styles['image']}
      src={src}
      loading="lazy"
      alt={alt}
      width={width}
      height={height}
      {...rest}
    />
  );
};

interface EmbedProps {
  src: string;
}

const Embed = ({ src }: EmbedProps): JSX.Element => {
  return (
    <div className={styles['embed']}>
      <iframe src={src} loading="lazy" title="Embed" />
    </div>
  );
};

export const postMarkdown = {
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
