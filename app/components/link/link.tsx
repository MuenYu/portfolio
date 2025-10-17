import type { ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react';
import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { classes } from '~/utils/style';
import styles from './link.module.css';

const VALID_EXT = ['txt', 'png', 'jpg'] as const;

type LinkBaseProps = {
  children?: ReactNode;
  className?: string;
  href?: string;
  secondary?: boolean;
};

type RouterExtendedProps = RouterLinkProps & {
  unstable_viewtransition?: boolean | string;
};

export type LinkProps = LinkBaseProps & Omit<RouterExtendedProps, keyof LinkBaseProps | 'to'>;

type RouterLinkWithViewTransitionProps = RouterLinkProps & {
  unstable_viewtransition?: boolean | string;
};

const RouterLinkWithViewTransition = RouterLink as ForwardRefExoticComponent<
  RouterLinkWithViewTransitionProps & RefAttributes<HTMLAnchorElement>
>;

const isAnchor = (href?: string): boolean => {
  if (!href) return false;

  const extension = href.split('.').pop()?.toLowerCase();
  const isValidExtension = extension ? (VALID_EXT as readonly string[]).includes(extension) : false;

  return href.includes('://') || href[0] === '#' || isValidExtension;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ rel, target, children, secondary, className, href, ...rest }, ref) => {
    const isExternal = href?.includes('://');
    const relValue = rel ?? (isExternal ? 'noreferrer noopener' : undefined);
    const targetValue = target ?? (isExternal ? '_blank' : undefined);

    const {
      discover,
      prefetch,
      reloadDocument,
      replace,
      state,
      preventScrollReset,
      relative,
      viewTransition,
      unstable_viewtransition,
      ...anchorRest
    } = rest;

    const linkProps = {
      className: classes(styles.link, className),
      ['data-secondary']: secondary,
      rel: relValue,
      href,
      target: targetValue,
      ref,
      ...anchorRest,
    };

    if (isAnchor(href)) {
      return (
        <a {...linkProps} href={href}>
          {children}
        </a>
      );
    }

    const viewTransitionValue = unstable_viewtransition ?? 'true';

    return (
      <RouterLinkWithViewTransition
        {...linkProps}
        discover={discover}
        prefetch={prefetch}
        reloadDocument={reloadDocument}
        replace={replace}
        state={state}
        preventScrollReset={preventScrollReset}
        relative={relative}
        viewTransition={viewTransition}
        unstable_viewtransition={viewTransitionValue}
        to={href ?? ''}
      >
        {children}
      </RouterLinkWithViewTransition>
    );
  }
);
