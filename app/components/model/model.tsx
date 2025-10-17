import { animate, useReducedMotion, useSpring } from 'framer-motion';
import type { AnimationPlaybackControls } from 'framer-motion';
import { useInViewport } from '~/hooks';
import type { Dispatch, HTMLAttributes, JSX, MutableRefObject, SetStateAction } from 'react';
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AmbientLight,
  Color,
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
} from 'three';
import type { Light, Material, Object3D, Texture } from 'three';
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

export type ModelPosition = {
  x: number;
  y: number;
  z: number;
};

export interface ModelTextureSource {
  placeholder: string;
  srcSet: string;
  sizes?: string;
}

export interface ModelInstance {
  url: string;
  width: number;
  height: number;
  position: ModelPosition;
  animation: ModelAnimation;
  texture: ModelTextureSource;
}

export interface ModelProps extends HTMLAttributes<HTMLDivElement> {
  models: ModelInstance[];
  show?: boolean;
  showDelay?: number;
  cameraPosition?: ModelPosition;
  onLoad?: () => void;
  alt: string;
}

const rotationSpringConfig = {
  stiffness: 40,
  damping: 20,
  mass: 1.4,
  restSpeed: 0.001,
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
}: ModelProps): JSX.Element => {
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
  const plane = useRef<Mesh | null>(null);
  const lights = useRef<Light[]>([]);
  const blurPlane = useRef<Mesh | null>(null);
  const fillPlane = useRef<Mesh | null>(null);
  const isInViewport = useInViewport(container, false, { threshold: 0.2 });
  const reduceMotion = useReducedMotion();
  const rotationX = useSpring(0, rotationSpringConfig);
  const rotationY = useSpring(0, rotationSpringConfig);

  useEffect(() => {
    const containerElement = container.current;
    const canvasElement = canvas.current;

    if (!containerElement || !canvasElement) {
      return undefined;
    }

    renderer.current = new WebGLRenderer({
      canvas: canvasElement,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    });

    renderer.current.setPixelRatio(2);
    renderer.current.setSize(containerElement.clientWidth, containerElement.clientHeight);
    renderer.current.outputColorSpace = SRGBColorSpace;

    camera.current = new PerspectiveCamera(
      36,
      containerElement.clientWidth / containerElement.clientHeight,
      0.1,
      100
    );
    camera.current.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    scene.current = new Scene();

    modelGroup.current = new Group();
    scene.current.add(modelGroup.current);

    // Lighting
    const ambientLight = new AmbientLight(0xffffff, 1.2);
    const keyLight = new DirectionalLight(0xffffff, 1.1);
    const fillLight = new DirectionalLight(0xffffff, 0.8);

    fillLight.position.set(-6, 2, 2);
    keyLight.position.set(0.5, 0, 0.866);
    lights.current = [ambientLight, keyLight, fillLight];
    lights.current.forEach(light => scene.current?.add(light));

    // The shadow container, if you need to move the plane just move this
    shadowGroup.current = new Group();
    scene.current.add(shadowGroup.current);
    shadowGroup.current.position.set(0, 0, -0.8);
    shadowGroup.current.rotateX(Math.PI / 2);

    const renderTargetSize = 512;
    const planeWidth = 8;
    const planeHeight = 8;
    const cameraHeight = 1.5;
    const shadowOpacity = 0.8;
    const shadowDarkness = 3;

    // The render target that will show the shadows in the plane texture
    renderTarget.current = new WebGLRenderTarget(renderTargetSize, renderTargetSize);
    renderTarget.current.texture.generateMipmaps = false;

    // The render target that we will use to blur the first render target
    renderTargetBlur.current = new WebGLRenderTarget(renderTargetSize, renderTargetSize);
    renderTargetBlur.current.texture.generateMipmaps = false;

    // Make a plane and make it face up
    const planeGeometry = new PlaneGeometry(planeWidth, planeHeight).rotateX(Math.PI / 2);

    const planeMaterial = new MeshBasicMaterial({
      map: renderTarget.current.texture,
      opacity: shadowOpacity,
      transparent: true,
    });

    plane.current = new Mesh(planeGeometry, planeMaterial);
    // The y from the texture is flipped!
    plane.current.scale.y = -1;
    shadowGroup.current.add(plane.current);

    // The plane onto which to blur the texture
    blurPlane.current = new Mesh(planeGeometry);
    blurPlane.current.visible = false;
    shadowGroup.current.add(blurPlane.current);

    // The plane with the color of the ground
    const fillMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0,
      transparent: true,
    });

    fillPlane.current = new Mesh(planeGeometry, fillMaterial);
    fillPlane.current.rotateX(Math.PI);
    fillPlane.current.position.y -= 0.00001;
    shadowGroup.current.add(fillPlane.current);

    // The camera to render the depth material from
    shadowCamera.current = new OrthographicCamera(
      -planeWidth / 2,
      planeWidth / 2,
      planeHeight / 2,
      -planeHeight / 2,
      0,
      cameraHeight
    );
    // Get the camera to look up
    shadowCamera.current.rotation.x = Math.PI / 2;
    shadowGroup.current.add(shadowCamera.current);

    // Like MeshDepthMaterial, but goes from black to transparent
    depthMaterial.current = new MeshDepthMaterial();
    depthMaterial.current.userData.darkness = { value: shadowDarkness };
    depthMaterial.current.onBeforeCompile = shader => {
      shader.uniforms.darkness = depthMaterial.current?.userData.darkness;
      shader.fragmentShader = `
        uniform float darkness;
        ${shader.fragmentShader.replace(
          'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
          'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
        )}
      `;
    };
    depthMaterial.current.depthTest = false;
    depthMaterial.current.depthWrite = false;

    horizontalBlurMaterial.current = new ShaderMaterial(HorizontalBlurShader);
    horizontalBlurMaterial.current.depthTest = false;

    verticalBlurMaterial.current = new ShaderMaterial(VerticalBlurShader);
    verticalBlurMaterial.current.depthTest = false;

    const unsubscribeX = rotationX.on('change', renderFrame);
    const unsubscribeY = rotationY.on('change', renderFrame);

    return () => {
      renderTarget.current?.dispose();
      renderTargetBlur.current?.dispose();
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

  type BlurUniforms = {
    tDiffuse: { value: Texture | null };
    h?: { value: number };
    v?: { value: number };
  };

  const blurShadow = useCallback((amount: number) => {
    if (
      !blurPlane.current ||
      !renderer.current ||
      !shadowCamera.current ||
      !renderTarget.current ||
      !renderTargetBlur.current ||
      !horizontalBlurMaterial.current ||
      !verticalBlurMaterial.current
    ) {
      return;
    }

    blurPlane.current.visible = true;

    // Blur horizontally and draw in the renderTargetBlur
    blurPlane.current.material = horizontalBlurMaterial.current;
    const horizontalUniforms = horizontalBlurMaterial.current
      .uniforms as unknown as BlurUniforms;
    horizontalUniforms.tDiffuse.value = renderTarget.current.texture;
    if (horizontalUniforms.h) {
      horizontalUniforms.h.value = amount * (1 / 256);
    }

    renderer.current.setRenderTarget(renderTargetBlur.current);
    renderer.current.render(blurPlane.current, shadowCamera.current);

    // Blur vertically and draw in the main renderTarget
    blurPlane.current.material = verticalBlurMaterial.current;
    const verticalUniforms = verticalBlurMaterial.current
      .uniforms as unknown as BlurUniforms;
    verticalUniforms.tDiffuse.value = renderTargetBlur.current.texture;
    if (verticalUniforms.v) {
      verticalUniforms.v.value = amount * (1 / 256);
    }

    renderer.current.setRenderTarget(renderTarget.current);
    renderer.current.render(blurPlane.current, shadowCamera.current);

    blurPlane.current.visible = false;
  }, []);

  // Handle render passes for a single frame
  const renderFrame = useCallback(() => {
    if (
      !scene.current ||
      !renderer.current ||
      !shadowCamera.current ||
      !renderTarget.current ||
      !modelGroup.current ||
      !depthMaterial.current ||
      !camera.current
    ) {
      return;
    }

    const blurAmount = 5;

    // Remove the background
    const initialBackground = scene.current.background;
    scene.current.background = null;

    // Force the depthMaterial to everything
    // cameraHelper.visible = false;
    scene.current.overrideMaterial = depthMaterial.current;

    // Render to the render target to get the depths
    renderer.current.setRenderTarget(renderTarget.current);
    renderer.current.render(scene.current, shadowCamera.current);

    // And reset the override material
    scene.current.overrideMaterial = null;

    blurShadow(blurAmount);

    // A second pass to reduce the artifacts
    // (0.4 is the minimum blur amout so that the artifacts are gone)
    blurShadow(blurAmount * 0.4);

    // Reset and render the normal scene
    renderer.current.setRenderTarget(null);
    scene.current.background = initialBackground ?? null;

    modelGroup.current.rotation.x = rotationX.get();
    modelGroup.current.rotation.y = rotationY.get();

    renderer.current.render(scene.current, camera.current);
  }, [blurShadow, rotationX, rotationY]);

  // Handle mouse move animation
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!container.current || !renderer.current || !camera.current) return;

      const { clientWidth, clientHeight } = container.current;

      renderer.current.setSize(clientWidth, clientHeight);
      camera.current.aspect = clientWidth / clientHeight;
      camera.current.updateProjectionMatrix();

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
      style={cssProps({ delay: numToMs(showDelay) }, style)}
      ref={container}
      role="img"
      aria-label={alt}
      {...rest}
    >
      <canvas className={styles.canvas} ref={canvas} />
      {models.map((model, index) => (
        <Device
          key={JSON.stringify(model.position)}
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

type DeviceLoader = {
  start: () => Promise<{
    loadFullResTexture: () => Promise<void>;
    playAnimation?: () => AnimationPlaybackControls | void;
  }>;
};

interface DeviceProps {
  renderer: MutableRefObject<WebGLRenderer | null>;
  model: ModelInstance;
  modelGroup: MutableRefObject<Group | null>;
  renderFrame: () => void;
  index: number;
  showDelay: number;
  setLoaded: Dispatch<SetStateAction<boolean>>;
  onLoad?: () => void;
  show: boolean;
}

type TexturedMaterial = Material & {
  color: Color;
  transparent: boolean;
  opacity: number;
  map: Texture | null;
  clone: () => Material;
};

const isMesh = (object: Object3D): object is Mesh => {
  return 'isMesh' in object && (object as Mesh).isMesh === true;
};

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
}: DeviceProps): JSX.Element => {
  const [loadDevice, setLoadDevice] = useState<DeviceLoader | null>(null);
  const reduceMotion = useReducedMotion();
  const placeholderScreen = useRef<Mesh | null>(null);

  useEffect(() => {
    const applyScreenTexture = async (texture: Texture, node: Mesh) => {
      const rendererInstance = renderer.current;
      if (!rendererInstance) return;

      texture.colorSpace = SRGBColorSpace;
      texture.flipY = false;
      texture.anisotropy = rendererInstance.capabilities.getMaxAnisotropy();
      texture.generateMipmaps = false;

      // Decode the texture to prevent jank on first render
      await rendererInstance.initTexture(texture);

      const material = node.material as TexturedMaterial;
      material.color = new Color(0xffffff);
      material.transparent = true;
      material.map = texture;
    };

    // Generate promises to await when ready
    const load = async () => {
      const { texture, position, url } = model;
      let loadFullResTexture;
      let playAnimation;

      const [placeholder, gltf] = await Promise.all([
        textureLoader.loadAsync(texture.placeholder),
        modelLoader.loadAsync(url),
      ]);

      modelGroup.current?.add(gltf.scene);

      gltf.scene.traverse(async node => {
        if (!isMesh(node)) return;

        const mesh = node;
        const meshMaterial = mesh.material as TexturedMaterial;
        meshMaterial.color = new Color(0x1f2025);

        if (mesh.name === MeshType.Screen) {
          // Create a copy of the screen mesh so we can fade it out
          // over the full resolution screen texture
          placeholderScreen.current = mesh.clone();
          const placeholderMaterial = meshMaterial.clone() as TexturedMaterial;
          placeholderScreen.current.material = placeholderMaterial;
          mesh.parent?.add(placeholderScreen.current);
          placeholderMaterial.opacity = 1;
          placeholderScreen.current.position.z += 0.001;

          await applyScreenTexture(placeholder, placeholderScreen.current);

          loadFullResTexture = async () => {
            const image = await resolveSrcFromSrcSet({
              srcSet: texture.srcSet,
              sizes: texture.sizes,
            });
            const fullSize = await textureLoader.loadAsync(image);
            await applyScreenTexture(fullSize, mesh);

            animate(1, 0, {
              onUpdate: value => {
                if (placeholderScreen.current) {
                  (placeholderScreen.current.material as TexturedMaterial).opacity = value;
                }
                renderFrame();
              },
            });
          };
        }
      });

      const targetPosition = new Vector3(position.x, position.y, position.z);

      if (reduceMotion) {
        gltf.scene.position.set(...targetPosition.toArray());
      }

      // Simple slide up animation
      if (model.animation === ModelAnimationType.SpringUp) {
        playAnimation = () => {
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

      // Swing the laptop lid open
      if (model.animation === ModelAnimationType.LaptopOpen) {
        playAnimation = () => {
          const frameNode = gltf.scene.children.find(
            node => node.name === MeshType.Frame
          );
          if (!frameNode || !isMesh(frameNode)) return;
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

      return { loadFullResTexture, playAnimation };
    };

    setLoadDevice({ start: load });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loadDevice || !show) return;
    let animation: AnimationPlaybackControls | void;

    const onModelLoad = async () => {
      const { loadFullResTexture, playAnimation } = await loadDevice.start();

      setLoaded(true);
      onLoad?.();

      if (!reduceMotion) {
        animation = playAnimation?.();
      }

      await loadFullResTexture();

      if (reduceMotion) {
        renderFrame();
      }
    };

    startTransition(() => {
      onModelLoad();
    });

    return () => {
      animation?.stop?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDevice, show]);
  return null;
};

export default Model;
