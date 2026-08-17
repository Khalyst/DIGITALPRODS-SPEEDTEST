import React, { useState } from 'react';
import { X, Share2, Copy, Check, Download, ArrowDown, ArrowUp, Activity, Globe, Shield, Sparkles, Award } from 'lucide-react';
import { SpeedTestResult, SpeedUnit } from '../types';

interface ResultCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SpeedTestResult | null;
  unit: SpeedUnit;
}

export const ResultCardModal: React.FC<ResultCardModalProps> = ({
  isOpen,
  onClose,
  result,
  unit,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !result) return null;

  const formattedDate = new Date(result.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formatSpeed = (speed: number) => {
    if (unit === 'MB/s') return (speed / 8).toFixed(1);
    if (unit === 'Kbps') return (speed * 1000).toFixed(0);
    return speed.toFixed(1);
  };

  const handleCopyText = () => {
    const textSummary = `🚀 DigitalProds Speedtest Result:
📥 Download: ${formatSpeed(result.downloadSpeed)} ${unit}
📤 Upload: ${formatSpeed(result.uploadSpeed)} ${unit}
⚡ Ping: ${result.ping} ms | Jitter: ${result.jitter} ms
🌐 ISP: ${result.clientInfo.isp} (${result.clientInfo.city}, ${result.clientInfo.countryCode})
🖥️ Server: ${result.server.name} (${result.server.sponsor})
🏆 Grade: ${result.ratingGrade.grade} (${result.ratingGrade.title})
Tested with DIGITALPRODS.PRO SPEEDTEST`;

    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="result-card-modal"
        className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              DIGITALPRODS.PRO Speedtest Scorecard
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Visual Scorecard (Card Body) */}
        <div className="p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Top Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg text-white tracking-wider flex items-center gap-1.5">
                DIGITALPRODS.PRO <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">SPEEDTEST</span>
              </span>
            </div>

            <div 
              className="px-3 py-1 rounded-xl flex items-center gap-1.5 font-bold font-display text-sm border"
              style={{
                backgroundColor: `${result.ratingGrade.color}15`,
                borderColor: `${result.ratingGrade.color}40`,
                color: result.ratingGrade.color,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Grade {result.ratingGrade.grade}
            </div>
          </div>

          {/* Primary Speed Numbers */}
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-cyan-400 mb-1">
                <ArrowDown className="w-4 h-4" /> Download
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono-nums font-extrabold text-3xl sm:text-4xl text-white">
                  {formatSpeed(result.downloadSpeed)}
                </span>
                <span className="text-xs font-bold text-cyan-400">{unit}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-purple-400 mb-1">
                <ArrowUp className="w-4 h-4" /> Upload
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono-nums font-extrabold text-3xl sm:text-4xl text-white">
                  {formatSpeed(result.uploadSpeed)}
                </span>
                <span className="text-xs font-bold text-purple-400">{unit}</span>
              </div>
            </div>
          </div>

          {/* Detailed Latency & Ping Metrics */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 mb-4 text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Ping</div>
              <div className="font-mono-nums font-bold text-white text-sm mt-0.5">{result.ping} ms</div>
            </div>
            <div className="border-x border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-500">Jitter</div>
              <div className="font-mono-nums font-bold text-cyan-400 text-sm mt-0.5">{result.jitter} ms</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Loaded Lag</div>
              <div className="font-mono-nums font-bold text-purple-400 text-sm mt-0.5">{result.downloadLatency} ms</div>
            </div>
          </div>

          {/* Network & ISP Info */}
          <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-500">
                <Globe className="w-3.5 h-3.5 text-cyan-400" /> Provider & IP:
              </span>
              <span className="font-semibold text-slate-200 truncate max-w-[240px]">
                {result.clientInfo.isp} • {result.clientInfo.city}, {result.clientInfo.countryCode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-500">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> Server Node:
              </span>
              <span className="font-semibold text-slate-200">
                {result.server.name} ({result.server.sponsor})
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Timestamp: {formattedDate}</span>
              <span>Mode: {result.connectionMode} Streams</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            id="copy-result-summary-btn"
            onClick={handleCopyText}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Summary!' : 'Copy Summary'}
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold transition-all active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
