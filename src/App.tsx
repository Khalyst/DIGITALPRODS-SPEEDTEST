/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Globe,
  Radio,
  RotateCcw,
  Sparkles,
  Award,
  ArrowRight,
  Shield,
  Zap,
  Square,
  Activity,
  Share2,
  Tv,
  Calculator,
  ChevronRight,
  Cpu,
  Wifi
} from 'lucide-react';

import {
  TestPhase,
  SpeedUnit,
  ConnectionMode,
  ServerNode,
  ClientInfo,
  SpeedTestResult,
  LiveSample,
  TestSettings,
} from './types';

import { GLOBAL_SERVERS, detectClientInfo, sortServersByProximity } from './services/ipService';
import { networkSpeedEngine } from './services/networkSpeedEngine';
import { soundEffects } from './services/audioService';

import { Navbar, ActiveTab } from './components/Navbar';
import { SpeedometerGauge } from './components/SpeedometerGauge';
import { LiveThroughputChart } from './components/LiveThroughputChart';
import { LatencyMetrics } from './components/LatencyMetrics';
import { ServerSelectorModal } from './components/ServerSelectorModal';
import { VideoStreamingTest } from './components/VideoStreamingTest';
import { BandwidthCalculator } from './components/BandwidthCalculator';
import { ResultCardModal } from './components/ResultCardModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';

const STORAGE_KEY = 'speedtest_pro_history_v1';
const SETTINGS_KEY = 'speedtest_pro_settings_v1';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('speedtest');

  // Client & Server
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    ip: 'Loading IP...',
    isp: 'Detecting Broadband Provider...',
    city: 'Location',
    region: '',
    country: 'Detecting...',
    countryCode: 'US',
    lat: 37.7749,
    lon: -122.4194,
    connectionType: 'High-Speed Broadband',
  });
  const [selectedServer, setSelectedServer] = useState<ServerNode>(GLOBAL_SERVERS[0]);

  // Test State
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [currentInstantSpeed, setCurrentInstantSpeed] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<number>(0);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);
  const [ping, setPing] = useState<number>(0);
  const [jitter, setJitter] = useState<number>(0);
  const [downloadLatency, setDownloadLatency] = useState<number>(0);
  const [uploadLatency, setUploadLatency] = useState<number>(0);
  const [packetLoss, setPacketLoss] = useState<number>(0);

  // Live Chart Points
  const [downloadSamples, setDownloadSamples] = useState<LiveSample[]>([]);
  const [uploadSamples, setUploadSamples] = useState<LiveSample[]>([]);

  // Results & History
  const [latestResult, setLatestResult] = useState<SpeedTestResult | null>(null);
  const [history, setHistory] = useState<SpeedTestResult[]>([]);

  // Modals
  const [isServerModalOpen, setIsServerModalOpen] = useState<boolean>(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<TestSettings>({
    units: 'Mbps',
    connectionMode: 'Multi',
    duration: 'standard',
    enableAudio: true,
    theme: 'dark',
    gaugeMaxSpeed: 1000,
  });

  // Load Initial Data & Settings
  useEffect(() => {
    // Load local history
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch {}

    // Detect client ISP and sort servers
    const initNetwork = async () => {
      const detected = await detectClientInfo();
      setClientInfo(detected);
      const sorted = sortServersByProximity(detected.lat, detected.lon);
      if (sorted.length > 0) {
        setSelectedServer(sorted[0]);
      }
    };
    initNetwork();
  }, []);

  // Update Audio feedback service on settings change
  useEffect(() => {
    soundEffects.setEnabled(settings.enableAudio);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Save history to localStorage
  const saveToHistory = useCallback((result: SpeedTestResult) => {
    setHistory((prev) => {
      const updated = [result, ...prev.slice(0, 49)];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  // Trigger celebration on good results
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#a855f7', '#10b981'],
      });
    } catch {}
  };

  // Run Test Function
  const handleStartTest = async () => {
    if (phase !== 'idle' && phase !== 'complete' && phase !== 'error') {
      return;
    }

    // Reset Metrics
    setPhase('finding_server');
    setCurrentInstantSpeed(0);
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setPing(0);
    setJitter(0);
    setDownloadLatency(0);
    setUploadLatency(0);
    setPacketLoss(0);
    setDownloadSamples([]);
    setUploadSamples([]);
    setLatestResult(null);

    const durationMultiplier =
      settings.duration === 'quick' ? 0.65 : settings.duration === 'extended' ? 1.6 : 1.0;

    await networkSpeedEngine.runFullTest(
      selectedServer,
      clientInfo,
      settings.connectionMode,
      durationMultiplier,
      {
        onPhaseChange: (newPhase) => {
          setPhase(newPhase);
        },
        onPingUpdate: (p, j) => {
          setPing(p);
          setJitter(j);
        },
        onDownloadUpdate: (sample) => {
          setCurrentInstantSpeed(sample.speed);
          setDownloadSpeed(sample.speed);
          setDownloadSamples((prev) => [...prev.slice(-40), sample]);
        },
        onUploadUpdate: (sample) => {
          setCurrentInstantSpeed(sample.speed);
          setUploadSpeed(sample.speed);
          setUploadSamples((prev) => [...prev.slice(-40), sample]);
        },
        onLoadedLatencyUpdate: (dlPing, ulPing) => {
          if (dlPing > 0) setDownloadLatency(dlPing);
          if (ulPing > 0) setUploadLatency(ulPing);
        },
        onPacketLossUpdate: (loss) => {
          setPacketLoss(loss);
        },
        onComplete: (result) => {
          setLatestResult(result);
          setDownloadSpeed(result.downloadSpeed);
          setUploadSpeed(result.uploadSpeed);
          setPing(result.ping);
          setJitter(result.jitter);
          setDownloadLatency(result.downloadLatency);
          setUploadLatency(result.uploadLatency);
          setPacketLoss(result.packetLoss);
          setCurrentInstantSpeed(0);
          saveToHistory(result);

          if (result.ratingGrade.grade === 'A+' || result.ratingGrade.grade === 'A') {
            triggerCelebration();
          }
        },
        onError: (err) => {
          console.error(err);
          setPhase('error');
        },
      }
    );
  };

  const handleStopTest = () => {
    networkSpeedEngine.abort();
    setPhase('idle');
    setCurrentInstantSpeed(0);
  };

  const isTesting =
    phase === 'finding_server' || phase === 'ping' || phase === 'download' || phase === 'upload';

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'speedtest' && (
          <div className="flex flex-col items-center">
            {/* Speedometer Gauge and Core Interaction */}
            <div className="w-full flex flex-col items-center justify-center my-4">
              <SpeedometerGauge
                speed={currentInstantSpeed}
                maxSpeed={settings.gaugeMaxSpeed}
                phase={phase}
                unit={settings.units}
                onStartClick={handleStartTest}
                isStarting={isTesting}
              />

              {/* Stop Button when test is running */}
              {isTesting && (
                <div className="mt-2">
                  <button
                    id="cancel-test-btn"
                    onClick={handleStopTest}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-rose-300" /> Cancel Test
                  </button>
                </div>
              )}
            </div>

            {/* Live Real-time Throughput Graph during test */}
            {isTesting && (
              <LiveThroughputChart
                downloadSamples={downloadSamples}
                uploadSamples={uploadSamples}
                currentPhase={phase}
              />
            )}

            {/* Latency & Throughput Metrics Panel */}
            <LatencyMetrics
              downloadSpeed={downloadSpeed}
              uploadSpeed={uploadSpeed}
              ping={ping}
              jitter={jitter}
              downloadLatency={downloadLatency}
              uploadLatency={uploadLatency}
              packetLoss={packetLoss}
              phase={phase}
              unit={settings.units}
            />

            {/* Completed Test Rating & Score Banner */}
            {phase === 'complete' && latestResult && (
              <div 
                id="test-completion-banner"
                className="w-full max-w-4xl mx-auto mt-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-2xl border shadow-lg shrink-0"
                    style={{
                      backgroundColor: `${latestResult.ratingGrade.color}20`,
                      borderColor: `${latestResult.ratingGrade.color}60`,
                      color: latestResult.ratingGrade.color,
                    }}
                  >
                    {latestResult.ratingGrade.grade}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      {latestResult.ratingGrade.title}
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed max-w-xl">
                      {latestResult.ratingGrade.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    id="open-result-card-btn"
                    onClick={() => setIsResultModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" /> Share Scorecard
                  </button>

                  <button
                    onClick={handleStartTest}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                    title="Run Another Test"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ISP & Server Node Footer Bar */}
            <div 
              id="network-info-bar"
              className="w-full max-w-4xl mx-auto mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300"
            >
              {/* Client ISP & IP */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your Provider & IP</div>
                  <div className="font-bold text-white truncate">{clientInfo.isp}</div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {clientInfo.ip} • {clientInfo.city}, {clientInfo.countryCode}
                  </div>
                </div>
              </div>

              {/* Server Node Selection */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Selected Server</div>
                    <div className="font-bold text-white truncate max-w-[180px]">{selectedServer.name}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                      {selectedServer.sponsor}
                    </div>
                  </div>
                </div>

                <button
                  id="change-server-btn"
                  onClick={() => setIsServerModalOpen(true)}
                  disabled={isTesting}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-400 text-xs font-bold border border-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Quick Diagnostic Insights Grid */}
            <div className="w-full max-w-4xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab('video')}
                className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Tv className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="font-bold text-white text-sm">4K Video Streaming Benchmark</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Test if your network handles 4K 60FPS HDR streams with zero adaptive buffering.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('calculator')}
                className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="font-bold text-white text-sm">Transfer Time Calculator</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Compute download times for 100GB games, 4K movies, and cloud archives.
                </p>
              </div>

              <div 
                onClick={() => setIsSettingsOpen(true)}
                className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="font-bold text-white text-sm">Multi vs Single Stream Mode</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Currently running in <span className="text-cyan-400 font-bold">{settings.connectionMode} Connection</span> mode. Switch to isolate TCP threads.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Video Quality Test Tab */}
        {activeTab === 'video' && (
          <VideoStreamingTest
            measuredDownloadSpeed={downloadSpeed > 0 ? downloadSpeed : 120}
            onClose={() => setActiveTab('speedtest')}
          />
        )}

        {/* Bandwidth Calculator Tab */}
        {activeTab === 'calculator' && (
          <BandwidthCalculator
            measuredDownloadMbps={downloadSpeed > 0 ? downloadSpeed : 100}
            measuredUploadMbps={uploadSpeed > 0 ? uploadSpeed : 25}
          />
        )}
      </main>

      {/* Global Modals */}
      <ServerSelectorModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        selectedServer={selectedServer}
        onSelectServer={setSelectedServer}
        clientLat={clientInfo.lat}
        clientLon={clientInfo.lon}
      />

      <ResultCardModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        result={latestResult}
        unit={settings.units}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onSelectResult={(res) => {
          setLatestResult(res);
          setIsResultModalOpen(true);
        }}
        unit={settings.units}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
