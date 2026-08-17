import React from 'react';
import { Gauge, Tv, Calculator, History, Settings, Activity, Signal, Zap } from 'lucide-react';

export type ActiveTab = 'speedtest' | 'video' | 'calculator';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenHistory,
  onOpenSettings,
  historyCount,
}) => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onTabChange('speedtest')}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.35)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.55)] transition-all">
            <Gauge className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                DIGITALPRODS.PRO
              </span>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                SPEEDTEST
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-0.5">
              Broadband Network Diagnostics
            </div>
          </div>
        </div>

        {/* Center Primary Tools Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            id="nav-tab-speedtest"
            onClick={() => onTabChange('speedtest')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'speedtest'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gauge className="w-4 h-4" />
            Speed Test
          </button>

          <button
            id="nav-tab-video"
            onClick={() => onTabChange('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-4 h-4" />
            Video Test
          </button>

          <button
            id="nav-tab-calculator"
            onClick={() => onTabChange('calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Transfer Calc
          </button>
        </nav>

        {/* Right Tools: History & Settings */}
        <div className="flex items-center gap-2.5">
          <button
            id="open-history-btn"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all active:scale-95 cursor-pointer text-xs font-bold relative"
            title="View Test History"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500 text-slate-950 font-black">
                {historyCount}
              </span>
            )}
          </button>

          <button
            id="open-settings-btn"
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all active:scale-95 cursor-pointer"
            title="Configure Speedtest Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Subnav for tabs */}
      <div className="flex md:hidden border-t border-slate-800/80 px-4 py-2 bg-slate-950 gap-2 overflow-x-auto">
        <button
          onClick={() => onTabChange('speedtest')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
            activeTab === 'speedtest' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" /> Speed
        </button>
        <button
          onClick={() => onTabChange('video')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
            activeTab === 'video' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          <Tv className="w-3.5 h-3.5" /> Video
        </button>
        <button
          onClick={() => onTabChange('calculator')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
            activeTab === 'calculator' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" /> Calculator
        </button>
      </div>
    </header>
  );
};
