import React, { useMemo, useCallback, memo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { PlayerData } from './types';
import { formatTooltipValue } from './numberFormat';
import { useResizeObserver } from './useResizeObserver'; // Fixed import path
import { throttle } from './utils';

const SAMPLE_THRESHOLD = 1000; // Points threshold before sampling
const MIN_POINTS_DISPLAYED = 100;
const ANIMATION_THRESHOLD = 50; // Disable animations above this many points

interface ChartDimensions {
  width: number;
  height: number;
}

interface ChartProps {
  d: PlayerData;
  dimensions?: ChartDimensions;
}

// Memoized data sampling function
const sampleData = (data: Array<{t: number; v: number}>, sampleSize: number) => {
  if (data.length <= sampleSize) return data;
  
  const sampled: Array<{t: number; v: number}> = [];
  const step = data.length / sampleSize;
  
  for (let i = 0; i < data.length; i += step) {
    const index = Math.floor(i);
    if (index < data.length) {
      sampled.push(data[index]);
    }
  }
  
  // Always include the last point
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1]);
  }
  
  return sampled;
};

// Memoized tooltip component
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  
  return (
    <div className="bg-white p-2 border rounded shadow-lg">
      <div className="text-gray-600">Trade {label}</div>
      <div className="font-medium">
        {formatTooltipValue(payload[0]?.value)}
      </div>
    </div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';

// Memoized Chart container
export const Chart = memo(({ d, dimensions }: ChartProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const size = useResizeObserver(containerRef);
  
  // Memoize chart dimensions
  const chartDimensions = useMemo(() => ({
    width: dimensions?.width ?? size?.width ?? 280,
    height: dimensions?.height ?? size?.height ?? 120
  }), [dimensions, size]);

  // Memoize data processing
  const processedData = useMemo(() => {
    const dataLength = d.h.length;
    if (dataLength > SAMPLE_THRESHOLD) {
      return sampleData(d.h, Math.max(MIN_POINTS_DISPLAYED, Math.floor(chartDimensions.width / 2)));
    }
    return d.h;
  }, [d.h, chartDimensions.width]);

  // Memoize domain calculations
  const domains = useMemo(() => {
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    for (let i = 0; i < processedData.length; i++) {
      const value = processedData[i].v;
      if (value < minValue) minValue = value;
      if (value > maxValue) maxValue = value;
    }
    
    const padding = (maxValue - minValue) * 0.1;
    return {
      yMin: Math.max(0, minValue - padding),
      yMax: maxValue + padding
    };
  }, [processedData]);

  // Throttled update handler
  const handleMouseMove = useCallback(
    throttle((e: any) => {
      // Custom mouse move handling if needed
    }, 16),
    []
  );

  return (
    <div ref={containerRef} className="relative h-32 w-full">
      <LineChart
        width={chartDimensions.width}
        height={chartDimensions.height}
        data={processedData}
        onMouseMove={handleMouseMove}
        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
      >
        <Line
          type="monotone"
          dataKey="v"
          stroke="#6366f1"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={processedData.length < ANIMATION_THRESHOLD}
          animationDuration={300}
        />
        <XAxis
          dataKey="t"
          hide
          domain={['dataMin', 'dataMax']}
          type="number"
        />
        <YAxis
          hide
          domain={[domains.yMin, domains.yMax]}
          type="number"
        />
        <Tooltip
          content={<CustomTooltip />}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
});

Chart.displayName = 'Chart';

// Memoized Average Gain Chart
export const AverageGainChart = memo(({ 
  data,
  movingAverages 
}: { 
  data: PlayerData;
  movingAverages: {
    fastMAEnabled: boolean;
    slowMAEnabled: boolean;
    fastMAPeriod: number;
    slowMAPeriod: number;
  };
}) => {
  // Memoize chart data calculation
  const chartData = useMemo(() => {
    if (data.h.length <= 1) return [];

    const points = data.h.map((point, index) => {
      const trades = index + 1;
      const avgGain = data.tw / Math.max(1, data.w);
      return { t: trades, v: avgGain };
    });

    return points.length > SAMPLE_THRESHOLD 
      ? sampleData(points, Math.max(MIN_POINTS_DISPLAYED, Math.floor(280 / 2)))
      : points;
  }, [data.h, data.tw, data.w]);

  if (chartData.length === 0) return null;

  return (
    <div className="relative h-32 w-full">
      <div className="text-xs text-gray-500 absolute top-0 left-0">
        Average Gain
      </div>
      <LineChart 
        width={280} 
        height={120} 
        data={chartData}
        margin={{ top: 15, right: 5, bottom: 5, left: 5 }}
      >
        <Line
          type="monotone"
          dataKey="v"
          stroke="#22c55e"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={chartData.length < ANIMATION_THRESHOLD}
          animationDuration={300}
        />
        <XAxis
          dataKey="t"
          hide
          domain={['dataMin', 'dataMax']}
          type="number"
        />
        <YAxis
          hide
          domain={['auto', 'auto']}
          type="number"
        />
        <Tooltip
          content={<CustomTooltip />}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
});

AverageGainChart.displayName = 'AverageGainChart';

export default Chart;