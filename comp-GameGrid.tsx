import { PlayerCard } from './cards-index';
import { BotCard } from './cards-index';
import { GameState, PlayerData, DisplayMetrics, BatchRollConfig } from './types';

interface GameGridProps {
  player: PlayerData;
  bots: PlayerData[];
  risk: number;
  botRisks: number[];
  onPlayTurn: () => void;
  onSetRisk: (risk: number) => void;
  onSetBotRisk: (index: number, value: number) => void;
  disabled: boolean;
  gameState: GameState;
  layout: 'grid' | 'list';
  displayMetrics: DisplayMetrics;
  batchRoll: BatchRollConfig;
}

export const GameGrid: React.FC<GameGridProps> = ({
  player,
  bots,
  risk,
  botRisks,
  onPlayTurn,
  onSetRisk,
  onSetBotRisk,
  disabled,
  gameState,
  layout,
  displayMetrics,
  batchRoll
}) => (
  <div className={`grid gap-4 ${
    layout === 'list' 
      ? 'grid-cols-1' 
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }`}>
    <PlayerCard
      data={player}
      risk={risk}
      setRisk={onSetRisk}
      onPlay={onPlayTurn}
      disabled={!!(!gameState.yourTurn || gameState.over)}
      displayMetrics={displayMetrics}
      batchRoll={batchRoll}
      streakAdjustment={{
        active: gameState.streakAdjustmentActive,
        remaining: gameState.streakAdjustmentRemaining
      }}
      processingBatch={gameState.processingBatch}
    />
    {bots.map((bot, i) => (
      <BotCard
        key={i}
        data={bot}
        index={i}
        risk={botRisks[i]}
        setRisk={(v: number) => onSetBotRisk(i, v)}
        disabled={disabled}
        displayMetrics={displayMetrics}
        processingBatch={gameState.processingBatch && gameState.turnQueue[0]?.type === 'bot' && gameState.turnQueue[0]?.index === i}
      />
    ))}
  </div>
);