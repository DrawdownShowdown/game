import { GameSettings } from './types'
import { Label } from './ui-label'

type NumericSettingProps = {
  settings: [string, keyof GameSettings, number, number, number][]
  currentValues: GameSettings
  onUpdate: (settings: GameSettings) => void
}

export const NumericSetting = ({settings, currentValues, onUpdate}: NumericSettingProps) => (
  <div className="space-y-2">
    {settings.map(([label, key, min, max, step]) => (
      <div key={key} className="flex items-center gap-4">
        <Label className="w-48">{label}</Label>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={currentValues[key] as number}
          onChange={e => onUpdate({
            ...currentValues,
            [key]: +e.target.value
          })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    ))}
  </div>
)