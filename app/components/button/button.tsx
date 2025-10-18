import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  ReactNode,
  Ref,
} from 'react';
import { forwardRef } from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';
import { Icon } from '~/components/icon';
import { Loader } from '~/components/loader';
import { Transition } from '~/components/transition';
import { classes } from '~/utils/style';
import styles from './button.module.css';

type LinkOnlyProps = Partial<Omit<LinkProps, 'children'>>;

interface CommonButtonProps {
  as?: ElementType;
  className?: string;
  secondary?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: string;
  iconEnd?: string;
  iconHoverShift?: boolean;
  iconOnly?: boolean;
  href?: string;
  rel?: string;
  target?: string;
  children?: ReactNode;
  unstable_viewtransition?: string;
}

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  keyof CommonButtonProps
>;
type NativeAnchorProps = Partial<
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonButtonProps>
>;

export type ButtonProps = CommonButtonProps &
  NativeButtonProps &
  NativeAnchorProps &
  LinkOnlyProps;

const isExternalLink = (href?: string): href is string =>
  typeof href === 'string' && href.includes('://');

type ButtonElement = HTMLButtonElement | HTMLAnchorElement;

const ButtonComponent = ({ href, ...rest }: ButtonProps, ref: Ref<ButtonElement>) => {
  if (isExternalLink(href) || !href) {
    return <ButtonContent href={href} ref={ref} {...rest} />;
  }

  return (
    <ButtonContent
      unstable_viewtransition="true"
      as={Link}
      prefetch="intent"
      to={href}
      ref={ref}
      {...rest}
    />
  );
};

export const Button = forwardRef<ButtonElement, ButtonProps>(ButtonComponent);

Button.displayName = 'Button';

const ButtonContent = forwardRef<ButtonElement, ButtonProps>(
  (
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
      ...rest
    },
    ref
  ) => {
    const isExternal = isExternalLink(href);
    const defaultComponent: ElementType = href ? 'a' : 'button';
    const Component = as ?? defaultComponent;
    const computedRel = rel ?? (isExternal ? 'noopener noreferrer' : undefined);
    const computedTarget = target ?? (isExternal ? '_blank' : undefined);

    return (
      <Component
        {...rest}
        {...(href ? { href } : {})}
        {...(computedRel ? { rel: computedRel } : {})}
        {...(computedTarget ? { target: computedTarget } : {})}
        className={classes(styles['button'], className)}
        data-loading={loading}
        data-icon-only={iconOnly}
        data-secondary={secondary}
        data-icon={icon}
        ref={ref}
      >
        {!!icon && (
          <Icon
            className={styles['icon']}
            data-start={!iconOnly}
            data-shift={iconHoverShift}
            icon={icon}
          />
        )}
        {!!children && <span className={styles['text']}>{children}</span>}
        {!!iconEnd && (
          <Icon
            className={styles['icon']}
            data-end={!iconOnly}
            data-shift={iconHoverShift}
            icon={iconEnd}
          />
        )}
        <Transition unmount in={loading}>
          {({ visible, nodeRef }) => (
            <Loader
              ref={nodeRef}
              className={styles['loader']}
              size={32}
              text={loadingText}
              data-visible={visible}
            />
          )}
        </Transition>
      </Component>
    );
  }
);

ButtonContent.displayName = 'ButtonContent';
