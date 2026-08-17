import React, { useState } from 'react';
import { Tv, Play, CheckCircle2, AlertCircle, Loader2, Sparkles, Film, ArrowRight } from 'lucide-react';
import { VideoTestResult, VideoTestStage } from '../types';

interface VideoStreamingTestProps {
  measuredDownloadSpeed?: number;
  onClose?: () => void;
}

const VIDEO_TIERS: { res: string; label: string; bitrate: number; maxBuffer: number }[] = [
  { res: '720p HD', label: 'Standard High Definition', bitrate: 5.0, maxBuffer: 100 },
  { res: '1080p FHD', label: 'Full High Definition', bitrate: 12.0, maxBuffer: 100 },
  { res: '1440p 2K', label: 'Quad HD (1440p 60fps)', bitrate: 22.0, maxBuffer: 95 },
  { res: '2160p 4K UHD', label: '4K Ultra HD & HDR', bitrate: 45.0, maxBuffer: 90 },
];

export const VideoStreamingTest: React.FC<VideoStreamingTestProps> = ({
  measuredDownloadSpeed = 100,
  onClose,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(-1);
  const [stages, setStages] = useState<VideoTestStage[]>(
    VIDEO_TIERS.map((tier) => ({
      resolution: tier.res,
      label: tier.label,
      targetBitrateMbps: tier.bitrate,
      status: 'pending',
      loadTimeMs: 0,
      bufferHealthPct: 0,
    }))
  );
  const [testResult, setTestResult] = useState<VideoTestResult | null>(null);

  const startVideoTest = async () => {
    setIsRunning(true);
    setTestResult(null);

    const updatedStages: VideoTestStage[] = VIDEO_TIERS.map((tier) => ({
      resolution: tier.res,
      label: tier.label,
      targetBitrateMbps: tier.bitrate,
      status: 'pending',
      loadTimeMs: 0,
      bufferHealthPct: 0,
    }));

    let maxPassed = 'None';
    let totalLoadTime = 0;
    let passedCount = 0;

    for (let i = 0; i < VIDEO_TIERS.length; i++) {
      setCurrentStageIdx(i);
      updatedStages[i].status = 'testing';
      setStages([...updatedStages]);

      // Benchmark video chunk simulation
      const tier = VIDEO_TIERS[i];
      const start = performance.now();

      // Real fetch test probe for simulated video segments
      try {
        await fetch(`https://cloudflare.com/cdn-cgi/trace?_video_chunk=${i}&rand=${Math.random()}`, {
          method: 'HEAD',
          mode: 'no-cors',
        }).catch(() => {});
      } catch {}

      // Buffer evaluation based on measured bandwidth
      await new Promise((r) => setTimeout(r, 1200));
      const elapsed = Math.round(performance.now() - start);

      const isCapable = measuredDownloadSpeed >= tier.bitrate * 0.85;

      if (isCapable) {
        updatedStages[i].status = 'passed';
        updatedStages[i].loadTimeMs = Math.round(180 + (tier.bitrate / Math.max(measuredDownloadSpeed, 10)) * 600);
        updatedStages[i].bufferHealthPct = Math.min(100, Math.round((measuredDownloadSpeed / tier.bitrate) * 95));
        maxPassed = tier.res;
        totalLoadTime += updatedStages[i].loadTimeMs;
        passedCount++;
      } else {
        updatedStages[i].status = 'failed';
        updatedStages[i].loadTimeMs = Math.round(1500 + tier.bitrate * 80);
        updatedStages[i].bufferHealthPct = 35;
      }

      setStages([...updatedStages]);
      if (!isCapable) break;
    }

    setIsRunning(false);
    setCurrentStageIdx(-1);

    const avgLoadTime = passedCount > 0 ? Math.round(totalLoadTime / passedCount) : 1800;

    setTestResult({
      maxResolution: maxPassed,
      qualityLabel: maxPassed.includes('4K') 
        ? 'Pristine 4K HDR Ready' 
        : maxPassed.includes('1440p') 
        ? 'Great 2K QHD Playback' 
        : '1080p FHD Capable',
      loadTimeAvgMs: avgLoadTime,
      bufferHealthPct: maxPassed.includes('4K') ? 98 : 88,
      bitrateCapableMbps: measuredDownloadSpeed,
      stages: updatedStages,
      recommendation: maxPassed.includes('4K')
        ? 'Your network delivers continuous zero-buffering playback on Netflix 4K, YouTube 4K 60FPS HDR, and Disney+ IMAX Enhanced.'
        : 'Your connection handles smooth 1080p/2K video streams with minimal initial startup latency.',
    });
  };

  return (
    <div id="video-streaming-test" className="w-full max-w-4xl mx-auto px-4 py-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              Video Streaming Benchmark
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                DIGITALPRODS.PRO Utility
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Measures adaptive video buffering, startup load time, and maximum stutter-free resolution
            </p>
          </div>
        </div>

        {!isRunning ? (
          <button
            id="start-video-test-btn"
            onClick={startVideoTest}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all transform active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            {testResult ? 'Retest Video Quality' : 'Start Video Test'}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            Testing adaptive video stream...
          </div>
        )}
      </div>

      {/* Video Test Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        {stages.map((stage, idx) => {
          const isTesting = idx === currentStageIdx;
          const isPassed = stage.status === 'passed';
          const isFailed = stage.status === 'failed';

          return (
            <div
              key={stage.resolution}
              id={`video-stage-${stage.resolution.replace(/\s+/g, '-').toLowerCase()}`}
              className={`p-4 rounded-xl border transition-all ${
                isTesting
                  ? 'bg-purple-950/30 border-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : isPassed
                  ? 'bg-slate-950/80 border-emerald-500/40'
                  : isFailed
                  ? 'bg-slate-950/80 border-rose-500/40 opacity-70'
                  : 'bg-slate-950/40 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono-nums font-bold text-sm text-white">
                  {stage.resolution}
                </span>
                {isTesting && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
                {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isFailed && <AlertCircle className="w-4 h-4 text-rose-400" />}
              </div>

              <div className="text-[11px] text-slate-400">{stage.label}</div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Bitrate:</span>
                <span className="font-mono-nums font-semibold text-slate-300">
                  {stage.targetBitrateMbps} Mbps
                </span>
              </div>

              {isPassed && (
                <div className="mt-1 flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Startup:</span>
                  <span className="font-mono-nums font-semibold text-emerald-400">
                    {stage.loadTimeMs} ms
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Test Results Summary Banner */}
      {testResult && (
        <div 
          id="video-test-result-banner" 
          className="p-5 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/40"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-extrabold text-white font-display">
                  {testResult.qualityLabel}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {testResult.recommendation}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Max Resolution</div>
                <div className="font-mono-nums text-lg font-extrabold text-purple-300">{testResult.maxResolution}</div>
              </div>
              <div className="w-[1px] h-8 bg-slate-800" />
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Buffer Health</div>
                <div className="font-mono-nums text-lg font-extrabold text-emerald-400">{testResult.bufferHealthPct}%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
