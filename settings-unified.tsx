import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui.components.index';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui-tabs';
import { Alert, AlertDescription } from './ui.components.index';
import { Label } from './ui-label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui-select';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { GameSettings, CelebrationEffects, AudioEffects, DisplayMetrics, BatchRollConfig, RiskDisplayMode, StreakAdjustment } from './types';
import { defaults } from './defaults';

interface BaseSettingProps {
  onChange: (value: any) => void;
}

interface NumericSettingProps extends BaseSettingProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

const NumericSetting: React.FC<NumericSettingProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange
}) => (
  <div className="flex items-center gap-4">
    <Label className="w-48">{label}</Label>
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(+e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
    />
  </div>
);

interface BatchRollSettingProps extends BaseSettingProps {
  config: BatchRollConfig;
}

const BatchRollSetting: React.FC<BatchRollSettingProps> = ({ config, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label>Batch Trading</Label>
      <input
        type="checkbox"
        checked={config.enabled}
        onChange={e => onChange({ ...config, enabled: e.target.checked })}
        className="rounded border-gray-300 text-blue-600"
      />
    </div>
    {config.enabled && (
      <div className="grid gap-4 pl-4">
        <NumericSetting
          label="Trades per Batch"
          value={config.size}
          min={defaults.batchSizeConstraints.min}
          max={defaults.batchSizeConstraints.max}
          step={1}
          onChange={size => onChange({ ...config, size })}
        />
        <NumericSetting
          label="Auto Play Speed (ms)"
          value={config.autoPlaySpeed}
          min={defaults.speedConstraints.min}
          max={defaults.speedConstraints.max}
          step={1}
          onChange={speed => onChange({ ...config, autoPlaySpeed: speed })}
        />
      </div>
    )}
  </div>
);

interface DisplayMetricsSettingProps extends BaseSettingProps {
  metrics: DisplayMetrics;
}

const DisplayMetricsSetting: React.FC<DisplayMetricsSettingProps> = ({ metrics, onChange }) => {
  const toggleMetric = (key: keyof DisplayMetrics) => {
    onChange({
      ...metrics,
      [key]: !metrics[key]
    });
  };

  const handleRiskDisplayChange = (value: RiskDisplayMode) => {
    onChange({
      ...metrics,
      riskDisplay: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Display Metrics</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {[
            ['accountPeak', 'Account Peak'],
            ['accountLow', 'Account Low'],
            ['winLossRatio', 'Win/Loss Ratio'],
            ['averageGain', 'Average Gain'],
            ['averageLoss', 'Average Loss'],
            ['bestStreak', 'Best Streak'],
            ['worstStreak', 'Worst Streak'],
            ['totalTrades', 'Total Trades'],
            ['showAverageGainChart', 'Show Gain Chart'],
            ['showScoreboard', 'Show Scoreboard']
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={metrics[key as keyof DisplayMetrics] as boolean}
                onChange={() => toggleMetric(key as keyof DisplayMetrics)}
                className="rounded border-gray-300 text-blue-600"
              />
              {label}
            </label>
          ))}
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
    </div>
  );
};

interface StreakAdjustmentSettingProps extends BaseSettingProps {
  adjustment: StreakAdjustment;
}

const StreakAdjustmentSetting: React.FC<StreakAdjustmentSettingProps> = ({
  adjustment,
  onChange
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label>Streak-Based Win Rate Adjustment</Label>
      <input
        type="checkbox"
        checked={adjustment.enabled}
        onChange={e => onChange({ ...adjustment, enabled: e.target.checked })}
        className="rounded border-gray-300 text-blue-600"
      />
    </div>
    {adjustment.enabled && (
      <div className="grid gap-4 pl-4">
        <NumericSetting
          label="Required Streak"
          value={adjustment.requiredStreak}
          min={1}
          max={20}
          step={1}
          onChange={value => onChange({ ...adjustment, requiredStreak: value })}
        />
        <NumericSetting
          label="Duration (trades)"
          value={adjustment.duration}
          min={1}
          max={100}
          step={1}
          onChange={value => onChange({ ...adjustment, duration: value })}
        />
        <NumericSetting
          label="Adjustment (%)"
          value={adjustment.adjustment}
          min={-50}
          max={50}
          step={1}
          onChange={value => onChange({ ...adjustment, adjustment: value })}
        />
      </div>
    )}
  </div>
);

interface SettingsDialogProps {
  settings: GameSettings;
  open: boolean;
  onClose: () => void;
  onUpdate: (settings: GameSettings) => void;
  onSave: () => void;
  onReset: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  settings,
  open,
  onClose,
  onUpdate,
  onSave,
  onReset
}) => {
  const [showSaveConfirm, setShowSaveConfirm] = React.useState(false);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const handleSave = () => {
    onSave();
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const handleReset = () => {
    if (showResetConfirm) {
      onReset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogDescription>
            Configure game behavior and display options
          </DialogDescription>
        </DialogHeader>

        {showSaveConfirm && (
          <Alert className="absolute top-4 right-4 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="ml-4">Settings saved successfully</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="game" className="flex-1">
          <TabsList>
            <TabsTrigger value="game">Game</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <div className="p-4 space-y-6">
            <TabsContent value="game">
              <BatchRollSetting
                config={settings.batchRoll}
                onChange={batchRoll => onUpdate({ ...settings, batchRoll })}
              />
            </TabsContent>

            <TabsContent value="display">
              <DisplayMetricsSetting
                metrics={settings.displayMetrics}
                onChange={displayMetrics => onUpdate({ ...settings, displayMetrics })}
              />
            </TabsContent>

            <TabsContent value="advanced">
              <StreakAdjustmentSetting
                adjustment={settings.streakAdjustment}
                onChange={streakAdjustment => onUpdate({ ...settings, streakAdjustment })}
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg ${
              showResetConfirm ? 'bg-red-500' : 'bg-gray-500'
            } text-white`}
          >
            {showResetConfirm ? 'Confirm Reset' : 'Reset Game'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white"
          >
            Save Settings
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;