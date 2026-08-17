import React, { useMemo } from 'react';
import { LiveSample, TestPhase } from '../types';

interface LiveThroughputChartProps {
  downloadSamples: LiveSample[];
  uploadSamples: LiveSample[];
  currentPhase: TestPhase;
}

export const LiveThroughputChart: React.FC<LiveThroughputChartProps> = ({
  downloadSamples,
  uploadSamples,
  currentPhase,
}) => {
  const width = 500;
  const height = 90;
  const padding = 6;

  // Compute points and path
  const { dlPath, dlAreaPath, ulPath, ulAreaPath, maxVal } = useMemo(() => {
    const allSpeeds = [
      ...downloadSamples.map((s) => s.speed),
      ...uploadSamples.map((s) => s.speed),
    ];
    const max = Math.max(...allSpeeds, 50);

    const getPathFromSamples = (samples: LiveSample[]) => {
      if (samples.length === 0) return { path: '', area: '' };
      const points = samples.map((sample, index) => {
        const x = padding + (index / Math.max(samples.length - 1, 1)) * (width - 2 * padding);
        const y = height - padding - (sample.speed / max) * (height - 2 * padding);
        return { x, y };
      });

      if (points.length === 1) {
        return {
          path: `M ${points[0].x} ${points[0].y}`,
          area: '',
        };
      }

      // Smooth Bezier path
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX = (p0.x + p1.x) / 2;
        d += ` Q ${p0.x} ${p0.y}, ${cpX} ${(p0.y + p1.y) / 2}`;
      }
      const lastPoint = points[points.length - 1];
      d += ` T ${lastPoint.x} ${lastPoint.y}`;

      const area = `${d} L ${lastPoint.x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
      return { path: d, area };
    };

    const dl = getPathFromSamples(downloadSamples);
    const ul = getPathFromSamples(uploadSamples);

    return {
      dlPath: dl.path,
      dlAreaPath: dl.area,
      ulPath: ul.path,
      ulAreaPath: ul.area,
      maxVal: max,
    };
  }, [downloadSamples, uploadSamples]);

  if (downloadSamples.length === 0 && uploadSamples.length === 0) {
    return null;
  }

  return (
    <div id="live-throughput-chart" className="w-full max-w-xl mx-auto mt-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Download
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Upload
          </span>
        </div>
        <span className="font-mono-nums text-[11px] text-slate-500">
          Peak: {maxVal.toFixed(1)} Mbps
        </span>
      </div>

      <div className="relative h-[90px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible preserve-3d">
          <defs>
            <linearGradient id="dlAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="ulAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="0" y1={height - padding} x2={width} y2={height - padding} stroke="#1e293b" strokeWidth="1" />

          {/* Download fill & line */}
          {dlAreaPath && <path d={dlAreaPath} fill="url(#dlAreaGradient)" />}
          {dlPath && (
            <path
              d={dlPath}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Upload fill & line */}
          {ulAreaPath && <path d={ulAreaPath} fill="url(#ulAreaGradient)" />}
          {ulPath && (
            <path
              d={ulPath}
              fill="none"
              stroke="#c084fc"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
