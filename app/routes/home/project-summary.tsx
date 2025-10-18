import { Button } from '~/components/button';
import { Divider } from '~/components/divider';
import { Heading } from '~/components/heading';
import { deviceModels } from '~/components/model/device-models';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { Transition } from '~/components/transition';
import { Loader } from '~/components/loader';
import { useWindowSize } from '~/hooks';
import type {
  ComponentPropsWithoutRef,
  MutableRefObject,
  ReactNode,
  RefObject,
} from 'react';
import { Suspense, lazy, useState } from 'react';
import { media } from '~/utils/style';
import { useHydrated } from '~/hooks/useHydrated';
import styles from './project-summary.module.css';

interface ProjectSummaryButton {
  text: string;
  link: string;
}

interface ModelTexture {
  srcSet: string;
  placeholder?: string;
  sizes?: string;
}

interface LaptopProjectModel {
  type: 'laptop';
  alt: string;
  textures: [ModelTexture];
}

interface PhoneProjectModel {
  type: 'phone';
  alt: string;
  textures: [ModelTexture, ModelTexture];
}

type ProjectModel = LaptopProjectModel | PhoneProjectModel;

type SectionElement = HTMLElement;

type SectionProps = ComponentPropsWithoutRef<typeof Section>;

interface ProjectSummaryProps extends Omit<SectionProps, 'children' | 'ref'> {
  id: string;
  visible: boolean;
  sectionRef: MutableRefObject<SectionElement | null> | RefObject<SectionElement>;
  index: number;
  title: string;
  description: ReactNode;
  buttons?: readonly ProjectSummaryButton[];
  model: ProjectModel;
  alternate?: boolean;
}

const Model = lazy(() =>
  import('~/components/model').then(module => ({ default: module.Model }))
);

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
  const { width } = useWindowSize();
  const isHydrated = useHydrated();
  const titleId = `${id}-title`;
  const isMobile = width <= media.tablet;
  const indexText = index < 10 ? `0${index}` : index;
  const phoneSizes = `(max-width: ${media.tablet}px) 30vw, 20vw`;
  const laptopSizes = `(max-width: ${media.tablet}px) 80vw, 40vw`;
  const transitionVisible = sectionVisible ? true : focused;
  const useAlternateLayout = alternate === true ? true : isMobile;

  function handleModelLoad() {
    setModelLoaded(true);
  }

  function renderDetails(visible: boolean) {
    return (
      <div className={styles['details']}>
        <div aria-hidden className={styles['index']}>
          <Divider
            notchWidth="64px"
            notchHeight="8px"
            collapsed={!visible}
            collapseDelay={1000}
          />
          <span className={styles['indexNumber']} data-visible={visible}>
            {indexText}
          </span>
        </div>
        <Heading
          level={3}
          as="h2"
          className={styles['title']}
          data-visible={visible}
          id={titleId}
        >
          {title}
        </Heading>
        <Text className={styles['description']} data-visible={visible} as="p">
          {description}
        </Text>
        <div className={styles['button']} data-visible={visible}>
          {buttons.map(button => (
            <Button
              key={button.link}
              iconHoverShift
              href={button.link}
              iconEnd="arrow-right"
            >
              {button.text}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  function renderPreview(visible: boolean) {
    return (
      <div className={styles['preview']}>
        {model.type === 'laptop' && (
          <>
            {/* {renderKatakana('laptop', visible)} */}
            <div className={styles['model']} data-device="laptop">
              {!modelLoaded && (
                <Loader center className={styles['loader']} data-visible={visible} />
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
            {/* {renderKatakana('phone', visible)} */}
            <div className={styles['model']} data-device="phone">
              {!modelLoaded && (
                <Loader center className={styles['loader']} data-visible={visible} />
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
  }

  return (
    <Section
      className={styles['summary']}
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
      <div className={styles['content']}>
        <Transition in={transitionVisible}>
          {({ visible }) => (
            <>
              {!useAlternateLayout && (
                <>
                  {renderDetails(visible)}
                  {renderPreview(visible)}
                </>
              )}
              {useAlternateLayout && (
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
