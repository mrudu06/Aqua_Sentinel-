import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Download,
  Radio,
  Send,
  Terminal,
  CheckCircle2,
  Clock,
  MapPin,
  Wifi,
  BellRing,
  Zap,
  Search,
  AlertTriangle
} from 'lucide-react';
import { DispatchLog, RiskEvaluation } from '../types';

interface EmergencyConsoleProps {
  risk: RiskEvaluation;
  logs: DispatchLog[];
  onTriggerDispatch: () => void;
  selectedDistrict: string;
}

export const EmergencyConsole: React.FC<EmergencyConsoleProps> = ({
  risk,
  logs,
  onTriggerDispatch,
  selectedDistrict
}) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'critical' | 'action' | 'warning'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Web Audio alert beep
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1040, audioCtx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch {
      // Audio context policy
    }
  };

  const handleTrigger = () => {
    setIsDispatching(true);
    playAlertSound();
    onTriggerDispatch();
    setTimeout(() => setIsDispatching(false), 600);
  };

  const downloadReport = () => {
    const report = {
      title: "Aqua Sentinel - Glacial Lake Outburst Telemetry & Early Warning Report",
      timestamp: new Date().toISOString(),
      district: selectedDistrict,
      riskLevel: risk.level,
      expansionRatePct: risk.expansionPct,
      netDeltaAreaPx: risk.deltaPx,
      actionProtocol: risk.actionProtocol,
      dispatchHistory: logs
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aqua_Sentinel_GLOF_Report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesType = logFilter === 'all' || log.type === logFilter;
      const matchesSearch = searchQuery === '' ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.timestamp.includes(searchQuery);
      return matchesType && matchesSearch;
    });
  }, [logs, logFilter, searchQuery]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs mb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className={`w-4 h-4 ${risk.level === 'Critical' ? 'text-rose-600 animate-pulse' : 'text-amber-500'}`} />
              <span>Incident Response & Automated Early-Warning Dispatch</span>
            </h2>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              CAP v1.2 Gateway
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated civil alert dissemination pipeline for District Disaster Management Authorities (DDMA).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition ${
              soundEnabled
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle siren audio feedback"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Siren {soundEnabled ? 'ON' : 'MUTE'}</span>
          </button>

          {/* Export Incident Report */}
          <button
            onClick={downloadReport}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Incident Log</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Left Column: 3-Step Operations Panel */}
        <div className="lg:col-span-5 flex flex-col gap-3.5">
          {/* Step 1: Real-time Operational Directive */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-600" />
                <span>Operational Risk Directive</span>
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                risk.level === 'Critical'
                  ? 'bg-rose-600 text-white'
                  : risk.level === 'Warning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {risk.level}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {risk.actionProtocol}
            </p>
          </div>

          {/* Step 2: Downstream Target Zone & Flood Wave Model */}
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 text-slate-800 text-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                <span>Downstream Vulnerability Corridor</span>
              </span>
              <span className="font-mono text-slate-700 font-semibold">{selectedDistrict.split(',')[0]}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white border border-slate-200 p-2 rounded-lg shadow-2xs">
                <span className="text-slate-500 block text-[10px]">Surge Wave ETA:</span>
                <span className="font-mono text-amber-700 font-bold flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-amber-600" />
                  24 - 38 mins
                </span>
              </div>
              <div className="bg-white border border-slate-200 p-2 rounded-lg shadow-2xs">
                <span className="text-slate-500 block text-[10px]">Evacuation Radius:</span>
                <span className="font-mono text-slate-800 font-bold flex items-center gap-1 mt-0.5">
                  <Wifi className="w-3 h-3 text-slate-600" />
                  18.5 km Valley
                </span>
              </div>
            </div>

            {/* Broadcast Channel Indicators */}
            <div className="pt-1 text-[11px] text-slate-500 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Armed Channels:</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-mono shadow-2xs">
                  <BellRing className="w-2.5 h-2.5 text-rose-600" /> Sirens (3)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-mono shadow-2xs">
                  <Radio className="w-2.5 h-2.5 text-sky-600" /> SMS Broadcast
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-mono shadow-2xs">
                  <Zap className="w-2.5 h-2.5 text-amber-600" /> Spillway Gate
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Primary Action Trigger Button */}
          <button
            id="trigger-emergency-protocol-btn"
            onClick={handleTrigger}
            disabled={isDispatching}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              risk.level === 'Critical'
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 ring-2 ring-rose-500/40'
                : risk.level === 'Warning'
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
            }`}
          >
            {isDispatching ? (
              <>
                <Radio className="w-4 h-4 animate-spin" />
                <span>Broadcasting CAP Emergency Packets...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Broadcast Early Warning / Trigger Sirens</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Dispatch Terminal with Search & Filters */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full min-h-[340px] shadow-inner">
            {/* Terminal Header */}
            <div className="bg-slate-900 px-3.5 py-2.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs text-slate-200 font-bold">
                  Emergency Audit Trail & Gateway Logs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  CAP-GATEWAY: READY
                </span>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1">
                {(['all', 'critical', 'action', 'warning'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLogFilter(filter)}
                    className={`px-2 py-0.5 rounded capitalize font-mono text-[10px] transition ${
                      logFilter === filter
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 sm:w-44 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Scrollable Logs Container */}
            <div
              id="live-status-log-box"
              className="p-3.5 overflow-y-auto space-y-2 font-mono text-[11px] flex-1 scrollbar-thin scrollbar-thumb-slate-700 max-h-72"
            >
              {filteredLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  No matching log entries found for "{searchQuery}"
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2 leading-relaxed transition-opacity duration-300 ${
                      log.type === 'critical'
                        ? 'text-rose-400 font-semibold'
                        : log.type === 'warning'
                        ? 'text-amber-300'
                        : log.type === 'action'
                        ? 'text-cyan-300'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="text-slate-600 shrink-0 font-mono">[{log.timestamp}]</span>
                    {log.type === 'critical' && (
                      <span className="text-[10px] px-1 rounded bg-rose-950/80 border border-rose-800/80 text-rose-400 font-bold shrink-0">
                        CRIT
                      </span>
                    )}
                    {log.type === 'warning' && (
                      <span className="text-[10px] px-1 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 font-bold shrink-0">
                        WARN
                      </span>
                    )}
                    {log.type === 'action' && (
                      <span className="text-[10px] px-1 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-bold shrink-0">
                        DISPATCH
                      </span>
                    )}
                    {log.type === 'info' && (
                      <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400 font-bold shrink-0">
                        SYS
                      </span>
                    )}
                    <span className="break-all">{log.message}</span>
                  </div>
                ))
              )}
            </div>

            {/* Terminal Footer */}
            <div className="bg-slate-900/60 px-3.5 py-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Encrypted UDP / CAP Gateway Active
              </span>
              <span>
                Showing {filteredLogs.length} of {logs.length} entries
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

