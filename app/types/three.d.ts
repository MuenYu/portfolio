declare module 'three' {
  export type ColorRepresentation = number | string;

  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
  }

  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
  }

  export class Euler {
    x: number;
    y: number;
    z: number;
  }

  export abstract class Object3D {
    name: string;
    parent: Object3D | null;
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
    traverse(callback: (object: Object3D) => void): void;
  }

  export class Scene extends Object3D {}

  export abstract class Material {
    dispose(): void;
  }

  export class MeshPhongMaterial extends Material {
    onBeforeCompile?: (shader: Shader) => void;
  }

  export class Geometry {
    dispose(): void;
  }

  export class SphereGeometry extends Geometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number);
  }

  export class Mesh<
    TGeometry extends Geometry = Geometry,
    TMaterial extends Material = Material
  > extends Object3D {
    constructor(geometry: TGeometry, material: TMaterial);
    geometry: TGeometry;
    material: TMaterial;
    rotation: Euler;
    position: Vector3;
  }

  export abstract class Camera extends Object3D {}

  export class PerspectiveCamera extends Camera {
    constructor(fov: number, aspect: number, near: number, far: number);
    aspect: number;
    position: Vector3;
    updateProjectionMatrix(): void;
  }

  export class AmbientLight extends Object3D {
    constructor(color?: ColorRepresentation, intensity?: number);
    position: Vector3;
  }

  export class DirectionalLight extends Object3D {
    constructor(color?: ColorRepresentation, intensity?: number);
    position: Vector3;
  }

  export interface IUniform {
    value: unknown;
    type?: string;
  }

  export interface Shader {
    uniforms: Record<string, IUniform>;
    vertexShader: string;
    fragmentShader: string;
  }

  export const UniformsUtils: {
    merge(uniforms: readonly Record<string, IUniform>[]): Record<string, IUniform>;
  };

  export const LinearSRGBColorSpace: unknown;

  export interface WebGLRendererParameters {
    canvas?: HTMLCanvasElement;
    antialias?: boolean;
    alpha?: boolean;
    powerPreference?: string;
    failIfMajorPerformanceCaveat?: boolean;
  }

  export class WebGLRenderer {
    constructor(parameters?: WebGLRendererParameters);
    outputColorSpace: unknown;
    setSize(width: number, height: number): void;
    setPixelRatio(value: number): void;
    render(scene: Scene, camera: Camera): void;
    dispose(): void;
  }

  export interface Texture {
    dispose(): void;
    source?: { data?: { close?: () => void } };
    minFilter?: unknown;
  }

  export class TextureLoader {
    loadAsync(url: string): Promise<Texture>;
  }
}
