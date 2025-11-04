/**
 * Scene.ts
 * Interface definition for all scene implementations
 * Constitution Principle IV: Composable Scene Architecture with lifecycle hooks
 */

import type * as THREE from 'three';

/**
 * Scene interface with lifecycle methods
 * All scene implementations must follow this contract
 */
export interface Scene {
  /**
   * Scene identifier (e.g., 'landing', 'about', 'projects', 'contact')
   */
  id: string;

  /**
   * Three.js Scene instance
   */
  scene: THREE.Scene;

  /**
   * Initialize scene resources (async)
   * - Load 3D models
   * - Create geometries and materials
   * - Set up initial state
   * 
   * This method is called once when the scene is first created
   */
  init(): Promise<void>;

  /**
   * Mount scene to renderer
   * - Add objects to scene
   * - Start animations
   * - Bind event listeners
   * 
   * This method is called when the scene becomes active
   */
  mount(): void;

  /**
   * Update scene per frame
   * - Animate objects
   * - Update particles
   * - Process input
   * 
   * @param delta Time since last frame in seconds
   * @param time Total elapsed time in seconds
   */
  update(delta: number, time: number): void;

  /**
   * Dispose scene resources
   * - Remove event listeners
   * - Dispose geometries and materials
   * - Clear object references
   * 
   * This method is called when transitioning away from the scene
   */
  dispose(): void;

  /**
   * Optional: Handle window resize
   * Override if scene needs custom resize behavior
   * 
   * @param width New window width
   * @param height New window height
   */
  onResize?(width: number, height: number): void;

  /**
   * Optional: Handle visibility change (tab hidden/visible)
   * Override if scene needs to pause/resume animations
   * 
   * @param visible Whether the tab is visible
   */
  onVisibilityChange?(visible: boolean): void;
}
