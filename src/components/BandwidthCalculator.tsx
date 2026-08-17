import React, { useState } from 'react';
import { Calculator, Download, Upload, HardDrive, Gamepad2, Film, FileArchive, CloudUpload, Clock } from 'lucide-react';
import { SpeedUnit } from '../types';

interface BandwidthCalculatorProps {
  measuredDownloadMbps: number;
  measuredUploadMbps: number;
}

const PRESET_FILES = [
  { name: 'Cyberpunk / GTA 6 Game', sizeGb: 110, icon: Gamepad2, category: 'Gaming' },
  { name: '4K Ultra HD Movie (Remux)', sizeGb: 45, icon: Film, category: 'Media' },
  { name: '1080p FHD Movie', sizeGb: 4.5, icon: Film, category: 'Media' },
  { name: 'OS Image / Virtual Machine', sizeGb: 8.0, icon: HardDrive, category: 'Software' },
  { name: 'Full Cloud Photo Archive', sizeGb: 15.0, icon: CloudUpload, category: 'Backup' },
  { name: 'Game DLC / Patch', sizeGb: 2.5, icon: FileArchive, category: 'Update' },
];

export const BandwidthCalculator: React.FC<BandwidthCalculatorProps> = ({
  measuredDownloadMbps = 100,
  measuredUploadMbps = 25,
}) => {
  const [customSizeGb, setCustomSizeGb] = useState<number>(25);
  const [activeDownloadSpeed, setActiveDownloadSpeed] = useState<number>(
    measuredDownloadMbps > 0 ? measuredDownloadMbps : 100
  );
  const [activeUploadSpeed, setActiveUploadSpeed] = useState<number>(
    measuredUploadMbps > 0 ? measuredUploadMbps : 25
  );

  // Transfer time formula: (size in Gigabits) / (speed in Mbps) = seconds
  const calculateTime = (sizeGb: number, speedMbps: number): string => {
    if (speedMbps <= 0) return '—';
    const totalMegabits = sizeGb * 8 * 1024;
    const totalSeconds = totalMegabits / speedMbps;

    if (totalSeconds < 60) {
      return `${Math.round(totalSeconds)} seconds`;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSecs = Math.round(totalSeconds % 60);
    if (minutes < 60) {
      return `${minutes}m ${remainingSecs}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    return `${hours}h ${remMinutes}m`;
  };

  return (
    <div id="bandwidth-calculator" className="w-full max-w-4xl mx-auto px-4 py-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white font-display">
            Bandwidth & Download Time Calculator
          </h2>
          <p className="text-xs text-slate-400">
            See how fast your current connection downloads games, 4K movies, archives, and cloud backups
          </p>
        </div>
      </div>

      {/* Speed Overrides / Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1 font-semibold text-cyan-400">
              <Download className="w-4 h-4" />
              Download Speed: {activeDownloadSpeed} Mbps
            </span>
            <span className="text-[11px] text-slate-500">{(activeDownloadSpeed / 8).toFixed(1)} MB/s</span>
          </div>
          <input
            type="range"
            min="5"
            max="1000"
            step="5"
            value={activeDownloadSpeed}
            onChange={(e) => setActiveDownloadSpeed(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1 font-semibold text-purple-400">
              <Upload className="w-4 h-4" />
              Upload Speed: {activeUploadSpeed} Mbps
            </span>
            <span className="text-[11px] text-slate-500">{(activeUploadSpeed / 8).toFixed(1)} MB/s</span>
          </div>
          <input
            type="range"
            min="1"
            max="500"
            step="5"
            value={activeUploadSpeed}
            onChange={(e) => setActiveUploadSpeed(Number(e.target.value))}
            className="w-full accent-purple-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Preset File Downloads Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
        {PRESET_FILES.map((preset) => {
          const Icon = preset.icon;
          const dlTime = calculateTime(preset.sizeGb, activeDownloadSpeed);
          const ulTime = calculateTime(preset.sizeGb, activeUploadSpeed);

          return (
            <div
              key={preset.name}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white line-clamp-1">{preset.name}</div>
                    <div className="text-[10px] text-slate-400">{preset.sizeGb} GB size</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Download className="w-3 h-3 text-cyan-400" /> Download:
                  </span>
                  <span className="font-mono-nums font-bold text-cyan-300">
                    {dlTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Upload className="w-3 h-3 text-purple-400" /> Cloud Upload:
                  </span>
                  <span className="font-mono-nums font-bold text-purple-300">
                    {ulTime}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Size Interactive Box */}
      <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-white">Custom File Size Estimation</div>
            <div className="text-[11px] text-slate-400">Enter any custom transfer payload in GB</div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
            <input
              type="number"
              min="0.1"
              max="5000"
              step="1"
              value={customSizeGb}
              onChange={(e) => setCustomSizeGb(Math.max(0.1, Number(e.target.value)))}
              className="w-16 bg-transparent text-sm font-mono-nums font-bold text-white focus:outline-none"
            />
            <span className="text-xs text-slate-400 font-bold">GB</span>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-900/90 px-3.5 py-1.5 rounded-lg border border-slate-700">
            <div>
              <span className="text-slate-400">DL: </span>
              <span className="font-mono-nums font-bold text-cyan-300">
                {calculateTime(customSizeGb, activeDownloadSpeed)}
              </span>
            </div>
            <div className="w-[1px] h-4 bg-slate-700" />
            <div>
              <span className="text-slate-400">UL: </span>
              <span className="font-mono-nums font-bold text-purple-300">
                {calculateTime(customSizeGb, activeUploadSpeed)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
