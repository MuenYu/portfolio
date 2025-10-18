import {
  animate,
  type AnimationPlaybackControls,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { useInViewport } from '~/hooks';
import {
  createRef,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { HTMLAttributes, MutableRefObject } from 'react';
import {
  AmbientLight,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
  type Light,
  type Material,
  type Object3D,
  type IUniform,
  type Texture,
} from 'three';
import type { Color } from 'three';
import { HorizontalBlurShader, VerticalBlurShader } from 'three-stdlib';
import { resolveSrcFromSrcSet } from '~/utils/image';
import { classes, cssProps, numToMs } from '~/utils/style';
import {
  cleanRenderer,
  cleanScene,
  modelLoader,
  removeLights,
  textureLoader,
} from '~/utils/three';
import { ModelAnimationType } from './device-models';
import { throttle } from '~/utils/throttle';
import styles from './model.module.css';

const MeshType = {
  Frame: 'Frame',
  Logo: 'Logo',
  Screen: 'Screen',
} as const;

type ModelAnimation = (typeof ModelAnimationType)[keyof typeof ModelAnimationType];

interface ModelTexture {
  readonly placeholder: string;
  readonly srcSet: string;
  readonly sizes?: string;
}

interface VectorCoordinates {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

interface DeviceModelConfig {
  readonly animation: ModelAnimation;
  readonly position: VectorCoordinates;
  readonly texture: ModelTexture;
  readonly url: string;
}

interface ModelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  readonly alt: string;
  readonly cameraPosition?: VectorCoordinates;
  readonly models: readonly DeviceModelConfig[];
  readonly onLoad?: () => void;
  readonly show?: boolean;
  readonly showDelay?: number;
  readonly style?: Record<string, string | number | undefined>;
}

type BlurUniforms = Record<string, IUniform>;

type BlurPlaneMesh = Mesh<PlaneGeometry, ShaderMaterial>;

type PlaneMesh = Mesh<PlaneGeometry, MeshBasicMaterial>;

const rotationSpringConfig = {
  stiffness: 40,
  damping: 20,
  mass: 1.4,
  restSpeed: 0.001,
};

const isMeshObject = (object: Object3D | null | undefined): object is Mesh =>
  object instanceof Mesh;

const isUniform = (uniform: IUniform | undefined): uniform is IUniform =>
  typeof uniform === 'object' && uniform !== null && 'value' in uniform;

const getPrimaryMaterial = (mesh: Mesh): Material | undefined => {
  const { material } = mesh;
  return Array.isArray(material) ? material[0] : material;
};

export const Model = ({
  models,
  show = true,
  showDelay = 0,
  cameraPosition = { x: 0, y: 0, z: 8 },
  style,
  className,
  onLoad,
  alt,
  ...rest
}: ModelProps) => {
  const [loaded, setLoaded] = useState(false);
  const container = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const camera = useRef<PerspectiveCamera | null>(null);
  const modelGroup = useRef<Group | null>(null);
  const scene = useRef<Scene | null>(null);
  const renderer = useRef<WebGLRenderer | null>(null);
  const shadowGroup = useRef<Group | null>(null);
  const renderTarget = useRef<WebGLRenderTarget | null>(null);
  const renderTargetBlur = useRef<WebGLRenderTarget | null>(null);
  const shadowCamera = useRef<OrthographicCamera | null>(null);
  const depthMaterial = useRef<MeshDepthMaterial | null>(null);
  const horizontalBlurMaterial = useRef<ShaderMaterial | null>(null);
  const verticalBlurMaterial = useRef<ShaderMaterial | null>(null);
  const plane = useRef<PlaneMesh | null>(null);
  const lights = useRef<Light[]>([]);
  const blurPlane = useRef<BlurPlaneMesh | null>(null);
  const fillPlane = useRef<PlaneMesh | null>(null);
  const isInViewport = useInViewport(container, false, { threshold: 0.2 });
  const reduceMotion = useReducedMotion();
  const rotationX = useSpring(0, rotationSpringConfig);
  const rotationY = useSpring(0, rotationSpringConfig);

  useEffect(() => {
    const containerElement = container.current;
    const canvasElement = canvas.current;

    if (!containerElement || !canvasElement) {
      return;
    }

    const { clientWidth, clientHeight } = containerElement;

    const rendererInstance = new WebGLRenderer({
      canvas: canvasElement,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    });

    rendererInstance.setPixelRatio(2);
    rendererInstance.setSize(clientWidth, clientHeight);
    rendererInstance.outputColorSpace = SRGBColorSpace;

    const cameraInstance = new PerspectiveCamera(
      36,
      clientWidth / clientHeight,
      0.1,
      100
    );
    cameraInstance.position.set(
      cameraPosition.x,
      cameraPosition.y,
      cameraPosition.z
    );

    const sceneInstance = new Scene();
    const modelGroupInstance = new Group();

    sceneInstance.add(modelGroupInstance);

    const ambientLight = new AmbientLight(0xffffff, 1.2);
    const keyLight = new DirectionalLight(0xffffff, 1.1);
    const fillLight = new DirectionalLight(0xffffff, 0.8);

    fillLight.position.set(-6, 2, 2);
    keyLight.position.set(0.5, 0, 0.866);

    lights.current = [ambientLight, keyLight, fillLight];
    lights.current.forEach(light => sceneInstance.add(light));

    const shadowGroupInstance = new Group();
    sceneInstance.add(shadowGroupInstance);
    shadowGroupInstance.position.set(0, 0, -0.8);
    shadowGroupInstance.rotateX(Math.PI / 2);

    const renderTargetSize = 512;
    const planeWidth = 8;
    const planeHeight = 8;
    const cameraHeight = 1.5;
    const shadowOpacity = 0.8;
    const shadowDarkness = 3;

    const renderTargetInstance = new WebGLRenderTarget(
      renderTargetSize,
      renderTargetSize
    );
    renderTargetInstance.texture.generateMipmaps = false;

    const renderTargetBlurInstance = new WebGLRenderTarget(
      renderTargetSize,
      renderTargetSize
    );
    renderTargetBlurInstance.texture.generateMipmaps = false;

    const planeGeometry = new PlaneGeometry(planeWidth, planeHeight);
    planeGeometry.rotateX(Math.PI / 2);

    const planeMaterial = new MeshBasicMaterial({
      map: renderTargetInstance.texture,
      opacity: shadowOpacity,
      transparent: true,
    });

    const planeMesh = new Mesh(planeGeometry, planeMaterial);
    planeMesh.scale.y = -1;
    shadowGroupInstance.add(planeMesh);

    const blurPlaneMesh = new Mesh<PlaneGeometry, ShaderMaterial>(
      planeGeometry,
      new ShaderMaterial()
    );
    blurPlaneMesh.visible = false;
    shadowGroupInstance.add(blurPlaneMesh);

    const fillMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0,
      transparent: true,
    });

    const fillPlaneMesh = new Mesh(planeGeometry, fillMaterial);
    fillPlaneMesh.rotateX(Math.PI);
    fillPlaneMesh.position.y -= 0.00001;
    shadowGroupInstance.add(fillPlaneMesh);

    const shadowCameraInstance = new OrthographicCamera(
      -planeWidth / 2,
      planeWidth / 2,
      planeHeight / 2,
      -planeHeight / 2,
      0,
      cameraHeight
    );
    shadowCameraInstance.rotation.x = Math.PI / 2;
    shadowGroupInstance.add(shadowCameraInstance);

    const depthMaterialInstance = new MeshDepthMaterial();
    const darknessUniforms = depthMaterialInstance.userData as typeof depthMaterialInstance.userData & {
      darkness?: IUniform<number>;
    };
    darknessUniforms.darkness = { value: shadowDarkness };
    depthMaterialInstance.onBeforeCompile = shader => {
      if (darknessUniforms.darkness) {
        shader.uniforms.darkness = darknessUniforms.darkness;
      }
      shader.fragmentShader = `
        uniform float darkness;
        ${shader.fragmentShader.replace(
          'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
          'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
        )}
      `;
    };
    depthMaterialInstance.depthTest = false;
    depthMaterialInstance.depthWrite = false;

    const horizontalBlurMaterialInstance = new ShaderMaterial(
      HorizontalBlurShader
    );
    horizontalBlurMaterialInstance.depthTest = false;

    const verticalBlurMaterialInstance = new ShaderMaterial(VerticalBlurShader);
    verticalBlurMaterialInstance.depthTest = false;

    renderer.current = rendererInstance;
    camera.current = cameraInstance;
    scene.current = sceneInstance;
    modelGroup.current = modelGroupInstance;
    shadowGroup.current = shadowGroupInstance;
    renderTarget.current = renderTargetInstance;
    renderTargetBlur.current = renderTargetBlurInstance;
    shadowCamera.current = shadowCameraInstance;
    depthMaterial.current = depthMaterialInstance;
    horizontalBlurMaterial.current = horizontalBlurMaterialInstance;
    verticalBlurMaterial.current = verticalBlurMaterialInstance;
    plane.current = planeMesh;
    blurPlane.current = blurPlaneMesh;
    fillPlane.current = fillPlaneMesh;

    const unsubscribeX = rotationX.on('change', renderFrame);
    const unsubscribeY = rotationY.on('change', renderFrame);

    return () => {
      renderTargetInstance.dispose();
      renderTargetBlurInstance.dispose();
      removeLights(lights.current);
      cleanScene(scene.current ?? undefined);
      if (renderer.current) {
        cleanRenderer(renderer.current);
      }

      unsubscribeX();
      unsubscribeY();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraPosition.x, cameraPosition.y, cameraPosition.z]);

  const blurShadow = useCallback((amount: number) => {
    const rendererInstance = renderer.current;
    const renderTargetInstance = renderTarget.current;
    const renderTargetBlurInstance = renderTargetBlur.current;
    const blurPlaneInstance = blurPlane.current;
    const horizontalMaterial = horizontalBlurMaterial.current;
    const verticalMaterial = verticalBlurMaterial.current;
    const shadowCameraInstance = shadowCamera.current;

    if (
      !rendererInstance ||
      !renderTargetInstance ||
      !renderTargetBlurInstance ||
      !blurPlaneInstance ||
      !horizontalMaterial ||
      !verticalMaterial ||
      !shadowCameraInstance
    ) {
      return;
    }

    blurPlaneInstance.visible = true;

    blurPlaneInstance.material = horizontalMaterial;

    const horizontalUniforms = horizontalMaterial.uniforms as BlurUniforms;
    const horizontalTextureUniform = horizontalUniforms.tDiffuse;
    if (isUniform(horizontalTextureUniform)) {
      horizontalTextureUniform.value = renderTargetInstance.texture;
    }
    const horizontalValueUniform = horizontalUniforms.h;
    if (isUniform(horizontalValueUniform)) {
      horizontalValueUniform.value = amount * (1 / 256);
    }

    rendererInstance.setRenderTarget(renderTargetBlurInstance);
    rendererInstance.render(blurPlaneInstance, shadowCameraInstance);

    blurPlaneInstance.material = verticalMaterial;

    const verticalUniforms = verticalMaterial.uniforms as BlurUniforms;
    const verticalTextureUniform = verticalUniforms.tDiffuse;
    if (isUniform(verticalTextureUniform)) {
      verticalTextureUniform.value = renderTargetBlurInstance.texture;
    }
    const verticalValueUniform = verticalUniforms.v;
    if (isUniform(verticalValueUniform)) {
      verticalValueUniform.value = amount * (1 / 256);
    }

    rendererInstance.setRenderTarget(renderTargetInstance);
    rendererInstance.render(blurPlaneInstance, shadowCameraInstance);

    blurPlaneInstance.visible = false;
  }, []);

  const renderFrame = useCallback(() => {
    const rendererInstance = renderer.current;
    const sceneInstance = scene.current;
    const cameraInstance = camera.current;
    const shadowCameraInstance = shadowCamera.current;
    const modelGroupInstance = modelGroup.current;
    const depthMaterialInstance = depthMaterial.current;
    const renderTargetInstance = renderTarget.current;

    if (
      !rendererInstance ||
      !sceneInstance ||
      !cameraInstance ||
      !shadowCameraInstance ||
      !modelGroupInstance ||
      !depthMaterialInstance ||
      !renderTargetInstance
    ) {
      return;
    }

    const initialBackground = sceneInstance.background;
    sceneInstance.background = null;
    sceneInstance.overrideMaterial = depthMaterialInstance;

    rendererInstance.setRenderTarget(renderTargetInstance);
    rendererInstance.render(sceneInstance, shadowCameraInstance);

    sceneInstance.overrideMaterial = null;

    const blurAmount = 5;
    blurShadow(blurAmount);
    blurShadow(blurAmount * 0.4);

    rendererInstance.setRenderTarget(null);
    sceneInstance.background = initialBackground;

    modelGroupInstance.rotation.x = rotationX.get();
    modelGroupInstance.rotation.y = rotationY.get();

    rendererInstance.render(sceneInstance, cameraInstance);
  }, [blurShadow, rotationX, rotationY]);

  useEffect(() => {
    const onMouseMove = throttle(event => {
      const { innerWidth, innerHeight } = window;

      const position = {
        x: (event.clientX - innerWidth / 2) / innerWidth,
        y: (event.clientY - innerHeight / 2) / innerHeight,
      };

      rotationY.set(position.x / 2);
      rotationX.set(position.y / 2);
    }, 100);

    if (isInViewport && !reduceMotion) {
      window.addEventListener('mousemove', onMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isInViewport, reduceMotion, rotationX, rotationY]);

  useEffect(() => {
    const handleResize = () => {
      const containerElement = container.current;
      const rendererInstance = renderer.current;
      const cameraInstance = camera.current;

      if (!containerElement || !rendererInstance || !cameraInstance) {
        return;
      }

      const { clientWidth, clientHeight } = containerElement;

      rendererInstance.setSize(clientWidth, clientHeight);
      cameraInstance.aspect = clientWidth / clientHeight;
      cameraInstance.updateProjectionMatrix();

      renderFrame();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [renderFrame]);

  return (
    <div
      className={classes(styles.model, className)}
      data-loaded={loaded}
      style={cssProps({ delay: numToMs(showDelay) }, style ?? {})}
      ref={container}
      role="img"
      aria-label={alt}
      {...rest}
    >
      <canvas className={styles.canvas} ref={canvas} />
      {models.map((model, index) => (
        <Device
          key={`${model.url}-${index}`}
          renderer={renderer}
          modelGroup={modelGroup}
          show={show}
          showDelay={showDelay}
          renderFrame={renderFrame}
          index={index}
          setLoaded={setLoaded}
          onLoad={onLoad}
          model={model}
        />
      ))}
    </div>
  );
};

interface DeviceProps {
  readonly renderer: MutableRefObject<WebGLRenderer | null>;
  readonly model: DeviceModelConfig;
  readonly modelGroup: MutableRefObject<Group | null>;
  readonly renderFrame: () => void;
  readonly index: number;
  readonly showDelay: number;
  readonly setLoaded: (value: boolean) => void;
  readonly onLoad?: () => void;
  readonly show: boolean;
}

interface LoadDeviceResult {
  loadFullResTexture: () => Promise<void>;
  playAnimation: () => AnimationPlaybackControls | void;
}

interface LoadDeviceState {
  start: () => Promise<LoadDeviceResult>;
}

const Device = ({
  renderer,
  model,
  modelGroup,
  renderFrame,
  index,
  showDelay,
  setLoaded,
  onLoad,
  show,
}: DeviceProps) => {
  const [loadDevice, setLoadDevice] = useState<LoadDeviceState | null>(null);
  const reduceMotion = useReducedMotion();
  const placeholderScreen = createRef<Mesh | null>();

  useEffect(() => {
    const applyScreenTexture = (texture: Texture, node: Mesh) => {
      const rendererInstance = renderer.current;
      if (!rendererInstance) {
        return;
      }

      texture.colorSpace = SRGBColorSpace;
      texture.flipY = false;
      texture.anisotropy = rendererInstance.capabilities.getMaxAnisotropy();
      texture.generateMipmaps = false;
      texture.needsUpdate = true;

      const material = getPrimaryMaterial(node);

      if (!material || !('map' in material)) {
        return;
      }

      const texturedMaterial = material as Material & {
        map: Texture | null;
        needsUpdate: boolean;
        color?: Color;
      };

      if (texturedMaterial.color) {
        texturedMaterial.color.set(0xffffff);
      }

      texturedMaterial.transparent = true;
      texturedMaterial.map = texture;
      texturedMaterial.needsUpdate = true;

      renderFrame();
    };

    const load = async (): Promise<LoadDeviceResult> => {
      const { texture, position, url } = model;
      const rendererInstance = renderer.current;
      const modelGroupInstance = modelGroup.current;

      if (!rendererInstance || !modelGroupInstance) {
        return {
          loadFullResTexture: () => Promise.resolve(),
          playAnimation: () => undefined,
        };
      }

      let loadFullResTexture: (() => Promise<void>) | undefined;
      let playAnimation: (() => AnimationPlaybackControls | void) | undefined;

      const [placeholder, gltf] = await Promise.all([
        textureLoader.loadAsync(texture.placeholder),
        modelLoader.loadAsync(url),
      ]);

      modelGroupInstance.add(gltf.scene);

      gltf.scene.traverse(node => {
        if (!isMeshObject(node)) {
          return;
        }

        const material = getPrimaryMaterial(node);

        if (material && 'color' in material) {
          (material as Material & { color: Color }).color.set(0x1f2025);
        }

        if (node.name === MeshType.Screen) {
          const screenMaterial = material;
          if (!screenMaterial) {
            return;
          }

          const screenClone = node.clone();
          const parent = node.parent;

          if (!screenClone || !parent) {
            return;
          }

          screenClone.material = screenMaterial.clone();
          parent.add(screenClone);
          screenClone.position.z += 0.001;

          const placeholderMaterial = getPrimaryMaterial(screenClone);

          if (!placeholderMaterial) {
            return;
          }

          placeholderMaterial.opacity = 1;
          placeholderScreen.current = screenClone;

          applyScreenTexture(placeholder, screenClone);

          loadFullResTexture = async () => {
            const image = await resolveSrcFromSrcSet({
              srcSet: texture.srcSet,
              sizes: texture.sizes,
            });
            const fullSize = await textureLoader.loadAsync(image);
            applyScreenTexture(fullSize, node);

            animate(1, 0, {
              onUpdate: value => {
                const screen = placeholderScreen.current;
                if (screen) {
                  const cloneMaterial = Array.isArray(screen.material)
                    ? screen.material[0]
                    : screen.material;

                  if (cloneMaterial) {
                    cloneMaterial.opacity = value;
                  }
                }

                renderFrame();
              },
            });
          };
        }
      });

      const targetPosition = new Vector3(
        position.x,
        position.y,
        position.z
      );

      if (reduceMotion) {
        gltf.scene.position.set(...targetPosition.toArray());
      }

      if (model.animation === ModelAnimationType.SpringUp) {
        playAnimation = () => {
          const frameNode = gltf.scene.children.find(
            (child): child is Mesh =>
              child.name === MeshType.Frame && isMeshObject(child)
          );

          if (!frameNode) {
            return undefined;
          }

          const startPosition = new Vector3(
            targetPosition.x,
            targetPosition.y - 1,
            targetPosition.z
          );

          gltf.scene.position.set(...startPosition.toArray());

          return animate(startPosition.y, targetPosition.y, {
            type: 'spring',
            delay: (300 * index + showDelay) / 1000,
            stiffness: 60,
            damping: 20,
            mass: 1,
            restSpeed: 0.0001,
            restDelta: 0.0001,
            onUpdate: value => {
              gltf.scene.position.y = value;
              renderFrame();
            },
          });
        };
      }

      if (model.animation === ModelAnimationType.LaptopOpen) {
        playAnimation = () => {
          const frameNode = gltf.scene.children.find(
            (child): child is Mesh =>
              child.name === MeshType.Frame && isMeshObject(child)
          );

          if (!frameNode) {
            return undefined;
          }

          const startRotation = new Vector3(MathUtils.degToRad(90), 0, 0);
          const endRotation = new Vector3(0, 0, 0);

          gltf.scene.position.set(...targetPosition.toArray());
          frameNode.rotation.set(...startRotation.toArray());

          return animate(startRotation.x, endRotation.x, {
            type: 'spring',
            delay: (300 * index + showDelay + 300) / 1000,
            stiffness: 80,
            damping: 20,
            restSpeed: 0.0001,
            restDelta: 0.0001,
            onUpdate: value => {
              frameNode.rotation.x = value;
              renderFrame();
            },
          });
        };
      }

        const defaultLoadFullResTexture = () => Promise.resolve();

        return {
          loadFullResTexture:
            loadFullResTexture ?? defaultLoadFullResTexture,
          playAnimation: playAnimation ?? (() => undefined),
        };
      };

    setLoadDevice({ start: load });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loadDevice || !show) {
      return;
    }

    let animation: AnimationPlaybackControls | undefined;

    const onModelLoad = async () => {
      const { loadFullResTexture, playAnimation } = await loadDevice.start();

      setLoaded(true);
      onLoad?.();

      if (!reduceMotion) {
        const result = playAnimation();
        if (result) {
          animation = result;
        }
      }

      await loadFullResTexture();

      if (reduceMotion) {
        renderFrame();
      }
    };

    startTransition(() => {
      void onModelLoad();
    });

    return () => {
      animation?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDevice, show]);
};

export default Model;
