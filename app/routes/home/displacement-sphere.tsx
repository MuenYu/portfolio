import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import { useReducedMotion, useSpring } from 'framer-motion';
import { useInViewport, useWindowSize } from '~/hooks';
import { startTransition, useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
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
  type WebGLProgramParametersWithUniforms,
  type IUniform,
} from 'three';
import { media } from '~/utils/style';
import { throttle } from '~/utils/throttle';
import { cleanRenderer, cleanScene, removeLights } from '~/utils/three';
import fragmentShader from './displacement-sphere-fragment.glsl?raw';
import vertexShader from './displacement-sphere-vertex.glsl?raw';
import styles from './displacement-sphere.module.css';

type ShaderUniforms = Record<string, IUniform>;

type DisplacementSphereMesh = Mesh<SphereGeometry, MeshPhongMaterial> & {
  modifier?: number;
};

const springConfig = {
  stiffness: 30,
  damping: 20,
  mass: 2,
};

export const DisplacementSphere = (
  props: ComponentPropsWithoutRef<'canvas'>
): JSX.Element => {
  const { theme } = useTheme();
  const start = useRef<number>(Date.now());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderer = useRef<WebGLRenderer | null>(null);
  const camera = useRef<PerspectiveCamera | null>(null);
  const scene = useRef<Scene | null>(null);
  const lights = useRef<(AmbientLight | DirectionalLight)[]>([]);
  const uniforms = useRef<ShaderUniforms | null>(null);
  const material = useRef<MeshPhongMaterial | null>(null);
  const geometry = useRef<SphereGeometry | null>(null);
  const sphere = useRef<DisplacementSphereMesh | null>(null);
  const reduceMotion = useReducedMotion();
  const isInViewport = useInViewport(canvasRef);
  const windowSize = useWindowSize();
  const rotationX = useSpring(0, springConfig);
  const rotationY = useSpring(0, springConfig);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const { innerWidth, innerHeight } = window;
    const rendererInstance = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    });
    rendererInstance.setSize(innerWidth, innerHeight);
    rendererInstance.setPixelRatio(1);
    rendererInstance.outputColorSpace = LinearSRGBColorSpace;
    renderer.current = rendererInstance;

    const cameraInstance = new PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 100);
    cameraInstance.position.z = 52;
    camera.current = cameraInstance;

    const sceneInstance = new Scene();
    scene.current = sceneInstance;

    const materialInstance = new MeshPhongMaterial();
    materialInstance.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
      uniforms.current = UniformsUtils.merge([
        shader.uniforms,
        { time: { value: 0 } },
      ]) as ShaderUniforms;

      shader.uniforms = uniforms.current;
      shader.vertexShader = vertexShader;
      shader.fragmentShader = fragmentShader;
    };
    material.current = materialInstance;

    startTransition(() => {
      const geometryInstance = new SphereGeometry(32, 128, 128);
      geometry.current = geometryInstance;

      const sphereMesh = new Mesh<SphereGeometry, MeshPhongMaterial>(
        geometryInstance,
        materialInstance
      );
      const displacementSphere = sphereMesh as DisplacementSphereMesh;
      displacementSphere.position.z = 0;
      displacementSphere.modifier = Math.random();
      sphere.current = displacementSphere;
      sceneInstance.add(displacementSphere);
    });

    return () => {
      cleanScene(sceneInstance);
      cleanRenderer(rendererInstance);
    };
  }, []);

  useEffect(() => {
    const sceneInstance = scene.current;
    if (!sceneInstance) {
      return;
    }

    const dirLight = new DirectionalLight(0xffffff, theme === 'light' ? 1.8 : 2.0);
    const ambientLight = new AmbientLight(0xffffff, theme === 'light' ? 2.7 : 0.4);

    dirLight.position.z = 200;
    dirLight.position.x = 100;
    dirLight.position.y = 100;

    lights.current = [dirLight, ambientLight];
    lights.current.forEach(light => sceneInstance.add(light));

    return () => {
      removeLights(lights.current);
    };
  }, [theme]);

  useEffect(() => {
    const rendererInstance = renderer.current;
    const cameraInstance = camera.current;
    const sphereMesh = sphere.current;
    const sceneInstance = scene.current;

    if (!rendererInstance || !cameraInstance || !sphereMesh || !sceneInstance) {
      return;
    }

    const { width, height } = windowSize;

    const adjustedHeight = height + height * 0.3;
    rendererInstance.setSize(width, adjustedHeight);
    cameraInstance.aspect = width / adjustedHeight;
    cameraInstance.updateProjectionMatrix();

    // Render a single frame on resize when not animating
    if (reduceMotion) {
      rendererInstance.render(sceneInstance, cameraInstance);
    }

    if (width <= media.mobile) {
      sphereMesh.position.x = 14;
      sphereMesh.position.y = 10;
    } else if (width <= media.tablet) {
      sphereMesh.position.x = 18;
      sphereMesh.position.y = 14;
    } else {
      sphereMesh.position.x = 22;
      sphereMesh.position.y = 16;
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
    const cameraInstance = camera.current;
    const sceneInstance = scene.current;
    const sphereMesh = sphere.current;

    if (!rendererInstance || !cameraInstance || !sceneInstance || !sphereMesh) {
      return;
    }

    let animation: number | undefined;

    const animate = () => {
      animation = requestAnimationFrame(animate);

      const uniformsMap = uniforms.current;
      const timeUniform = uniformsMap?.time;

      if (timeUniform && typeof timeUniform.value === 'number') {
        timeUniform.value = 0.00005 * (Date.now() - start.current);
      }

      sphereMesh.rotation.z += 0.001;
      sphereMesh.rotation.x = rotationX.get();
      sphereMesh.rotation.y = rotationY.get();

      rendererInstance.render(sceneInstance, cameraInstance);
    };

    if (!reduceMotion && isInViewport) {
      animate();
    } else {
      rendererInstance.render(sceneInstance, cameraInstance);
    }

    return () => {
      cancelAnimationFrame(animation);
    };
  }, [isInViewport, reduceMotion, rotationX, rotationY]);

  return (
    <Transition in timeout={3000} nodeRef={canvasRef}>
      {({ visible, nodeRef }) => (
        <canvas
          aria-hidden
          className={styles['canvas']}
          data-visible={visible}
          ref={nodeRef}
          {...props}
        />
      )}
    </Transition>
  );
};
