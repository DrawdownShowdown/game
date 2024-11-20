import { PlayerCardProps, BotCardProps, PlayerData } from './types'
import { Chart } from './comp-Chart'
import { AverageGainChart } from './comp-AverageGainChart'
import { Overlay } from './comp-Overlay'
import { CardHeaderCustom, StatsGrid, RiskControls } from './cards-parts'
import { TooltipProvider, TooltipTrigger, TooltipContent } from './ui-tooltip'
import { Sparkles, Loader2 } from 'lucide-react'
import { NumberDisplay } from './numberFormat'

export const PlayerCard = ({
  data, 
  risk, 
  setRisk, 
  onPlay, 
  disabled,
  displayMetrics,
  batchRoll,
  streakAdjustment,
  processingBatch
}: PlayerCardProps) => {
  const isBankrupt = data.b <= 0 || data.b / data.sb < 0.5;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <CardHeaderCustom title="You" color="blue"/>
      <div className="relative">
        <div className="flex items-center justify-center gap-2">
          <div className={`text-2xl font-bold text-center ${
            isBankrupt ? 'text-red-500' : 
            data.c > 0 ? 'text-green-500' : 
            data.c < 0 ? 'text-red-500' : 
            'text-gray-700'
          }`}>
            $<NumberDisplay value={isBankrupt ? 0 : data.b} />
          </div>
          {processingBatch && (
            <div className="animate-spin ml-2">
              <Loader2 className="w-5 h-5 text-blue-500" />
            </div>
          )}
          {streakAdjustment.active && (
            <TooltipProvider>
              <TooltipTrigger asChild>
                <div className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{streakAdjustment.remaining}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Streak adjustment active for {streakAdjustment.remaining} more trades</p>
              </TooltipContent>
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
        disabled={disabled || isBankrupt || processingBatch}
        showPlayButton
        onPlay={onPlay}
        batchEnabled={batchRoll.enabled}
        batchSize={batchRoll.size}
      />
      {batchRoll.enabled && batchRoll.size > 1 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Trading {batchRoll.size} times per click
        </div>
      )}
    </div>
  )
}

export const BotCard = ({
  data, 
  index, 
  risk, 
  setRisk, 
  disabled,
  displayMetrics,
  processingBatch
}: BotCardProps) => {
  const isBankrupt = data.b <= 0 || data.b / data.sb < 0.5;

  return (
    <div className={`bg-white rounded-lg shadow p-4 relative ${isBankrupt ? 'opacity-75' : ''}`}>
      <CardHeaderCustom title={`Bot ${index + 1}`} color="indigo"/>
      <div className="relative">
        <div className={`text-2xl font-bold text-center ${
          isBankrupt ? 'text-red-500' :
          data.c > 0 ? 'text-green-500' : 
          data.c < 0 ? 'text-red-500' : 
          'text-gray-700'
        }`}>
          $<NumberDisplay value={isBankrupt ? 0 : data.b} />
        </div>
        {processingBatch && (
          <div className="absolute top-0 right-0">
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          </div>
        )}
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
        disabled={disabled || isBankrupt}
        showPlayButton={false}
        batchEnabled={false}
      />
    </div>
  )
}