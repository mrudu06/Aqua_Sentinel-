import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  Satellite,
  Share2,
  Copy,
  Check,
  Download,
  Play,
  RotateCcw,
  Terminal,
  Activity,
  Waves,
  MapPin,
  AlertTriangle,
  FileCode,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { HIMALAYA_SECTOR_4_ANALYSIS, RAW_JSON_PAYLOAD } from '../data/sectorData';

interface SectorAnalysisPanelProps {
  onLoadSectorPreset?: () => void;
}

export const SectorAnalysisPanel: React.FC<SectorAnalysisPanelProps> = ({ onLoadSectorPreset }) => {
  const data = HIMALAYA_SECTOR_4_ANALYSIS;
  const [copied, setCopied] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cap' | 'routes' | 'logs' | 'raw_json'>('overview');

  // Simulation playback state
  const [simIndex, setSimIndex] = useState<number>(data.ui_log_simulation.length);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && simIndex < data.ui_log_simulation.length) {
      timer = setTimeout(() => {
        setSimIndex((prev) => prev + 1);
      }, 550);
    } else if (simIndex >= data.ui_log_simulation.length) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, simIndex, data.ui_log_simulation.length]);

  const handleStartSim = () => {
    setSimIndex(0);
    setIsPlaying(true);
  };

  const handleResetSim = () => {
    setSimIndex(data.ui_log_simulation.length);
    setIsPlaying(false);
  };

  const copyToClipboard = (text: string, isRaw: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isRaw) {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(RAW_JSON_PAYLOAD, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AquaSentinel_Himalaya_Sector_4_CAP_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-teal-950/10 rounded-xl shadow-xs mb-6 overflow-hidden">
      {/* Top Banner: Targeted Geographical Zone */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-mono text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                CRITICAL TARGET ZONE • ALERT TIER RED
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Zone ID: {data.zone_id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Himalaya Catchment Sector 4</span>
              <span className="text-xs font-mono font-normal text-teal-300 bg-teal-950/80 px-2.5 py-1 rounded border border-teal-800">
                Imja Tsho & Tsho Rolpa
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-mono">{data.target_coordinates}</span>
              </span>
              <span>•</span>
              <span className="text-slate-400">Temporal Multi-Spectral Raster Comparison (NDWI + SAR)</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {onLoadSectorPreset && (
              <button
                onClick={onLoadSectorPreset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Load in Raster Lab</span>
              </button>
            )}

            <button
              onClick={() => copyToClipboard(JSON.stringify(RAW_JSON_PAYLOAD, null, 2), true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRaw ? 'Copied JSON' : 'Copy Pure JSON'}</span>
            </button>

            <button
              onClick={downloadJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hazard Score & Precursors Summary Bar */}
      <div className="bg-rose-50/70 border-b border-rose-200/80 px-5 py-3.5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-xs">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">
                Hazard Probability Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-rose-900 font-mono">
                  {data.hazard_score}%
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-600 text-white uppercase">
                  Alert Tier: {data.alert_tier}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 border-t md:border-t-0 md:border-l border-rose-200/80 pt-2 md:pt-0 md:pl-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 block mb-0.5">
              Detected Critical Precursors
            </span>
            <p className="text-xs font-medium text-rose-800 leading-relaxed">
              {data.precursors} Acute hydrostatic overtopping pressure and lateral moraine shear fractures indicate imminent dam breach risk.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="px-5 pt-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/60">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'overview'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Evaluated Indicators
          </button>
          <button
            onClick={() => setActiveTab('cap')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cap'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-600" />
            <span>CAP v1.2 Message</span>
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'routes'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Satellite className="w-3.5 h-3.5 text-sky-600" />
            <span>Offline Dispatch Routes ({data.offline_dispatch_routes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-teal-600" />
            <span>Live Broadcast Simulation</span>
          </button>
          <button
            onClick={() => setActiveTab('raw_json')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'raw_json'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-slate-600" />
            <span>Pure JSON Output</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-500 py-2">
          Sender: <span className="font-semibold text-slate-800">{data.cap_message.sender}</span>
        </span>
      </div>

      {/* Main Content Area based on Sub-Tabs */}
      <div className="p-5">
        {/* TAB 1: 3 EVALUATED INDICATORS */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Indicator 1: Lake Surface Area Expansion */}
              <div className="bg-white border border-teal-950/10 rounded-xl p-4 shadow-2xs hover:border-teal-400 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <Waves className="w-3.5 h-3.5 text-teal-600" />
                      1. Lake Surface Expansion
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      CRITICAL
                    </span>
                  </div>
                  <div className="text-3xl font-black text-rose-600 font-mono tracking-tight">
                    +{data.indicators.surface_area_expansion.growth_pct}%
                  </div>
                  <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">
                    {data.indicators.surface_area_expansion.ndwi_shift}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  {data.indicators.surface_area_expansion.details}
                </div>
              </div>

              {/* Indicator 2: Terrain and Slope Stress */}
              <div className="bg-white border border-teal-950/10 rounded-xl p-4 shadow-2xs hover:border-teal-400 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                      2. Terrain & Slope Stress
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                      HIGH SHEAR
                    </span>
                  </div>
                  <div className="text-sm font-bold text-amber-900 font-sans tracking-tight mb-1">
                    {data.indicators.terrain_slope_stress.status}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-mono font-semibold text-amber-800">
                    {data.indicators.terrain_slope_stress.sar_displacement_rate}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  {data.indicators.terrain_slope_stress.details}
                </div>
              </div>

              {/* Indicator 3: Upstream Runoff Anomalies */}
              <div className="bg-white border border-teal-950/10 rounded-xl p-4 shadow-2xs hover:border-teal-400 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-cyan-600" />
                      3. Upstream Runoff Inflow
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 font-bold border border-cyan-200">
                      SURGE INGRESS
                    </span>
                  </div>
                  <div className="text-lg font-black text-cyan-900 font-mono tracking-tight mb-1">
                    {data.indicators.upstream_runoff.anomaly_rate}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Rapid meltwater influx into Imja Tsho and Tsho Rolpa basins resulting in acute moraine base destabilization.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  {data.indicators.upstream_runoff.details}
                </div>
              </div>
            </div>

            {/* Quick Action to switch to CAP details */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-rose-600 shrink-0" />
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block">Common Alerting Protocol (CAP) v1.2 Ready for Dissemination</span>
                  Formatted emergency payload with mandatory evacuation order and 4 multi-hop offline dispatch channels.
                </div>
              </div>
              <button
                onClick={() => setActiveTab('cap')}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-100 text-xs font-semibold transition cursor-pointer"
              >
                <span>View CAP Notification</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: COMMON ALERTING PROTOCOL MESSAGE */}
        {activeTab === 'cap' && (
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-rose-200/80 mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-rose-900 uppercase tracking-wider text-[11px]">
                    OASIS CAP v1.2 Emergency Payload
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold">
                    {data.cap_message.status}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-mono text-[10px] font-bold">
                    {data.cap_message.msgType}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-mono text-[10px] font-bold">
                    {data.cap_message.scope}
                  </span>
                </div>
              </div>

              {/* Identifier & Sender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 font-mono text-[11px]">
                <div className="bg-white/80 p-2 rounded-lg border border-rose-200">
                  <span className="text-slate-500 block text-[10px]">CAP Identifier:</span>
                  <span className="font-bold text-slate-900">{data.cap_message.identifier}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-rose-200">
                  <span className="text-slate-500 block text-[10px]">Sender & Timestamp:</span>
                  <span className="font-bold text-slate-900">{data.cap_message.sender} • {data.cap_message.sent_timestamp}</span>
                </div>
              </div>

              {/* Headline */}
              <div className="bg-white/90 p-3 rounded-lg border border-rose-200 mb-3">
                <span className="text-rose-800 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Alert Headline:
                </span>
                <span className="font-bold text-slate-900 text-sm leading-snug">
                  {data.cap_message.headline}
                </span>
              </div>

              {/* Description */}
              <div className="bg-white/90 p-3 rounded-lg border border-rose-200 mb-3">
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Incident Description:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {data.cap_message.description}
                </p>
              </div>

              {/* Mandatory Evacuation Instruction */}
              <div className="bg-rose-100/90 p-3.5 rounded-lg border-2 border-rose-400">
                <span className="text-rose-900 block text-[11px] font-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Mandatory Evacuation Instruction:
                </span>
                <p className="text-rose-950 font-semibold leading-relaxed">
                  {data.cap_message.instruction}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => copyToClipboard(JSON.stringify(data.cap_message, null, 2))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy CAP Object'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: OFFLINE DISPATCH ROUTES */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600 mb-1">
              Decentralized, multi-bearer emergency routing for trans-Himalayan dead zones without terrestrial cellular dependence.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.offline_dispatch_routes.map((route, i) => (
                <div
                  key={i}
                  className="bg-white border border-teal-950/10 rounded-xl p-4 shadow-2xs hover:border-teal-400 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        {route.channel.includes('Satellite') ? (
                          <Satellite className="w-4 h-4 text-sky-600" />
                        ) : route.channel.includes('Mesh') ? (
                          <Radio className="w-4 h-4 text-emerald-600" />
                        ) : route.channel.includes('Cellular') ? (
                          <Share2 className="w-4 h-4 text-cyan-600" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                        )}
                        <span>{route.channel}</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        {route.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] font-mono text-slate-700 mb-2">
                      <span className="text-slate-500 block text-[10px] font-sans">Protocol:</span>
                      {route.protocol}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <span className="text-slate-500 font-medium">Target Coverage: </span>
                    {route.target_coverage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LIVE UI LOG SIMULATION */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 text-xs block">
                  Interactive Broadcast Simulation Player
                </span>
                <span className="text-[11px] text-slate-500">
                  Step-by-step telemetry verification and multi-hop relay propagation.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartSim}
                  disabled={isPlaying}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-950 hover:bg-teal-900 text-white text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isPlaying ? 'Simulating...' : 'Run Simulation'}</span>
                </button>
                <button
                  onClick={handleResetSim}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full transition-all duration-300"
                style={{ width: `${(simIndex / data.ui_log_simulation.length) * 100}%` }}
              />
            </div>

            {/* Terminal Window */}
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 max-h-80 overflow-y-auto border border-slate-800 shadow-inner">
              {data.ui_log_simulation.slice(0, simIndex).map((log, idx) => (
                <div key={idx} className="leading-relaxed flex items-start gap-2">
                  <span className="text-teal-400 select-none">❯</span>
                  <span className="break-all">
                    {log.includes('RED') || log.includes('Critical') ? (
                      <span className="text-rose-400 font-bold">{log}</span>
                    ) : log.includes('OK') || log.includes('confirmed') ? (
                      <span className="text-emerald-300">{log}</span>
                    ) : (
                      log
                    )}
                  </span>
                </div>
              ))}

              {simIndex === 0 && (
                <div className="text-slate-500 italic py-4 text-center">
                  Click "Run Simulation" above to execute the step-by-step broadcast sequence.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PURE JSON OUTPUT VIEW */}
        {activeTab === 'raw_json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                Standard pure JSON representation formatted to requested specification:
              </span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(RAW_JSON_PAYLOAD, null, 2), true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRaw ? 'Copied to Clipboard' : 'Copy Pure JSON'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-96 border border-slate-800">
              <pre>{JSON.stringify(RAW_JSON_PAYLOAD, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
