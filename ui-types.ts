import { PlayerData, DisplayMetrics, BatchRollConfig, RiskDisplayMode } from './game-types'
import { GameState } from './state-types'

// Base props shared by multiple components
interface BaseComponentProps {
  className?: string
}

// Card-related props
export interface PlayerCardProps extends BaseComponentProps {
  data: PlayerData
  risk: number
  setRisk: (risk: number) => void
  onPlay: () => void
  disabled: boolean
  displayMetrics: DisplayMetrics
  batchRoll: BatchRollConfig
  streakAdjustment: {
    active: boolean
    remaining: number
  }
  processingBatch: boolean
}

export interface BotCardProps extends BaseComponentProps {
  data: PlayerData
  index: number
  risk: number
  setRisk: (risk: number) => void
  disabled: boolean
  displayMetrics: DisplayMetrics
  processingBatch: boolean
}

export interface CardHeaderProps extends BaseComponentProps {
  title: string
  color: string
}

// Game component props
export interface GameHeaderProps extends BaseComponentProps {
  onAutoPlay: (e: React.ChangeEvent<HTMLInputElement>) => void
  onShowSettings: () => void
  onReset: () => void
  isAutoPlay: boolean
  streakAdjustment: {
    active: boolean
    remaining: number
    adjustment: number
  }
}

export interface GameGridProps extends BaseComponentProps {
  player: PlayerData
  bots: PlayerData[]
  risk: number
  botRisks: number[]
  onPlayTurn: () => void
  onSetRisk: (risk: number) => void
  onSetBotRisk: (index: number, value: number) => void
  disabled: boolean
  gameState: GameState
  layout: 'grid' | 'list'
  displayMetrics: DisplayMetrics
  batchRoll: BatchRollConfig
}

export interface GameOverProps extends BaseComponentProps {
  playerBankrupt: boolean
  onReset: () => void
  open: boolean
  onClose?: () => void
  finalBalance?: number
  player: PlayerData
  bots: PlayerData[]
  playerRisk: number
  botRisks: number[]
  displayMetrics: {
    riskDisplay: RiskDisplayMode
  }
}

// Chart-related props
export interface ChartProps {
  d: PlayerData
}

export interface AverageGainChartProps {
  data: PlayerData
  movingAverages: {
    fastMAEnabled: boolean
    slowMAEnabled: boolean
    fastMAPeriod: number
    slowMAPeriod: number
  }
}

// Control props
export interface RiskControlsProps {
  risk: number
  setRisk: (risk: number) => void
  disabled: boolean
  showPlayButton: boolean
  onPlay?: () => void
  batchEnabled?: boolean
  batchSize?: number
}

// Settings props
export interface SettingsProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  onReset: () => void
}

// Animation configuration
export interface AnimationConfig {
  duration: number
  ease: string
  delay?: number
}

export interface UIConfig {
  animations: {
    alert: AnimationConfig
    modal: AnimationConfig
    tabs: AnimationConfig
  }
  transitions: {
    fast: string
    default: string
    slow: string
  }
}