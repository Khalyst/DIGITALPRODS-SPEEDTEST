import React, { useMemo } from 'react';
import { TestPhase, SpeedUnit } from '../types';

interface SpeedometerGaugeProps {
  speed: number;
  maxSpeed?: number;
  phase: TestPhase;
  unit?: SpeedUnit;
  onStartClick?: () => void;
  isStarting?: boolean;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  speed,
  maxSpeed = 1000,
  phase,
  unit = 'Mbps',
  onStartClick,
  isStarting = false,
}) => {
  // Convert speed according to selected unit
  const displaySpeed = useMemo(() => {
    if (unit === 'MB/s') return (speed / 8).toFixed(1);
    if (unit === 'Kbps') return (speed * 1000).toFixed(0);
    return speed < 10 ? speed.toFixed(2) : speed < 100 ? speed.toFixed(1) : speed.toFixed(0);
  }, [speed, unit]);

  // Logarithmic-like angle mapping for wide bandwidth ranges (0 to 1000+ Mbps)
  // Arc spans from -135deg (bottom-left) to +135deg (bottom-right), total 270deg.
  const needleAngle = useMemo(() => {
    if (speed <= 0) return -135;
    // Logarithmic scale so lower speeds (1-50) have visible needle movement, and gigabit speeds can still scale
    const minVal = 0.5;
    const effectiveSpeed = Math.max(speed, minVal);
    const logMin = Math.log10(minVal);
    const logMax = Math.log10(Math.max(maxSpeed, 1000));
    const logCurrent = Math.log10(Math.min(effectiveSpeed, maxSpeed * 1.2));

    const ratio = Math.max(0, Math.min((logCurrent - logMin) / (logMax - logMin), 1));
    return -135 + ratio * 270;
  }, [speed, maxSpeed]);

  const tickMarks = [
    { value: 0, label: '0' },
    { value: 5, label: '5' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 250, label: '250' },
    { value: 500, label: '500' },
    { value: 1000, label: '1G+' },
  ];

  // Circle dimensions
  const size = 380;
  const cx = size / 2;
  const cy = size / 2;
  const r = 145;
  const startAngle = -225; // in standard polar coordinates
  const endAngle = 45;

  // Arc path generator
  const getArcCoordinates = (angleInDegrees: number, radius: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + radius * Math.cos(angleInRadians),
      y: cy + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, start: number, end: number) => {
    const startCoord = getArcCoordinates(end, radius);
    const endCoord = getArcCoordinates(start, radius);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return [
      'M', startCoord.x, startCoord.y,
      'A', radius, radius, 0, largeArcFlag, 0, endCoord.x, endCoord.y
    ].join(' ');
  };

  const bgArc = describeArc(cx, cy, r, -135, 135);

  // Active progress arc based on needle angle
  const activeArc = describeArc(cx, cy, r, -135, Math.max(needleAngle, -134));

  const isTesting = phase === 'ping' || phase === 'download' || phase === 'upload' || phase === 'finding_server';

  return (
    <div id="speedometer-gauge-container" className="relative flex flex-col items-center justify-center select-none py-2">
      {/* Glow Backdrop */}
      <div 
        className={`absolute w-80 h-80 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
          phase === 'download' 
            ? 'bg-cyan-500/20 opacity-100' 
            : phase === 'upload' 
            ? 'bg-purple-500/20 opacity-100' 
            : phase === 'ping'
            ? 'bg-amber-500/15 opacity-100'
            : 'bg-cyan-500/5 opacity-40'
        }`} 
      />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <linearGradient id="speedArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          <linearGradient id="needleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Track Arc */}
        <path
          d={bgArc}
          fill="none"
          stroke="#1e293b"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Active Colored Arc */}
        {isTesting && (
          <path
            d={activeArc}
            fill="none"
            stroke="url(#speedArcGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#glowEffect)"
            className="transition-all duration-75"
          />
        )}

        {/* Tick Marks and Labels */}
        {tickMarks.map((tick) => {
          let tickAngle = -135;
          if (tick.value > 0) {
            const minVal = 0.5;
            const logMin = Math.log10(minVal);
            const logMax = Math.log10(Math.max(maxSpeed, 1000));
            const logVal = Math.log10(tick.value);
            const ratio = (logVal - logMin) / (logMax - logMin);
            tickAngle = -135 + ratio * 270;
          }
          const innerPos = getArcCoordinates(tickAngle, r - 14);
          const outerPos = getArcCoordinates(tickAngle, r + 2);
          const textPos = getArcCoordinates(tickAngle, r - 32);

          const isActive = needleAngle >= tickAngle && isTesting;

          return (
            <g key={tick.value}>
              <line
                x1={innerPos.x}
                y1={innerPos.y}
                x2={outerPos.x}
                y2={outerPos.y}
                stroke={isActive ? '#38bdf8' : '#334155'}
                strokeWidth={tick.value === 0 || tick.value === 1000 ? 3 : 2}
                strokeLinecap="round"
                className="transition-colors duration-150"
              />
              <text
                x={textPos.x}
                y={textPos.y + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fontFamily="'JetBrains Mono', monospace"
                fill={isActive ? '#e2e8f0' : '#64748b'}
                className="transition-colors duration-150 select-none"
              >
                {tick.label}
              </text>
            </g>
          );
        })}

        {/* Center Digital Speed readout or Big GO Button */}
        {phase === 'idle' || phase === 'complete' ? (
          <g transform={`translate(${cx}, ${cy})`} className="cursor-pointer">
            {/* Pulsing Start Button Ring */}
            <circle
              r="76"
              fill="#0f172a"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="animate-spin"
              style={{ animationDuration: '24s' }}
            />
            <circle
              r="68"
              fill="url(#needleGradient)"
              className="opacity-20 hover:opacity-30 transition-opacity"
            />
            <circle
              r="62"
              fill="#090d16"
              stroke="#1e293b"
              strokeWidth="2"
            />
          </g>
        ) : (
          /* Active Testing Needle */
          <g transform={`translate(${cx}, ${cy})`}>
            {/* Needle line */}
            <g
              transform={`rotate(${needleAngle})`}
              className="transition-transform duration-75 ease-out"
            >
              {/* Glow Needle Shadow */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2={-r + 15}
                stroke="#06b6d4"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#glowEffect)"
                opacity="0.8"
              />
              {/* Sharp Center Needle */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2={-r + 15}
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Needle Tip Arrow Marker */}
              <circle
                cx="0"
                cy={-r + 14}
                r="4.5"
                fill="#38bdf8"
                filter="url(#glowEffect)"
              />
            </g>

            {/* Center Dial Hub */}
            <circle r="18" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <circle r="7" fill="#38bdf8" />
          </g>
        )}
      </svg>

      {/* Center Interactive Overlay: GO Button or Digital Numbers */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {phase === 'idle' || phase === 'complete' ? (
          <button
            id="speedtest-start-button"
            onClick={onStartClick}
            disabled={isStarting}
            className="pointer-events-auto group relative w-36 h-36 rounded-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-cyan-950/40 border-2 border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_50px_rgba(6,182,212,0.55)] transition-all duration-300 transform active:scale-95 cursor-pointer"
          >
            <span className="font-display text-4xl font-extrabold tracking-wider text-cyan-300 group-hover:text-white transition-colors">
              {phase === 'complete' ? 'AGAIN' : 'GO'}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 group-hover:text-cyan-200 mt-0.5">
              {phase === 'complete' ? 'Re-Test' : 'Start Test'}
            </span>
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center mt-32 pointer-events-auto">
            {/* Live Numeric Readout */}
            <div className="flex items-baseline gap-1.5">
              <span 
                id="live-speed-value" 
                className="font-mono-nums font-extrabold text-5xl md:text-6xl tracking-tight text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                {displaySpeed}
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                {unit}
              </span>
            </div>

            {/* Current Phase Badge */}
            <div className="mt-2 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md">
              <div 
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  phase === 'download' 
                    ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' 
                    : phase === 'upload' 
                    ? 'bg-purple-400 shadow-[0_0_8px_#c084fc]' 
                    : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                }`} 
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {phase === 'finding_server' && 'Connecting to Node...'}
                {phase === 'ping' && 'Measuring Latency & Jitter'}
                {phase === 'download' && 'Testing Download Stream'}
                {phase === 'upload' && 'Testing Upload Stream'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
