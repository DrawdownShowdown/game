import { Label } from './ui-label'
import { StreakAdjustment } from './types'

type StreakAdjustmentSettingProps = {
  adjustment: StreakAdjustment
  onChange: (adjustment: StreakAdjustment) => void
}

export const StreakAdjustmentSetting = ({adjustment, onChange}: StreakAdjustmentSettingProps) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label>Streak-Based Win Rate Adjustment</Label>
      <input
        type="checkbox"
        checked={adjustment.enabled}
        onChange={e => onChange({...adjustment, enabled: e.target.checked})}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    </div>
    <div className="grid gap-4 pl-4">
      <div className="flex items-center gap-4">
        <Label className="w-48">Required Streak</Label>
        <input
          type="number"
          min="1"
          max="20"
          value={adjustment.requiredStreak}
          onChange={e => onChange({...adjustment, requiredStreak: +e.target.value})}
          disabled={!adjustment.enabled}
          className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        trades
      </div>
      <div className="flex items-center gap-4">
        <Label className="w-48">Duration (trades)</Label>
        <input
          type="number"
          min="1"
          max="100"
          value={adjustment.duration}
          onChange={e => onChange({...adjustment, duration: +e.target.value})}
          disabled={!adjustment.enabled}
          className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-4">
        <Label className="w-48">Adjustment (%)</Label>
        <input
          type="number"
          min="-50"
          max="50"
          value={adjustment.adjustment}
          onChange={e => onChange({...adjustment, adjustment: +e.target.value})}
          disabled={!adjustment.enabled}
          className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  </div>
)