import { ProcessingMetrics } from './types';

export class PerformanceMonitor {
  private startTime: number = 0;
  private measurements: number[] = [];
  private updateTimes: number[] = [];
  private frameDrops: number = 0;
  private lastFrameTime: number = 0;
  private frameThreshold: number = 1000 / 60; // 16.67ms for 60fps

  start() {
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
  }

  measure() {
    const elapsed = performance.now() - this.startTime;
    this.measurements.push(elapsed);
    return elapsed;
  }

  recordUpdate() {
    const now = performance.now();
    const timeSinceLastFrame = now - this.lastFrameTime;

    if (this.lastFrameTime !== 0) {
      if (timeSinceLastFrame > this.frameThreshold) {
        this.frameDrops += Math.floor(timeSinceLastFrame / this.frameThreshold) - 1;
      }
    }

    this.updateTimes.push(now);
    this.lastFrameTime = now;
  }

  getMetrics(): ProcessingMetrics {
    const total = this.measurements.reduce((a, b) => a + b, 0);
    const avg = total / Math.max(1, this.measurements.length);
    const max = Math.max(...this.measurements, 0);
    
    return {
      averageProcessingTime: avg,
      maxProcessingTime: max,
      frameDrops: this.frameDrops,
      totalUpdates: this.updateTimes.length,
      totalProcessingTime: total
    };
  }

  reset() {
    this.measurements = [];
    this.updateTimes = [];
    this.frameDrops = 0;
    this.startTime = 0;
    this.lastFrameTime = 0;
  }
}

// Throttle function for UI updates
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean = false;
  let lastRan: number = 0;
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>): ReturnType<T> => {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, Math.max(0, limit - (Date.now() - lastRan)));
    }
    return undefined as any;
  }) as T;
};

// RequestAnimationFrame wrapper with fallback
export const scheduleUpdate = (
  callback: () => void,
  immediate: boolean = false
): void => {
  if (immediate) {
    callback();
    return;
  }
  
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    window.requestAnimationFrame(() => callback());
  } else {
    setTimeout(callback, 16);
  }
};

// Helper to detect if the browser tab is active
export const isTabActive = (): boolean => {
  return typeof document !== 'undefined' 
    ? !document.hidden 
    : true;
};

// Debounce function for expensive operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  }) as any;
};

// Helper to batch multiple updates together
export class UpdateBatcher {
  private updates: Set<() => void> = new Set();
  private scheduled: boolean = false;
  private readonly batchDelay: number;

  constructor(batchDelay: number = 16) {
    this.batchDelay = batchDelay;
  }

  add(update: () => void): void {
    this.updates.add(update);
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (!this.scheduled) {
      this.scheduled = true;
      scheduleUpdate(() => this.flush());
    }
  }

  private flush(): void {
    this.scheduled = false;
    const updates = Array.from(this.updates);
    this.updates.clear();
    
    updates.forEach(update => {
      try {
        update();
      } catch (error) {
        console.error('Error in batched update:', error);
      }
    });
  }

  clear(): void {
    this.updates.clear();
    this.scheduled = false;
  }
}

// Create a singleton instance for global use
export const globalUpdateBatcher = new UpdateBatcher();

// Helper to check if performance is degraded
export const isPerformanceDegraded = (metrics: ProcessingMetrics): boolean => {
  return metrics.frameDrops > 5 || 
         metrics.averageProcessingTime > 16 || 
         metrics.maxProcessingTime > 50;
};

// Helper to adjust batch processing based on performance
export const getOptimalBatchSize = (
  currentSize: number,
  metrics: ProcessingMetrics
): number => {
  if (isPerformanceDegraded(metrics)) {
    return Math.max(4, Math.floor(currentSize * 0.75));
  }
  if (metrics.frameDrops === 0 && metrics.averageProcessingTime < 8) {
    return Math.min(100, Math.floor(currentSize * 1.25));
  }
  return currentSize;
};