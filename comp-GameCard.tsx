import React, { memo, useMemo } from 'react';
import { PlayerData, DisplayMetrics, BatchRollConfig } from './types';
import { Chart } from './comp-Chart';
import { AverageGainChart } from './comp-AverageGainChart';
import { Overlay } from './comp-Overlay';
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip } from './ui-tooltip';
import { Sparkles, Loader2 } from 'lucide-react';
import { NumberDisplay } from './numberFormat';

// Memoized Stats Grid Component
const StatsGrid = memo(({ data, displayMetrics }: { data: PlayerData; displayMetrics: DisplayMetrics }) => {
  const metrics = useMemo(() => [
    displayMetrics.accountPeak && ['Peak', <NumberDisplay key="peak" value={data.mb} prefix="$" />],
    displayMetrics.accountLow && ['Low', <NumberDisplay key="low" value={data.nb} prefix="$" />],
    displayMetrics.winLossRatio && ['W/L', `${data.w}/${data.l}`],
    displayMetrics.averageGain && ['Avg Gain', <NumberDisplay key="avg-gain" value={data.avg} prefix="$" />],
    displayMetrics.averageLoss && ['Avg Loss', <NumberDisplay key="avg-loss" value={data.avgl} prefix="$" />],
    displayMetrics.bestStreak && ['Best Streak', data.mw.toString()],
    displayMetrics.worstStreak && ['Worst Streak', (-data.ml).toString()],
    displayMetrics.totalTrades && ['Trades', data.r.toString()]
  ].filter((item): item is [string, string | JSX.Element] => Boolean(item)), [data, displayMetrics]);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded text-sm">
        {metrics.map(([key, value]) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <div className="hover:bg-gray-100 rounded px-1 cursor-help">
                <span className="text-gray-600">{key}:</span>{' '}
                <span className="tabular-nums">{value}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{MetricTooltips[key]}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
});

StatsGrid.displayName = 'StatsGrid';

// Memoized Risk Controls
const RiskControls = memo(({
  risk,
  setRisk,
  disabled,
  showPlayButton,
  onPlay,
  batchEnabled,
  batchSize
}: {
  risk: number;
  setRisk: (risk: number) => void;
  disabled: boolean;
  showPlayButton: boolean;
  onPlay?: () => void;
  batchEnabled?: boolean;
  batchSize?: number;
}) => (
  <div className="mt-4 space-y-4">
    <TooltipProvider>
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="block mb-2 font-medium cursor-help">
              Risk: {risk}%
            </label>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Percentage of current balance to risk on each trade</p>
          </TooltipContent>
        </Tooltip>
        {showPlayButton ? (
          <input
            type="range"
            min="0.1"
            max="100"
            step={risk < 1 ? "0.1" : "1"}
            value={risk}
            onChange={e => setRisk(+e.target.value)}
            className="w-full"
            disabled={disabled}
          />
        ) : (
          <input
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            value={risk}
            onChange={e => setRisk(+e.target.value)}
            disabled={disabled}
            className="p-2 border rounded-lg w-32"
          />
        )}
      </div>
      {showPlayButton && onPlay && (
        <button
          onClick={onPlay}
          disabled={disabled}
          className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {batchEnabled && batchSize && batchSize > 1 ? `Trade ${batchSize}x` : 'Trade'}
        </button>
      )}
    </TooltipProvider>
  </div>
));

RiskControls.displayName = 'RiskControls';

// Constants
const MetricTooltips: Record<string, string> = {
  'Peak': 'Highest balance achieved during the session',
  'Low': 'Lowest balance reached during the session',
  'W/L': 'Win/Loss ratio - total number of winning trades vs losing trades',
  'Avg Gain': 'Average profit per winning trade',
  'Avg Loss': 'Average loss per losing trade',
  'Best Streak': 'Longest consecutive winning streak',
  'Worst Streak': 'Longest consecutive losing streak',
  'Trades': 'Total number of trades executed'
};

// Main GameCard Component
export const GameCard = memo(({
  data,
  risk,
  setRisk,
  isPlayer = false,
  botIndex,
  onPlay,
  disabled,
  displayMetrics,
  batchRoll,
  streakAdjustment,
  processingBatch
}: {
  data: PlayerData;
  risk: number;
  setRisk: (risk: number) => void;
  isPlayer?: boolean;
  botIndex?: number;
  onPlay?: () => void;
  disabled: boolean;
  displayMetrics: DisplayMetrics;
  batchRoll?: BatchRollConfig;
  streakAdjustment?: {
    active: boolean;
    remaining: number;
  };
  processingBatch?: boolean;
}) => {
  const isBankrupt = useMemo(() => 
    data.b <= 0 || data.b / data.sb < 0.5, 
    [data.b, data.sb]
  );

  const title = isPlayer ? 'You' : `Bot ${botIndex! + 1}`;
  const colorScheme = isPlayer ? 'blue' : 'indigo';

  const balanceClassName = useMemo(() => {
    if (isBankrupt) return 'text-red-500';
    if (data.c > 0) return 'text-green-500';
    if (data.c < 0) return 'text-red-500';
    return 'text-gray-700';
  }, [isBankrupt, data.c]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className={`text-xl font-bold text-center mb-4 text-${colorScheme}-800`}>
        {title}
      </h2>
      <div className="relative">
        <div className="flex items-center justify-center gap-2">
          <div className={`text-2xl font-bold text-center ${balanceClassName}`}>
            $<NumberDisplay value={isBankrupt ? 0 : data.b} />
          </div>
          {processingBatch && (
            <div className="animate-spin ml-2">
              <Loader2 className="w-5 h-5 text-blue-500" />
            </div>
          )}
          {isPlayer && streakAdjustment?.active && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{streakAdjustment.remaining}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Streak adjustment active for {streakAdjustment.remaining} more trades</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="relative h-32 w-full">
          {!isBankrupt && (data.c !== 0 || data.batchResults) && (
            <Overlay 
              c={data.c} 
              m={data.m} 
              batchResults={data.batchResults}
            />
          )}
          <Chart d={data}/>
          {isBankrupt && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg transform rotate-12 text-lg font-bold shadow-lg">
                BANKRUPT
              </div>
            </div>
          )}
        </div>
        {displayMetrics.showAverageGainChart && (
          <div className="h-32 w-full mt-4 border-t border-gray-100 pt-4">
            <AverageGainChart 
              data={data}
              movingAverages={displayMetrics.movingAverages}
            />
          </div>
        )}
        <StatsGrid data={data} displayMetrics={displayMetrics}/>
      </div>
      <RiskControls
        risk={risk}
        setRisk={setRisk}
        disabled={Boolean(disabled || isBankrupt || processingBatch)}
        showPlayButton={isPlayer}
        onPlay={onPlay}
        batchEnabled={batchRoll?.enabled}
        batchSize={batchRoll?.size}
      />
      {isPlayer && batchRoll?.enabled && batchRoll.size > 1 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Trading {batchRoll.size} times per click
        </div>
      )}
    </div>
  );
});

GameCard.displayName = 'GameCard';

export default GameCard;