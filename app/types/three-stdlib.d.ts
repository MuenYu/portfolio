declare module 'three-stdlib' {
  import type { Group, ShaderMaterialParameters, ShaderUniform } from 'three';

  export interface GLTF {
    scene: Group;
    animations: unknown[];
  }

  export class DRACOLoader {
    constructor(manager?: unknown);
    setDecoderPath(path: string): void;
  }

  export class GLTFLoader {
    constructor(manager?: unknown);
    setDRACOLoader(loader: DRACOLoader): void;
    loadAsync(url: string): Promise<GLTF>;
  }

  export interface ShaderDefinition extends ShaderMaterialParameters {
    uniforms: Record<string, ShaderUniform>;
    vertexShader: string;
    fragmentShader: string;
  }

  export const HorizontalBlurShader: ShaderDefinition;
  export const VerticalBlurShader: ShaderDefinition;
}
