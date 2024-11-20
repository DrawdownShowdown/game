import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { PlayerData } from './types';
import { formatTooltipValue } from './numberFormat';
import { MovingAverageSettings } from './types';

type AverageGainChartProps = {
  data: PlayerData;
  movingAverages: MovingAverageSettings;
}

interface ChartDataPoint {
  trade: number;
  fastMA?: number;
  slowMA?: number;
}

const calculateSMA = (data: number[], period: number): (number | undefined)[] => {
  const sma: (number | undefined)[] = [];
  let sum = 0;
  
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    if (i >= period) {
      sum -= data[i - period];
    }
    sma.push(i < period - 1 ? undefined : sum / Math.min(period, i + 1));
  }
  
  return sma;
};

export const AverageGainChart: React.FC<AverageGainChartProps> = ({ data, movingAverages }) => {
  const chartData = useMemo(() => {
    // Extract individual trade changes
    const tradeChanges: number[] = [];
    for (let i = 1; i < data.h.length; i++) {
      tradeChanges.push(data.h[i].v - data.h[i-1].v);
    }

    // Calculate moving averages
    const fastMA = movingAverages.fastMAEnabled ? 
      calculateSMA(tradeChanges, movingAverages.fastMAPeriod) : [];
    const slowMA = movingAverages.slowMAEnabled ? 
      calculateSMA(tradeChanges, movingAverages.slowMAPeriod) : [];

    // Create chart data points
    return tradeChanges.map((_, index) => ({
      trade: index + 1,
      fastMA: fastMA[index],
      slowMA: slowMA[index]
    }));
  }, [data.h, movingAverages]);

  // Don't render if both MAs are disabled or no data
  if ((!movingAverages.fastMAEnabled && !movingAverages.slowMAEnabled) || data.h.length <= 1) {
    return null;
  }

  return (
    <div className="relative h-32 w-full">
      <div className="text-xs text-gray-500 absolute top-0 left-0">Moving Averages</div>
      <LineChart 
        width={280} 
        height={120} 
        data={chartData}
        margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
      >
        <XAxis 
          dataKey="trade" 
          hide 
          domain={['dataMin', 'dataMax']}
        />
        <YAxis 
          hide 
          domain={['auto', 'auto']}
        />
        <Tooltip
          formatter={(value: number) => formatTooltipValue(value)}
          labelFormatter={(trade: number) => `Trade ${trade}`}
        />
        {movingAverages.fastMAEnabled && (
          <Line
            type="monotone"
            dataKey="fastMA"
            stroke="#ef4444"
            dot={false}
            strokeWidth={1.5}
            name={`Fast MA (${movingAverages.fastMAPeriod})`}
            connectNulls
          />
        )}
        {movingAverages.slowMAEnabled && (
          <Line
            type="monotone"
            dataKey="slowMA"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={1.5}
            name={`Slow MA (${movingAverages.slowMAPeriod})`}
            connectNulls
          />
        )}
      </LineChart>
    </div>
  );
};

export default AverageGainChart;