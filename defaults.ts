import { PlayerData, GameSettings, CelebrationEffects, AudioEffects, DisplayMetrics, StreakAdjustment, BatchRollConfig, ChartSettings, MovingAverageSettings } from './types'

const createInitialState = (balance: number): PlayerData => ({
  b: balance,  // balance
  r: 0,        // trades
  w: 0,        // wins
  l: 0,        // losses
  s: 0,        // streak
  mw: 0,       // max win streak
  ml: 0,       // max loss streak
  mb: balance, // max balance
  nb: balance, // min balance
  c: 0,        // last change
  m: 1,        // last multiplier
  tw: 0,       // total winnings
  tl: 0,       // total losses
  avg: 0,      // average gain
  avgl: 0,     // average loss
  sb: balance, // starting balance
  h: [{t: 0, v: balance}] // history
})

const defaultCelebrationEffects: CelebrationEffects = {
  confetti: true,
  fireworks: true,
  coinRain: true,
  victorySound: true
}

const defaultAudioEffects: AudioEffects = {
  bankruptcy: true,
  streakRecord: true,
  volume: 0.5
}

const defaultChartSettings: ChartSettings = {
  sampleRate: 10,
  useLogScale: false,
  showBankruptcyPoints: true,
  minSampleRate: 1,
  maxSampleRate: 100
}

const defaultMovingAverages: MovingAverageSettings = {
  fastMAEnabled: true,
  slowMAEnabled: true,
  fastMAPeriod: 10,
  slowMAPeriod: 100
}

const defaultDisplayMetrics: DisplayMetrics = {
  accountPeak: true,
  accountLow: true,
  winLossRatio: true,
  averageGain: true,
  averageLoss: false,
  bestStreak: true,
  worstStreak: true,
  totalTrades: false,
  showAverageGainChart: false,
  showScoreboard: true,  // Added this line - scoreboard shown by default
  riskDisplay: 'hidden',
  chartSettings: defaultChartSettings,
  movingAverages: defaultMovingAverages
}

const defaultStreakAdjustment: StreakAdjustment = {
  enabled: false,
  requiredStreak: 5,
  duration: 10,
  adjustment: -10  // decrease win rate by 10 percentage points after streak
}

const defaultBatchRoll: BatchRollConfig = {
  enabled: false,
  size: 10,           // default batch size
  autoPlaySpeed: 100, // default speed in ms
  updateFrequency: 100, // update UI every 100ms during batch processing
  batchUpdateDelay: 16,  // minimum 16ms between updates (~ 60fps)
  processingMode: 'chunked',
  chunkSize: 5,
  maxProcessingTime: 50,
  throttleUpdates: true
}

export const defaults = {
  i: createInitialState,
  p: 50,                     // win probability
  m: {                       // multiplier probabilities
    2: 10,
    3: 3,
    4: 1,
    5: 0.5,
    10: 0
  },
  e: [2,3,4,5] as number[],  // enabled multipliers
  t: 10,                     // delay
  n: 8,                      // number of bots
  bankruptcyThreshold: 0.5,   // bankruptcy threshold (50% of starting balance)
  maxTurns: 0,               // maximum turns (0 for unlimited)
  layout: 'grid' as const,    // card layout
  celebrationEffects: defaultCelebrationEffects,
  audioEffects: defaultAudioEffects,
  displayMetrics: defaultDisplayMetrics,
  streakAdjustment: defaultStreakAdjustment,
  batchRoll: defaultBatchRoll,

  // Constraints for batch processing
  batchSizeConstraints: {
    min: 4,
    max: 100
  },
  speedConstraints: {
    min: 1,
    max: 1000
  },

  // UI update thresholds
  uiThresholds: {
    minBatchUpdateDelay: 16,     // minimum ms between UI updates (~60fps)
    batchChunkSize: 5,           // number of trades to process in each chunk
    progressUpdateInterval: 100   // ms between progress updates
  },

  // Performance settings
  performance: {
    maxQueueSize: 1000,          // maximum number of pending operations
    maxProcessingTime: 50,       // ms maximum time for continuous processing
    idleDelay: 1                 // ms delay between processing chunks
  },

  // Chart settings constraints and defaults
  chart: {
    minSampleRate: 1,
    maxSampleRate: 100,
    colors: [
      '#FF0000', // Red
      '#0000FF', // Blue
      '#00FF00', // Green
      '#FFFF00', // Yellow
      '#FFA500', // Orange
      '#800080', // Purple
      '#00FFFF', // Cyan
      '#FF00FF'  // Magenta
    ],
    lineStyles: ['solid', 'dashed', 'dotted', 'dash-dot'],
    playerLineWidth: 2,
    botLineWidth: 1,
    bankruptcyMarkerSize: 8
  }
} as const;

// Type guard to check if a value is a valid multiplier
export const isValidMultiplier = (value: number): boolean => {
  return Object.keys(defaults.m).includes(value.toString());
};

// Helper to get safe batch size
export const getSafeBatchSize = (size: number): number => {
  return Math.min(
    defaults.batchSizeConstraints.max,
    Math.max(defaults.batchSizeConstraints.min, size)
  );
};

// Helper to get safe speed value
export const getSafeSpeed = (speed: number): number => {
  return Math.min(
    defaults.speedConstraints.max,
    Math.max(defaults.speedConstraints.min, speed)
  );
};

// Helper to validate settings
export const validateSettings = (settings: Partial<GameSettings>): boolean => {
  if (settings.batchRoll) {
    if (settings.batchRoll.size < defaults.batchSizeConstraints.min || 
        settings.batchRoll.size > defaults.batchSizeConstraints.max) {
      return false;
    }
    if (settings.batchRoll.autoPlaySpeed < defaults.speedConstraints.min || 
        settings.batchRoll.autoPlaySpeed > defaults.speedConstraints.max) {
      return false;
    }
  }

  if (settings.displayMetrics?.chartSettings) {
    const { sampleRate } = settings.displayMetrics.chartSettings;
    if (sampleRate < defaults.chart.minSampleRate || 
        sampleRate > defaults.chart.maxSampleRate) {
      return false;
    }
  }

  return true;
};

// Helper to get line style for chart
export const getChartLineStyle = (index: number): string => {
  const styleIndex = Math.floor(index / defaults.chart.colors.length) % defaults.chart.lineStyles.length;
  return defaults.chart.lineStyles[styleIndex];
};

// Helper to get color for chart
export const getChartColor = (index: number): string => {
  return defaults.chart.colors[index % defaults.chart.colors.length];
};