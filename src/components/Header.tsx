import React from 'react';
import { ShieldAlert, Waves, RefreshCw, Satellite, Droplets, LayoutDashboard, Microscope, BellRing, BookOpen, Radio } from 'lucide-react';
import { RiskEvaluation } from '../types';

export type ViewTab = 'dashboard' | 'sector-analysis' | 'cv-lab' | 'emergency' | 'methodology';

interface HeaderProps {
  risk: RiskEvaluation;
  onReset: () => void;
  selectedLakeName: string;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  risk,
  onReset,
  selectedLakeName,
  activeTab,
  onTabChange
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-teal-950/10 sticky top-0 z-30 shadow-2xs">
      {/* Subtle aquatic accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-700 via-cyan-600 to-sky-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Branding & Status Row */}
        <div className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100">
          {/* Title and Lake Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-700 flex items-center justify-center text-white shadow-xs shrink-0 ring-2 ring-teal-500/20">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Aqua Sentinel
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80">
                  <Droplets className="w-3 h-3 text-teal-600" />
                  Glacial Lake Telemetry
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  <Satellite className="w-3 h-3 text-cyan-600" />
                  Sentinel-2 MSI
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Outburst Flood Predictive Monitoring &bull; Active Reservoir: <span className="text-teal-900 font-semibold">{selectedLakeName}</span>
              </p>
            </div>
          </div>

          {/* Action Controls & Risk Pill */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {/* Status Indicator Pill */}
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                risk.level === 'Critical'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : risk.level === 'Warning'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{risk.level.toUpperCase()} PROTOCOL</span>
            </div>

            {/* Reset Baseline Button */}
            <button
              id="reset-telemetry-btn"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-50/60 hover:bg-teal-100/70 text-teal-900 border border-teal-200 transition cursor-pointer"
              title="Reset telemetry and thresholds to baseline"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-700" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* View Navigation Tabs with Lake-Themed Active Indicators */}
        <nav className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto text-xs font-medium scrollbar-none">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-teal-950 text-teal-50 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Mission Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('sector-analysis')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'sector-analysis'
                ? 'bg-rose-700 text-white font-semibold shadow-xs'
                : 'text-rose-700 hover:text-rose-900 hover:bg-rose-50'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Target Zone: Sector-4</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold">RED</span>
          </button>

          <button
            onClick={() => onTabChange('cv-lab')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'cv-lab'
                ? 'bg-teal-950 text-teal-50 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50/60'
            }`}
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>Glacial CV Lab</span>
          </button>

          <button
            onClick={() => onTabChange('emergency')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'emergency'
                ? 'bg-teal-950 text-teal-50 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50/60'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Emergency Protocols</span>
          </button>

          <button
            onClick={() => onTabChange('methodology')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'methodology'
                ? 'bg-teal-950 text-teal-50 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Scientific Architecture</span>
          </button>
        </nav>
      </div>
    </header>
  );
};


