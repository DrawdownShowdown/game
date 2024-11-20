import React from 'react';
import { Trophy, Frown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui.components.index';
import { Alert } from './ui.components.index';
import { NumberDisplay } from './numberFormat';
import { EndGameChart } from './EndGameChart';
import { PlayerData } from './types';
import html2canvas from 'html2canvas';

export interface GameOverProps {
  playerBankrupt: boolean;
  onReset: () => void;
  open: boolean;
  onClose?: () => void;
  finalBalance?: number;
  player: PlayerData;
  bots: PlayerData[];
  playerRisk: number;
  botRisks: number[];
  displayMetrics: { 
    riskDisplay: 'hidden' | 'labels' | 'legend' 
  };
}

const GameOver = ({ 
  playerBankrupt, 
  onReset, 
  open, 
  onClose, 
  finalBalance,
  player,
  bots,
  playerRisk,
  botRisks,
  displayMetrics
}: GameOverProps) => {
  const handleSaveChart = async () => {
    const chartElement = document.getElementById('end-game-chart');
    if (!chartElement) return;

    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'trading-history.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error saving chart:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full overflow-hidden flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Game Over!
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col items-center gap-6 p-8 overflow-auto">
          <div className="text-center">
            {playerBankrupt ? (
              <>
                <Frown className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-xl font-semibold text-red-600">
                  You went bankrupt!
                </p>
              </>
            ) : (
              <>
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <p className="text-xl font-semibold text-green-600">
                  You won! All bots went bankrupt!
                  {finalBalance && (
                    <div className="mt-2 text-lg">
                      Final Balance: $<NumberDisplay value={finalBalance} />
                    </div>
                  )}
                </p>
              </>
            )}
          </div>

          <div id="end-game-chart" className="w-full flex-1 min-h-[400px]">
            <EndGameChart 
              player={player}
              bots={bots}
              onSaveImage={handleSaveChart}
              playerRisk={playerRisk}
              botRisks={botRisks}
              riskDisplay={displayMetrics.riskDisplay}
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={onReset}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameOver;