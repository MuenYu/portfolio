import { Cache, TextureLoader } from 'three';
import { DRACOLoader, GLTFLoader } from 'three-stdlib';

interface Disposable {
  dispose(): void;
}

interface Object3DLike {
  name: string;
  traverse(callback: (object: Object3DLike) => void): void;
  parent: Object3DLike | null;
  remove?(child: Object3DLike): void;
}

interface MeshLike extends Object3DLike {
  geometry: Disposable;
  material: MaterialLike | MaterialLike[];
  isMesh?: boolean;
}

interface SceneLike {
  traverse(callback: (object: Object3DLike) => void): void;
}

interface MaterialLike extends Disposable {
  [key: string]: unknown;
}

interface TextureLike {
  dispose?: () => void;
  source?: { data?: { close?: () => void } };
  minFilter?: unknown;
}

interface WebGLRendererLike {
  dispose(): void;
}

interface LightLike {
  parent: Object3DLike | null;
}

const isMeshObject = (object: Object3DLike): object is MeshLike =>
  Boolean((object as MeshLike).isMesh);

const isRemovableParent = (
  parent: Object3DLike | null
): parent is Object3DLike & { remove(child: Object3DLike): void } =>
  typeof parent?.remove === 'function';

const isDisposableMaterialProp = (value: unknown): value is TextureLike =>
  typeof value === 'object' &&
  value !== null &&
  'minFilter' in (value as Record<string, unknown>);

// Enable caching for all loaders
(Cache as unknown as { enabled: boolean }).enabled = true;

const dracoLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();
dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * GLTF model loader configured with draco decoder
 */
export const modelLoader = gltfLoader;
export const textureLoader = new TextureLoader();

/**
 * Clean up a scene's materials and geometry
 */
export const cleanScene = (scene?: SceneLike): void => {
  scene?.traverse(object => {
    if (!isMeshObject(object)) {
      return;
    }

    object.geometry.dispose();

    const { material } = object;

    if (Array.isArray(material)) {
      material.forEach(cleanMaterial);
      return;
    }

    cleanMaterial(material);
  });
};

/**
 * Clean up and dispose of a material
 */
export const cleanMaterial = (material: MaterialLike): void => {
  material.dispose();

  const entries = Object.entries(
    material as MaterialLike & Record<string, unknown>
  );

  for (const [, value] of entries) {
    if (!isDisposableMaterialProp(value)) continue;

    value.dispose?.();

    // Close GLTF bitmap textures
    value.source?.data?.close?.();
  }
};

/**
 * Clean up and dispose of a renderer
 */
export const cleanRenderer = (renderer: WebGLRendererLike): void => {
  renderer.dispose();
};

/**
 * Clean up lights by removing them from their parent
 */
export const removeLights = (lights: LightLike[]): void => {
  for (const light of lights) {
    if (isRemovableParent(light.parent)) {
      light.parent.remove(light);
    }
  }
};

/**
 * Get child by name
 */
export const getChild = <T extends Object3DLike = Object3DLike>(
  name: string,
  object: Object3DLike
): T | undefined => {
  let node: T | undefined;

  object.traverse(child => {
    if (child.name === name) {
      node = child as T;
    }
  });

  return node;
};
