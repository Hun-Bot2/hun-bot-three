/**
 * ResourceDisposer.ts
 * Utility for proper cleanup of Three.js resources
 * Constitution Principle III: Stability, Readability, Safe Interactions
 * Constitution Principle IV: Composable Scene Architecture (disposal lifecycle)
 */

import type * as THREE from 'three';

export class ResourceDisposer {
  /**
   * Dispose of a geometry and free GPU memory
   */
  static disposeGeometry(geometry: THREE.BufferGeometry | null | undefined): void {
    if (!geometry) return;
    
    try {
      geometry.dispose();
    } catch (error) {
      console.error('Error disposing geometry:', error);
    }
  }

  /**
   * Dispose of a material and free GPU memory
   * Handles both single materials and material arrays
   */
  static disposeMaterial(
    material: THREE.Material | THREE.Material[] | null | undefined
  ): void {
    if (!material) return;

    const materials = Array.isArray(material) ? material : [material];

    materials.forEach((mat) => {
      try {
        // Dispose of textures used by the material
        Object.keys(mat).forEach((key) => {
          const value = (mat as any)[key];
          if (value && typeof value === 'object' && 'isTexture' in value) {
            this.disposeTexture(value);
          }
        });

        // Dispose of the material itself
        mat.dispose();
      } catch (error) {
        console.error('Error disposing material:', error);
      }
    });
  }

  /**
   * Dispose of a texture and free GPU memory
   */
  static disposeTexture(texture: THREE.Texture | null | undefined): void {
    if (!texture) return;

    try {
      texture.dispose();
    } catch (error) {
      console.error('Error disposing texture:', error);
    }
  }

  /**
   * Dispose of a mesh (geometry + material)
   */
  static disposeMesh(mesh: THREE.Mesh | null | undefined): void {
    if (!mesh) return;

    try {
      this.disposeGeometry(mesh.geometry);
      this.disposeMaterial(mesh.material);
    } catch (error) {
      console.error('Error disposing mesh:', error);
    }
  }

  /**
   * Dispose of an Object3D and all its children recursively
   */
  static disposeObject3D(object: THREE.Object3D | null | undefined): void {
    if (!object) return;

    try {
      // Recursively dispose children first
      const children = [...object.children]; // Copy array to avoid modification during iteration
      children.forEach((child) => this.disposeObject3D(child));

      // Dispose of this object's resources
      if ('geometry' in object) {
        this.disposeGeometry((object as any).geometry);
      }
      if ('material' in object) {
        this.disposeMaterial((object as any).material);
      }

      // Remove from parent
      object.removeFromParent();
    } catch (error) {
      console.error('Error disposing Object3D:', error);
    }
  }

  /**
   * Dispose of a scene and all its contents
   */
  static disposeScene(scene: THREE.Scene | null | undefined): void {
    if (!scene) return;

    try {
      // Dispose all children
      const children = [...scene.children];
      children.forEach((child) => this.disposeObject3D(child));

      // Clear the scene
      scene.clear();
    } catch (error) {
      console.error('Error disposing scene:', error);
    }
  }

  /**
   * Dispose of a render target
   */
  static disposeRenderTarget(renderTarget: THREE.WebGLRenderTarget | null | undefined): void {
    if (!renderTarget) return;

    try {
      renderTarget.dispose();
    } catch (error) {
      console.error('Error disposing render target:', error);
    }
  }

  /**
   * Batch dispose multiple resources
   */
  static disposeAll(...resources: Array<any>): void {
    resources.forEach((resource) => {
      if (!resource) return;

      if ('isScene' in resource) {
        this.disposeScene(resource);
      } else if ('isMesh' in resource) {
        this.disposeMesh(resource);
      } else if ('isObject3D' in resource) {
        this.disposeObject3D(resource);
      } else if ('isGeometry' in resource || 'isBufferGeometry' in resource) {
        this.disposeGeometry(resource);
      } else if ('isMaterial' in resource) {
        this.disposeMaterial(resource);
      } else if ('isTexture' in resource) {
        this.disposeTexture(resource);
      } else if ('isWebGLRenderTarget' in resource) {
        this.disposeRenderTarget(resource);
      }
    });
  }
}
