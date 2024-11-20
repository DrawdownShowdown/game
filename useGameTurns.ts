import { useCallback, useEffect, useRef, useMemo } from 'react';
import { calculateRoll, calculateChange, updateStats } from './gameLogic';
import { GameState, GameSettings, PlayerData, Turn, BatchProcessingOptions } from './types';
import { audioManager } from './audio-manager';
import { batchProcessor } from './batchProcessing';
import { isTabActive, scheduleUpdate } from './performanceUtils';

type SetStateType<T> = React.Dispatch<React.SetStateAction<T>>;

// Memoized game state checks
const useGameChecks = (
  player: PlayerData,
  bots: PlayerData[],
  settings: GameSettings
) => {
  return useMemo(() => ({
    isGameOver: player.b / player.sb < settings.bankruptcyThreshold || 
                bots.every(bot => bot.b / bot.sb < settings.bankruptcyThreshold),
    anyBotActive: bots.some(bot => bot.b / bot.sb >= settings.bankruptcyThreshold)
  }), [player.b, player.sb, bots, settings.bankruptcyThreshold]);
};

// Optimized turn queue generator
const createTurnQueue = (batchSize: number, botCount: number): Turn[] => {
  const queue: Turn[] = [{ type: 'player', batchSize }];
  for (let i = 0; i < botCount; i++) {
    queue.push({ type: 'bot', index: i, batchSize });
  }
  return queue;
};

export const useGameTurns = (
  gameState: GameState,
  settings: GameSettings,
  player: PlayerData,
  bots: PlayerData[],
  risk: number,
  botRisks: number[],
  setPlayer: SetStateType<PlayerData>,
  setBots: SetStateType<PlayerData[]>,
  setGameState: SetStateType<GameState>
) => {
  const processingRef = useRef(false);
  const turnTimerRef = useRef<NodeJS.Timeout>();
  const batchOptionsRef = useRef<BatchProcessingOptions>();

  // Memoize game state checks
  const { isGameOver, anyBotActive } = useGameChecks(player, bots, settings);

  // Memoize streak adjustment check
  const checkStreakAdjustment = useCallback(() => {
    if (gameState.streakAdjustmentActive) {
      return gameState.streakAdjustmentRemaining <= 1 
        ? { active: false, remaining: 0 }
        : { active: true, remaining: gameState.streakAdjustmentRemaining - 1 };
    }

    if (settings.streakAdjustment.enabled && Math.abs(player.s) >= settings.streakAdjustment.requiredStreak) {
      return {
        active: true,
        remaining: settings.streakAdjustment.duration
      };
    }

    return null;
  }, [
    gameState.streakAdjustmentActive,
    gameState.streakAdjustmentRemaining,
    settings.streakAdjustment,
    player.s
  ]);

  // Memoized batch options
  const getBatchOptions = useCallback((
    onUpdate: (p: PlayerData) => void,
    onComplete: (p: PlayerData) => void
  ): BatchProcessingOptions => ({
    onProgress: (progress) => {
      if (!isTabActive()) return;
      scheduleUpdate(() => {
        setGameState(prev => ({
          ...prev,
          processingProgress: progress
        }));
      });
    },
    onUpdate: (currentPlayer) => {
      if (!isTabActive()) return;
      scheduleUpdate(() => onUpdate(currentPlayer));
    },
    onComplete: (finalPlayer) => {
      scheduleUpdate(() => onComplete(finalPlayer));
    }
  }), [setGameState]);

  // Optimized bot processing
  const processBot = useCallback(async (
    bot: PlayerData,
    index: number,
    batchSize: number
  ): Promise<PlayerData> => {
    if (bot.b / bot.sb < settings.bankruptcyThreshold) {
      return {
        ...bot,
        r: player.r // Synchronize trade count
      };
    }

    if (settings.batchRoll.enabled && batchSize > 1) {
      return batchProcessor.processBatch(
        bot,
        { ...settings, batchRoll: { ...settings.batchRoll, size: batchSize } },
        botRisks[index],
        false,
        batchOptionsRef.current
      );
    }

    const { won, multiplier } = calculateRoll(settings, false);
    const change = calculateChange(bot.b, botRisks[index], won, multiplier);
    return updateStats(bot, change, won, multiplier);
  }, [settings, botRisks, player.r]);

  // Memoized turn processor
  const processTurnQueue = useCallback(async () => {
    if (processingRef.current || gameState.over || gameState.turnQueue.length === 0) return;

    processingRef.current = true;
    const turn = gameState.turnQueue[0];
    const batchSize = settings.batchRoll.enabled ? settings.batchRoll.size : 1;

    try {
      if (turn.type === 'player') {
        let updatedPlayer: PlayerData;

        if (settings.batchRoll.enabled && batchSize > 1) {
          setGameState(prev => ({ ...prev, processingBatch: true }));

          updatedPlayer = await batchProcessor.processBatch(
            player,
            settings,
            risk,
            gameState.streakAdjustmentActive,
            batchOptionsRef.current
          );
        } else {
          const { won, multiplier } = calculateRoll(settings, gameState.streakAdjustmentActive);
          const change = calculateChange(player.b, risk, won, multiplier);
          updatedPlayer = updateStats(player, change, won, multiplier);
        }

        const streakUpdate = checkStreakAdjustment();
        scheduleUpdate(() => {
          setPlayer(updatedPlayer);
          setGameState(prev => ({
            ...prev,
            turnQueue: prev.turnQueue.slice(1),
            processingBatch: false,
            turnsPlayed: prev.turnsPlayed + batchSize,
            ...(streakUpdate || {})
          }));
        });

      } else if (turn.type === 'bot' && turn.index !== undefined) {
        const updatedBot = await processBot(bots[turn.index], turn.index, batchSize);

        scheduleUpdate(() => {
          setBots(prev => {
            const next = [...prev];
            next[turn.index] = updatedBot;
            return next;
          });
          setGameState(prev => ({
            ...prev,
            turnQueue: prev.turnQueue.slice(1)
          }));
        });
      }

      if (isGameOver) {
        scheduleUpdate(() => {
          setGameState(prev => ({
            ...prev,
            over: true,
            turnQueue: []
          }));
        });

        if (player.b / player.sb >= settings.bankruptcyThreshold) {
          audioManager.playVictory();
        }
      } else if (gameState.turnQueue.length <= 1) {
        scheduleUpdate(() => {
          setGameState(prev => ({
            ...prev,
            yourTurn: true,
            turnQueue: []
          }));
        });
      }
    } finally {
      processingRef.current = false;
    }
  }, [
    gameState,
    settings,
    player,
    bots,
    risk,
    isGameOver,
    checkStreakAdjustment,
    processBot,
    setPlayer,
    setBots,
    setGameState
  ]);

  // Clean up turn timer
  useEffect(() => {
    return () => {
      if (turnTimerRef.current) {
        clearTimeout(turnTimerRef.current);
      }
    };
  }, []);

  // Process turn queue
  useEffect(() => {
    if (gameState.turnQueue.length > 0 && !processingRef.current) {
      const delay = settings.batchRoll.enabled 
        ? settings.batchRoll.autoPlaySpeed 
        : settings.t;
      
      turnTimerRef.current = setTimeout(processTurnQueue, delay);
      return () => {
        if (turnTimerRef.current) {
          clearTimeout(turnTimerRef.current);
        }
      };
    }
  }, [gameState.turnQueue, processTurnQueue, settings]);

  // Memoized play turn function
  return useCallback((isPlayer: boolean) => {
    if (gameState.over || !isPlayer || !gameState.yourTurn || 
        player.b / player.sb < settings.bankruptcyThreshold) {
      return;
    }

    const batchSize = settings.batchRoll.enabled ? settings.batchRoll.size : 1;
    const turnQueue = createTurnQueue(batchSize, bots.length);

    // Update game state
    scheduleUpdate(() => {
      setGameState(prev => ({
        ...prev,
        yourTurn: false,
        running: true,
        turnQueue
      }));
    });
  }, [
    gameState.over,
    gameState.yourTurn,
    player.b,
    player.sb,
    settings.bankruptcyThreshold,
    settings.batchRoll,
    bots.length,
    setGameState
  ]);
};