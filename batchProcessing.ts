import { PerformanceMonitor, scheduleUpdate, isTabActive } from './performanceUtils';
import { PlayerData, BatchRollConfig, GameSettings, BatchProcessingOptions, ProcessingMetrics } from './types';
import { calculateRoll, calculateChange, updateStats } from './gameLogic';

// Optimize memory usage with a reusable batch results object
const createBatchResults = () => ({
  wins: {} as Record<number, number>,
  totalWins: 0,
  totalLosses: 0,
  processedTrades: 0,
  interrupted: false
});

export class BatchProcessor {
  private performanceMonitor: PerformanceMonitor;
  private isProcessing: boolean = false;
  private shouldStop: boolean = false;
  private batchResults = createBatchResults();
  private processingPromise: Promise<PlayerData> | null = null;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
  }

  processBatch(
    player: PlayerData,
    settings: GameSettings,
    risk: number,
    streakAdjustmentActive: boolean,
    options: BatchProcessingOptions = {}
  ): Promise<PlayerData> {
    // Reuse existing promise if processing
    if (this.processingPromise) {
      return this.processingPromise;
    }

    this.isProcessing = true;
    this.shouldStop = false;
    this.performanceMonitor.start();
    
    // Reset batch results
    Object.assign(this.batchResults, createBatchResults());

    this.processingPromise = this.processChunks(
      player,
      settings,
      risk,
      streakAdjustmentActive,
      options
    ).finally(() => {
      this.isProcessing = false;
      this.processingPromise = null;
    });

    return this.processingPromise;
  }

  private async processChunks(
    initialPlayer: PlayerData,
    settings: GameSettings,
    risk: number,
    streakAdjustmentActive: boolean,
    options: BatchProcessingOptions
  ): Promise<PlayerData> {
    const batchSize = settings.batchRoll.size;
    let currentPlayer = { ...initialPlayer };
    let processed = 0;
    let lastUpdateTime = performance.now();

    const processChunk = (chunkSize: number): PlayerData => {
      const chunkStartTime = performance.now();

      for (let i = 0; i < chunkSize && processed < batchSize && !this.shouldStop; i++) {
        const { won, multiplier } = calculateRoll(settings, streakAdjustmentActive);
        const change = calculateChange(currentPlayer.b, risk, won, multiplier);
        
        if (won) {
          this.batchResults.wins[multiplier] = (this.batchResults.wins[multiplier] || 0) + 1;
          this.batchResults.totalWins += change;
        } else {
          this.batchResults.totalLosses += Math.abs(change);
        }

        currentPlayer = updateStats(currentPlayer, change, won, multiplier);
        processed++;

        // Check bankruptcy immediately
        if (currentPlayer.b / currentPlayer.sb < settings.bankruptcyThreshold) {
          this.shouldStop = true;
          break;
        }

        // Break if chunk processing takes too long
        if (performance.now() - chunkStartTime > settings.batchRoll.maxProcessingTime!) {
          break;
        }
      }

      return currentPlayer;
    };

    try {
      while (processed < batchSize && !this.shouldStop) {
        const chunkSize = Math.min(
          settings.batchRoll.chunkSize || 5,
          batchSize - processed
        );
        
        currentPlayer = processChunk(chunkSize);
        
        // Update batch results
        currentPlayer.batchResults = {
          ...this.batchResults,
          processedTrades: processed,
          interrupted: this.shouldStop || processed < batchSize
        };

        const currentTime = performance.now();
        if (currentTime - lastUpdateTime >= settings.batchRoll.updateFrequency) {
          lastUpdateTime = currentTime;
          
          if (options.onProgress) {
            const progress = (processed / batchSize) * 100;
            scheduleUpdate(() => options.onProgress?.(progress));
          }

          if (options.onUpdate && isTabActive()) {
            const updatePlayer = { ...currentPlayer };
            scheduleUpdate(() => options.onUpdate?.(updatePlayer));
          }

          // Yield to main thread
          await new Promise(resolve => setTimeout(resolve, settings.batchRoll.batchUpdateDelay));
        }
      }

      // Final update
      if (options.onComplete) {
        const finalPlayer = { ...currentPlayer };
        scheduleUpdate(() => options.onComplete?.(finalPlayer));
      }

      this.performanceMonitor.recordUpdate();
      return currentPlayer;

    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  }

  stop(): void {
    this.shouldStop = true;
  }

  isActive(): boolean {
    return this.isProcessing;
  }

  getPerformanceMetrics(): ProcessingMetrics {
    return this.performanceMonitor.getMetrics();
  }
}

// Singleton instance
export const batchProcessor = new BatchProcessor();