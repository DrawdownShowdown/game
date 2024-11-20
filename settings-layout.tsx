import { Label } from './ui-label'

type LayoutSettingProps = {
  value: 'grid' | 'list'
  onChange: (value: 'grid' | 'list') => void
}

export const LayoutSetting = ({value, onChange}: LayoutSettingProps) => (
  <div className="space-y-2">
    <Label>Layout Style</Label>
    <div className="flex gap-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={value === 'grid'}
          onChange={() => onChange('grid')}
          className="text-blue-600 focus:ring-blue-500"
        />
        Grid Layout
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={value === 'list'}
          onChange={() => onChange('list')}
          className="text-blue-600 focus:ring-blue-500"
        />
        List Layout
      </label>
    </div>
  </div>
)