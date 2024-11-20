import { PlayerData, GameSettings } from './types';
import { audioManager } from './audio-manager';

// Simplified win/loss tracking with single-pass calculations
const updateAverages = (prev: PlayerData, change: number, won: boolean): { avg: number, avgl: number } => {
  if (won) {
    return {
      avg: ((prev.avg * prev.w) + change) / (prev.w + 1),
      avgl: prev.avgl
    };
  }
  return {
    avg: prev.avg,
    avgl: ((prev.avgl * prev.l) + Math.abs(change)) / (prev.l + 1)
  };
};

// Streamlined streak calculation
const calculateStreak = (currentStreak: number, won: boolean): number => {
  if (won) {
    return currentStreak >= 0 ? currentStreak + 1 : 1;
  }
  return currentStreak <= 0 ? currentStreak - 1 : -1;
};

// Optimized stats update with single object creation
export const updateStats = (prev: PlayerData, change: number, won: boolean, multiplier: number): PlayerData => {
  const newBalance = Math.max(0, prev.b + change);
  const newStreak = calculateStreak(prev.s, won);
  const averages = updateAverages(prev, change, won);
  
  const next = {
    ...prev,
    b: newBalance,
    r: prev.r + 1,
    w: prev.w + (won ? 1 : 0),
    l: prev.l + (won ? 0 : 1),
    s: newStreak,
    mw: won ? Math.max(prev.mw, newStreak) : prev.mw,
    ml: !won ? Math.max(prev.ml, Math.abs(newStreak)) : prev.ml,
    mb: Math.max(prev.mb, newBalance),
    nb: Math.min(prev.nb, newBalance),
    c: change,
    m: multiplier,
    tw: prev.tw + (won ? change : 0),
    tl: prev.tl + (!won ? Math.abs(change) : 0),
    avg: averages.avg,
    avgl: averages.avgl,
    sb: prev.sb,
    h: [...prev.h, { t: prev.r + 1, v: newBalance }]
  };

  // Trigger audio feedback only when needed
  if (next.b / next.sb < 0.001) {
    audioManager.playBankruptcy();
  } else if ((won && next.mw > prev.mw) || (!won && next.ml > prev.ml)) {
    audioManager.playStreakRecord();
  }

  return next;
};

// Combined roll calculation with early returns
export const calculateRoll = (settings: GameSettings, streakAdjustmentActive: boolean = false): { won: boolean; multiplier: number } => {
  // Early return for edge cases
  if (!settings.e.length) {
    return { won: false, multiplier: 1 };
  }

  // Adjusted win probability
  let winProbability = streakAdjustmentActive && settings.streakAdjustment.enabled
    ? Math.max(1, Math.min(99, settings.p + settings.streakAdjustment.adjustment))
    : settings.p;

  // Determine win/loss
  const won = Math.random() * 100 < winProbability;
  if (!won) {
    return { won, multiplier: 1 };
  }

  // Calculate multiplier only on wins
  const roll = Math.random() * 100;
  let sum = 0;
  
  // Use enabled multipliers array directly
  for (const multiplier of settings.e) {
    sum += settings.m[multiplier];
    if (roll < sum) {
      return { won, multiplier };
    }
  }

  return { won, multiplier: 1 };
};

// Simplified change calculation
export const calculateChange = (balance: number, risk: number, won: boolean, multiplier: number): number => {
  const amount = (balance * risk) / 100;
  return won ? amount * multiplier : -amount;
};

// Batch processing with optimized state updates
export const processBatchRoll = (
  player: PlayerData,
  settings: GameSettings,
  risk: number,
  streakAdjustmentActive: boolean
): Promise<PlayerData> => {
  return new Promise((resolve) => {
    let currentPlayer = { ...player };
    const batchSize = settings.batchRoll.size;
    const wins: Record<number, number> = {};
    let totalWins = 0;
    let totalLosses = 0;
    let processed = 0;

    const processChunk = () => {
      const chunkSize = Math.min(5, batchSize - processed);
      const startTime = performance.now();

      for (let i = 0; i < chunkSize && processed < batchSize; i++) {
        const { won, multiplier } = calculateRoll(settings, streakAdjustmentActive);
        const change = calculateChange(currentPlayer.b, risk, won, multiplier);
        
        if (won) {
          wins[multiplier] = (wins[multiplier] || 0) + 1;
          totalWins += change;
        } else {
          totalLosses += Math.abs(change);
        }

        currentPlayer = updateStats(currentPlayer, change, won, multiplier);
        processed++;

        // Early exit on bankruptcy
        if (currentPlayer.b / currentPlayer.sb < settings.bankruptcyThreshold) {
          break;
        }
      }

      // Update batch results once per chunk
      currentPlayer.batchResults = {
        wins,
        totalWins,
        totalLosses,
        processedTrades: processed,
        interrupted: processed < batchSize
      };

      if (processed < batchSize && currentPlayer.b / currentPlayer.sb >= settings.bankruptcyThreshold) {
        const elapsed = performance.now() - startTime;
        const delay = Math.max(0, (1000 / settings.batchRoll.autoPlaySpeed) - elapsed);
        setTimeout(processChunk, delay);
      } else {
        resolve(currentPlayer);
      }
    };

    processChunk();
  });
};