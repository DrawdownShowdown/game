import { Label } from './ui-label';
import { DisplayMetrics, RiskDisplayMode, MovingAverageSettings } from './types';
import { ChartSettingsPart } from './settings-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui-select';

type DisplayMetricsSettingProps = {
  metrics: DisplayMetrics;
  onChange: (metrics: DisplayMetrics) => void;
};

export const DisplayMetricsSetting = ({metrics, onChange}: DisplayMetricsSettingProps) => {
  const handleMetricChange = (key: keyof DisplayMetrics, value: boolean) => {
    onChange({
      ...metrics,
      [key]: value
    });
  };

  const handleRiskDisplayChange = (value: RiskDisplayMode) => {
    onChange({
      ...metrics,
      riskDisplay: value
    });
  };

  const handleChartSettingsChange = (chartSettings: DisplayMetrics['chartSettings']) => {
    onChange({
      ...metrics,
      chartSettings
    });
  };

  const handleMAChange = (key: keyof MovingAverageSettings, value: any) => {
    onChange({
      ...metrics,
      movingAverages: {
        ...metrics.movingAverages,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Display Metrics</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={metrics.accountPeak}
              onChange={e => handleMetricChange('accountPeak', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Account Peak
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={metrics.accountLow}
              onChange={e => handleMetricChange('accountLow', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Account Low
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={metrics.winLossRatio}
              onChange={e => handleMetricChange('winLossRatio', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Win/Loss Ratio
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={metrics.averageGain}
              onChange={e => handleMetricChange('averageGain', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Average Gain
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={metrics.averageLoss}
              onChange={e => handleMetricChange('averageLoss', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Average Loss
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={metrics.bestStreak}
              onChange={e => handleMetricChange('bestStreak', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Best Winning Streak
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={metrics.worstStreak}
              onChange={e => handleMetricChange('worstStreak', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Worst Losing Streak
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={metrics.totalTrades}
              onChange={e => handleMetricChange('totalTrades', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Total Trades
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={metrics.showAverageGainChart}
              onChange={e => handleMetricChange('showAverageGainChart', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show Gain Chart
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={metrics.showScoreboard}
              onChange={e => handleMetricChange('showScoreboard', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show Scoreboard
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Risk Display</Label>
        <Select
          value={metrics.riskDisplay}
          onValueChange={handleRiskDisplayChange}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select risk display mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hidden">Hidden</SelectItem>
            <SelectItem value="labels">Show Labels</SelectItem>
            <SelectItem value="legend">Show Legend</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Moving Averages</Label>
        <div className="grid gap-4 pl-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={metrics.movingAverages.fastMAEnabled}
                onChange={e => handleMAChange('fastMAEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Fast MA
            </label>
            <input
              type="number"
              min={1}
              max={metrics.movingAverages.slowMAPeriod - 1}
              value={metrics.movingAverages.fastMAPeriod}
              onChange={e => handleMAChange('fastMAPeriod', Math.max(1, parseInt(e.target.value)))}
              disabled={!metrics.movingAverages.fastMAEnabled}
              className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <span className="text-sm text-gray-500">period</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={metrics.movingAverages.slowMAEnabled}
                onChange={e => handleMAChange('slowMAEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Slow MA
            </label>
            <input
              type="number"
              min={metrics.movingAverages.fastMAPeriod + 1}
              max={1000}
              value={metrics.movingAverages.slowMAPeriod}
              onChange={e => handleMAChange('slowMAPeriod', Math.max(metrics.movingAverages.fastMAPeriod + 1, parseInt(e.target.value)))}
              disabled={!metrics.movingAverages.slowMAEnabled}
              className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <span className="text-sm text-gray-500">period</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <ChartSettingsPart
          settings={metrics.chartSettings}
          onChange={handleChartSettingsChange}
        />
      </div>
    </div>
  );
};