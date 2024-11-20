import { Sparkles } from 'lucide-react'
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip } from './ui-tooltip'
import { NumberDisplay } from './numberFormat'

interface GameHeaderProps {
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

export const GameHeader: React.FC<GameHeaderProps> = ({ 
  onAutoPlay, 
  onShowSettings, 
  onReset,
  isAutoPlay, 
  streakAdjustment 
}) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-4">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
        Drawdown Showdown
      </h1>
      {streakAdjustment.active && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={`
                  flex items-center gap-2 
                  ${streakAdjustment.adjustment > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  px-3 py-1 rounded-full
                  animate-pulse
                `}
              >
                <Sparkles className="w-4 h-4" />
                <span className="tabular-nums">
                  Win Rate {streakAdjustment.adjustment > 0 ? '+' : ''}{streakAdjustment.adjustment}% 
                  ({streakAdjustment.remaining})
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Streak adjustment active! Win rate temporarily {streakAdjustment.adjustment > 0 ? 'increased' : 'decreased'} for {streakAdjustment.remaining} more trades.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <div className="flex items-center gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                onChange={onAutoPlay}
                checked={isAutoPlay}
              />
              Auto
            </label>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Automatically execute trades at the configured speed</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <button 
        onClick={onReset}
        className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:shadow-lg transition-all"
      >
        Reset
      </button>
      <button 
        onClick={onShowSettings} 
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow hover:shadow-lg transition-all"
      >
        Config
      </button>
    </div>
  </div>
)