import { Button } from '~/components/button';
import { Heading } from '~/components/heading';
import { Image } from '~/components/image';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { tokens } from '~/components/theme-provider/theme';
import { Transition } from '~/components/transition';
import { useParallax } from '~/hooks';
import {
  forwardRef,
  useRef,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { classes, cssProps, msToNum, numToMs } from '~/utils/style';
import styles from './project.module.css';

const initDelay = 300;

interface ProjectHeaderProps {
  className?: string;
  description: ReactNode;
  linkLabel?: string;
  roles?: string[];
  title: ReactNode;
  url?: string;
}

export function ProjectHeader({
  title,
  description,
  linkLabel = 'Visit website',
  url,
  roles,
  className,
}: ProjectHeaderProps): JSX.Element {
  return (
    <Section className={classes(styles.header, className)} as="section">
      <div
        className={styles.headerContent}
        style={cssProps({ initDelay: numToMs(initDelay) })}
      >
        <div className={styles.details}>
          <Heading className={styles.title} level={2} as="h1">
            {title}
          </Heading>
          <Text className={styles.description} size="xl" as="p">
            {description}
          </Text>
          {!!url && (
            <Button
              secondary
              iconHoverShift
              className={styles.linkButton}
              icon="chevron-right"
              href={url}
            >
              {linkLabel}
            </Button>
          )}
        </div>
        {!!roles?.length && (
          <ul className={styles.meta}>
            {roles?.map((role, index) => (
              <li
                className={styles.metaItem}
                style={cssProps({ delay: numToMs(initDelay + 300 + index * 140) })}
                key={role}
              >
                <Text secondary>{role}</Text>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}

type ProjectContainerProps = ComponentPropsWithoutRef<'article'>;

export const ProjectContainer = ({
  className,
  ...rest
}: ProjectContainerProps): JSX.Element => (
  <article className={classes(styles.project, className)} {...rest} />
);

type ProjectSectionProps = {
  backgroundElement?: ReactNode;
  backgroundOverlayOpacity?: number;
  fullHeight?: boolean;
  light?: boolean;
  padding?: string;
} & ComponentPropsWithoutRef<'section'>;

export const ProjectSection = forwardRef<HTMLElement, ProjectSectionProps>(
  (
    {
      className,
      light,
      padding = 'both',
      fullHeight,
      backgroundOverlayOpacity = 0.9,
      backgroundElement,
      children,
      ...rest
    },
    ref
  ) => (
    <section
      className={classes(styles.section, className)}
      data-light={light}
      data-full-height={fullHeight}
      ref={ref}
      {...rest}
    >
      {!!backgroundElement && (
        <div
          className={styles.sectionBackground}
          style={cssProps({ opacity: backgroundOverlayOpacity })}
        >
          {backgroundElement}
        </div>
      )}
      <Section className={styles.sectionInner} data-padding={padding}>
        {children}
      </Section>
    </section>
  )
);

ProjectSection.displayName = 'ProjectSection';

type ImageComponentProps = ComponentPropsWithoutRef<typeof Image>;

type ProjectBackgroundProps = {
  className?: string;
  opacity?: number;
} & Omit<ImageComponentProps, 'className'>;

export const ProjectBackground = ({
  opacity = 0.7,
  className,
  ...rest
}: ProjectBackgroundProps) => {
  const imageRef = useRef<HTMLDivElement | null>(null);

  useParallax(0.6, value => {
    const currentImage = imageRef.current;
    if (!currentImage) return;
    currentImage.style.setProperty('--offset', `${value}px`);
  });

  return (
    <Transition in timeout={msToNum(tokens.base.durationM)}>
      {({ visible, nodeRef }) => (
        <div
          className={classes(styles.backgroundImage, className)}
          data-visible={visible}
          ref={nodeRef}
        >
          <div className={styles.backgroundImageElement} ref={imageRef}>
            <Image cover alt="" role="presentation" {...rest} />
          </div>
          <div className={styles.backgroundScrim} style={cssProps({ opacity })} />
        </div>
      )}
    </Transition>
  );
};

type ProjectImageProps = {
  className?: string;
  alt: string;
} & Omit<ImageComponentProps, 'className' | 'alt'>;

export const ProjectImage = ({
  className,
  alt,
  ...rest
}: ProjectImageProps): JSX.Element => (
  <div className={classes(styles.image, className)}>
    <Image reveal alt={alt} delay={300} {...rest} />
  </div>
);

type ProjectSectionContentProps = {
  className?: string;
  width?: string;
} & HTMLAttributes<HTMLDivElement>;

export const ProjectSectionContent = ({
  className,
  width = 'l',
  ...rest
}: ProjectSectionContentProps): JSX.Element => (
  <div
    className={classes(styles.sectionContent, className)}
    data-width={width}
    {...rest}
  />
);

type ProjectSectionHeadingProps = Omit<
  ComponentPropsWithoutRef<typeof Heading>,
  'className'
> & {
  className?: string;
};

export const ProjectSectionHeading = ({
  className,
  level = 3,
  as = 'h2',
  ...rest
}: ProjectSectionHeadingProps): JSX.Element => (
  <Heading
    className={classes(styles.sectionHeading, className)}
    as={as}
    level={level}
    align="auto"
    {...rest}
  />
);

type ProjectSectionTextProps = Omit<
  ComponentPropsWithoutRef<typeof Text>,
  'className'
> & {
  className?: string;
};

export const ProjectSectionText = ({
  className,
  ...rest
}: ProjectSectionTextProps): JSX.Element => (
  <Text className={classes(styles.sectionText, className)} size="l" as="p" {...rest} />
);

type ProjectTextRowProps = {
  center?: boolean;
  centerMobile?: boolean;
  className?: string;
  justify?: string;
  noMargin?: boolean;
  stretch?: boolean;
  width?: string;
} & HTMLAttributes<HTMLDivElement>;

export const ProjectTextRow = ({
  center,
  stretch,
  justify = 'center',
  width = 'm',
  noMargin,
  className,
  centerMobile,
  ...rest
}: ProjectTextRowProps): JSX.Element => (
  <div
    className={classes(styles.textRow, className)}
    data-center={center}
    data-stretch={stretch}
    data-center-mobile={centerMobile}
    data-no-margin={noMargin}
    data-width={width}
    data-justify={justify}
    {...rest}
  />
);

type ProjectSectionColumnsProps = ProjectSectionContentProps & { centered?: boolean };

export const ProjectSectionColumns = ({
  className,
  centered,
  ...rest
}: ProjectSectionColumnsProps): JSX.Element => (
  <ProjectSectionContent
    className={classes(styles.sectionColumns, className)}
    data-centered={centered}
    {...rest}
  />
);
