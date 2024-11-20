import { useState, useEffect } from 'react'
import { defaults } from './defaults'
import { useGameState } from './useGameState'
import { useGameTurns } from './useGameTurns'
import { GameHeader } from './comp-GameHeader'
import { GameGrid } from './comp-GameGrid'
import { Scoreboard } from './Scoreboard'
import GameOver from './gameover'
import { Settings } from './settings-index'
import { GameSettings } from './types'
import { Celebrations } from './comp-Celebrations'
import { audioManager } from './audio-manager'

const initialSettings: GameSettings = {
  i: 100,
  p: defaults.p,
  m: defaults.m,
  e: [...defaults.e],
  t: defaults.t,
  n: defaults.n,
  bankruptcyThreshold: defaults.bankruptcyThreshold,
  maxTurns: defaults.maxTurns,
  layout: defaults.layout,
  celebrationEffects: { ...defaults.celebrationEffects },
  audioEffects: { ...defaults.audioEffects },
  displayMetrics: { ...defaults.displayMetrics },
  streakAdjustment: { ...defaults.streakAdjustment },
  batchRoll: { ...defaults.batchRoll }
}

export default function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  
  const {
    settings, setSettings,
    player, setPlayer,
    bots, setBots,
    risk, setRisk,
    botRisks, setBotRisks,
    gameState, setGameState,
    reset
  } = useGameState(initialSettings)

  useEffect(() => {
    audioManager.updateSettings(settings.audioEffects)
  }, [settings.audioEffects])

  const playTurn = useGameTurns(
    gameState,
    settings,
    player,
    bots,
    risk,
    botRisks,
    setPlayer,
    setBots,
    setGameState
  )

  // Check for streak-based win rate adjustment
  useEffect(() => {
    if (settings.streakAdjustment.enabled) {
      const currentStreak = Math.abs(player.s);
      if (currentStreak >= settings.streakAdjustment.requiredStreak && !gameState.streakAdjustmentActive) {
        setGameState(prev => ({
          ...prev,
          streakAdjustmentActive: true,
          streakAdjustmentRemaining: settings.streakAdjustment.duration
        }));
      }
    }
  }, [player.s, settings.streakAdjustment, gameState.streakAdjustmentActive]);

  // Autoplay effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isAutoPlay && !gameState.over) {
      interval = setInterval(() => {
        // Check if we can make a move
        if (gameState.yourTurn && !gameState.over && gameState.turnQueue.length === 0) {
          playTurn(true);
        }
      }, settings.batchRoll.enabled ? settings.batchRoll.autoPlaySpeed : settings.t);
    }

    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    isAutoPlay, 
    gameState.over, 
    gameState.yourTurn, 
    gameState.turnQueue.length,
    settings.batchRoll.enabled, 
    settings.batchRoll.autoPlaySpeed, 
    settings.t,
    playTurn
  ]);

  // Game over check
  useEffect(() => {
    const isPlayerBankrupt = player.b / player.sb < settings.bankruptcyThreshold;
    if (gameState.over || isPlayerBankrupt) {
      setIsAutoPlay(false);
      if (gameState.over) {
        setShowGameOver(true);
        if (!isPlayerBankrupt) {
          audioManager.playVictory();
        }
      }
    }
  }, [gameState.over, player.b, player.sb, settings.bankruptcyThreshold]);

  const handleAutoPlay = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAutoPlay(e.target.checked);
  }

  const handleBotRiskChange = (index: number, value: number) => {
    if (!gameState.running) {
      setBotRisks(prev => {
        const next = [...prev]
        next[index] = value
        return next
      })
    }
  }

  const handleSettingsSave = () => {
    setShowSettings(false)
  }

  const handleSettingsReset = () => {
    setIsAutoPlay(false);
    setShowSettings(false)
    reset()
  }

  const handleGameReset = () => {
    setIsAutoPlay(false);
    setShowGameOver(false);
    reset();
  }

  const handleGameOverClose = () => {
    setShowGameOver(false);
  }

  // Check if max turns reached
  useEffect(() => {
    if (settings.maxTurns > 0 && gameState.turnsPlayed >= settings.maxTurns) {
      setGameState(prev => ({
        ...prev,
        over: true,
        running: false,
        yourTurn: false
      }));
    }
  }, [gameState.turnsPlayed, settings.maxTurns, setGameState]);

  const isPlayerBankrupt = player.b / player.sb < settings.bankruptcyThreshold;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 ${
      settings.layout === 'list' ? 'list-layout' : ''
    }`}>
      <div className="max-w-7xl mx-auto">
        <GameHeader
          onAutoPlay={handleAutoPlay}
          onShowSettings={() => setShowSettings(true)}
          isAutoPlay={isAutoPlay}
          onReset={handleGameReset}
          streakAdjustment={{
            active: gameState.streakAdjustmentActive,
            remaining: gameState.streakAdjustmentRemaining,
            adjustment: settings.streakAdjustment.adjustment
          }}
        />
        
        {/* Added Scoreboard Component */}
        {settings.displayMetrics.showScoreboard && (
          <Scoreboard 
            player={player}
            bots={bots}
            className="mb-6"
          />
        )}

        <GameGrid
          player={player}
          bots={bots}
          risk={risk}
          botRisks={botRisks}
          onPlayTurn={() => playTurn(true)}
          onSetRisk={setRisk}
          onSetBotRisk={handleBotRiskChange}
          disabled={!gameState.yourTurn || gameState.over}
          gameState={gameState}
          layout={settings.layout}
          displayMetrics={settings.displayMetrics}
          batchRoll={settings.batchRoll}
        />

        <GameOver
          playerBankrupt={isPlayerBankrupt}
          onReset={handleGameReset}
          open={showGameOver}
          onClose={handleGameOverClose}
          finalBalance={player.b}
          player={player}
          bots={bots}
          playerRisk={risk}
          botRisks={botRisks}
          displayMetrics={settings.displayMetrics}
        />
        
        <Settings
          settings={settings}
          onUpdate={setSettings}
          onSave={handleSettingsSave}
          onReset={handleSettingsReset}
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
        
        <Celebrations 
          active={gameState.over && !isPlayerBankrupt} 
          effects={settings.celebrationEffects}
        />
      </div>
    </div>
  )
}