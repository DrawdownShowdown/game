import { PlayerData, DisplayMetrics } from './types'
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip } from './ui-tooltip'
import { NumberDisplay } from './numberFormat'

export const CardHeaderCustom = ({title, color}: {title: string, color: string}) => (
  <h2 className={`text-xl font-bold text-center mb-4 text-${color}-800`}>
    {title}
  </h2>
)

interface StatsGridProps {
  data: PlayerData
  displayMetrics: DisplayMetrics
}

const MetricTooltips: Record<string, string> = {
  'Peak': 'Highest balance achieved during the session',
  'Low': 'Lowest balance reached during the session',
  'W/L': 'Win/Loss ratio - total number of winning trades vs losing trades',
  'Avg Gain': 'Average profit per winning trade',
  'Avg Loss': 'Average loss per losing trade',
  'Best Streak': 'Longest consecutive winning streak',
  'Worst Streak': 'Longest consecutive losing streak',
  'Trades': 'Total number of trades executed'
}

export const StatsGrid: React.FC<StatsGridProps> = ({data, displayMetrics}) => {
  const metrics = [
    displayMetrics.accountPeak && ['Peak', <NumberDisplay key="peak" value={data.mb} prefix="$" />],
    displayMetrics.accountLow && ['Low', <NumberDisplay key="low" value={data.nb} prefix="$" />],
    displayMetrics.winLossRatio && ['W/L', `${data.w}/${data.l}`],
    displayMetrics.averageGain && ['Avg Gain', <NumberDisplay key="avg-gain" value={data.avg} prefix="$" />],
    displayMetrics.averageLoss && ['Avg Loss', <NumberDisplay key="avg-loss" value={data.avgl} prefix="$" />],
    displayMetrics.bestStreak && ['Best Streak', data.mw.toString()],
    displayMetrics.worstStreak && ['Worst Streak', (-data.ml).toString()],
    displayMetrics.totalTrades && ['Trades', data.r.toString()]
  ].filter((item): item is [string, string | JSX.Element] => Boolean(item));

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
}

interface RiskControlsProps {
  risk: number
  setRisk: (risk: number) => void
  disabled: boolean
  showPlayButton: boolean
  onPlay?: () => void
  batchEnabled?: boolean
  batchSize?: number
}

export const RiskControls: React.FC<RiskControlsProps> = ({
  risk,
  setRisk,
  disabled,
  showPlayButton,
  onPlay,
  batchEnabled,
  batchSize
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
            step={risk<1?"0.1":"1"}
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
      {showPlayButton && (
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
)