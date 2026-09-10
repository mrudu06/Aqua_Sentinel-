import React from 'react';
import { TrendingUp, TrendingDown, Layers, Droplets, AlertTriangle, CheckCircle2, ShieldAlert, Waves } from 'lucide-react';
import { CVProcessingResult, RiskEvaluation } from '../types';

interface MetricCardsProps {
  resT0: CVProcessingResult;
  resT1: CVProcessingResult;
  risk: RiskEvaluation;
  baselineKm2?: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  resT0,
  resT1,
  risk,
  baselineKm2 = 1.62
}) => {
  const isPositive = risk.deltaPx >= 0;
  
  // Calculate approximate real-world estimates based on baseline km2
  const currentKm2 = baselineKm2 * (resT0.surfaceAreaPx > 0 ? (resT1.surfaceAreaPx / resT0.surfaceAreaPx) : 1);
  const deltaKm2 = currentKm2 - baselineKm2;
  const deltaHectares = deltaKm2 * 100;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-teal-600" />
            <span>Quantitative Lake Telemetry & Inundation Metrics</span>
          </h2>
          <span className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded font-mono font-medium">
            Sentinel-2 MSI 10m/px
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Normal &le; 10%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Warning 10-25%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Critical &gt; 25%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Baseline Area */}
        <div
          id="metric-card-baseline"
          className="bg-white border border-teal-950/10 rounded-xl p-4 shadow-2xs hover:border-teal-300 transition flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                Baseline Body (t₀)
              </span>
              <span className="p-1 rounded-md bg-teal-50 text-teal-700">
                <Waves className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {resT0.surfaceAreaPx.toLocaleString()}
              <span className="text-xs font-semibold text-slate-500 ml-1">px²</span>
            </div>
          </div>
          <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Water Surface:</span>
            <span className="font-semibold text-slate-700 font-mono">
              {baselineKm2.toFixed(2)} km²
            </span>
          </div>
        </div>

        {/* 2. Current Area */}
        <div
          id="metric-card-current"
          className="bg-white border border-teal-950/10 rounded-xl p-4 shadow-2xs hover:border-teal-300 transition flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                Expanded Lake (t₁)
              </span>
              <span className="p-1 rounded-md bg-cyan-50 text-cyan-700">
                <Droplets className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {resT1.surfaceAreaPx.toLocaleString()}
              <span className="text-xs font-semibold text-slate-500 ml-1">px²</span>
            </div>
          </div>
          <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Current Expanse:</span>
            <span className="font-semibold text-cyan-800 font-mono">
              {currentKm2.toFixed(2)} km²
            </span>
          </div>
        </div>

        {/* 3. Net Change */}
        <div
          id="metric-card-delta"
          className="bg-white border border-teal-950/10 rounded-xl p-4 shadow-2xs hover:border-teal-300 transition flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                Submerged Delta (Δ)
              </span>
              <span className={`p-1 rounded-md ${
                risk.level === 'Critical'
                  ? 'bg-rose-50 text-rose-600'
                  : risk.level === 'Warning'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-teal-50 text-teal-600'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
              </span>
            </div>
            <div className={`text-2xl font-black tracking-tight font-mono ${
              risk.level === 'Critical'
                ? 'text-rose-600'
                : risk.level === 'Warning'
                ? 'text-amber-600'
                : 'text-teal-700'
            }`}>
              {isPositive ? `+${risk.deltaPx.toLocaleString()}` : risk.deltaPx.toLocaleString()}
              <span className="text-xs font-semibold text-slate-500 ml-1">px²</span>
            </div>
          </div>
          <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Inundated Moraine:</span>
            <span className={`font-semibold font-mono ${
              risk.level === 'Critical' ? 'text-rose-700 font-bold' : 'text-slate-700'
            }`}>
              {deltaHectares >= 0 ? `+${deltaHectares.toFixed(1)} ha` : `${deltaHectares.toFixed(1)} ha`}
            </span>
          </div>
        </div>

        {/* 4. Expansion Rate (%) */}
        <div
          id="metric-card-rate"
          className="bg-white border border-teal-950/10 rounded-xl p-4 shadow-2xs hover:border-teal-300 transition flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                Expansion Velocity
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 font-mono border border-teal-100">
                Δt %
              </span>
            </div>
            <div className={`text-2xl font-black tracking-tight font-mono ${
              risk.level === 'Critical'
                ? 'text-rose-600'
                : risk.level === 'Warning'
                ? 'text-amber-600'
                : 'text-teal-700'
            }`}>
              {isPositive ? `+${risk.expansionPct.toFixed(1)}%` : `${risk.expansionPct.toFixed(1)}%`}
            </div>
          </div>
          {/* Progress bar toward breach threshold */}
          <div className="pt-2.5 mt-2 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  risk.level === 'Critical'
                    ? 'bg-rose-500'
                    : risk.level === 'Warning'
                    ? 'bg-amber-500'
                    : 'bg-teal-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, (risk.expansionPct / 40) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 5. Risk Assessment Badge */}
        <div
          id="metric-card-risk"
          className={`border rounded-xl p-4 shadow-2xs transition-all flex flex-col justify-between ${
            risk.level === 'Critical'
              ? 'bg-rose-50/80 border-rose-300'
              : risk.level === 'Warning'
              ? 'bg-amber-50/80 border-amber-300'
              : 'bg-teal-50/50 border-teal-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700">
                Hydrological Hazard
              </span>
              {risk.level === 'Critical' ? (
                <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
              ) : risk.level === 'Warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wide text-white uppercase shadow-xs ${
                  risk.level === 'Critical'
                    ? 'bg-rose-600'
                    : risk.level === 'Warning'
                    ? 'bg-amber-600'
                    : 'bg-teal-700'
                }`}
              >
                {risk.level}
              </span>
              <span className="text-xs font-semibold text-slate-800 font-mono">
                {risk.level === 'Safe' ? '≤ 10.0%' : risk.level === 'Warning' ? '10.0-25.0%' : '> 25.0%'}
              </span>
            </div>
          </div>
          <div className="pt-2.5 mt-2 border-t border-slate-200/80 text-[11px] font-mono font-semibold text-slate-700 truncate" title={risk.alertCode}>
            {risk.alertCode}
          </div>
        </div>
      </div>
    </div>
  );
};

