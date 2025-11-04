/**
 * InputHandler.ts
 * Unified input handling for pointer, keyboard, scroll, and touch events
 * Constitution Principle V: Accessibility & Input Gracefulness
 */

import * as THREE from 'three';

export interface PointerState {
  x: number; // Normalized device coordinates (-1 to 1)
  y: number;
  deltaX: number;
  deltaY: number;
  isDown: boolean;
}

export interface KeyboardState {
  keysPressed: Set<string>;
  lastKey: string | null;
}

export class InputHandler {
  private canvas: HTMLCanvasElement;
  private pointer: PointerState = {
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    isDown: false,
  };
  
  private keyboard: KeyboardState = {
    keysPressed: new Set(),
    lastKey: null,
  };

  private scrollDelta: number = 0;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  
  private boundHandlers: Map<string, EventListener> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  /**
   * Setup all event listeners
   */
  private setupEventListeners(): void {
    // Pointer events
    this.addListener('pointermove', this.handlePointerMove);
    this.addListener('pointerdown', this.handlePointerDown);
    this.addListener('pointerup', this.handlePointerUp);
    this.addListener('pointerleave', this.handlePointerLeave);
    
    // Keyboard events
    this.addListener('keydown', this.handleKeyDown, window);
    this.addListener('keyup', this.handleKeyUp, window);
    
    // Scroll events
    this.addListener('wheel', this.handleWheel, { passive: false });
    
    // Touch events for mobile (passive: false allows preventDefault)
    this.addListener('touchstart', this.handleTouchStart, { passive: false });
    this.addListener('touchmove', this.handleTouchMove, { passive: false });
    this.addListener('touchend', this.handleTouchEnd);
  }

  /**
   * Add event listener and store reference for cleanup
   */
  private addListener(
    event: string,
    handler: EventListener,
    target: EventTarget | AddEventListenerOptions = this.canvas,
    options?: AddEventListenerOptions
  ): void {
    const eventTarget = target instanceof EventTarget ? target : this.canvas;
    const eventOptions = target instanceof EventTarget ? options : (target as AddEventListenerOptions);
    
    const boundHandler = handler.bind(this);
    this.boundHandlers.set(event, boundHandler);
    eventTarget.addEventListener(event, boundHandler, eventOptions);
  }

  /**
   * Handle pointer move
   */
  private handlePointerMove = (event: Event): void => {
    const e = event as PointerEvent;
    const rect = this.canvas.getBoundingClientRect();
    
    const prevX = this.pointer.x;
    const prevY = this.pointer.y;
    
    // Convert to normalized device coordinates (-1 to 1)
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Calculate delta
    this.pointer.deltaX = this.pointer.x - prevX;
    this.pointer.deltaY = this.pointer.y - prevY;
  };

  /**
   * Handle pointer down
   */
  private handlePointerDown = (): void => {
    this.pointer.isDown = true;
  };

  /**
   * Handle pointer up
   */
  private handlePointerUp = (): void => {
    this.pointer.isDown = false;
  };

  /**
   * Handle pointer leave
   */
  private handlePointerLeave = (): void => {
    this.pointer.isDown = false;
  };

  /**
   * Handle key down
   */
  private handleKeyDown = (event: Event): void => {
    const e = event as KeyboardEvent;
    this.keyboard.keysPressed.add(e.key.toLowerCase());
    this.keyboard.lastKey = e.key.toLowerCase();
  };

  /**
   * Handle key up
   */
  private handleKeyUp = (event: Event): void => {
    const e = event as KeyboardEvent;
    this.keyboard.keysPressed.delete(e.key.toLowerCase());
  };

  /**
   * Handle mouse wheel
   */
  private handleWheel = (event: Event): void => {
    const e = event as WheelEvent;
    e.preventDefault();
    this.scrollDelta += e.deltaY;
  };

  /**
   * Handle touch start
   */
  private handleTouchStart = (event: Event): void => {
    const e = event as TouchEvent;
    e.preventDefault();
    
    if (e.touches.length > 0) {
      const touch = e.touches[0]!;
      const rect = this.canvas.getBoundingClientRect();
      
      this.pointer.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      this.pointer.isDown = true;
    }
  };

  /**
   * Handle touch move
   */
  private handleTouchMove = (event: Event): void => {
    const e = event as TouchEvent;
    e.preventDefault();
    
    if (e.touches.length > 0) {
      const touch = e.touches[0]!;
      const rect = this.canvas.getBoundingClientRect();
      
      const prevX = this.pointer.x;
      const prevY = this.pointer.y;
      
      this.pointer.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      
      this.pointer.deltaX = this.pointer.x - prevX;
      this.pointer.deltaY = this.pointer.y - prevY;
    }
  };

  /**
   * Handle touch end
   */
  private handleTouchEnd = (): void => {
    this.pointer.isDown = false;
    this.pointer.deltaX = 0;
    this.pointer.deltaY = 0;
  };

  /**
   * Get current pointer state
   */
  getPointerState(): Readonly<PointerState> {
    return { ...this.pointer };
  }

  /**
   * Get keyboard state
   */
  getKeyboardState(): Readonly<KeyboardState> {
    return {
      keysPressed: new Set(this.keyboard.keysPressed),
      lastKey: this.keyboard.lastKey,
    };
  }

  /**
   * Check if key is pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keyboard.keysPressed.has(key.toLowerCase());
  }

  /**
   * Get and consume scroll delta
   */
  getScrollDelta(): number {
    const delta = this.scrollDelta;
    this.scrollDelta = 0;
    return delta;
  }

  /**
   * Get raycaster for intersection tests
   * Updates raycaster with current pointer position and camera
   */
  getRaycaster(camera: THREE.Camera): THREE.Raycaster {
    this.raycaster.setFromCamera(
      new THREE.Vector2(this.pointer.x, this.pointer.y),
      camera
    );
    return this.raycaster;
  }

  /**
   * Reset pointer deltas (call at end of frame)
   */
  resetDeltas(): void {
    this.pointer.deltaX = 0;
    this.pointer.deltaY = 0;
  }

  /**
   * Cleanup event listeners
   */
  dispose(): void {
    this.boundHandlers.forEach((handler, event) => {
      if (event === 'keydown' || event === 'keyup') {
        window.removeEventListener(event, handler);
      } else {
        this.canvas.removeEventListener(event, handler);
      }
    });
    this.boundHandlers.clear();
    this.keyboard.keysPressed.clear();
  }
}
