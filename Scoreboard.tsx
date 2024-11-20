import React from 'react';
import { PlayerData } from './types';
import { NumberDisplay } from './numberFormat';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ScoreboardProps {
  player: PlayerData;
  bots: PlayerData[];
  className?: string;
}

interface PlayerEntry {
  name: string;
  data: PlayerData;
}

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

export const Scoreboard: React.FC<ScoreboardProps> = ({ player, bots, className }) => {
  const [isExpanded, setIsExpanded] = useLocalStorage('scoreboard-expanded', false);
  
  // Combine and sort players by balance
  const sortedPlayers: PlayerEntry[] = React.useMemo(() => {
    const allPlayers: PlayerEntry[] = [
      { name: 'You', data: player },
      ...bots.map((bot, index) => ({ name: `Bot ${index + 1}`, data: bot }))
    ];
    
    return allPlayers
      .filter(p => p.data.b / p.data.sb >= 0.5) // Filter out bankrupt players
      .sort((a, b) => b.data.b - a.data.b);     // Sort by balance descending
  }, [player, bots]);

  // Find player's current position
  const playerPosition = React.useMemo(() => {
    return sortedPlayers.findIndex((p: PlayerEntry) => p.name === 'You') + 1;
  }, [sortedPlayers]);

  const positionSuffix = playerPosition === 1 ? 'st' : 
                        playerPosition === 2 ? 'nd' : 
                        playerPosition === 3 ? 'rd' : 'th';

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-4 ${className}`}>
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <div className={`w-1 h-6 rounded-full ${
            playerPosition === 1 ? 'bg-yellow-400' :
            playerPosition === 2 ? 'bg-gray-400' :
            playerPosition === 3 ? 'bg-amber-600' :
            'bg-blue-500'
          }`} />
          Scoreboard - {playerPosition}{positionSuffix} Place - {isExpanded ? 'Expanded' : 'Collapsed'}
        </h2>
        <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-100">
          {sortedPlayers.map((p: PlayerEntry, index: number) => (
            <div 
              key={p.name}
              className={`flex justify-between items-center px-4 py-3
                ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                ${p.name === 'You' ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-100'}
                transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-sm
                  ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'}`}
                >
                  {index + 1}
                </div>
                <span className={`font-medium ${p.name === 'You' ? 'text-blue-600' : ''}`}>
                  {p.name}
                </span>
              </div>
              <span className={`tabular-nums font-semibold ${
                p.data.b > p.data.sb ? 'text-green-600' :
                p.data.b < p.data.sb ? 'text-red-600' :
                'text-gray-600'
              }`}>
                $<NumberDisplay value={p.data.b} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};