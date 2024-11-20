import { Label } from './ui-label'

type MultiplierSettingProps = {
  multipliers: Record<number, number>
  enabled: number[]
  onChange: (multipliers: Record<number, number>, enabled: number[]) => void
}

export const MultiplierSetting = ({multipliers, enabled, onChange}: MultiplierSettingProps) => (
  <div className="space-y-2">
    <Label>Multipliers</Label>
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(multipliers).map(([m, v]) => (
        <div key={m} className="flex items-center gap-2">
          <span className="w-8">{m}x:</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={v}
            onChange={e => onChange(
              {...multipliers, [m]: +e.target.value},
              enabled
            )}
            className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <span className="w-8">%</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled.includes(+m)}
              onChange={e => onChange(
                multipliers,
                e.target.checked ? [...enabled, +m].sort((a,b) => a-b) : enabled.filter(x => x !== +m)
              )}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Enable
          </label>
        </div>
      ))}
    </div>
  </div>
)