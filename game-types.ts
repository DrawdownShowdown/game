// Core game data structures
export interface PlayerData {
  b: number      // balance
  r: number      // trades
  w: number      // wins
  l: number      // losses
  s: number      // streak
  mw: number     // max win streak
  ml: number     // max loss streak
  mb: number     // max balance
  nb: number     // min balance
  c: number      // last change
  m: number      // last multiplier
  tw: number     // total winnings
  tl: number     // total losses
  avg: number    // average gain per trade
  avgl: number   // average loss per trade
  sb: number     // starting balance
  h: Array<{t: number, v: number}>  // history
  batchResults?: {
    wins: Record<number, number>  // multiplier -> count
    totalWins: number
    totalLosses: number
    processedTrades: number       // Track actual processed trades
    interrupted?: boolean         // Flag for interrupted batches
  }
  lastUpdateTime?: number        // For throttling updates
}

export interface GameSettings {
  i: number              // initial balance
  p: number              // win probability
  m: Record<number, number>  // multiplier probabilities
  e: number[]            // enabled multipliers
  t: number              // delay
  n: number              // number of bots
  bankruptcyThreshold: number  // threshold for bankruptcy (percentage of starting balance)
  maxTurns: number       // maximum number of turns (0 for unlimited)
  layout: 'grid' | 'list'  // card layout
  celebrationEffects: CelebrationEffects
  audioEffects: AudioEffects
  displayMetrics: DisplayMetrics
  streakAdjustment: StreakAdjustment
  batchRoll: BatchRollConfig
}

export interface BatchRollConfig {
  enabled: boolean
  size: number        // number of trades per batch (4-100)
  autoPlaySpeed: number // ms delay between trades in auto mode (1-1000)
  updateFrequency: number // How often to update UI during batch processing (ms)
  batchUpdateDelay: number // Minimum delay between batch updates (ms)
  throttleUpdates?: boolean     // Option to throttle UI updates
  processingMode: 'immediate' | 'chunked' | 'scheduled'  // Processing strategy
  chunkSize?: number           // For chunked processing
  maxProcessingTime?: number   // For preventing UI blocking
}

export interface StreakAdjustment {
  enabled: boolean
  requiredStreak: number
  duration: number      // number of trades the adjustment lasts
  adjustment: number    // percentage points to adjust win rate
}

export interface AudioEffects {
  bankruptcy: boolean
  streakRecord: boolean
  volume: number
}

export interface CelebrationEffects {
  confetti: boolean
  fireworks: boolean
  coinRain: boolean
  victorySound: boolean
}

export interface DisplayMetrics {
  accountPeak: boolean
  accountLow: boolean
  winLossRatio: boolean
  averageGain: boolean
  averageLoss: boolean
  bestStreak: boolean
  worstStreak: boolean
  totalTrades: boolean
  showAverageGainChart: boolean
  showScoreboard: boolean
  riskDisplay: RiskDisplayMode
  chartSettings: ChartSettings
  movingAverages: MovingAverageSettings
}

export type RiskDisplayMode = 'hidden' | 'labels' | 'legend'

export interface MovingAverageSettings {
  fastMAEnabled: boolean
  slowMAEnabled: boolean
  fastMAPeriod: number
  slowMAPeriod: number
}

export interface ChartSettings {
  sampleRate: number     // Number of trades to sample (e.g., 10 for every 10th trade)
  useLogScale: boolean   // Whether to use logarithmic scale for y-axis
  showBankruptcyPoints: boolean  // Whether to show X markers at bankruptcy points
  minSampleRate: number  // Minimum allowed sample rate
  maxSampleRate: number  // Maximum allowed sample rate
}