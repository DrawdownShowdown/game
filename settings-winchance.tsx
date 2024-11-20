import { Label } from './ui-label'

type WinChanceSettingProps = {
  value: number
  onChange: (value: number) => void
}

export const WinChanceSetting = ({value, onChange}: WinChanceSettingProps) => (
  <div className="space-y-2">
    <Label>Win Chance: {value}%</Label>
    <div className="flex items-center gap-4">
      <input
        type="range"
        min="1"
        max="99"
        value={value}
        onChange={e => onChange(+e.target.value)}
        className="flex-1"
      />
      <span className="w-12 text-right">{value}%</span>
    </div>
  </div>
)