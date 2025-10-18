import { DecoderText } from '~/components/decoder-text';
import { Heading } from '~/components/heading';
import { Section } from '~/components/section';
import type { SectionProps } from '~/components/section/section';
import { useTheme } from '~/components/theme-provider';
import { tokens } from '~/components/theme-provider/theme';
import { Transition } from '~/components/transition';
import { VisuallyHidden } from '~/components/visually-hidden';
import { Link as RouterLink } from 'react-router';
import { useInterval, usePrevious, useScrollToHash } from '~/hooks';
import {
  Suspense,
  lazy,
  useEffect,
  useState,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react';
import { cssProps } from '~/utils/style';
import config from '~/config.json';
import { useHydrated } from '~/hooks/useHydrated';
import styles from './intro.module.css';

const DisplacementSphere = lazy(() =>
  import('./displacement-sphere').then(module => ({ default: module.DisplacementSphere }))
);

type IntroSectionProps = SectionProps<'section'>;

interface IntroProps extends Omit<IntroSectionProps, 'id' | 'ref'> {
  id: string;
  sectionRef: RefObject<HTMLElement>;
  scrollIndicatorHidden: boolean;
}

export function Intro({ id, sectionRef, scrollIndicatorHidden, ...rest }: IntroProps): JSX.Element {
  const { theme } = useTheme();
  const { disciplines } = config;
  const [disciplineIndex, setDisciplineIndex] = useState(0);
  const prevTheme = usePrevious(theme);
  const [lastDiscipline = ''] = disciplines.slice(-1);
  const previousDisciplines = disciplines.slice(0, -1).join(', ');
  const introLabel =
    disciplines.length > 1 && previousDisciplines
      ? `${previousDisciplines}, and ${lastDiscipline}`
      : lastDiscipline;
  const currentDiscipline = disciplines[disciplineIndex] ?? disciplines[0];
  const titleId = `${id}-title`;
  const scrollToHash = useScrollToHash();
  const isHydrated = useHydrated();

  useInterval(
    () => {
      setDisciplineIndex(index => (index + 1) % disciplines.length);
    },
    5000,
    theme
  );

  useEffect(() => {
    if (prevTheme && prevTheme !== theme) {
      setDisciplineIndex(0);
    }
  }, [theme, prevTheme]);

  const handleScrollClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToHash(event.currentTarget.href);
  };

  return (
    <Section
      className={styles.intro}
      as="section"
      ref={sectionRef}
      id={id}
      aria-labelledby={titleId}
      tabIndex={-1}
      {...rest}
    >
      <Transition in key={theme} timeout={3000}>
        {({ visible, status }) => (
          <>
            {isHydrated && (
              <Suspense>
                <DisplacementSphere />
              </Suspense>
            )}
            <header className={styles.text}>
              <h1 className={styles.name} data-visible={visible} id={titleId}>
                <DecoderText text={config.name} delay={500} />
              </h1>
              <Heading level={0} as="h2" className={styles.title}>
                <VisuallyHidden className={styles.label}>
                  {`${config.role} + ${introLabel}`}
                </VisuallyHidden>
                <span aria-hidden className={styles.row}>
                  <span
                    className={styles.word}
                    data-status={status}
                    style={cssProps({ delay: tokens.base.durationXS })}
                  >
                    {config.role}
                  </span>
                  <span className={styles.line} data-status={status} />
                </span>
                <div className={styles.row}>
                  {disciplines.map(item => (
                    <Transition
                      unmount
                      in={item === currentDiscipline}
                      timeout={{ enter: 3000, exit: 2000 }}
                      key={item}
                    >
                      {({ status, nodeRef }) => (
                        <span
                          aria-hidden
                          ref={nodeRef}
                          className={styles.word}
                          data-plus={true}
                          data-status={status}
                          style={cssProps({ delay: tokens.base.durationL })}
                        >
                          {item}
                        </span>
                      )}
                    </Transition>
                  ))}
                </div>
              </Heading>
            </header>
            <RouterLink
              to="/#project-1"
              className={styles.scrollIndicator}
              data-status={status}
              data-hidden={scrollIndicatorHidden}
              onClick={handleScrollClick}
            >
              <VisuallyHidden>Scroll to projects</VisuallyHidden>
            </RouterLink>
            <RouterLink
              to="/#project-1"
              className={styles.mobileScrollIndicator}
              data-status={status}
              data-hidden={scrollIndicatorHidden}
              onClick={handleScrollClick}
            >
              <VisuallyHidden>Scroll to projects</VisuallyHidden>
              <svg
                aria-hidden
                stroke="currentColor"
                width="43"
                height="15"
                viewBox="0 0 43 15"
              >
                <path d="M1 1l20.5 12L42 1" strokeWidth="2" fill="none" />
              </svg>
            </RouterLink>
          </>
        )}
      </Transition>
    </Section>
  );
}
