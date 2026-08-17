import React from 'react';
import { X, Settings, Gauge, Volume2, VolumeX, Cpu, Sliders, Zap } from 'lucide-react';
import { TestSettings, SpeedUnit, ConnectionMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TestSettings;
  onUpdateSettings: (newSettings: TestSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="settings-modal"
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">DIGITALPRODS.PRO Settings</h2>
              <p className="text-xs text-slate-400">Configure speed units, streams, and diagnostic parameters</p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Options */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Unit selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Speed Measurement Unit
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Mbps', 'MB/s', 'Kbps'] as SpeedUnit[]).map((unit) => (
                <button
                  key={unit}
                  id={`unit-select-${unit}`}
                  onClick={() => onUpdateSettings({ ...settings, units: unit })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    settings.units === unit
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {unit}
                  <span className="block text-[10px] opacity-70 font-normal mt-0.5">
                    {unit === 'Mbps' ? 'Standard Megabits' : unit === 'MB/s' ? 'Bytes / sec' : 'Kilobits'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Connection Mode (Multi vs Single) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Connection Mode
              </label>
              <span className="text-[11px] text-cyan-400 font-semibold">
                {settings.connectionMode === 'Multi' ? 'Multi-Stream (Recommended)' : 'Single-Stream (Diagnostic)'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="mode-multi-btn"
                onClick={() => onUpdateSettings({ ...settings, connectionMode: 'Multi' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.connectionMode === 'Multi'
                    ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/50'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <Zap className="w-4 h-4 text-cyan-400" /> Multi-Connection
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Opens 4-8 parallel streams to saturate your full broadband capacity.
                </p>
              </button>

              <button
                id="mode-single-btn"
                onClick={() => onUpdateSettings({ ...settings, connectionMode: 'Single' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.connectionMode === 'Single'
                    ? 'bg-purple-950/40 border-purple-500/80 ring-1 ring-purple-500/50'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <Cpu className="w-4 h-4 text-purple-400" /> Single-Connection
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Tests single TCP socket throughput to identify individual stream throttling.
                </p>
              </button>
            </div>
          </div>

          {/* Test Duration */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Test Sample Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'quick', label: 'Quick (6s)' },
                { id: 'standard', label: 'Standard (12s)' },
                { id: 'extended', label: 'Extended (20s)' },
              ].map((item) => (
                <button
                  key={item.id}
                  id={`duration-${item.id}`}
                  onClick={() => onUpdateSettings({ ...settings, duration: item.id as any })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    settings.duration === item.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gauge Max Limit */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Speedometer Scale Range
            </label>
            <div className="flex gap-2">
              {[100, 500, 1000, 2500].map((val) => (
                <button
                  key={val}
                  onClick={() => onUpdateSettings({ ...settings, gaugeMaxSpeed: val })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    settings.gaugeMaxSpeed === val
                      ? 'bg-slate-800 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {val >= 1000 ? `${val / 1000} Gbps` : `${val} Mbps`}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Feedback Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              {settings.enableAudio ? (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <div className="text-xs font-bold text-white">Acoustic Pitch Feedback</div>
                <div className="text-[11px] text-slate-400">Plays frequency-synthesized audio tones during speed acceleration</div>
              </div>
            </div>

            <button
              id="audio-toggle-btn"
              onClick={() => onUpdateSettings({ ...settings, enableAudio: !settings.enableAudio })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.enableAudio ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.enableAudio ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
