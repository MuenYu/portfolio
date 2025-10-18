import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import { useReducedMotion, useSpring } from 'framer-motion';
import { useInViewport, useWindowSize } from '~/hooks';
import { startTransition, useEffect, useRef } from 'react';
import {
  AmbientLight,
  DirectionalLight,
  LinearSRGBColorSpace,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  UniformsUtils,
  WebGLRenderer,
} from 'three';
import type { Light, Shader } from 'three';
import { media } from '~/utils/style';
import { throttle } from '~/utils/throttle';
import { cleanRenderer, cleanScene, removeLights } from '~/utils/three';
import fragmentShader from './displacement-sphere-fragment.glsl?raw';
import vertexShader from './displacement-sphere-vertex.glsl?raw';
import styles from './displacement-sphere.module.css';

type DisplacementSphereProps = Omit<JSX.IntrinsicElements['canvas'], 'ref'>;

type SphereMesh = Mesh<SphereGeometry, MeshPhongMaterial> & {
  modifier: number;
};

const springConfig = {
  stiffness: 30,
  damping: 20,
  mass: 2,
};

export const DisplacementSphere = (props: DisplacementSphereProps) => {
  const { theme } = useTheme();
  const start = useRef<number>(Date.now());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderer = useRef<WebGLRenderer | null>(null);
  const camera = useRef<PerspectiveCamera | null>(null);
  const scene = useRef<Scene | null>(null);
  const lights = useRef<Light[]>([]);
  const uniforms = useRef<Shader['uniforms'] | null>(null);
  const material = useRef<MeshPhongMaterial | null>(null);
  const sphere = useRef<SphereMesh | null>(null);
  const reduceMotion = useReducedMotion();
  const isInViewport = useInViewport(canvasRef);
  const windowSize = useWindowSize();
  const rotationX = useSpring(0, springConfig);
  const rotationY = useSpring(0, springConfig);

  useEffect(() => {
    const { innerWidth, innerHeight } = window;
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rendererInstance = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    });

    renderer.current = rendererInstance;
    rendererInstance.setSize(innerWidth, innerHeight);
    rendererInstance.setPixelRatio(1);
    rendererInstance.outputColorSpace = LinearSRGBColorSpace;

    const cameraInstance = new PerspectiveCamera(
      54,
      innerWidth / innerHeight,
      0.1,
      100
    );

    camera.current = cameraInstance;
    cameraInstance.position.z = 52;

    const sceneInstance = new Scene();
    scene.current = sceneInstance;

    const materialInstance = new MeshPhongMaterial();
    material.current = materialInstance;
    materialInstance.onBeforeCompile = (shader: Shader) => {
      const mergedUniforms = UniformsUtils.merge([
        shader.uniforms,
        { time: { type: 'f', value: 0 } },
      ]) as Shader['uniforms'];

      uniforms.current = mergedUniforms;
      shader.uniforms = mergedUniforms;
      shader.vertexShader = vertexShader;
      shader.fragmentShader = fragmentShader;
    };

    startTransition(() => {
      const materialForSphere = material.current;

      if (!materialForSphere) {
        return;
      }

      const geometry = new SphereGeometry(32, 128, 128);

      const mesh = new Mesh(geometry, materialForSphere) as SphereMesh;
      mesh.position.z = 0;
      mesh.modifier = Math.random();

      sphere.current = mesh;
      sceneInstance.add(mesh);
    });

    return () => {
      cleanScene(scene.current ?? undefined);
      if (renderer.current) {
        cleanRenderer(renderer.current);
      }
    };
  }, []);

  useEffect(() => {
    const sceneInstance = scene.current;

    if (!sceneInstance) {
      return undefined;
    }

    const dirLight = new DirectionalLight(0xffffff, theme === 'light' ? 1.8 : 2.0);
    const ambientLight = new AmbientLight(0xffffff, theme === 'light' ? 2.7 : 0.4);

    dirLight.position.z = 200;
    dirLight.position.x = 100;
    dirLight.position.y = 100;

    lights.current = [dirLight, ambientLight];
    for (const light of lights.current) {
      sceneInstance.add(light);
    }

    return () => {
      removeLights(lights.current);
    };
  }, [theme]);

  useEffect(() => {
    const { width, height } = windowSize;

    const adjustedHeight = height + height * 0.3;
    const rendererInstance = renderer.current;
    const cameraInstance = camera.current;
    const sceneInstance = scene.current;
    const sphereInstance = sphere.current;

    if (!rendererInstance || !cameraInstance || !sceneInstance || !sphereInstance) {
      return;
    }

    rendererInstance.setSize(width, adjustedHeight);
    cameraInstance.aspect = width / adjustedHeight;
    cameraInstance.updateProjectionMatrix();

    // Render a single frame on resize when not animating
    if (reduceMotion) {
      rendererInstance.render(sceneInstance, cameraInstance);
    }

    if (width <= media.mobile) {
      sphereInstance.position.x = 14;
      sphereInstance.position.y = 10;
    } else if (width <= media.tablet) {
      sphereInstance.position.x = 18;
      sphereInstance.position.y = 14;
    } else {
      sphereInstance.position.x = 22;
      sphereInstance.position.y = 16;
    }
  }, [reduceMotion, windowSize]);

  useEffect(() => {
    const onMouseMove = throttle((event: MouseEvent) => {
      const position = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      };

      rotationX.set(position.y / 2);
      rotationY.set(position.x / 2);
    }, 100);

    if (!reduceMotion && isInViewport) {
      window.addEventListener('mousemove', onMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isInViewport, reduceMotion, rotationX, rotationY]);

  useEffect(() => {
    const rendererInstance = renderer.current;
    const sceneInstance = scene.current;
    const cameraInstance = camera.current;
    const sphereInstance = sphere.current;

    if (!rendererInstance || !sceneInstance || !cameraInstance || !sphereInstance) {
      return undefined;
    }

    let animation: number | undefined;

    const animate = () => {
      animation = requestAnimationFrame(animate);

      if (uniforms.current) {
        uniforms.current.time.value = 0.00005 * (Date.now() - start.current);
      }

      sphereInstance.rotation.z += 0.001;
      sphereInstance.rotation.x = rotationX.get();
      sphereInstance.rotation.y = rotationY.get();

      rendererInstance.render(sceneInstance, cameraInstance);
    };

    if (!reduceMotion && isInViewport) {
      animate();
    } else {
      rendererInstance.render(sceneInstance, cameraInstance);
    }

    return () => {
      if (animation !== undefined) {
        cancelAnimationFrame(animation);
      }
    };
  }, [isInViewport, reduceMotion, rotationX, rotationY]);

  return (
    <Transition in timeout={3000} nodeRef={canvasRef}>
      {({ visible, nodeRef }) => {
        const assignRefs = (node: HTMLCanvasElement | null) => {
          canvasRef.current = node;
          nodeRef.current = node;
        };

        return (
          <canvas
            aria-hidden
            className={styles.canvas}
            data-visible={visible}
            ref={assignRefs}
            {...props}
          />
        );
      }}
    </Transition>
  );
};
