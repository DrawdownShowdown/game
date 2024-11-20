import { Label } from './ui-label'
import { AudioEffects } from './types'

type AudioEffectsSettingProps = {
  effects: AudioEffects
  onChange: (effects: AudioEffects) => void
}

export const AudioEffectsSetting = ({effects, onChange}: AudioEffectsSettingProps) => (
  <div className="space-y-2">
    <Label>Audio Settings</Label>
    <div className="grid gap-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={effects.bankruptcy}
          onChange={e => onChange({...effects, bankruptcy: e.target.checked})}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Bankruptcy Alert
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={effects.streakRecord}
          onChange={e => onChange({...effects, streakRecord: e.target.checked})}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        New Streak Record Alert
      </label>
      <div className="flex items-center gap-4">
        <Label className="w-24">Volume</Label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={effects.volume}
          onChange={e => onChange({...effects, volume: +e.target.value})}
          className="flex-1"
        />
        <span className="w-12 text-right">{Math.round(effects.volume * 100)}%</span>
      </div>
    </div>
  </div>
)