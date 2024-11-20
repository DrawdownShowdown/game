import { Label } from './ui-label'
import { CelebrationEffects } from './types'

type CelebrationEffectsSettingProps = {
  effects: CelebrationEffects
  onChange: (effects: CelebrationEffects) => void
}

export const CelebrationEffectsSetting = ({effects, onChange}: CelebrationEffectsSettingProps) => (
  <div className="space-y-2">
    <Label>Victory Celebrations</Label>
    <div className="grid grid-cols-2 gap-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={effects.confetti}
          onChange={e => onChange({...effects, confetti: e.target.checked})}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Confetti
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={effects.fireworks}
          onChange={e => onChange({...effects, fireworks: e.target.checked})}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Fireworks
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={effects.coinRain}
          onChange={e => onChange({...effects, coinRain: e.target.checked})}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Coin Rain
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={effects.victorySound}
          onChange={e => onChange({...effects, victorySound: e.target.checked})}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Victory Sound
      </label>
    </div>
  </div>
)