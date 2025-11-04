/**
 * CameraController.ts
 * Camera position management and GSAP transitions
 * Constitution Principle II: Smooth Performance & Motion Quality (500-800ms transitions)
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { ReducedMotion } from '../utils/ReducedMotion';

export interface CameraTransitionOptions {
  duration?: number; // seconds (default: 0.6s, constitution: 0.5-0.8s)
  ease?: string; // GSAP easing (default: 'power2.inOut')
  onStart?: () => void;
  onUpdate?: () => void;
  onComplete?: () => void;
}

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  // Timeline and Tween both extend gsap.core.Animation — use the common base type
  private activeTween: gsap.core.Animation | null = null;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  /**
   * Smoothly transition camera to new position and target
   */
  transitionTo(
    position: THREE.Vector3,
    target: THREE.Vector3,
    options: CameraTransitionOptions = {}
  ): Promise<void> {
    // Cancel existing transition
    if (this.activeTween) {
      this.activeTween.kill();
      this.activeTween = null;
    }

    const {
      duration = 0.6,
      ease = 'power2.inOut',
      onStart,
      onUpdate,
      onComplete,
    } = options;

    // Apply reduced motion preference
    const adjustedDuration = ReducedMotion.getAdjustedDuration(duration, 0.01);

    return new Promise((resolve) => {
      // Create timeline for parallel position and lookAt transitions
      const timeline = gsap.timeline({
        onStart: () => {
          onStart?.();
        },
        onUpdate: () => {
          onUpdate?.();
        },
        onComplete: () => {
          this.activeTween = null;
          onComplete?.();
          resolve();
        },
      });

      // Animate camera position
      timeline.to(
        this.camera.position,
        {
          x: position.x,
          y: position.y,
          z: position.z,
          duration: adjustedDuration,
          ease,
        },
        0
      );

      // Animate camera lookAt (using a temporary target object)
      const tempTarget = { x: 0, y: 0, z: 0 };
      this.camera.getWorldDirection(tempTarget as any);
      
      timeline.to(
        tempTarget,
        {
          x: target.x,
          y: target.y,
          z: target.z,
          duration: adjustedDuration,
          ease,
          onUpdate: () => {
            this.camera.lookAt(tempTarget.x, tempTarget.y, tempTarget.z);
          },
        },
        0
      );

      this.activeTween = timeline;
    });
  }

  /**
   * Immediately set camera position and target (no animation)
   */
  setPosition(position: THREE.Vector3, target?: THREE.Vector3): void {
    // Cancel any active transition
    if (this.activeTween) {
      this.activeTween.kill();
      this.activeTween = null;
    }

    this.camera.position.copy(position);
    
    if (target) {
      this.camera.lookAt(target);
    }
  }

  /**
   * Get current camera position
   */
  getPosition(): THREE.Vector3 {
    return this.camera.position.clone();
  }

  /**
   * Get current camera target (lookAt direction)
   */
  getTarget(): THREE.Vector3 {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction;
  }

  /**
   * Check if camera is currently transitioning
   */
  isTransitioning(): boolean {
    return this.activeTween !== null && this.activeTween.isActive();
  }

  /**
   * Cancel current transition
   */
  cancelTransition(): void {
    if (this.activeTween) {
      this.activeTween.kill();
      this.activeTween = null;
    }
  }

  /**
   * Apply parallax offset based on pointer position
   * For subtle camera movement in response to mouse
   */
  applyParallax(
    pointerX: number,
    pointerY: number,
    strength: number = 0.02
  ): void {
    // Only apply if not transitioning
    if (this.isTransitioning()) return;

    const offsetX = pointerX * strength;
    const offsetY = pointerY * strength;

    // Smoothly interpolate to target offset
    gsap.to(this.camera.position, {
      x: `+=${offsetX}`,
      y: `+=${offsetY}`,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }

  /**
   * Update camera aspect ratio (call on window resize)
   */
  updateAspect(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.cancelTransition();
  }
}
