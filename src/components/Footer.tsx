import React from 'react';
import { Gauge, Shield, Globe, Radio, Sparkles, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 mt-16 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-black text-sm">
                <Gauge className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-display font-extrabold text-lg text-white">
                DIGITALPRODS.PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-precision internet bandwidth diagnostics and latency testing utility, measuring multi-stream download, upload, jitter, and bufferbloat.
            </p>
          </div>

          {/* Col 2: Global Diagnostics */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Diagnostics Suite
            </h4>
            <ul className="text-xs space-y-1.5">
              <li className="hover:text-cyan-400 transition-colors">Multi-Stream Throughput</li>
              <li className="hover:text-cyan-400 transition-colors">Bufferbloat & Loaded Latency</li>
              <li className="hover:text-cyan-400 transition-colors">RFC 3550 Jitter Telemetry</li>
              <li className="hover:text-cyan-400 transition-colors">4K Adaptive Video Benchmark</li>
              <li className="hover:text-cyan-400 transition-colors">Global Server Mesh Routing</li>
            </ul>
          </div>

          {/* Col 3: Network Index */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Global Standards
            </h4>
            <div className="text-xs space-y-1.5 text-slate-400">
              <div className="flex justify-between py-0.5 border-b border-slate-900">
                <span>Global Median Mobile:</span>
                <span className="font-mono-nums font-bold text-slate-200">55.8 Mbps</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-900">
                <span>Global Median Fixed:</span>
                <span className="font-mono-nums font-bold text-slate-200">93.4 Mbps</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Average Global Latency:</span>
                <span className="font-mono-nums font-bold text-slate-200">27 ms</span>
              </div>
            </div>
          </div>

          {/* Col 4: Network Quality Standards */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Broadband Quality
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Speed ratings adhere to high-accuracy broadband quality frameworks, measuring raw throughput, loaded queuing delay, and packet interarrival stability.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} DIGITALPRODS.PRO SPEEDTEST. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Secure SSL Benchmark
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Real-time Node Probing
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
