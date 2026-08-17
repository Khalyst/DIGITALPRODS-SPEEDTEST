import React, { useState } from 'react';
import { X, History, Trash2, Download, ArrowDown, ArrowUp, Activity, Check, FileSpreadsheet, Sparkles, Eye } from 'lucide-react';
import { SpeedTestResult, SpeedUnit } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: SpeedTestResult[];
  onClearHistory: () => void;
  onSelectResult: (result: SpeedTestResult) => void;
  unit: SpeedUnit;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectResult,
  unit,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const formatSpeed = (speed: number) => {
    if (unit === 'MB/s') return (speed / 8).toFixed(1);
    if (unit === 'Kbps') return (speed * 1000).toFixed(0);
    return speed.toFixed(1);
  };

  // Compute Aggregates
  const totalTests = history.length;
  const avgDownload = totalTests > 0
    ? (history.reduce((a, b) => a + b.downloadSpeed, 0) / totalTests).toFixed(1)
    : '0';
  const avgUpload = totalTests > 0
    ? (history.reduce((a, b) => a + b.uploadSpeed, 0) / totalTests).toFixed(1)
    : '0';
  const bestDownload = totalTests > 0
    ? Math.max(...history.map((h) => h.downloadSpeed)).toFixed(1)
    : '0';
  const lowestPing = totalTests > 0
    ? Math.min(...history.map((h) => h.ping))
    : 0;

  // Export to CSV
  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Timestamp', 'Date', 'Download (Mbps)', 'Upload (Mbps)', 'Ping (ms)', 'Jitter (ms)', 'Loaded Ping (ms)', 'ISP', 'Server', 'Grade'];
    const rows = history.map((h) => [
      h.timestamp,
      new Date(h.timestamp).toISOString(),
      h.downloadSpeed,
      h.uploadSpeed,
      h.ping,
      h.jitter,
      h.downloadLatency,
      `"${h.clientInfo.isp}"`,
      `"${h.server.name}"`,
      h.ratingGrade.grade,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `speedtest-history-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="history-drawer"
        className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Test Results History</h2>
              <p className="text-xs text-slate-400">{totalTests} logged broadband speed sessions</p>
            </div>
          </div>
          <button
            id="close-history-drawer-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Analytics KPI Ribbon */}
        {totalTests > 0 && (
          <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Avg DL</div>
              <div className="font-mono-nums font-extrabold text-cyan-400 text-sm">{avgDownload}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Avg UL</div>
              <div className="font-mono-nums font-extrabold text-purple-400 text-sm">{avgUpload}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Peak DL</div>
              <div className="font-mono-nums font-extrabold text-emerald-400 text-sm">{bestDownload}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Best Ping</div>
              <div className="font-mono-nums font-extrabold text-amber-400 text-sm">{lowestPing}ms</div>
            </div>
          </div>
        )}

        {/* List of Previous Tests */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.map((record) => {
            const timeStr = new Date(record.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={record.id}
                id={`history-item-${record.id}`}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-0.5 rounded text-xs font-black border"
                      style={{
                        backgroundColor: `${record.ratingGrade.color}15`,
                        borderColor: `${record.ratingGrade.color}40`,
                        color: record.ratingGrade.color,
                      }}
                    >
                      {record.ratingGrade.grade}
                    </span>
                    <span className="text-xs font-semibold text-white">{record.server.name}</span>
                  </div>

                  <span className="text-[11px] text-slate-500">{timeStr}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs">
                  <div>
                    <div className="text-[10px] text-cyan-400 flex items-center gap-1 font-bold">
                      <ArrowDown className="w-3 h-3" /> DL
                    </div>
                    <div className="font-mono-nums font-bold text-white text-sm">
                      {formatSpeed(record.downloadSpeed)} <span className="text-[10px] font-normal text-slate-400">{unit}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-purple-400 flex items-center gap-1 font-bold">
                      <ArrowUp className="w-3 h-3" /> UL
                    </div>
                    <div className="font-mono-nums font-bold text-white text-sm">
                      {formatSpeed(record.uploadSpeed)} <span className="text-[10px] font-normal text-slate-400">{unit}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                      <Activity className="w-3 h-3" /> Ping
                    </div>
                    <div className="font-mono-nums font-bold text-white text-sm">
                      {record.ping} <span className="text-[10px] font-normal text-slate-400">ms</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="truncate max-w-[280px]">ISP: {record.clientInfo.isp}</span>
                  <button
                    onClick={() => {
                      onSelectResult(record);
                      onClose();
                    }}
                    className="flex items-center gap-1 font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Card
                  </button>
                </div>
              </div>
            );
          })}

          {history.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
              <History className="w-12 h-12 stroke-1 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-300">No test results recorded yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Press the GO button on the main dashboard to run your first broadband benchmark test.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          {history.length > 0 && (
            <>
              <button
                id="export-csv-btn"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
              </button>

              {!confirmClear ? (
                <button
                  id="clear-history-btn"
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Clear All
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                  >
                    Confirm Clear
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
