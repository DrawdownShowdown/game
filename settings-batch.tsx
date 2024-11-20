import { Label } from './ui-label';
import { BatchRollConfig } from './types';
import { defaults } from './defaults';
import { NumberDisplay } from './numberFormat';

type BatchRollSettingProps = {
  config: BatchRollConfig;
  onChange: (config: BatchRollConfig) => void;
}

export const BatchRollSetting = ({config, onChange}: BatchRollSettingProps) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label>Batch Trading</Label>
      <input
        type="checkbox"
        checked={config.enabled}
        onChange={e => onChange({...config, enabled: e.target.checked})}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    </div>
    {config.enabled && (
      <div className="grid gap-4 pl-4">
        <div className="flex items-center gap-4">
          <Label className="w-48">Trades per Batch</Label>
          <input
            type="number"
            min={defaults.batchSizeConstraints.min}
            max={defaults.batchSizeConstraints.max}
            value={config.size}
            onChange={e => onChange({
              ...config,
              size: Math.min(
                defaults.batchSizeConstraints.max,
                Math.max(
                  defaults.batchSizeConstraints.min,
                  +e.target.value
                )
              )
            })}
            className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm tabular-nums"
          />
          <span className="text-sm text-gray-500">
            ({defaults.batchSizeConstraints.min}-{defaults.batchSizeConstraints.max})
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Label className="w-48">Auto Play Speed (ms)</Label>
          <input
            type="number"
            min={defaults.speedConstraints.min}
            max={defaults.speedConstraints.max}
            step="1"
            value={config.autoPlaySpeed}
            onChange={e => onChange({
              ...config,
              autoPlaySpeed: Math.min(
                defaults.speedConstraints.max,
                Math.max(
                  defaults.speedConstraints.min,
                  +e.target.value
                )
              )
            })}
            className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm tabular-nums"
          />
          <span className="text-sm text-gray-500">
            ({defaults.speedConstraints.min}-{defaults.speedConstraints.max})
          </span>
        </div>
      </div>
    )}
  </div>
)