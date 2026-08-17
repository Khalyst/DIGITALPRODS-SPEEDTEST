import React from 'react';
import { ArrowDown, ArrowUp, Activity, Zap, ShieldCheck, HelpCircle } from 'lucide-react';
import { SpeedUnit, TestPhase } from '../types';

interface LatencyMetricsProps {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  downloadLatency: number;
  uploadLatency: number;
  packetLoss: number;
  phase: TestPhase;
  unit: SpeedUnit;
}

export const LatencyMetrics: React.FC<LatencyMetricsProps> = ({
  downloadSpeed,
  uploadSpeed,
  ping,
  jitter,
  downloadLatency,
  uploadLatency,
  packetLoss,
  phase,
  unit,
}) => {
  const formatSpeed = (speed: number) => {
    if (speed <= 0) return '—';
    if (unit === 'MB/s') return (speed / 8).toFixed(1);
    if (unit === 'Kbps') return (speed * 1000).toFixed(0);
    return speed.toFixed(1);
  };

  const bufferbloatDiff = Math.max(downloadLatency - ping, 0);

  return (
    <div id="latency-metrics-panel" className="w-full max-w-4xl mx-auto px-4 mt-6">
      {/* Primary Speed KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Download Speed Card */}
        <div 
          id="download-metric-card" 
          className={`relative p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border transition-all duration-300 ${
            phase === 'download' 
              ? 'border-cyan-500/80 shadow-[0_0_25px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/50' 
              : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <ArrowDown className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-300">
                DOWNLOAD
              </span>
            </div>
            {phase === 'download' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
                Active Test
              </span>
            )}
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono-nums font-extrabold text-4xl md:text-5xl text-white tracking-tight">
                {formatSpeed(downloadSpeed)}
              </span>
              <span className="text-sm font-semibold uppercase text-cyan-400">
                {unit}
              </span>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div className="text-[11px] text-slate-500">Loaded Ping</div>
              <div className="font-mono-nums font-semibold text-slate-200">
                {downloadLatency > 0 ? `${downloadLatency} ms` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Speed Card */}
        <div 
          id="upload-metric-card" 
          className={`relative p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border transition-all duration-300 ${
            phase === 'upload' 
              ? 'border-purple-500/80 shadow-[0_0_25px_rgba(168,85,247,0.2)] ring-1 ring-purple-500/50' 
              : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <ArrowUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-300">
                UPLOAD
              </span>
            </div>
            {phase === 'upload' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
                Active Test
              </span>
            )}
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono-nums font-extrabold text-4xl md:text-5xl text-white tracking-tight">
                {formatSpeed(uploadSpeed)}
              </span>
              <span className="text-sm font-semibold uppercase text-purple-400">
                {unit}
              </span>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div className="text-[11px] text-slate-500">Loaded Ping</div>
              <div className="font-mono-nums font-semibold text-slate-200">
                {uploadLatency > 0 ? `${uploadLatency} ms` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Latency & Quality Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Idle Ping */}
        <div id="idle-ping-card" className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Idle Ping
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono-nums font-bold text-2xl text-white">
              {ping > 0 ? ping : '—'}
            </span>
            <span className="text-xs text-slate-400">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {ping > 0 ? (ping < 20 ? 'Optimal for gaming' : ping < 50 ? 'Good broadband' : 'Fair latency') : 'Unloaded'}
          </div>
        </div>

        {/* Jitter */}
        <div id="jitter-card" className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Jitter
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono-nums font-bold text-2xl text-white">
              {jitter > 0 ? jitter : '—'}
            </span>
            <span className="text-xs text-slate-400">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {jitter > 0 ? (jitter < 3 ? 'Rock-solid stability' : 'Acceptable variance') : 'Variation'}
          </div>
        </div>

        {/* Bufferbloat / Loaded Latency Delta */}
        <div id="bufferbloat-card" className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1" title="Difference between idle latency and latency when downloading full speed">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Bufferbloat
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`font-mono-nums font-bold text-2xl ${
              bufferbloatDiff > 50 ? 'text-amber-400' : 'text-white'
            }`}>
              {downloadLatency > 0 ? `+${bufferbloatDiff}` : '—'}
            </span>
            <span className="text-xs text-slate-400">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {downloadLatency > 0 ? (bufferbloatDiff < 15 ? 'Grade A (Low lag)' : bufferbloatDiff < 40 ? 'Grade B (Minor lag)' : 'Grade C (High queue)') : 'Under load'}
          </div>
        </div>

        {/* Packet Loss */}
        <div id="packet-loss-card" className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Packet Loss
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono-nums font-bold text-2xl text-white">
              {packetLoss !== undefined ? `${packetLoss}%` : '0%'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {packetLoss === 0 ? 'Zero dropped packets' : 'Minor packet drop'}
          </div>
        </div>
      </div>
    </div>
  );
};
