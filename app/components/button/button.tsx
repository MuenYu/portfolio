import type {
  ComponentPropsWithRef,
  ElementType,
  MutableRefObject,
  ReactElement,
  ReactNode,
} from 'react';
import { forwardRef } from 'react';
import { Link } from 'react-router';
import { Icon } from '~/components/icon';
import { Loader } from '~/components/loader';
import { Transition } from '~/components/transition';
import type { PolymorphicProps, PolymorphicRef } from '~/types/polymorphic';
import { classes } from '~/utils/style';
import styles from './button.module.css';

type ButtonOwnProps = {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  icon?: string;
  iconEnd?: string;
  iconHoverShift?: boolean;
  iconOnly?: boolean;
  loading?: boolean;
  loadingText?: string;
  rel?: string;
  secondary?: boolean;
  target?: string;
};

export type ButtonProps<E extends ElementType = 'button'> = PolymorphicProps<E, ButtonOwnProps>;

type ButtonComponent = <E extends ElementType = 'button'>(
  props: ButtonProps<E>
) => ReactElement | null;

const isExternalLink = (href?: string): boolean => Boolean(href?.includes('://'));

const ButtonBase = <E extends ElementType = 'button'>(
  {
    className,
    as,
    secondary,
    loading,
    loadingText = 'loading',
    icon,
    iconEnd,
    iconHoverShift,
    iconOnly,
    children,
    rel,
    target,
    href,
    disabled,
    ...rest
  }: ButtonProps<E>,
  ref: PolymorphicRef<E>
) => {
  const isExternal = isExternalLink(href);
  const shouldUseRouterLink = !as && href && !isExternal;
  const defaultComponent = href ? 'a' : 'button';
  const Component = (shouldUseRouterLink ? Link : as ?? defaultComponent) as ElementType;
  const resolvedRel = rel ?? (isExternal ? 'noopener noreferrer' : undefined);
  const resolvedTarget = target ?? (isExternal ? '_blank' : undefined);

  type RouterButtonProps = ComponentPropsWithRef<typeof Link> & {
    unstable_viewtransition?: boolean | string;
  };

  const linkProps: Partial<RouterButtonProps> | undefined = shouldUseRouterLink
    ? {
        to: href,
        prefetch: 'intent',
        unstable_viewtransition: 'true',
      }
    : undefined;

  return (
    <Component
      ref={ref}
      className={classes(styles.button, className)}
      data-loading={loading}
      data-icon-only={iconOnly}
      data-secondary={secondary}
      data-icon={icon}
      href={shouldUseRouterLink ? undefined : href}
      rel={resolvedRel}
      target={resolvedTarget}
      disabled={disabled}
      {...(linkProps ?? {})}
      {...rest}
    >
      {!!icon && (
        <Icon
          className={styles.icon}
          data-start={!iconOnly}
          data-shift={iconHoverShift}
          icon={icon}
        />
      )}
      {!!children && <span className={styles.text}>{children}</span>}
      {!!iconEnd && (
        <Icon
          className={styles.icon}
          data-end={!iconOnly}
          data-shift={iconHoverShift}
          icon={iconEnd}
        />
      )}
      <Transition unmount in={loading}>
        {({ visible, nodeRef }) => (
          <Loader
            ref={nodeRef as MutableRefObject<HTMLDivElement | null>}
            className={styles.loader}
            size={32}
            text={loadingText}
            data-visible={visible}
          />
        )}
      </Transition>
    </Component>
  );
};

export const Button = forwardRef(ButtonBase) as ButtonComponent;
