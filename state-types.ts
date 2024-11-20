import { PlayerData } from './game-types';

export type PlayerTurn = {
  type: 'player'
  batchSize?: number
}

export type BotTurn = {
  type: 'bot'
  index: number
  batchSize?: number
}

export type Turn = PlayerTurn | BotTurn

export interface GameState {
  yourTurn: boolean
  running: boolean
  over: boolean
  turnsPlayed: number
  streakAdjustmentActive: boolean
  streakAdjustmentRemaining: number
  processingBatch: boolean
  turnQueue: Turn[]
  lastProcessTime?: number      // For performance tracking
  processingMetrics?: {         // For monitoring performance
    startTime: number
    tradesProcessed: number
    lastUpdateTime: number
    averageProcessingTime: number
  }
}

export interface BatchProcessingOptions {
  onProgress?: (progress: number) => void
  onUpdate?: (player: PlayerData) => void
  onComplete?: (player: PlayerData) => void
  onError?: (error: Error) => void
}