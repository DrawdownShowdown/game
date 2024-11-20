import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui.dialog'; // Back to original
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui-tabs'; // Back to original
import { Alert, AlertDescription } from './ui.components.index'; // New alert import
import { CheckCircle2, AlertCircle } from 'lucide-react';
import {
  NumericSetting,
  WinChanceSetting,
  MultiplierSetting,
  LayoutSetting,
  CelebrationEffectsSetting,
  AudioEffectsSetting,
  DisplayMetricsSetting,
  StreakAdjustmentSetting,
  BatchRollSetting
} from './settings-parts';
import { GameSettings } from './types';
import { defaults } from './defaults';

interface SettingsProps {
  settings: GameSettings;
  onUpdate: (s: GameSettings) => void;
  onSave: () => void;
  onReset: () => void;
  open: boolean;
  onClose: () => void;
}

export const Settings = ({ settings: initialSettings, onUpdate, onSave, onReset, open, onClose }: SettingsProps) => {
  const [currentSettings, setCurrentSettings] = useState<GameSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    setCurrentSettings(initialSettings);
    setHasChanges(false);
  }, [initialSettings]);

  const handleUpdate = (newSettings: GameSettings) => {
    setCurrentSettings(newSettings);
    setHasChanges(true);
    onUpdate(newSettings);
  };

  const handleSave = () => {
    onSave();
    setHasChanges(false);
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

  const ActionButtons = () => (
    <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-4 mt-4">
      <button
        onClick={handleReset}
        className={`px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all ${
          showResetConfirm
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-gray-500 hover:bg-gray-600 text-white'
        }`}
      >
        {showResetConfirm ? 'Confirm Reset' : 'Reset Game'}
      </button>
      <button
        onClick={handleSave}
        disabled={!hasChanges}
        className={`px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all ${
          hasChanges
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Save Settings
      </button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Game Settings</DialogTitle>
        </DialogHeader>

        {showSaveConfirm && (
          <Alert className="absolute top-4 right-4 w-auto bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">Settings saved successfully</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="game" className="flex-1 overflow-hidden flex flex-col">
  <div className="border-b border-gray-200 bg-gray-50/50">
    <TabsList className="w-full justify-start">
      <TabsTrigger value="game" className="relative">
        Game
      </TabsTrigger>
      <TabsTrigger value="trading" className="relative">
        Trading
      </TabsTrigger>
      <TabsTrigger value="display" className="relative">
        Display
      </TabsTrigger>
      <TabsTrigger value="effects" className="relative">
        Effects
      </TabsTrigger>
    </TabsList>
  </div>

  <div className="flex-1 overflow-y-auto px-6 pt-4 border-t border-gray-200">
            <TabsContent value="game" className="mt-0 space-y-6">
              <h3 className="text-lg font-semibold">Game Configuration</h3>
              <NumericSetting
                settings={[
                  ['Starting Capital', 'i', 100, 1e6, 100],
                  ['Number of Bots', 'n', 1, 8, 1],
                  ['Bankruptcy Threshold (%)', 'bankruptcyThreshold', 0.1, 100, 0.1],
                  ['Max Turns (0 for unlimited)', 'maxTurns', 0, 1000, 1],
                ]}
                currentValues={currentSettings}
                onUpdate={handleUpdate}
              />
              <WinChanceSetting
                value={currentSettings.p}
                onChange={v => handleUpdate({ ...currentSettings, p: v })}
              />
              <MultiplierSetting
                multipliers={currentSettings.m}
                enabled={currentSettings.e}
                onChange={(m, e) => handleUpdate({ ...currentSettings, m, e })}
              />
            </TabsContent>

            <TabsContent value="trading" className="mt-0 space-y-6">
              <h3 className="text-lg font-semibold">Trading Options</h3>
              <BatchRollSetting
                config={currentSettings.batchRoll}
                onChange={batchRoll => handleUpdate({ ...currentSettings, batchRoll })}
              />
              <NumericSetting
                settings={[['Trade Delay (ms)', 't', 1, 5000, 1]]}
                currentValues={currentSettings}
                onUpdate={handleUpdate}
              />
              <StreakAdjustmentSetting
                adjustment={currentSettings.streakAdjustment}
                onChange={streakAdjustment => handleUpdate({ ...currentSettings, streakAdjustment })}
              />
            </TabsContent>

            <TabsContent value="display" className="mt-0 space-y-6">
              <h3 className="text-lg font-semibold">Display Settings</h3>
              <LayoutSetting
                value={currentSettings.layout}
                onChange={layout => handleUpdate({ ...currentSettings, layout })}
              />
              <DisplayMetricsSetting
                metrics={currentSettings.displayMetrics}
                onChange={displayMetrics => handleUpdate({ ...currentSettings, displayMetrics })}
              />
            </TabsContent>

            <TabsContent value="effects" className="mt-0 space-y-6">
              <h3 className="text-lg font-semibold">Effects</h3>
              <AudioEffectsSetting
                effects={currentSettings.audioEffects}
                onChange={audioEffects => handleUpdate({ ...currentSettings, audioEffects })}
              />
              <CelebrationEffectsSetting
                effects={currentSettings.celebrationEffects}
                onChange={celebrationEffects => handleUpdate({ ...currentSettings, celebrationEffects })}
              />
            </TabsContent>
          </div>

          <ActionButtons />
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;