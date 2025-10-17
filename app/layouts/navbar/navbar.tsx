import {
  useEffect,
  useRef,
  useState,
  type ForwardRefExoticComponent,
  type MouseEvent,
  type RefAttributes,
} from 'react';
import {
  Link as RouterLink,
  useLocation,
  type LinkProps as RouterLinkProps,
} from 'react-router';
import { Icon } from '~/components/icon';
import { Monogram } from '~/components/monogram';
import { useTheme } from '~/components/theme-provider';
import { tokens } from '~/components/theme-provider/theme';
import { Transition } from '~/components/transition';
import { useScrollToHash, useWindowSize } from '~/hooks';
import { cssProps, media, msToNum, numToMs } from '~/utils/style';
import { NavToggle } from './nav-toggle';
import { ThemeToggle } from './theme-toggle';
import { navLinks, socialLinks, type SocialLink } from './nav-data';
import config from '~/config';
import styles from './navbar.module.css';

type ElementMeasurement = {
  element: HTMLElement;
  top: number;
  bottom: number;
};

type NavbarIconsProps = {
  desktop?: boolean;
};

const RouterLinkWithViewTransition = RouterLink as ForwardRefExoticComponent<
  RouterLinkProps & { unstable_viewtransition?: boolean | string } & RefAttributes<HTMLAnchorElement>
>;

export const Navbar = () => {
  const [current, setCurrent] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const { theme } = useTheme();
  const location = useLocation();
  const windowSize = useWindowSize();
  const headerRef = useRef<HTMLElement | null>(null);
  const isMobile = windowSize.width <= media.mobile || windowSize.height <= 696;
  const scrollToHash = useScrollToHash();

  useEffect(() => {
    // Prevent ssr mismatch by storing this in state
    setCurrent(`${location.pathname}${location.hash}`);
  }, [location]);

  // Handle smooth scroll nav items
  useEffect(() => {
    if (!target || location.pathname !== '/') return;
    setCurrent(`${location.pathname}${target}`);
    scrollToHash(target, () => setTarget(null));
  }, [location.pathname, scrollToHash, target]);

  // Handle swapping the theme when intersecting with inverse themed elements
  useEffect(() => {
    const navItems = document.querySelectorAll<HTMLElement>('[data-navbar-item]');
    const inverseTheme = theme === 'dark' ? 'light' : 'dark';
    const { innerHeight } = window;

    let inverseMeasurements: ElementMeasurement[] = [];
    let navItemMeasurements: ElementMeasurement[] = [];

    const isOverlap = (
      rect1: ElementMeasurement,
      rect2: ElementMeasurement,
      scrollY: number
    ): boolean => {
      return !(rect1.bottom - scrollY < rect2.top || rect1.top - scrollY > rect2.bottom);
    };

    const resetNavTheme = () => {
      for (const measurement of navItemMeasurements) {
        measurement.element.dataset.theme = '';
      }
    };

    const handleInversion = () => {
      const invertedElements = document.querySelectorAll<HTMLElement>(
        `[data-theme='${inverseTheme}'][data-invert]`
      );

      if (!invertedElements) return;

      inverseMeasurements = Array.from(invertedElements).map(item => ({
        element: item,
        top: item.offsetTop,
        bottom: item.offsetTop + item.offsetHeight,
      }));

      const { scrollY } = window;

      resetNavTheme();

      for (const inverseMeasurement of inverseMeasurements) {
        if (
          inverseMeasurement.top - scrollY > innerHeight ||
          inverseMeasurement.bottom - scrollY < 0
        ) {
          continue;
        }

        for (const measurement of navItemMeasurements) {
          if (isOverlap(inverseMeasurement, measurement, scrollY)) {
            measurement.element.dataset.theme = inverseTheme;
          } else {
            measurement.element.dataset.theme = '';
          }
        }
      }
    };

    // Currently only the light theme has dark full-width elements
    if (theme === 'light') {
      navItemMeasurements = Array.from(navItems).map(item => {
        const rect = item.getBoundingClientRect();

        return {
          element: item,
          top: rect.top,
          bottom: rect.bottom,
        };
      });

      document.addEventListener('scroll', handleInversion);
      handleInversion();
    }

    return () => {
      document.removeEventListener('scroll', handleInversion);
      resetNavTheme();
    };
  }, [theme, windowSize, location.key]);

  // Check if a nav item should be active
  const getCurrent = (url: string = ''): 'page' | '' => {
    const nonTrailing = current?.endsWith('/') ? current.slice(0, -1) : current;

    if (url === nonTrailing) {
      return 'page';
    }

    return '';
  };

  // Store the current hash to scroll to
  const handleNavItemClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const hash = event.currentTarget.href.split('#')[1];
    setTarget(null);

    if (hash && location.pathname === '/') {
      setTarget(`#${hash}`);
      event.preventDefault();
    }
  };

  const handleMobileNavClick = (event: MouseEvent<HTMLAnchorElement>) => {
    handleNavItemClick(event);
    if (menuOpen) setMenuOpen(false);
  };

  return (
    <header className={styles.navbar} ref={headerRef}>
        <RouterLinkWithViewTransition
          unstable_viewtransition="true"
          prefetch="intent"
          to={location.pathname === '/' ? '/#intro' : '/'}
          data-navbar-item
          className={styles.logo}
          aria-label={`${config.name}, ${config.role}`}
          onClick={handleMobileNavClick}
        >
          <Monogram highlight />
        </RouterLinkWithViewTransition>
      <NavToggle onClick={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />
      <nav className={styles.nav}>
        <div className={styles.navList}>
          {navLinks.map(({ label, pathname }) => (
            <RouterLinkWithViewTransition
              unstable_viewtransition="true"
              prefetch="intent"
              to={pathname}
              key={label}
              data-navbar-item
              className={styles.navLink}
              aria-current={getCurrent(pathname)}
              onClick={handleNavItemClick}
            >
              {label}
            </RouterLinkWithViewTransition>
          ))}
        </div>
        <NavbarIcons desktop />
      </nav>
      <Transition unmount in={menuOpen} timeout={msToNum(tokens.base.durationL)}>
        {({ visible, nodeRef }) => (
          <nav className={styles.mobileNav} data-visible={visible} ref={nodeRef}>
            {navLinks.map(({ label, pathname }, index) => (
              <RouterLinkWithViewTransition
                unstable_viewtransition="true"
                prefetch="intent"
                to={pathname}
                key={label}
                className={styles.mobileNavLink}
                data-visible={visible}
                aria-current={getCurrent(pathname)}
                onClick={handleMobileNavClick}
                style={cssProps({
                  transitionDelay: numToMs(
                    Number(msToNum(tokens.base.durationS)) + index * 50
                  ),
                })}
              >
                {label}
              </RouterLinkWithViewTransition>
            ))}
            <NavbarIcons />
            <ThemeToggle isMobile />
          </nav>
        )}
      </Transition>
      {!isMobile && <ThemeToggle data-navbar-item />}
    </header>
  );
};

const NavbarIcons = ({ desktop }: NavbarIconsProps) => (
  <div className={styles.navIcons}>
    {socialLinks.map(({ label, url, icon }: SocialLink) => (
      <a
        key={label}
        data-navbar-item={desktop || undefined}
        className={styles.navIconLink}
        aria-label={label}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon className={styles.navIcon} icon={icon} />
      </a>
    ))}
  </div>
);
