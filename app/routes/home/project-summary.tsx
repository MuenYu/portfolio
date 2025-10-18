import { Button } from '~/components/button';
import { Divider } from '~/components/divider';
import { Heading } from '~/components/heading';
import { deviceModels } from '~/components/model/device-models';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import { Loader } from '~/components/loader';
import { useWindowSize } from '~/hooks';
import type { ComponentPropsWithoutRef, RefObject } from 'react';
import { Suspense, lazy, useMemo, useState } from 'react';
import { media } from '~/utils/style';
import { useHydrated } from '~/hooks/useHydrated';
import type { ProjectButton, ProjectModel } from '~/types/config';
import styles from './project-summary.module.css';

const Model = lazy(() =>
  import('~/components/model').then(module => ({ default: module.Model }))
);

type LaptopModel = {
  type: 'laptop';
  alt: string;
  textures: [ProjectModel];
};

type PhoneModel = {
  type: 'phone';
  alt: string;
  textures: [ProjectModel, ProjectModel];
};

export type ProjectSummaryModel = LaptopModel | PhoneModel;

type ProjectSummaryProps = {
  id: string;
  visible: boolean;
  sectionRef: RefObject<HTMLElement>;
  index: number;
  title: string;
  description: string;
  model: ProjectSummaryModel;
  buttons?: ProjectButton[];
  alternate?: boolean;
} & ComponentPropsWithoutRef<typeof Section>;

export function ProjectSummary({
  id,
  visible: sectionVisible,
  sectionRef,
  index,
  title,
  description,
  model,
  buttons = [],
  alternate,
  ...rest
}: ProjectSummaryProps) {
  const [focused, setFocused] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const { theme } = useTheme();
  const { width } = useWindowSize();
  const isHydrated = useHydrated();
  const titleId = `${id}-title`;
  const isMobile = width <= media.tablet;
  const indexText = index < 10 ? `0${index}` : String(index);
  const phoneSizes = useMemo(() => `(max-width: ${media.tablet}px) 30vw, 20vw`, []);
  const laptopSizes = useMemo(() => `(max-width: ${media.tablet}px) 80vw, 40vw`, []);

  const handleModelLoad = () => {
    setModelLoaded(true);
  };

  const renderDetails = (visible: boolean) => {
    return (
      <div className={styles.details}>
        <div aria-hidden className={styles.index}>
          <Divider
            notchWidth="64px"
            notchHeight="8px"
            collapsed={!visible}
            collapseDelay={1000}
          />
          <span className={styles.indexNumber} data-visible={visible}>
            {indexText}
          </span>
        </div>
        <Heading
          level={3}
          as="h2"
          className={styles.title}
          data-visible={visible}
          id={titleId}
        >
          {title}
        </Heading>
        <Text className={styles.description} data-visible={visible} as="p">
          {description}
        </Text>
        <div className={styles.button} data-visible={visible}>
          {buttons.map(button => (
            <Button key={button.link} iconHoverShift href={button.link} iconEnd="arrow-right">
              {button.text}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderPreview = (visible: boolean) => {
    return (
      <div className={styles.preview}>
        {model.type === 'laptop' && (
          <>
            <div className={styles.model} data-device="laptop">
              {!modelLoaded && (
                <Loader center className={styles.loader} data-visible={visible} />
              )}
              {isHydrated && visible && (
                <Suspense>
                  <Model
                    alt={model.alt}
                    cameraPosition={{ x: 0, y: 0, z: 8 }}
                    showDelay={700}
                    onLoad={handleModelLoad}
                    show={visible}
                    models={[
                      {
                        ...deviceModels.laptop,
                        texture: {
                          ...model.textures[0],
                          sizes: laptopSizes,
                        },
                      },
                    ]}
                  />
                </Suspense>
              )}
            </div>
          </>
        )}
        {model.type === 'phone' && (
          <>
            <div className={styles.model} data-device="phone">
              {!modelLoaded && (
                <Loader center className={styles.loader} data-visible={visible} />
              )}
              {isHydrated && visible && (
                <Suspense>
                  <Model
                    alt={model.alt}
                    cameraPosition={{ x: 0, y: 0, z: 11.5 }}
                    showDelay={300}
                    onLoad={handleModelLoad}
                    show={visible}
                    models={[
                      {
                        ...deviceModels.phone,
                        position: { x: -0.6, y: 1.1, z: 0 },
                        texture: {
                          ...model.textures[0],
                          sizes: phoneSizes,
                        },
                      },
                      {
                        ...deviceModels.phone,
                        position: { x: 0.6, y: -0.5, z: 0.3 },
                        texture: {
                          ...model.textures[1],
                          sizes: phoneSizes,
                        },
                      },
                    ]}
                  />
                </Suspense>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Section
      className={styles.summary}
      data-alternate={alternate}
      data-first={index === 1}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      as="section"
      aria-labelledby={titleId}
      ref={sectionRef}
      id={id}
      tabIndex={-1}
      {...rest}
    >
      <div className={styles.content}>
        <Transition in={sectionVisible || focused}>
          {({ visible }) => (
            <>
              {!alternate && !isMobile && (
                <>
                  {renderDetails(visible)}
                  {renderPreview(visible)}
                </>
              )}
              {(alternate || isMobile) && (
                <>
                  {renderPreview(visible)}
                  {renderDetails(visible)}
                </>
              )}
            </>
          )}
        </Transition>
      </div>
    </Section>
  );
}
