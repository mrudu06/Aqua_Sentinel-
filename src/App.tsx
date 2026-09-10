import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header, ViewTab } from './components/Header';
import { SidebarControls } from './components/SidebarControls';
import { MetricCards } from './components/MetricCards';
import { VisualComparison } from './components/VisualComparison';
import { EmergencyConsole } from './components/EmergencyConsole';
import { MethodologyGuide } from './components/MethodologyGuide';
import { SectorAnalysisPanel } from './components/SectorAnalysisPanel';
import { BENCHMARK_PRESETS, generateProceduralLakeCanvas } from './utils/lakeGenerator';
import { processImageWithCV, generateDifferenceHeatmap } from './utils/cvEngine';
import { evaluateRiskMatrix } from './utils/riskMatrix';
import { CVProcessingResult, DispatchLog, GlacialLakePreset } from './types';
import { loadRasterFile, LoadedRaster } from './utils/rasterLoader';
import { createSampleSatellitePasses } from './utils/sampleSatelliteRasters';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');

  // Preset and simulation states
  const [selectedPreset, setSelectedPreset] = useState<GlacialLakePreset>(BENCHMARK_PRESETS[0]);
  const [meltExpansionFactor, setMeltExpansionFactor] = useState<number>(selectedPreset.t1ExpansionFactor);

  // Thresholds
  const [warningThreshold, setWarningThreshold] = useState<number>(10.0);
  const [criticalThreshold, setCriticalThreshold] = useState<number>(25.0);
  const [cvDarknessThreshold, setCvDarknessThreshold] = useState<number>(95);

  // Custom uploaded rasters (GeoTIFF / PNG / JPEG)
  const [rasterT0, setRasterT0] = useState<LoadedRaster | null>(null);
  const [rasterT1, setRasterT1] = useState<LoadedRaster | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCustomUpload, setIsCustomUpload] = useState<boolean>(false);

  // Simulated live logs
  const [logs, setLogs] = useState<DispatchLog[]>([
    {
      id: 'log-1',
      timestamp: '06:00:12',
      type: 'info',
      message: 'Sentinel-2 Multispectral MSI Pass calibrated. Band 3/Band 8 NDWI raster indexed.'
    },
    {
      id: 'log-2',
      timestamp: '06:00:15',
      type: 'info',
      message: 'CV Engine booted: Low-albedo lake boundary tracing initialized with Otsu fallback.'
    }
  ]);

  // When preset changes, update melt factor
  const handleSelectPreset = (preset: GlacialLakePreset) => {
    setSelectedPreset(preset);
    setMeltExpansionFactor(preset.t1ExpansionFactor);
    setIsCustomUpload(false);
    setRasterT0(null);
    setRasterT1(null);
    setUploadError(null);
  };

  const handleLoadSectorPreset = () => {
    const sec4 = BENCHMARK_PRESETS.find(p => p.id === 'himalaya-sector-4') || BENCHMARK_PRESETS[0];
    setSelectedPreset(sec4);
    setMeltExpansionFactor(sec4.t1ExpansionFactor);
    setIsCustomUpload(false);
    setRasterT0(null);
    setRasterT1(null);
    setUploadError(null);
    setActiveTab('dashboard');
  };

  // Image source resolution
  const [resT0, setResT0] = useState<CVProcessingResult | null>(null);
  const [resT1, setResT1] = useState<CVProcessingResult | null>(null);
  const [diffHeatmapUrl, setDiffHeatmapUrl] = useState<string>('');

  // Re-run CV engine whenever images, thresholds, or melt factor change
  useEffect(() => {
    // Determine canvas or image for T0
    let sourceT0: HTMLCanvasElement | HTMLImageElement;
    if (rasterT0) {
      sourceT0 = rasterT0.canvas;
    } else {
      sourceT0 = generateProceduralLakeCanvas(selectedPreset.t0ExpansionFactor, 400, 400, 0);
    }

    // Determine canvas or image for T1
    let sourceT1: HTMLCanvasElement | HTMLImageElement;
    if (rasterT1) {
      sourceT1 = rasterT1.canvas;
    } else {
      sourceT1 = generateProceduralLakeCanvas(meltExpansionFactor, 400, 400, 4);
    }

    // Run CV extraction
    const result0 = processImageWithCV(sourceT0, cvDarknessThreshold, 400, '#10B981'); // Emerald green overlay for baseline
    const result1 = processImageWithCV(sourceT1, cvDarknessThreshold, 400, '#0d9488'); // Teal overlay for current lake pass

    const heatmap = generateDifferenceHeatmap(result0, result1, sourceT1);

    setResT0(result0);
    setResT1(result1);
    setDiffHeatmapUrl(heatmap);
  }, [
    selectedPreset,
    meltExpansionFactor,
    cvDarknessThreshold,
    rasterT0,
    rasterT1
  ]);

  // Evaluate Risk
  const risk = useMemo(() => {
    if (!resT0 || !resT1) {
      return evaluateRiskMatrix(0, 0, warningThreshold, criticalThreshold);
    }
    return evaluateRiskMatrix(resT0.surfaceAreaPx, resT1.surfaceAreaPx, warningThreshold, criticalThreshold);
  }, [resT0, resT1, warningThreshold, criticalThreshold]);

  // Automated logging when risk status elevates
  useEffect(() => {
    if (!resT0 || !resT1) return;
    const now = new Date().toTimeString().split(' ')[0];
    if (risk.level === 'Critical') {
      setLogs((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].type === 'critical' && prev[prev.length - 1].message.includes(risk.expansionPct.toFixed(0))) {
          return prev;
        }
        return [
          ...prev,
          {
            id: `crit-${Date.now()}`,
            timestamp: now,
            type: 'critical',
            message: `⚠️ CRITICAL BREACH HAZARD: Expansion reached +${risk.expansionPct.toFixed(1)}% (Δ: +${risk.deltaPx.toLocaleString()} px²). Trigger evacuation protocol.`
          }
        ];
      });
    } else if (risk.level === 'Warning') {
      setLogs((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].type === 'warning' && prev[prev.length - 1].message.includes(risk.expansionPct.toFixed(0))) {
          return prev;
        }
        return [
          ...prev,
          {
            id: `warn-${Date.now()}`,
            timestamp: now,
            type: 'warning',
            message: `⚡ ELEVATED EXPANSION WATCH: Surface area increased by +${risk.expansionPct.toFixed(1)}%. Alerting downstream civil defense.`
          }
        ];
      });
    }
  }, [risk.level, risk.expansionPct, risk.deltaPx, resT0, resT1]);

  // Custom image/GeoTIFF upload handlers
  const handleUploadT0 = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const loaded = await loadRasterFile(file, 400);
      setRasterT0(loaded);
      setIsCustomUpload(true);
      setLogs((prev) => [
        ...prev,
        {
          id: `raster-t0-${Date.now()}`,
          timestamp: new Date().toTimeString().split(' ')[0],
          type: 'info',
          message: `🛰️ Ingested T0 raster: "${file.name}" (${loaded.format}, ${loaded.width}×${loaded.height}px, ${(file.size / 1024).toFixed(1)} KB)`
        }
      ]);
    } catch (err: any) {
      setUploadError(`Failed to decode T0 (${file.name}): ${err.message || 'Corrupt or unreadable raster'}`);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleUploadT1 = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const loaded = await loadRasterFile(file, 400);
      setRasterT1(loaded);
      setIsCustomUpload(true);
      setLogs((prev) => [
        ...prev,
        {
          id: `raster-t1-${Date.now()}`,
          timestamp: new Date().toTimeString().split(' ')[0],
          type: 'info',
          message: `🛰️ Ingested T1 raster: "${file.name}" (${loaded.format}, ${loaded.width}×${loaded.height}px, ${(file.size / 1024).toFixed(1)} KB)`
        }
      ]);
    } catch (err: any) {
      setUploadError(`Failed to decode T1 (${file.name}): ${err.message || 'Corrupt or unreadable raster'}`);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleRemoveT0 = () => {
    setRasterT0(null);
    if (!rasterT1) {
      setIsCustomUpload(false);
    }
  };

  const handleRemoveT1 = () => {
    setRasterT1(null);
    if (!rasterT0) {
      setIsCustomUpload(false);
    }
  };

  const handleLoadSampleRasters = () => {
    const { t0, t1 } = createSampleSatellitePasses();
    setRasterT0(t0);
    setRasterT1(t1);
    setIsCustomUpload(true);
    setUploadError(null);
    setLogs((prev) => [
      ...prev,
      {
        id: `sample-load-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        type: 'info',
        message: `🛰️ Calibrated Sentinel-2 Level-2A GeoTIFF test suite: Baseline (2019) vs Glacial Swell (2024).`
      }
    ]);
  };

  const handleResetToSynthetic = () => {
    setIsCustomUpload(false);
    setRasterT0(null);
    setRasterT1(null);
    setUploadError(null);
    setMeltExpansionFactor(selectedPreset.t1ExpansionFactor);
  };

  // Trigger dispatch protocol
  const handleTriggerDispatch = () => {
    const now = new Date().toTimeString().split(' ')[0];
    const newLogs: DispatchLog[] = [
      {
        id: `action-${Date.now()}-1`,
        timestamp: now,
        type: 'action',
        message: `🔴 DISPATCH ACTIVATED: Broadcast initiated for ${selectedPreset.name}. Risk state: ${risk.level.toUpperCase()} (+${risk.expansionPct.toFixed(1)}%).`
      },
      {
        id: `action-${Date.now()}-2`,
        timestamp: now,
        type: 'action',
        message: `📢 Acoustic sirens triggered in Sectors Alpha, Beta & Gamma. Evacuation corridor open toward higher elevation.`
      },
      {
        id: `action-${Date.now()}-3`,
        timestamp: now,
        type: 'warning',
        message: `🌊 Hydro Electric Authority: Recommended spillway gate elevation to accommodate surge wave.`
      },
      {
        id: `action-${Date.now()}-4`,
        timestamp: now,
        type: 'info',
        message: `📡 Common Alerting Protocol (CAP XML) confirmed by State Emergency Operations Center.`
      }
    ];

    setLogs((prev) => [...prev, ...newLogs]);
  };

  const handleFullReset = () => {
    handleResetToSynthetic();
    setWarningThreshold(10.0);
    setCriticalThreshold(25.0);
    setCvDarknessThreshold(95);
    setLogs([
      {
        id: `reset-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        type: 'info',
        message: 'System telemetry recalibrated. Sentinel-2 lake contour baseline restored.'
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header */}
      <Header
        risk={risk}
        onReset={handleFullReset}
        selectedLakeName={selectedPreset.name}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Layout: Responsive Sidebar + Dashboard Content */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto border-x border-teal-950/10 bg-white">
        {/* Sidebar Controls */}
        <SidebarControls
          selectedPreset={selectedPreset}
          onSelectPreset={handleSelectPreset}
          meltExpansionFactor={meltExpansionFactor}
          onMeltExpansionChange={setMeltExpansionFactor}
          warningThreshold={warningThreshold}
          onWarningThresholdChange={setWarningThreshold}
          criticalThreshold={criticalThreshold}
          onCriticalThresholdChange={setCriticalThreshold}
          cvDarknessThreshold={cvDarknessThreshold}
          onCvDarknessThresholdChange={setCvDarknessThreshold}
          onUploadT0={handleUploadT0}
          onUploadT1={handleUploadT1}
          rasterT0={rasterT0}
          rasterT1={rasterT1}
          onRemoveT0={handleRemoveT0}
          onRemoveT1={handleRemoveT1}
          isUploading={isUploading}
          uploadError={uploadError}
          onLoadSampleRasters={handleLoadSampleRasters}
          isCustomUpload={isCustomUpload}
          onResetToSynthetic={handleResetToSynthetic}
        />

        {/* Dashboard Workspace */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50/50 flex flex-col justify-between">
          <div>
            {/* TAB 0: Targeted Sector Analysis (Sector 4) */}
            {activeTab === 'sector-analysis' && (
              <SectorAnalysisPanel onLoadSectorPreset={handleLoadSectorPreset} />
            )}

            {/* TAB 1: Complete Mission Dashboard */}
            {activeTab === 'dashboard' && (
              <>
                {/* Sector 4 Critical Surveillance Callout Banner */}
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 mb-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-rose-950 block">
                        Target Zone: Himalaya-Catchment-Sector-4 (27.9881° N, 86.9250° E)
                      </span>
                      <span className="text-[11px] text-rose-800">
                        Evaluated Hazard Probability: <strong className="font-mono">92.5% (RED)</strong> &bull; Surface Area Expansion: <strong className="font-mono">+34.0%</strong> with severe slope displacement.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('sector-analysis')}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    Inspect CAP & Offline Dispatch
                  </button>
                </div>

                {/* Real-time Quantitative Metric Cards */}
                {resT0 && resT1 && (
                  <MetricCards resT0={resT0} resT1={resT1} risk={risk} />
                )}

                {/* Visual Comparison: Baseline, Current & Differential Submersion */}
                {resT0 && resT1 && (
                  <VisualComparison
                    resT0={resT0}
                    resT1={resT1}
                    diffHeatmapUrl={diffHeatmapUrl}
                  />
                )}

                {/* Emergency Console: Button & Live Status Logs */}
                <EmergencyConsole
                  risk={risk}
                  logs={logs}
                  onTriggerDispatch={handleTriggerDispatch}
                  selectedDistrict={selectedPreset.region}
                />
              </>
            )}

            {/* TAB 2: Raster Computer Vision Laboratory */}
            {activeTab === 'cv-lab' && (
              <>
                <div className="bg-white border border-teal-950/10 rounded-xl p-4 mb-5 text-xs text-slate-700 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="font-semibold text-slate-900 block text-sm mb-0.5">
                      Computer Vision Analysis Laboratory
                    </span>
                    <span className="text-slate-500">
                      Inspect Otsu segmentation masks, difference heatmaps, and contour coordinates extracted from Sentinel-2 MSI band data.
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-800 rounded-md border border-teal-200/80 shrink-0">
                    CV Engine Online
                  </span>
                </div>

                {resT0 && resT1 && (
                  <VisualComparison
                    resT0={resT0}
                    resT1={resT1}
                    diffHeatmapUrl={diffHeatmapUrl}
                  />
                )}

                {resT0 && resT1 && (
                  <MetricCards resT0={resT0} resT1={resT1} risk={risk} />
                )}
              </>
            )}

            {/* TAB 3: Emergency Protocols & Downstream Corridors */}
            {activeTab === 'emergency' && (
              <>
                {resT0 && resT1 && (
                  <MetricCards resT0={resT0} resT1={resT1} risk={risk} />
                )}

                <EmergencyConsole
                  risk={risk}
                  logs={logs}
                  onTriggerDispatch={handleTriggerDispatch}
                  selectedDistrict={selectedPreset.region}
                />
              </>
            )}

            {/* TAB 4: Scientific Architecture & Guide */}
            {activeTab === 'methodology' && (
              <MethodologyGuide />
            )}
          </div>

          {/* Clean Lake Sentinel Footer */}
          <footer className="mt-8 pt-4 border-t border-teal-950/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-teal-900">Aqua Sentinel</span>
              <span className="text-slate-300">&bull;</span>
              <span>Glacial Lake Outburst Flood & Flash Flood Early-Warning Telemetry</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>Sentinel-2 MSI 10m/px</span>
              <span>&bull;</span>
              <span>OASIS CAP v1.2</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

