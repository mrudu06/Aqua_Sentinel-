import React, { useState, useRef, useCallback } from 'react';
import { Layers, Eye, Zap, Flame, ShieldCheck, Binary, SlidersHorizontal, Info, Maximize2 } from 'lucide-react';
import { CVProcessingResult } from '../types';

interface VisualComparisonProps {
  resT0: CVProcessingResult;
  resT1: CVProcessingResult;
  diffHeatmapUrl: string;
}

export const VisualComparison: React.FC<VisualComparisonProps> = ({
  resT0,
  resT1,
  diffHeatmapUrl
}) => {
  const [showContours, setShowContours] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'slider' | 'side-by-side' | 'heatmap' | 'mask'>('slider');
  
  // Swipe Slider State (0 to 100%)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  const handlePointerDown = () => {
    isDragging.current = true;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs mb-6">
      {/* Top Section Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-teal-950/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Multi-Temporal Lake Basin Delineation & Contour Tracking</span>
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/60 font-medium">
              Otsu + Contours
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Detecting glacial lake shoreline progression and natural moraine dam submersion via multi-spectral band reflectance.
          </p>
        </div>

        {/* View Mode & Contour Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Contour Toggle */}
          <button
            id="toggle-contours-btn"
            onClick={() => setShowContours(!showContours)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
              showContours
                ? 'bg-teal-950 text-teal-100 border-teal-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Computer Vision detected perimeter contour overlay"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Contours: {showContours ? 'Visible' : 'Hidden'}</span>
          </button>

          {/* Mode Selector Segmented Pill */}
          <div className="inline-flex rounded-lg border border-teal-200/80 p-0.5 bg-slate-100/90 text-xs">
            <button
              onClick={() => setActiveTab('slider')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                activeTab === 'slider'
                  ? 'bg-white shadow-xs text-teal-950 font-semibold'
                  : 'text-slate-600 hover:text-teal-900'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Split Slider</span>
            </button>
            <button
              onClick={() => setActiveTab('side-by-side')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                activeTab === 'side-by-side'
                  ? 'bg-white shadow-xs text-teal-950 font-semibold'
                  : 'text-slate-600 hover:text-teal-900'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>Dual View</span>
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                activeTab === 'heatmap'
                  ? 'bg-white shadow-xs text-rose-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3 h-3 text-rose-600" />
              <span>Submersion Heatmap</span>
            </button>
            <button
              onClick={() => setActiveTab('mask')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                activeTab === 'mask'
                  ? 'bg-white shadow-xs text-teal-950 font-semibold'
                  : 'text-slate-600 hover:text-teal-900'
              }`}
            >
              <Binary className="w-3 h-3" />
              <span>Binary Mask</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Display Area */}
      <div className="mt-4">
        {/* MODE 1: Interactive Swipe Slider */}
        {activeTab === 'slider' && (
          <div className="flex flex-col items-center">
            <div
              ref={sliderContainerRef}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerMove={handlePointerMove}
              className="relative w-full max-w-2xl aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-300 shadow-md select-none cursor-ew-resize touch-none"
            >
              {/* Baseline Image (Underneath) */}
              <img
                src={showContours ? resT0.processedDataUrl : resT0.maskDataUrl}
                alt="Baseline t0"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-slate-900/90 backdrop-blur-xs text-[11px] text-emerald-400 font-mono font-bold rounded-md border border-emerald-500/30">
                BASELINE (t₀)
              </div>

              {/* Current Image (Clipped by slider position) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
              >
                <img
                  src={showContours ? resT1.processedDataUrl : resT1.maskDataUrl}
                  alt="Current t1"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute top-3 right-3 px-2 py-1 bg-slate-900/90 backdrop-blur-xs text-[11px] text-cyan-400 font-mono font-bold rounded-md border border-cyan-500/30">
                  CURRENT PASS (t₁)
                </div>
              </div>

              {/* Draggable Divider Line & Knob */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-cyan-500">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-700" />
                </div>
              </div>

              {/* Coordinate Reticle Overlay */}
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-slate-950/80 backdrop-blur-xs text-[10px] text-slate-400 font-mono rounded">
                SLIDER: {sliderPos.toFixed(0)}% | SENSOR: Sentinel-2 MSI
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span>Drag the slider horizontally to compare boundary expansion between reference baseline (left) and current swollen state (right).</span>
            </p>
          </div>
        )}

        {/* MODE 2: Side-by-Side Dual View */}
        {activeTab === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Panel 1: Baseline Image (t0) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 flex flex-col shadow-xs">
              <div className="bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 flex items-center justify-between border-b border-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Reference Baseline (t₀)
                </span>
                <span className="font-mono text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  Area: {resT0.surfaceAreaPx.toLocaleString()} px²
                </span>
              </div>
              <div className="relative aspect-square bg-slate-950 flex items-center justify-center">
                <img
                  src={showContours ? resT0.processedDataUrl : resT0.maskDataUrl}
                  alt="Baseline Glacial Lake"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-slate-900/80 text-[10px] text-emerald-300 font-mono rounded border border-emerald-500/30">
                  LAKE_0 [t0] &bull; 10m/px
                </div>
              </div>
              <div className="p-3 bg-slate-900/70 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Green outline: Verified moraine waterline</span>
                <span className="text-emerald-400 font-mono">1 Contours</span>
              </div>
            </div>

            {/* Panel 2: Current Swollen Image (t1) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 flex flex-col shadow-xs">
              <div className="bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 flex items-center justify-between border-b border-slate-800">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  Current Satellite Raster (t₁)
                </span>
                <span className="font-mono text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  Area: {resT1.surfaceAreaPx.toLocaleString()} px²
                </span>
              </div>
              <div className="relative aspect-square bg-slate-950 flex items-center justify-center">
                <img
                  src={showContours ? resT1.processedDataUrl : resT1.maskDataUrl}
                  alt="Current Glacial Lake"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-slate-900/80 text-[10px] text-cyan-300 font-mono rounded border border-cyan-500/30">
                  LAKE_0 [t1] &bull; Multi-Spectral
                </div>
              </div>
              <div className="p-3 bg-slate-900/70 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Cyan outline: Current active perimeter</span>
                <span className="text-cyan-400 font-mono font-bold">Dilated</span>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: Differential Submersion Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xl border border-slate-200 rounded-xl overflow-hidden bg-slate-950 flex flex-col shadow-md">
              <div className="bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 flex items-center justify-between border-b border-slate-800">
                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  Differential Moraine Submersion Heatmap (t₁ - t₀)
                </span>
                <span className="font-mono text-[10px] text-rose-300 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded font-bold">
                  Δ Liquefaction Hazard
                </span>
              </div>

              <div className="relative aspect-square bg-slate-950 flex items-center justify-center">
                <img
                  src={diffHeatmapUrl}
                  alt="Differential Submersion Heatmap"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/90 text-[11px] text-rose-300 font-mono rounded border border-rose-500/40">
                  CRIMSON = NEWLY INUNDATED MORAINE DAM
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-600 inline-block shrink-0 shadow-sm" />
                  <span>Newly submerged sediment zones suffer rapid hydrostatic saturation.</span>
                </span>
                <span className="font-mono text-rose-400 font-bold">High Risk</span>
              </div>
            </div>
          </div>
        )}

        {/* MODE 4: Binary Mask */}
        {activeTab === 'mask' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 flex flex-col">
              <div className="bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 border-b border-slate-800 flex justify-between">
                <span>Baseline (t₀) Binary Segmentation</span>
                <span className="text-emerald-400 font-mono text-[11px]">{resT0.surfaceAreaPx} px</span>
              </div>
              <div className="aspect-square bg-black flex items-center justify-center">
                <img src={resT0.maskDataUrl} alt="Baseline Mask" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 flex flex-col">
              <div className="bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 border-b border-slate-800 flex justify-between">
                <span>Current (t₁) Binary Segmentation</span>
                <span className="text-cyan-400 font-mono text-[11px]">{resT1.surfaceAreaPx} px</span>
              </div>
              <div className="aspect-square bg-black flex items-center justify-center">
                <img src={resT1.maskDataUrl} alt="Current Mask" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual CV Legend Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-700">Delineation Key:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block border border-emerald-600" />
            <span>Green Contour: Baseline Perimeter (t₀)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block border border-cyan-600" />
            <span>Cyan Contour: Expanded Perimeter (t₁)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block border border-rose-700" />
            <span>Red Zone: Newly Inundated Moraine</span>
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          ALGORITHM: OpenCV cv2.findContours(RETR_EXTERNAL)
        </div>
      </div>
    </div>
  );
};

