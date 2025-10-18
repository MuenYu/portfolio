import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { Link as RouterLink } from 'react-router';
import { classes } from '~/utils/style';
import styles from './link.module.css';

// File extensions that can be linked to
const VALID_EXT = ['txt', 'png', 'jpg'];

function isAnchor(href: string | undefined): boolean {
  const isValidExtension = VALID_EXT.includes(href?.split('.').pop());
  const hasProtocol = href?.includes('://') ?? false;
  const startsWithHash = href?.startsWith('#') ?? false;
  return hasProtocol || startsWithHash || isValidExtension;
}

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

type RouterLinkComponentProps = ComponentPropsWithoutRef<typeof RouterLink>;

interface AppLinkProps
  extends Omit<AnchorProps, 'href' | 'className' | 'children'> {
  children?: ReactNode;
  className?: string;
  href?: string;
  secondary?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ rel, target, children, secondary, className, href, ...rest }, ref) => {
    const isExternal = href?.includes('://');
    const relValue = rel ?? (isExternal ? 'noreferrer noopener' : undefined);
    const targetValue = target ?? (isExternal ? '_blank' : undefined);

    const sharedProps: AnchorProps = {
      ...rest,
      className: classes(styles.link, className),
      'data-secondary': secondary,
      rel: relValue,
      target: targetValue,
    };

    if (isAnchor(href)) {
      return (
        <a {...sharedProps} href={href} ref={ref}>
          {children}
        </a>
      );
    }

    const routerLinkProps: RouterLinkComponentProps = {
      ...(sharedProps as unknown as RouterLinkComponentProps),
      to: href ?? '#',
      unstable_viewtransition: 'true',
      prefetch: 'intent',
    };

    return (
      <RouterLink {...routerLinkProps} ref={ref}>
        {children}
      </RouterLink>
    );
  }
);

Link.displayName = 'Link';
