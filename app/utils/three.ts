import { Cache, TextureLoader } from 'three';
import type { Light, Material, Object3D, Scene, WebGLRenderer } from 'three';
import { DRACOLoader, GLTFLoader } from 'three-stdlib';

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
export const cleanScene = (scene?: Scene): void => {
  scene?.traverse(object => {
    if (!('isMesh' in object) || !object.isMesh) return;

    object.geometry.dispose();

    const material = object.material;

    if (Array.isArray(material)) {
      for (const item of material) {
        cleanMaterial(item);
      }
    } else {
      cleanMaterial(material);
    }
  });
};

/**
 * Clean up and dispose of a material
 */
type DisposableMaterial = Material & {
  [key: string]: unknown;
};

export const cleanMaterial = (material: DisposableMaterial): void => {
  material.dispose();

  for (const key of Object.keys(material)) {
    const value = material[key];
    if (value && typeof value === 'object' && 'minFilter' in (value as Record<string, unknown>)) {
      const disposable = value as {
        dispose?: () => void;
        source?: { data?: { close?: () => void } };
      };

      disposable.dispose?.();

      // Close GLTF bitmap textures
      disposable.source?.data?.close?.();
    }
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
    light.parent?.remove(light);
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
