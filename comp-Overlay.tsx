import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMemo } from 'react';
import { NumberDisplay, formatChangeValue } from './numberFormat';

interface OverlayProps {
  c: number;  // change
  m: number;  // multiplier
  batchResults?: {
    wins: Record<number, number>;  // multiplier -> count
    totalWins: number;
    totalLosses: number;
  };
}

export const Overlay: React.FC<OverlayProps> = ({ c, m, batchResults }) => {
  // Always calculate multiplier summary if we have batch results
  const multiplierSummary = useMemo(() => {
    if (!batchResults?.wins) return null;
    const winEntries = Object.entries(batchResults.wins);
    if (winEntries.length === 0) return null;
    
    return winEntries
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([mult, count]) => `${mult}x(${count})`)
      .join(', ');
  }, [batchResults?.wins]);

  // Define animation styles
  const fadeOutAnimation = {
    animation: 'fadeOut 3s ease-out forwards',
    WebkitAnimation: 'fadeOut 3s ease-out forwards'
  };

  // Handle batch results - always show if batchResults exists
  if (batchResults) {
    const totalChange = batchResults.totalWins - batchResults.totalLosses;
    const isPositive = totalChange > 0;

    return (
      <div 
        key={`batch-summary-${Date.now()}`} 
        className="absolute inset-0 flex items-center justify-center z-10"
        style={fadeOutAnimation}
      >
        <div className={`flex flex-col items-center gap-2 bg-white/95 shadow-lg rounded-lg p-4 ${
          isPositive ? 'text-green-500' : 'text-red-500'
        }`}>
          <div className="flex items-center gap-2 text-xl font-bold">
            {isPositive ? <TrendingUp size={24}/> : <TrendingDown size={24}/>}
            <span>Total: <NumberDisplay value={totalChange} showFullValueOnHover={true} /></span>
          </div>
          {multiplierSummary && (
            <div className="text-sm text-gray-600">
              Wins: {multiplierSummary}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle single trade (only when not in batch mode and there was a change)
  if (c !== 0 && !batchResults) {
    return (
      <div 
        key={`single-trade-${Date.now()}`} 
        className="absolute inset-0 flex items-center justify-center z-10"
        style={fadeOutAnimation}
      >
        <div className={`flex items-center gap-2 bg-white/95 shadow-lg rounded-lg p-2 ${
          c > 0 ? 'text-green-500' : 'text-red-500'
        } text-xl font-bold`}>
          {c > 0 ? <TrendingUp size={24}/> : <TrendingDown size={24}/>}
          <span>{formatChangeValue(c, c > 0 ? m : undefined)}</span>
        </div>
      </div>
    );
  }

  return null;
}