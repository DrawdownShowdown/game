import { PlayerData } from './game-types'

export interface ProcessingMetrics {
  averageProcessingTime: number
  maxProcessingTime: number
  frameDrops: number
  totalUpdates: number
  totalProcessingTime: number
}

export interface BatchProcessingResult {
  player: PlayerData
  metrics: ProcessingMetrics
  interrupted: boolean
}

export interface PerformanceConfig {
  maxQueueSize: number          // maximum number of pending operations
  maxProcessingTime: number     // ms maximum time for continuous processing
  idleDelay: number            // ms delay between processing chunks
  throttleInterval: number     // minimum ms between updates
  batchChunkSize: number      // number of trades to process in each chunk
  progressUpdateInterval: number // ms between progress updates
}

export interface PerformanceThresholds {
  minFrameTime: number        // minimum acceptable frame time (ms)
  maxFrameDrops: number      // maximum acceptable frame drops
  maxProcessingTime: number  // maximum acceptable processing time (ms)
  targetFPS: number         // target frames per second
}