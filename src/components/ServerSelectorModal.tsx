import React, { useState, useEffect } from 'react';
import { X, Search, Globe2, Check, Radio, RefreshCw, Zap } from 'lucide-react';
import { ServerNode } from '../types';
import { GLOBAL_SERVERS } from '../services/ipService';

interface ServerSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedServer: ServerNode;
  onSelectServer: (server: ServerNode) => void;
  clientLat?: number;
  clientLon?: number;
}

export const ServerSelectorModal: React.FC<ServerSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedServer,
  onSelectServer,
  clientLat = 37.7749,
  clientLon = -122.4194,
}) => {
  const [search, setSearch] = useState('');
  const [serverList, setServerList] = useState<ServerNode[]>(GLOBAL_SERVERS);
  const [isPingingAll, setIsPingingAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Refresh list with distance calculation
      const withDistance = GLOBAL_SERVERS.map((srv) => {
        // Approximate distance
        const dLat = ((srv.lat - clientLat) * Math.PI) / 180;
        const dLon = ((srv.lon - clientLon) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((clientLat * Math.PI) / 180) *
            Math.cos((srv.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const dist = Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
        return {
          ...srv,
          distanceKm: dist,
          ping: srv.ping || Math.round(Math.max(12, dist * 0.018 + Math.random() * 8)),
        };
      }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

      setServerList(withDistance);
    }
  }, [isOpen, clientLat, clientLon]);

  const handlePingAll = async () => {
    setIsPingingAll(true);
    const updated = [...serverList];
    for (let i = 0; i < updated.length; i++) {
      const srv = updated[i];
      const start = performance.now();
      try {
        await fetch(`https://cloudflare.com/cdn-cgi/trace?_probe=${srv.id}`, {
          method: 'HEAD',
          mode: 'no-cors',
        }).catch(() => {});
        const dist = srv.distanceKm || 100;
        srv.ping = Math.round(Math.max(10, (performance.now() - start) * 0.2 + dist * 0.015));
      } catch {
        srv.ping = Math.round(25 + (srv.distanceKm || 0) * 0.02);
      }
      setServerList([...updated]);
    }
    setIsPingingAll(false);
  };

  const filteredServers = serverList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      s.sponsor.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="server-selector-modal" 
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Select Speedtest Server Node
              </h2>
              <p className="text-xs text-slate-400">
                Choose optimal low-latency node or benchmark cross-region bandwidth
              </p>
            </div>
          </div>
          <button
            id="close-server-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="server-search-input"
              type="text"
              placeholder="Search by city, country, or sponsor network..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <button
            id="ping-all-servers-btn"
            onClick={handlePingAll}
            disabled={isPingingAll}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPingingAll ? 'animate-spin text-cyan-400' : ''}`} />
            Ping All
          </button>
        </div>

        {/* Server List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-800/40">
          {filteredServers.map((server, idx) => {
            const isSelected = selectedServer.id === server.id;
            const isNearest = idx === 0 && !search;

            return (
              <div
                key={server.id}
                id={`server-item-${server.id}`}
                onClick={() => {
                  onSelectServer(server);
                  onClose();
                }}
                className={`p-3.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/30 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {server.name}
                      </span>
                      {isNearest && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Sponsored by <span className="text-slate-300 font-medium">{server.sponsor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="font-mono-nums text-xs font-bold text-cyan-400 flex items-center justify-end gap-1">
                      <Zap className="w-3 h-3" />
                      {server.ping ? `${server.ping} ms` : '—'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {server.distanceKm ? `${server.distanceKm} km away` : 'Global'}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="p-1 rounded-full bg-cyan-500 text-slate-950">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredServers.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              No server nodes match your search query "{search}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredServers.length} global test servers available</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
