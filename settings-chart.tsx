import React from 'react';
import { Label } from './ui-label';
import { ChartSettings } from './types';
import { defaults } from './defaults';

type ChartSettingsProps = {
  settings: ChartSettings;
  onChange: (settings: ChartSettings) => void;
};

export const ChartSettingsPart: React.FC<ChartSettingsProps> = ({
  settings,
  onChange
}) => {
  const handleChange = (key: keyof ChartSettings, value: any) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm text-gray-700">Chart Visualization</h4>
      
      <div className="grid gap-4 pl-4">
        <div className="flex items-center gap-4">
          <Label className="w-48">Sample Rate (trades)</Label>
          <input
            type="number"
            min={defaults.chart.minSampleRate}
            max={defaults.chart.maxSampleRate}
            value={settings.sampleRate}
            onChange={(e) => handleChange('sampleRate', Math.max(
              defaults.chart.minSampleRate,
              Math.min(defaults.chart.maxSampleRate, parseInt(e.target.value))
            ))}
            className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <span className="text-sm text-gray-500">
            ({defaults.chart.minSampleRate}-{defaults.chart.maxSampleRate})
          </span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.useLogScale}
            onChange={(e) => handleChange('useLogScale', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Use Logarithmic Scale
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showBankruptcyPoints}
            onChange={(e) => handleChange('showBankruptcyPoints', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Show Bankruptcy Points
        </label>
      </div>
    </div>
  );
};