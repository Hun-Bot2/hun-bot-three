/**
 * AssetLoader.ts
 * Central asset loading with caching and disposal
 * Constitution Principle III: Stability (retry logic, error handling)
 * Constitution Principle IV: Resource management
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ResourceDisposer } from '../utils/ResourceDisposer';

export interface LoadProgressEvent {
  url: string;
  loaded: number;
  total: number;
  progress: number; // 0-1
}

export class AssetLoader {
  private static instance: AssetLoader | null = null;
  
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private loadingManager: THREE.LoadingManager;
  
  private modelCache: Map<string, GLTF> = new Map();
  private textureCache: Map<string, THREE.Texture> = new Map();
  
  private onProgressCallback: ((event: LoadProgressEvent) => void) | null = null;
  private onLoadCallback: (() => void) | null = null;
  private onErrorCallback: ((url: string, error: Error) => void) | null = null;

  private constructor() {
    // Create loading manager with callbacks
    this.loadingManager = new THREE.LoadingManager();
    
    this.loadingManager.onProgress = (url, loaded, total) => {
      if (this.onProgressCallback) {
        this.onProgressCallback({
          url,
          loaded,
          total,
          progress: total > 0 ? loaded / total : 0,
        });
      }
    };

    this.loadingManager.onLoad = () => {
      if (this.onLoadCallback) {
        this.onLoadCallback();
      }
    };

    this.loadingManager.onError = (url) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(url, new Error(`Failed to load: ${url}`));
      }
    };

    // Create loaders
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  /**
   * Set progress callback
   */
  setOnProgress(callback: (event: LoadProgressEvent) => void): void {
    this.onProgressCallback = callback;
  }

  /**
   * Set load complete callback
   */
  setOnLoad(callback: () => void): void {
    this.onLoadCallback = callback;
  }

  /**
   * Set error callback
   */
  setOnError(callback: (url: string, error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Load GLTF model with caching and retry logic
   */
  async loadModel(url: string, maxRetries: number = 3): Promise<GLTF> {
    // Check cache first
    if (this.modelCache.has(url)) {
      return this.modelCache.get(url)!;
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const gltf = await new Promise<GLTF>((resolve, reject) => {
          this.gltfLoader.load(
            url,
            (gltf) => resolve(gltf),
            undefined,
            (error) => reject(error)
          );
        });

        // Cache the model
        this.modelCache.set(url, gltf);
        return gltf;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load model ${url} (attempt ${attempt + 1}/${maxRetries}):`, error);
        
        // Exponential backoff
        if (attempt < maxRetries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries failed
    const errorMessage = `Failed to load model ${url} after ${maxRetries} attempts`;
    if (this.onErrorCallback) {
      this.onErrorCallback(url, lastError || new Error(errorMessage));
    }
    throw new Error(errorMessage);
  }

  /**
   * Load texture with caching and retry logic
   */
  async loadTexture(url: string, maxRetries: number = 3): Promise<THREE.Texture> {
    // Check cache first
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url)!;
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const texture = await new Promise<THREE.Texture>((resolve, reject) => {
          this.textureLoader.load(
            url,
            (texture) => resolve(texture),
            undefined,
            (error) => reject(error)
          );
        });

        // Cache the texture
        this.textureCache.set(url, texture);
        return texture;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load texture ${url} (attempt ${attempt + 1}/${maxRetries}):`, error);
        
        // Exponential backoff
        if (attempt < maxRetries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries failed
    const errorMessage = `Failed to load texture ${url} after ${maxRetries} attempts`;
    if (this.onErrorCallback) {
      this.onErrorCallback(url, lastError || new Error(errorMessage));
    }
    throw new Error(errorMessage);
  }

  /**
   * Preload multiple assets
   */
  async preloadAssets(
    models: string[] = [],
    textures: string[] = []
  ): Promise<{ models: GLTF[]; textures: THREE.Texture[] }> {
    const [loadedModels, loadedTextures] = await Promise.all([
      Promise.all(models.map((url) => this.loadModel(url))),
      Promise.all(textures.map((url) => this.loadTexture(url))),
    ]);

    return {
      models: loadedModels,
      textures: loadedTextures,
    };
  }

  /**
   * Get cached model
   */
  getCachedModel(url: string): GLTF | undefined {
    return this.modelCache.get(url);
  }

  /**
   * Get cached texture
   */
  getCachedTexture(url: string): THREE.Texture | undefined {
    return this.textureCache.get(url);
  }

  /**
   * Clear cache and dispose resources
   */
  clearCache(): void {
    // Dispose models
    this.modelCache.forEach((gltf) => {
      ResourceDisposer.disposeObject3D(gltf.scene);
    });
    this.modelCache.clear();

    // Dispose textures
    this.textureCache.forEach((texture) => {
      ResourceDisposer.disposeTexture(texture);
    });
    this.textureCache.clear();
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): { models: number; textures: number; total: number } {
    return {
      models: this.modelCache.size,
      textures: this.textureCache.size,
      total: this.modelCache.size + this.textureCache.size,
    };
  }

  /**
   * Utility: delay for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Clean up and reset singleton
   */
  static dispose(): void {
    if (AssetLoader.instance) {
      AssetLoader.instance.clearCache();
      AssetLoader.instance = null;
    }
  }
}
