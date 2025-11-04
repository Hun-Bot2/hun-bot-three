/**
 * PerformanceMonitor.ts
 * Track FPS, draw calls, and memory usage with constitution budget validation
 * Constitution Principle II: Smooth Performance & Motion Quality
 */

import type * as THREE from 'three';

export interface PerformanceMetrics {
  currentFPS: number;
  averageFPS: number;
  medianFPS: number;
  minFPS: number;
  maxFPS: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
  memoryMB: number;
  frameTime: number; // ms
}

export interface ConstitutionBudgets {
  targetFPS: number; // 60 FPS
  maxFrameTime: number; // 16.7ms for 60 FPS
  maxDrawCallsLanding: number; // 150
  maxDrawCallsTypical: number; // 300
  maxTextureMB: number; // 64 MB
  maxStutterDuration: number; // 250ms
}

export class PerformanceMonitor {
  private renderer: THREE.WebGLRenderer | null = null;
  private frameTimeHistory: number[] = [];
  private fpsHistory: number[] = [];
  private lastFrameTime: number = performance.now();
  private historySize: number = 120; // 2 seconds at 60 FPS
  
  private budgets: ConstitutionBudgets = {
    targetFPS: 60,
    maxFrameTime: 16.7,
    maxDrawCallsLanding: 150,
    maxDrawCallsTypical: 300,
    maxTextureMB: 64,
    maxStutterDuration: 250,
  };

  private isLandingScene: boolean = true;
  private warningThrottleTime: number = 5000; // Warn max once per 5 seconds
  private lastWarningTime: number = 0;

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
  }

  /**
   * Update performance metrics (call every frame)
   */
  update(): PerformanceMetrics {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Calculate FPS
    const fps = frameTime > 0 ? 1000 / frameTime : 60;

    // Update histories
    this.frameTimeHistory.push(frameTime);
    this.fpsHistory.push(fps);

    // Keep history size limited
    if (this.frameTimeHistory.length > this.historySize) {
      this.frameTimeHistory.shift();
      this.fpsHistory.shift();
    }

    // Get renderer info
    const info = this.renderer?.info;
    const memory = (this.renderer?.info.memory as any) || {};

    const metrics: PerformanceMetrics = {
      currentFPS: Math.round(fps),
      averageFPS: this.calculateAverage(this.fpsHistory),
      medianFPS: this.calculateMedian(this.fpsHistory),
      minFPS: Math.min(...this.fpsHistory),
      maxFPS: Math.max(...this.fpsHistory),
      drawCalls: info?.render.calls || 0,
      triangles: info?.render.triangles || 0,
      geometries: memory.geometries || 0,
      textures: memory.textures || 0,
      programs: info?.programs?.length || 0,
      memoryMB: this.estimateMemoryUsage(),
      frameTime: Math.round(frameTime * 100) / 100,
    };

    // Validate against constitution budgets
    this.validateBudgets(metrics);

    return metrics;
  }

  /**
   * Set whether current scene is landing (affects draw call budget)
   */
  setIsLandingScene(isLanding: boolean): void {
    this.isLandingScene = isLanding;
  }

  /**
   * Get current performance metrics without updating
   */
  getMetrics(): PerformanceMetrics | null {
    if (this.fpsHistory.length === 0) return null;

    const info = this.renderer?.info;
    const memory = (this.renderer?.info.memory as any) || {};

    return {
      currentFPS: Math.round(this.fpsHistory[this.fpsHistory.length - 1]!),
      averageFPS: this.calculateAverage(this.fpsHistory),
      medianFPS: this.calculateMedian(this.fpsHistory),
      minFPS: Math.min(...this.fpsHistory),
      maxFPS: Math.max(...this.fpsHistory),
      drawCalls: info?.render.calls || 0,
      triangles: info?.render.triangles || 0,
      geometries: memory.geometries || 0,
      textures: memory.textures || 0,
      programs: info?.programs?.length || 0,
      memoryMB: this.estimateMemoryUsage(),
      frameTime: this.frameTimeHistory[this.frameTimeHistory.length - 1] || 0,
    };
  }

  /**
   * Reset performance history
   */
  reset(): void {
    this.frameTimeHistory = [];
    this.fpsHistory = [];
    this.lastFrameTime = performance.now();
  }

  /**
   * Validate metrics against constitution budgets
   */
  private validateBudgets(metrics: PerformanceMetrics): void {
    const now = performance.now();
    
    // Throttle warnings to avoid spam
    if (now - this.lastWarningTime < this.warningThrottleTime) {
      return;
    }

    const warnings: string[] = [];

    // FPS check
    if (metrics.medianFPS < this.budgets.targetFPS * 0.9) {
      warnings.push(
        `⚠️ FPS below target: ${metrics.medianFPS.toFixed(1)} < ${this.budgets.targetFPS} (Constitution Principle II)`
      );
    }

    // Frame time check
    if (metrics.frameTime > this.budgets.maxFrameTime) {
      warnings.push(
        `⚠️ Frame time exceeded: ${metrics.frameTime.toFixed(2)}ms > ${this.budgets.maxFrameTime}ms`
      );
    }

    // Draw calls check
    const maxDrawCalls = this.isLandingScene
      ? this.budgets.maxDrawCallsLanding
      : this.budgets.maxDrawCallsTypical;
    
    if (metrics.drawCalls > maxDrawCalls) {
      warnings.push(
        `⚠️ Draw calls exceeded: ${metrics.drawCalls} > ${maxDrawCalls} (${this.isLandingScene ? 'Landing' : 'Typical'} scene)`
      );
    }

    // Memory check
    if (metrics.memoryMB > this.budgets.maxTextureMB) {
      warnings.push(
        `⚠️ Texture memory exceeded: ${metrics.memoryMB.toFixed(1)}MB > ${this.budgets.maxTextureMB}MB`
      );
    }

    // Stutter check (frame took too long)
    if (metrics.frameTime > this.budgets.maxStutterDuration) {
      warnings.push(
        `⚠️ Stutter detected: ${metrics.frameTime.toFixed(2)}ms > ${this.budgets.maxStutterDuration}ms`
      );
    }

    // Log warnings if any
    if (warnings.length > 0) {
      console.warn('Constitution Budget Violations:');
      warnings.forEach((warning) => console.warn(warning));
      this.lastWarningTime = now;
    }
  }

  /**
   * Estimate memory usage in MB (rough approximation)
   */
  private estimateMemoryUsage(): number {
    const memory = (this.renderer?.info.memory as any) || {};
    const geometries = memory.geometries || 0;
    const textures = memory.textures || 0;
    
    // Rough estimate: average 1MB per texture, 0.5MB per geometry
    return textures * 1 + geometries * 0.5;
  }

  /**
   * Calculate average of array
   */
  private calculateAverage(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return Math.round(sum / arr.length);
  }

  /**
   * Calculate median of array
   */
  private calculateMedian(arr: number[]): number {
    if (arr.length === 0) return 0;
    
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return Math.round(((sorted[mid - 1]!) + (sorted[mid]!)) / 2);
    }
    
    return Math.round(sorted[mid]!);
  }

  /**
   * Get formatted metrics string for overlay display
   */
  getFormattedMetrics(): string {
    const metrics = this.getMetrics();
    if (!metrics) return 'No metrics available';

    const maxDrawCalls = this.isLandingScene
      ? this.budgets.maxDrawCallsLanding
      : this.budgets.maxDrawCallsTypical;

    return `
FPS: ${metrics.currentFPS} (avg: ${metrics.averageFPS}, median: ${metrics.medianFPS})
Frame: ${metrics.frameTime.toFixed(2)}ms
Draw Calls: ${metrics.drawCalls} / ${maxDrawCalls}
Triangles: ${metrics.triangles.toLocaleString()}
Geometries: ${metrics.geometries}
Textures: ${metrics.textures}
Memory: ~${metrics.memoryMB.toFixed(1)} MB
    `.trim();
  }
}
