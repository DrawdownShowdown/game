import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { PlayerData, RiskDisplayMode } from './types';
import { formatNumber } from './numberFormat';
import { Download } from 'lucide-react';

const COLORS = [
  '#FF0000', // Red
  '#0000FF', // Blue
  '#00FF00', // Green
  '#FFFF00', // Yellow
  '#FFA500', // Orange
  '#800080', // Purple
  '#00FFFF', // Cyan
  '#FF00FF'  // Magenta
];

const LINE_STYLES = ['solid', 'dashed', 'dotted', 'dash-dot'];

interface EndGameChartProps {
  player: PlayerData;
  bots: PlayerData[];
  sampleRate?: number;
  onSaveImage?: () => void;
  playerRisk: number;
  botRisks: number[];
  riskDisplay: RiskDisplayMode;
}

const getLineStyle = (index: number): string => {
  return LINE_STYLES[Math.floor(index / COLORS.length) % LINE_STYLES.length];
};

const getStrokeDasharray = (style: string): string => {
  switch (style) {
    case 'dashed':
      return '5,5';
    case 'dotted':
      return '2,2';
    case 'dash-dot':
      return '5,2,2,2';
    default:
      return '';
  }
};

const isBankrupt = (value: number, startingBalance: number) => value / startingBalance < 0.5;

const RiskLabel = ({ 
  x, 
  y, 
  risk, 
  color, 
  isPlayer 
}: { 
  x: number; 
  y: number; 
  risk: number; 
  color: string; 
  isPlayer: boolean;
}) => (
  <g transform={`translate(${x},${y})`}>
    <rect
      x="-20"
      y="-10"
      width="40"
      height="20"
      rx="4"
      fill="white"
      stroke={color}
      strokeWidth="1"
      fillOpacity="0.9"
    />
    <text
      x="0"
      y="4"
      textAnchor="middle"
      fill={color}
      fontSize="12"
      fontWeight={isPlayer ? "bold" : "normal"}
    >
      {`${risk}%`}
    </text>
  </g>
);

export const EndGameChart: React.FC<EndGameChartProps> = ({
  player,
  bots,
  onSaveImage,
  playerRisk,
  botRisks,
  riskDisplay
}) => {
  const [hiddenPlayers, setHiddenPlayers] = useState<Set<number>>(new Set());

  const { chartData, bankruptcyPoints, lastValidPoints } = useMemo(() => {
    const allPlayers = [player, ...bots];
    const maxTrades = Math.max(...allPlayers.map(p => p.h.length));
    const sampledData = [];
    const bankruptcyData = allPlayers.map(() => ({ trade: -1, value: 0 }));
    const lastPoints = allPlayers.map(() => ({ trade: 0, value: 0 }));

    // Find bankruptcy points and last valid points
    allPlayers.forEach((p, playerIndex) => {
      let lastValidPoint = { trade: 0, value: p.h[0].v };
      
      for (let i = 0; i < p.h.length; i++) {
        if (!isBankrupt(p.h[i].v, p.sb)) {
          lastValidPoint = { trade: i, value: p.h[i].v };
        }
        
        if (isBankrupt(p.h[i].v, p.sb) && bankruptcyData[playerIndex].trade === -1) {
          bankruptcyData[playerIndex] = { trade: i, value: p.h[i].v };
          break;
        }
      }
      
      lastPoints[playerIndex] = lastValidPoint;
    });

    // Create chart data points
    for (let i = 0; i < maxTrades; i++) {
      const dataPoint: any = { trade: i };
      
      allPlayers.forEach((p, playerIndex) => {
        if (i < p.h.length) {
          if (bankruptcyData[playerIndex].trade === -1 || i <= bankruptcyData[playerIndex].trade) {
            dataPoint[`player${playerIndex}`] = p.h[i].v;
          }
        }
      });
      
      sampledData.push(dataPoint);
    }

    return {
      chartData: sampledData,
      bankruptcyPoints: bankruptcyData,
      lastValidPoints: lastPoints
    };
  }, [player, bots]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-bold">Trade {label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => {
            if (hiddenPlayers.has(index)) return null;
            const risk = index === 0 ? playerRisk : botRisks[index - 1];
            
            return (
              <div 
                key={entry.name} 
                style={{ color: entry.color }}
                className="flex items-center gap-2"
              >
                <span className="font-medium">
                  {index === 0 ? 'Player' : `Bot ${index}`}
                  {riskDisplay === 'labels' && ` (${risk}%)`}:
                </span>
                <span className="tabular-nums">
                  ${formatNumber(entry.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center p-4">
        {payload.map((entry: any, index: number) => {
          const isHidden = hiddenPlayers.has(index);
          const style = getLineStyle(index);
          const risk = index === 0 ? playerRisk : botRisks[index - 1];
          
          return (
            <div
              key={entry.value}
              className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity
                ${isHidden ? 'opacity-50' : 'opacity-100'}`}
              onClick={() => {
                const newHidden = new Set(hiddenPlayers);
                if (isHidden) {
                  newHidden.delete(index);
                } else {
                  newHidden.add(index);
                }
                setHiddenPlayers(newHidden);
              }}
            >
              <div 
                className="w-8 h-0.5"
                style={{ 
                  backgroundColor: entry.color,
                  borderTop: `2px ${style} ${entry.color}`
                }}
              />
              <span className={isHidden ? 'line-through' : ''}>
                {index === 0 ? 'Player' : `Bot ${index}`}
                {riskDisplay === 'legend' && (
                  <span className="ml-1 text-sm text-gray-600">
                    ({risk}%)
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center px-4">
        <h3 className="text-lg font-semibold">Trading History</h3>
        {onSaveImage && (
          <button
            onClick={onSaveImage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Download size={16} />
            Save Chart
          </button>
        )}
      </div>
      
      <div className="flex-1" style={{ aspectRatio: '16/9' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="trade" 
              label={{ 
                value: 'Trade Number',
                position: 'insideBottom',
                offset: -10
              }}
            />
            <YAxis 
              label={{ 
                value: 'Account Value ($)', 
                angle: -90, 
                position: 'insideLeft'
              }}
              tickFormatter={(value) => `$${formatNumber(value)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            
            {[player, ...bots].map((p, index) => {
              const style = getLineStyle(index);
              const bankruptcyPoint = bankruptcyPoints[index];
              const lastValidPoint = lastValidPoints[index];
              const color = COLORS[index % COLORS.length];
              const risk = index === 0 ? playerRisk : botRisks[index - 1];
              
              return (
                <React.Fragment key={index}>
                  <Line
                    type="monotone"
                    dataKey={`player${index}`}
                    stroke={color}
                    strokeDasharray={getStrokeDasharray(style)}
                    strokeWidth={index === 0 ? 2 : 1}
                    dot={false}
                    activeDot={{ r: index === 0 ? 6 : 4 }}
                    hide={hiddenPlayers.has(index)}
                  />
                  {bankruptcyPoint.trade !== -1 && !hiddenPlayers.has(index) && (
                    <ReferenceDot
                      x={bankruptcyPoint.trade}
                      y={bankruptcyPoint.value}
                      r={6}
                      fill="none"
                      stroke={color}
                      strokeWidth={2}
                      shape={(props) => {
                        const { cx, cy } = props;
                        const size = 6;
                        return (
                          <g>
                            <line 
                              x1={cx - size} 
                              y1={cy - size} 
                              x2={cx + size} 
                              y2={cy + size} 
                              stroke={color} 
                              strokeWidth={2} 
                            />
                            <line 
                              x1={cx - size} 
                              y1={cy + size} 
                              x2={cx + size} 
                              y2={cy - size} 
                              stroke={color} 
                              strokeWidth={2} 
                            />
                          </g>
                        );
                      }}
                    />
                  )}
                  {riskDisplay === 'labels' && !hiddenPlayers.has(index) && (
                    <RiskLabel
                      x={lastValidPoint.trade}
                      y={lastValidPoint.value}
                      risk={risk}
                      color={color}
                      isPlayer={index === 0}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};