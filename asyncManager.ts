// Central manager for handling async operations and performance monitoring
import { ProcessingMetrics } from './types';

class AsyncOperationManager {
  private activeOperations: Set<Promise<any>> = new Set();
  private metrics: ProcessingMetrics = {
    averageProcessingTime: 0,
    maxProcessingTime: 0,
    frameDrops: 0,
    totalUpdates: 0,
    totalProcessingTime: 0
  };

  private lastFrameTime: number = 0;
  private frameThreshold: number = 1000 / 60; // ~16.67ms for 60fps

  // Track and manage async operations
  async trackOperation<T>(operation: Promise<T>): Promise<T> {
    const startTime = performance.now();
    this.activeOperations.add(operation);

    try {
      const result = await operation;
      const duration = performance.now() - startTime;
      this.updateMetrics(duration);
      return result;
    } finally {
      this.activeOperations.delete(operation);
    }
  }

  // Update performance metrics
  private updateMetrics(duration: number): void {
    const currentTime = performance.now();
    const timeSinceLastFrame = currentTime - this.lastFrameTime;

    // Check for frame drops
    if (this.lastFrameTime !== 0 && timeSinceLastFrame > this.frameThreshold) {
      this.metrics.frameDrops += Math.floor(timeSinceLastFrame / this.frameThreshold) - 1;
    }

    // Update timing metrics
    this.metrics.totalProcessingTime += duration;
    this.metrics.totalUpdates++;
    this.metrics.averageProcessingTime = this.metrics.totalProcessingTime / this.metrics.totalUpdates;
    this.metrics.maxProcessingTime = Math.max(this.metrics.maxProcessingTime, duration);

    this.lastFrameTime = currentTime;
  }

  // Schedule updates respecting frame budget
  scheduleUpdate(callback: () => void, priority: 'high' | 'low' = 'low'): void {
    if (priority === 'high') {
      requestAnimationFrame(callback);
      return;
    }

    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => {
        if (document.hidden) {
          // Delay updates when tab is not visible
          setTimeout(callback, 100);
        } else {
          callback();
        }
      });
    } else {
      setTimeout(callback, 0);
    }
  }

  // Batch multiple async operations
  async batchOperations<T>(
    operations: Array<Promise<T>>,
    batchSize: number = 5,
    delayBetweenBatches: number = 16
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(op => this.trackOperation(op))
      );
      results.push(...batchResults);

      if (i + batchSize < operations.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    return results;
  }

  // Get current performance metrics
  getMetrics(): ProcessingMetrics {
    return { ...this.metrics };
  }

  // Check if any operations are in progress
  hasActiveOperations(): boolean {
    return this.activeOperations.size > 0;
  }

  // Wait for all current operations to complete
  async waitForOperations(): Promise<void> {
    if (this.activeOperations.size === 0) return;
    await Promise.all(Array.from(this.activeOperations));
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = {
      averageProcessingTime: 0,
      maxProcessingTime: 0,
      frameDrops: 0,
      totalUpdates: 0,
      totalProcessingTime: 0
    };
    this.lastFrameTime = 0;
  }

  // Cleanup
  dispose(): void {
    this.activeOperations.clear();
    this.resetMetrics();
  }
}

// Export singleton instance
export const asyncManager = new AsyncOperationManager();