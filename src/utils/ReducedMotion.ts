/**
 * ReducedMotion.ts
 * Utility to detect and respect user's prefers-reduced-motion preference
 * Constitution Principle V: Accessibility & Input Gracefulness
 */

export class ReducedMotion {
  private static mediaQuery: MediaQueryList | null = null;
  private static listeners: Set<(isReduced: boolean) => void> = new Set();

  /**
   * Check if user prefers reduced motion
   */
  static isReduced(): boolean {
    if (typeof window === 'undefined') return false;
    
    if (!this.mediaQuery) {
      this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    }
    
    return this.mediaQuery.matches;
  }

  /**
   * Get animation duration multiplier based on reduced motion preference
   * Returns 0.01 for reduced motion (effectively instant), 1.0 for normal
   */
  static getDurationMultiplier(): number {
    return this.isReduced() ? 0.01 : 1.0;
  }

  /**
   * Get adjusted duration in seconds
   * @param normalDuration Duration in seconds for normal motion
   * @param reducedDuration Optional custom duration for reduced motion (default: 0.01s)
   */
  static getAdjustedDuration(normalDuration: number, reducedDuration: number = 0.01): number {
    return this.isReduced() ? reducedDuration : normalDuration;
  }

  /**
   * Subscribe to reduced motion preference changes
   * @param callback Function to call when preference changes
   * @returns Unsubscribe function
   */
  static subscribe(callback: (isReduced: boolean) => void): () => void {
    if (typeof window === 'undefined') {
      return () => {}; // No-op for SSR
    }

    if (!this.mediaQuery) {
      this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    }

    this.listeners.add(callback);

    // Set up listener if this is the first subscriber
    if (this.listeners.size === 1) {
      this.mediaQuery.addEventListener('change', this.handleChange);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      
      // Remove listener if no more subscribers
      if (this.listeners.size === 0 && this.mediaQuery) {
        this.mediaQuery.removeEventListener('change', this.handleChange);
      }
    };
  }

  /**
   * Handle media query change event
   */
  private static handleChange = (e: MediaQueryListEvent) => {
    const isReduced = e.matches;
    this.listeners.forEach((callback) => callback(isReduced));
  };

  /**
   * Clean up all listeners (call on app unmount)
   */
  static cleanup(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleChange);
    }
    this.listeners.clear();
    this.mediaQuery = null;
  }
}
