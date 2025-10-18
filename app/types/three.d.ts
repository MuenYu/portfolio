declare module 'three' {
  type ColorRepresentation = number | string;

  interface Vector3Like {
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
  }

  type EulerLike = Vector3Like;

  class Object3D {
    name: string;
    position: Vector3Like;
    rotation: EulerLike;
    scale: Vector3Like;
    parent: Object3D | null;
    visible: boolean;
    children: Object3D[];
    userData: Record<string, unknown>;
    add(...object: Object3D[]): this;
    remove(...object: Object3D[]): this;
    traverse(callback: (object: Object3D) => void | Promise<void>): void;
    clone(): this;
    rotateX(angle: number): this;
  }

  export class Color {
    constructor(color?: ColorRepresentation);
    set(color: ColorRepresentation): this;
  }

  export const LinearFilter: number;
  export const LinearSRGBColorSpace: string;
  export const SRGBColorSpace: string;

  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    set(x: number, y: number): this;
  }

  export class Vector3 implements Vector3Like {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    toArray(): [number, number, number];
    clone(): Vector3;
  }

  export const MathUtils: {
    degToRad(degrees: number): number;
  };

  export class Material {
    transparent: boolean;
    opacity: number;
    map: Texture | null;
    depthTest: boolean;
    depthWrite: boolean;
    color: Color | ColorRepresentation;
    dispose(): void;
    clone(): this;
    onBeforeCompile?(shader: Shader): void;
  }

  export class MeshBasicMaterial extends Material {
    constructor(parameters?: {
      color?: ColorRepresentation;
      map?: Texture;
      opacity?: number;
      transparent?: boolean;
    });
  }

  export class MeshDepthMaterial extends Material {
    constructor(parameters?: Record<string, unknown>);
    userData: Record<string, unknown>;
  }

  export interface ShaderUniform<TValue = unknown> {
    type?: string;
    value: TValue;
    [key: string]: unknown;
  }

  export interface ShaderMaterialParameters {
    uniforms?: Record<string, ShaderUniform>;
    vertexShader?: string;
    fragmentShader?: string;
    transparent?: boolean;
    opacity?: number;
  }

  export interface Shader {
    uniforms: Record<string, ShaderUniform>;
    vertexShader: string;
    fragmentShader: string;
  }

  export class ShaderMaterial extends Material {
    constructor(parameters?: ShaderMaterialParameters);
    uniforms: Record<string, ShaderUniform>;
  }

  export class MeshPhongMaterial extends Material {
    constructor(parameters?: Record<string, unknown>);
  }

  export class BufferGeometry {
    dispose(): void;
    rotateX(angle: number): this;
  }

  export class PlaneGeometry extends BufferGeometry {
    constructor(width: number, height: number, widthSegments?: number, heightSegments?: number);
  }

  export class SphereGeometry extends BufferGeometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number);
  }

  export class Mesh<
    TGeometry = BufferGeometry,
    TMaterial = Material | Material[]
  > extends Object3D {
    constructor(geometry?: TGeometry, material?: TMaterial);
    geometry: TGeometry;
    material: TMaterial;
    readonly isMesh?: boolean;
    clone(): this;
  }

  export class Group extends Object3D {}

  export class Camera extends Object3D {}

  export class OrthographicCamera extends Camera {
    constructor(
      left: number,
      right: number,
      top: number,
      bottom: number,
      near?: number,
      far?: number
    );
  }

  export class PerspectiveCamera extends Camera {
    constructor(fov: number, aspect: number, near?: number, far?: number);
    aspect: number;
    updateProjectionMatrix(): void;
  }

  export class Scene extends Object3D {
    background: Color | null;
    overrideMaterial: Material | null;
  }

  export class Texture {
    anisotropy: number;
    colorSpace: string;
    magFilter: number;
    minFilter: number;
    generateMipmaps: boolean;
    flipY: boolean;
  }

  export class WebGLRenderTarget {
    constructor(width: number, height: number);
    readonly texture: Texture;
    dispose(): void;
  }

  export class WebGLRenderer {
    constructor(parameters?: {
      canvas?: HTMLCanvasElement;
      antialias?: boolean;
      alpha?: boolean;
      powerPreference?: string;
      failIfMajorPerformanceCaveat?: boolean;
    });
    readonly domElement: HTMLCanvasElement;
    readonly capabilities: { getMaxAnisotropy(): number };
    outputColorSpace: string;
    setPixelRatio(value: number): void;
    setClearColor(color: ColorRepresentation, alpha?: number): void;
    setSize(width: number, height: number): void;
    render(object: Object3D, camera: Camera): void;
    setRenderTarget(target: WebGLRenderTarget | null): void;
    initTexture(texture: Texture): Promise<void> | void;
    dispose(): void;
  }

  export class Light extends Object3D {
    intensity: number;
    color: Color | ColorRepresentation;
  }

  export class AmbientLight extends Light {
    constructor(color?: ColorRepresentation, intensity?: number);
  }

  export class DirectionalLight extends Light {
    constructor(color?: ColorRepresentation, intensity?: number);
  }

  export const Cache: Record<string, unknown>;

  export class TextureLoader {
    loadAsync(url: string): Promise<Texture>;
  }

  export const UniformsUtils: {
    merge(uniforms: Record<string, ShaderUniform>[]): Record<string, ShaderUniform>;
  };
}
