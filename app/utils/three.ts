import { Cache, TextureLoader, Mesh } from 'three';
import type {
  Material,
  Object3D,
  Scene,
  Texture,
  WebGLRenderer,
  Light,
} from 'three';
import { DRACOLoader, GLTFLoader } from 'three-stdlib';

const isMeshObject = (object: Object3D): object is Mesh => object instanceof Mesh;

const isRemovableParent = (
  parent: Object3D | null
): parent is Object3D & { remove(child: Object3D): void } =>
  typeof parent?.remove === 'function';

const isDisposableMaterialProp = (value: unknown): value is Texture =>
  typeof value === 'object' &&
  value !== null &&
  'isTexture' in (value as Record<string, unknown>);

// Enable caching for all loaders
Cache.enabled = true;

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
export const cleanScene = (scene?: Scene | null): void => {
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
export const cleanMaterial = (material: Material): void => {
  material.dispose();

  const entries = Object.entries(
    material as Material & Record<string, unknown>
  );

  for (const [, value] of entries) {
    if (!isDisposableMaterialProp(value)) continue;

    value.dispose();

    // Close GLTF bitmap textures
    const source = value.source as
      | { data?: { close?: () => void } }
      | undefined;
    source?.data?.close?.();
  }
};

/**
 * Clean up and dispose of a renderer
 */
export const cleanRenderer = (renderer: WebGLRenderer): void => {
  renderer.dispose();
};

/**
 * Clean up lights by removing them from their parent
 */
export const removeLights = (lights: Light[]): void => {
  for (const light of lights) {
    if (isRemovableParent(light.parent)) {
      light.parent.remove(light);
    }
  }
};

/**
 * Get child by name
 */
export const getChild = <T extends Object3D = Object3D>(
  name: string,
  object: Object3D
): T | undefined => {
  let node: T | undefined;

  object.traverse(child => {
    if (child.name === name) {
      node = child as T;
    }
  });

  return node;
};
