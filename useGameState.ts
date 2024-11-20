import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { defaults } from './defaults';
import { GameSettings, GameState, PlayerData } from './types';
import { audioManager } from './audio-manager';

type SetStateType<T> = Dispatch<SetStateAction<T>>;

// Simplified initial game state
const createInitialGameState = (): GameState => ({
  yourTurn: true,
  running: false,
  over: false,
  turnsPlayed: 0,
  streakAdjustmentActive: false,
  streakAdjustmentRemaining: 0,
  processingBatch: false,
  turnQueue: []
});

// Initial player state creation with minimal properties
const createInitialPlayerState = (startingBalance: number): PlayerData => ({
  ...defaults.i(startingBalance),
  sb: startingBalance
});

export const useGameState = (initialSettings: GameSettings) => {
  // Core state
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const [player, setPlayer] = useState<PlayerData>(() => createInitialPlayerState(settings.i));
  const [bots, setBots] = useState<PlayerData[]>(() => 
    Array(settings.n).fill(null).map(() => createInitialPlayerState(settings.i))
  );
  const [risk, setRisk] = useState<number>(1);
  const [botRisks, setBotRisks] = useState<number[]>([5,10,15,20,25,30,40,50]);
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());

  // Initialize audio settings once
  useEffect(() => {
    audioManager.updateSettings(settings.audioEffects);
  }, [settings.audioEffects]);

  // Handle bot count changes efficiently
  const updateBotCount = useCallback(() => {
    setBots(currentBots => {
      const newBots = [...currentBots];
      // Remove excess bots
      if (newBots.length > settings.n) {
        return newBots.slice(0, settings.n);
      }
      // Add new bots if needed
      while (newBots.length < settings.n) {
        newBots.push(createInitialPlayerState(settings.i));
      }
      return newBots;
    });
  }, [settings.n, settings.i]);

  // Monitor settings changes that affect bot count
  useEffect(() => {
    updateBotCount();
  }, [settings.n, settings.i, updateBotCount]);

  // Reset game state with optimized initialization
  const reset = useCallback(() => {
    setPlayer(createInitialPlayerState(settings.i));
    setBots(Array(settings.n).fill(null).map(() => createInitialPlayerState(settings.i)));
    setBotRisks(prev => prev.slice(0, settings.n));
    setGameState(createInitialGameState());
    setRisk(1);
  }, [settings.i, settings.n]);

  // Batch state updates for settings changes
  const updateSettings = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
    // Reset only if critical game parameters change
    if (newSettings.i !== settings.i || newSettings.n !== settings.n) {
      reset();
    }
  }, [settings.i, settings.n, reset]);

  return {
    // State
    settings,
    player,
    bots,
    risk,
    botRisks,
    gameState,
    
    // Update functions
    setSettings: updateSettings,
    setPlayer: setPlayer as SetStateType<PlayerData>,
    setBots: setBots as SetStateType<PlayerData[]>,
    setRisk,
    setBotRisks: setBotRisks as SetStateType<number[]>,
    setGameState: setGameState as SetStateType<GameState>,
    reset
  };
};

// Export memoized selector helpers
export const selectIsGameActive = (gameState: GameState): boolean => 
  !gameState.over && gameState.running;

export const selectCanPlay = (gameState: GameState, player: PlayerData, bankruptcyThreshold: number): boolean => 
  gameState.yourTurn && 
  !gameState.over && 
  player.b / player.sb >= bankruptcyThreshold;

export const selectIsProcessing = (gameState: GameState): boolean =>
  gameState.processingBatch || gameState.turnQueue.length > 0;