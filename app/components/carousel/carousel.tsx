import { animate, useReducedMotion } from 'framer-motion';
import { useInViewport } from '~/hooks';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Color,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  LinearSRGBColorSpace,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import type { ShaderMaterialParameters, Texture } from 'three';
import { resolveSrcFromSrcSet } from '~/utils/image';
import { cssProps } from '~/utils/style';
import { cleanRenderer, cleanScene, textureLoader } from '~/utils/three';
import styles from './carousel.module.css';
import fragment from './carousel-fragment.glsl?raw';
import vertex from './carousel-vertex.glsl?raw';

interface IndexableCollection<T> {
  readonly length: number;
  readonly [key: number]: T;
}

function determineIndex<T>(
  imageIndex: number,
  index: number | null,
  images: IndexableCollection<T>,
  direction: number
): number {
  if (index !== null) return index;
  const length = images.length;
  const prevIndex = (imageIndex - 1 + length) % length;
  const nextIndex = (imageIndex + 1) % length;
  const finalIndex = direction > 0 ? nextIndex : prevIndex;
  return finalIndex;
}

interface CarouselImage {
  alt: string;
  src: string;
  sizes?: string;
  srcSet?: string;
}

interface CarouselProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onPointerDown'> {
  height: number;
  images: CarouselImage[];
  placeholder?: string;
  width: number;
}

interface CarouselUniform<TValue> {
  type: 'f' | 't' | 'b';
  value: TValue;
}

interface CarouselUniforms {
  currentImage: CarouselUniform<Texture>;
  direction: CarouselUniform<number>;
  dispFactor: CarouselUniform<number>;
  nextImage: CarouselUniform<Texture>;
  reduceMotion: CarouselUniform<boolean>;
}

type CarouselShaderMaterial = ShaderMaterial & { uniforms: CarouselUniforms };

const createCarouselMaterial = (
  initialTextures: Texture[],
  reduceMotionValue: boolean
): CarouselShaderMaterial | null => {
  const firstTexture = initialTextures[0];
  if (!firstTexture) {
    return null;
  }

  const secondTexture = initialTextures[1] ?? firstTexture;
  const uniforms: CarouselUniforms = {
    dispFactor: { type: 'f', value: 0 },
    direction: { type: 'f', value: 1 },
    currentImage: { type: 't', value: firstTexture },
    nextImage: { type: 't', value: secondTexture },
    reduceMotion: { type: 'b', value: reduceMotionValue },
  };

  const shaderMaterial = new ShaderMaterial({
    uniforms: uniforms as unknown as ShaderMaterialParameters['uniforms'],
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: false,
    opacity: 1,
  });

  return Object.assign(shaderMaterial, { uniforms });
};

export const Carousel = ({
  width,
  height,
  images,
  placeholder,
  role = 'group',
  tabIndex,
  ...rest
}: CarouselProps) => {
  const [dragging, setDragging] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [textures, setTextures] = useState<Texture[] | null>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const imagePlane = useRef<Mesh | null>(null);
  const geometry = useRef<PlaneGeometry | null>(null);
  const material = useRef<CarouselShaderMaterial | null>(null);
  const scene = useRef<Scene | null>(null);
  const camera = useRef<OrthographicCamera | null>(null);
  const renderer = useRef<WebGLRenderer | null>(null);
  const animating = useRef(false);
  const swipeDirection = useRef(1);
  const lastSwipePosition = useRef(0);
  const scheduledAnimationFrame = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const inViewport = useInViewport(canvas, true);
  const placeholderRef = useRef<HTMLImageElement | null>(null);
  const initSwipeX = useRef(0);

  const currentImage = images[imageIndex] ?? images[0];
  const currentImageAlt = `Slide ${imageIndex + 1} of ${images.length}. ${
    currentImage?.alt ?? ''
  }`;

  useEffect(() => {
    if (dragging) {
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.body.style.cursor = '';
    };
  }, [dragging]);

  useEffect(() => {
    const cameraOptions: [number, number, number, number, number, number] = [
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000,
    ];
    const canvasElement = canvas.current;
    if (!canvasElement) {
      return;
    }

    renderer.current = new WebGLRenderer({
      canvas: canvasElement,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    });
    camera.current = new OrthographicCamera(...cameraOptions);
    scene.current = new Scene();
    const rendererInstance = renderer.current;
    const sceneInstance = scene.current;
    const cameraInstance = camera.current;

    rendererInstance.setPixelRatio(2);
    rendererInstance.setClearColor(0x111111, 1.0);
    rendererInstance.setSize(width, height);
    rendererInstance.domElement.style.width = '100%';
    rendererInstance.domElement.style.height = 'auto';
    sceneInstance.background = new Color(0x111111);
    cameraInstance.position.z = 1;

    return () => {
      animating.current = false;
      cleanScene(sceneInstance);
      if (rendererInstance) {
        cleanRenderer(rendererInstance);
      }
    };
  }, [height, width]);

  useEffect(() => {
    let mounted = true;

    const loadImages = async () => {
      const rendererInstance = renderer.current;
      const sceneInstance = scene.current;
      const cameraInstance = camera.current;

      if (!rendererInstance || !sceneInstance || !cameraInstance) {
        return;
      }

      const anisotropy = rendererInstance.capabilities.getMaxAnisotropy();

      const texturePromises = images.map(async (image): Promise<Texture> => {
        let imageSrc = image.src;
        if (image.srcSet) {
          imageSrc = await resolveSrcFromSrcSet(image);
        }

        const imageTexture = await textureLoader.loadAsync(imageSrc);
        imageTexture.colorSpace = LinearSRGBColorSpace;
        imageTexture.minFilter = LinearFilter;
        imageTexture.magFilter = LinearFilter;
        imageTexture.anisotropy = anisotropy;
        imageTexture.generateMipmaps = false;
        imageTexture.needsUpdate = true;
        return imageTexture;
      });

      const loadedTextures = await Promise.all(texturePromises);

      // Cancel if the component has unmounted during async code
      if (!mounted) return;

      const materialInstance = createCarouselMaterial(loadedTextures, reduceMotion);
      if (!materialInstance) {
        return;
      }

      material.current = materialInstance;

      geometry.current = new PlaneGeometry(width, height, 1);
      imagePlane.current = new Mesh(geometry.current, material.current);
      imagePlane.current.position.set(0, 0, 0);
      sceneInstance.add(imagePlane.current);

      setLoaded(true);
      setTextures(loadedTextures);

      window.requestAnimationFrame(() => {
        rendererInstance.render(sceneInstance, cameraInstance);
      });
    };

    if (inViewport && !loaded) {
      void loadImages();
    }

    return () => {
      mounted = false;
    };
  }, [height, images, inViewport, loaded, reduceMotion, width]);

  const goToIndex = useCallback(
    ({ index, direction = 1 }: { direction?: number; index: number }) => {
      if (!textures || !material.current) return;
      const targetTexture = textures[index];
      if (!targetTexture) {
        return;
      }
      setImageIndex(index);
      const { uniforms } = material.current;
      uniforms.nextImage.value = targetTexture;
      uniforms.direction.value = direction;

      const onComplete = () => {
        uniforms.currentImage.value = targetTexture;
        uniforms.dispFactor.value = 0;
        animating.current = false;
      };

      if (uniforms.dispFactor.value !== 1) {
        animating.current = true;

        animate(uniforms.dispFactor.value, 1, {
          type: 'spring',
          stiffness: 100,
          damping: 20,
          restSpeed: 0.001,
          restDelta: 0.001,
          onUpdate: value => {
            uniforms.dispFactor.value = value;
          },
          onComplete,
        });
      }
    },
    [textures]
  );

  const navigate = useCallback(
    ({ direction, index = null }: { direction: number; index?: number | null }) => {
      if (!loaded || !textures) return;

      if (animating.current) {
        if (scheduledAnimationFrame.current !== null) {
          cancelAnimationFrame(scheduledAnimationFrame.current);
          scheduledAnimationFrame.current = null;
        }
        scheduledAnimationFrame.current = window.requestAnimationFrame(() => {
          scheduledAnimationFrame.current = null;
          navigate({ direction, index });
        });
        return;
      }

      const finalIndex = determineIndex(imageIndex, index, textures, direction);
      goToIndex({ index: finalIndex, direction });
    },
    [goToIndex, imageIndex, loaded, textures]
  );

  const onNavClick = useCallback(
    (index: number) => {
      if (index === imageIndex) return;
      const direction = index > imageIndex ? 1 : -1;
      navigate({ direction, index });
    },
    [imageIndex, navigate]
  );

  useEffect(() => {
    const handleResize = () => {
      const rect = canvas.current?.getBoundingClientRect();
      if (rect) {
        setCanvasRect(rect);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    let animation: number | undefined;
    const renderLoop = () => {
      animation = window.requestAnimationFrame(renderLoop);
      if (animating.current && renderer.current && scene.current && camera.current) {
        renderer.current.render(scene.current, camera.current);
      }
    };

    animation = window.requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animation);
    };
  }, []);

  useEffect(() => {
    if (placeholder) {
      const purgePlaceholder = () => {
        setShowPlaceholder(false);
      };

      const placeholderElement = placeholderRef.current;
      placeholderElement?.addEventListener('transitionend', purgePlaceholder);

      return () => {
        if (placeholderElement) {
          placeholderElement.removeEventListener('transitionend', purgePlaceholder);
        }
      };
    }
  }, [placeholder]);

  const onSwipeMove = useCallback(
    (x: number) => {
      if (animating.current || !material.current || !textures || !canvasRect) return;
      lastSwipePosition.current = x;
      const absoluteX = Math.abs(x);
      const containerWidth = canvasRect.width;
      swipeDirection.current = x > 0 ? -1 : 1;
      const swipePercentage = 1 - ((absoluteX - containerWidth) / containerWidth) * -1;
      const nextIndex = determineIndex(imageIndex, null, images, swipeDirection.current);
      const uniforms = material.current.uniforms;
      const displacementClamp = Math.min(Math.max(swipePercentage, 0), 1);
      const currentTexture = textures[imageIndex];
      const nextTexture = textures[nextIndex];

      if (!currentTexture || !nextTexture) {
        return;
      }

      uniforms.currentImage.value = currentTexture;
      uniforms.nextImage.value = nextTexture;
      uniforms.direction.value = swipeDirection.current;

      uniforms.dispFactor.value = displacementClamp;

      window.requestAnimationFrame(() => {
        if (renderer.current && scene.current && camera.current) {
          renderer.current.render(scene.current, camera.current);
        }
      });
    },
    [canvasRect, imageIndex, images, textures]
  );

  const onSwipeEnd = useCallback(() => {
    if (!material.current || !canvasRect) return;
    const uniforms = material.current.uniforms;
    const position = Math.abs(lastSwipePosition.current);
    const minSwipeDistance = canvasRect.width * 0.2;
    lastSwipePosition.current = 0;

    if (animating.current) return;
    if (position === 0 || !position) return;

    if (position > minSwipeDistance) {
      navigate({
        direction: swipeDirection.current,
      });
    } else {
      const previousCurrent = uniforms.currentImage.value;
      const previousNext = uniforms.nextImage.value;
      uniforms.currentImage.value = previousNext;
      uniforms.nextImage.value = previousCurrent;
      uniforms.dispFactor.value = 1 - uniforms.dispFactor.value;

      navigate({
        direction: swipeDirection.current * -1,
        index: imageIndex,
      });
    }
  }, [canvasRect, imageIndex, navigate]);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      onSwipeMove(event.clientX - initSwipeX.current);
    },
    [onSwipeMove]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    onSwipeEnd();

    document.removeEventListener('pointerup', handlePointerUp);
    document.removeEventListener('pointermove', handlePointerMove);
  }, [handlePointerMove, onSwipeEnd]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      initSwipeX.current = event.clientX;
      setDragging(true);

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp]
  );

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
        navigate({ direction: 1 });
        break;
      case 'ArrowLeft':
        navigate({ direction: -1 });
        break;
    }
  };

  return (
    <div
      className={styles.carousel}
      onKeyDown={handleKeyDown}
      role={role}
      tabIndex={tabIndex ?? 0}
      {...rest}
    >
      <div className={styles.content}>
        <div
          className={styles.imageWrapper}
          data-dragging={dragging}
          onPointerDown={handlePointerDown}
          style={cssProps({ aspectRatio: `${width} / ${height}` })}
        >
          <div
            aria-atomic
            className={styles.canvasWrapper}
            aria-live="polite"
            aria-label={currentImageAlt}
            role="img"
          >
            <canvas aria-hidden className={styles.canvas} ref={canvas} />
          </div>
          {showPlaceholder && placeholder && (
            <img
              aria-hidden
              className={styles.placeholder}
              data-loaded={loaded && !!textures}
              src={placeholder}
              ref={placeholderRef}
              alt=""
              role="presentation"
            />
          )}
        </div>
        <button
          className={styles.button}
          data-prev={true}
          aria-label="Previous slide"
          onClick={() => navigate({ direction: -1 })}
        >
          <ArrowLeft />
        </button>
        <button
          className={styles.button}
          data-next={true}
          aria-label="Next slide"
          onClick={() => navigate({ direction: 1 })}
        >
          <ArrowRight />
        </button>
      </div>
      <div className={styles.nav}>
        {images.map((image, index) => (
          <button
            className={styles.navButton}
            key={image.alt}
            onClick={() => onNavClick(index)}
            aria-label={`Jump to slide ${index + 1}`}
            aria-pressed={index === imageIndex}
          />
        ))}
      </div>
    </div>
  );
};

function ArrowLeft() {
  return (
    <svg fill="currentColor" width="18" height="42" viewBox="0 0 18 42">
      <path d="M18.03 1.375L16.47.125-.031 20.75l16.5 20.625 1.562-1.25L2.53 20.75z" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg fill="currentColor" width="18" height="42" viewBox="0 0 18 42">
      <path d="M-.03 1.375L1.53.125l16.5 20.625-16.5 20.625-1.562-1.25 15.5-19.375z" />
    </svg>
  );
}
