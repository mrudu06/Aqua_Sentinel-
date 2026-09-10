import React, { useRef, useState } from 'react';
import {
  Sliders,
  Upload,
  Gauge,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Mountain,
  Droplets,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Loader2,
  Layers
} from 'lucide-react';
import { GlacialLakePreset } from '../types';
import { BENCHMARK_PRESETS } from '../utils/lakeGenerator';
import { LoadedRaster } from '../utils/rasterLoader';

interface SidebarControlsProps {
  selectedPreset: GlacialLakePreset;
  onSelectPreset: (preset: GlacialLakePreset) => void;
  meltExpansionFactor: number;
  onMeltExpansionChange: (factor: number) => void;
  warningThreshold: number;
  onWarningThresholdChange: (val: number) => void;
  criticalThreshold: number;
  onCriticalThresholdChange: (val: number) => void;
  cvDarknessThreshold: number;
  onCvDarknessThresholdChange: (val: number) => void;
  onUploadT0: (file: File) => void;
  onUploadT1: (file: File) => void;
  rasterT0: LoadedRaster | null;
  rasterT1: LoadedRaster | null;
  onRemoveT0: () => void;
  onRemoveT1: () => void;
  isUploading: boolean;
  uploadError: string | null;
  onLoadSampleRasters: () => void;
  isCustomUpload: boolean;
  onResetToSynthetic: () => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  selectedPreset,
  onSelectPreset,
  meltExpansionFactor,
  onMeltExpansionChange,
  warningThreshold,
  onWarningThresholdChange,
  criticalThreshold,
  onCriticalThresholdChange,
  cvDarknessThreshold,
  onCvDarknessThresholdChange,
  onUploadT0,
  onUploadT1,
  rasterT0,
  rasterT1,
  onRemoveT0,
  onRemoveT1,
  isUploading,
  uploadError,
  onLoadSampleRasters,
  isCustomUpload,
  onResetToSynthetic
}) => {
  const fileInputT0 = useRef<HTMLInputElement>(null);
  const fileInputT1 = useRef<HTMLInputElement>(null);

  const [isDraggingT0, setIsDraggingT0] = useState<boolean>(false);
  const [isDraggingT1, setIsDraggingT1] = useState<boolean>(false);

  const expansionPct = (meltExpansionFactor - 1) * 100;

  const handleDropT0 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingT0(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUploadT0(file);
  };

  const handleDropT1 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingT1(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUploadT1(file);
  };

  return (
    <aside className="bg-white border-r border-teal-950/10 text-slate-800 p-4 lg:p-5 flex flex-col gap-4 w-full lg:w-80 shrink-0">
      <div className="flex items-center justify-between pb-2 border-b border-teal-950/10">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-teal-600" />
          <span>Hydro Simulation & Basin</span>
        </span>
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/60">
          Telemetry Active
        </span>
      </div>

      {/* SECTION 1: Glacial Basin Preset Selection */}
      <div className="bg-teal-50/30 border border-teal-900/10 rounded-xl p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-teal-700" />
            <span>Target Glacial Basin</span>
          </label>
          {isCustomUpload && (
            <button
              onClick={onResetToSynthetic}
              className="text-[11px] text-teal-700 hover:text-teal-900 flex items-center gap-1 font-medium transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        <select
          id="preset-basin-select"
          value={selectedPreset.id}
          onChange={(e) => {
            const found = BENCHMARK_PRESETS.find((p) => p.id === e.target.value);
            if (found) onSelectPreset(found);
          }}
          className="w-full bg-white border border-teal-200 rounded-lg py-2 px-2.5 text-xs font-medium text-slate-900 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 focus:outline-none transition cursor-pointer shadow-2xs"
        >
          {BENCHMARK_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Basin Meta Details */}
        <div className="bg-white rounded-lg p-2.5 border border-teal-100 text-[11px] space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span>Location:</span>
            <span className="font-medium text-slate-800">{selectedPreset.region}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Water Elevation:</span>
            <span className="font-mono text-teal-800 font-semibold">{selectedPreset.elevation}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Nominal Area:</span>
            <span className="font-mono text-slate-700 font-semibold">{selectedPreset.baselineAreaKm2} km²</span>
          </div>
          <p className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-100 leading-relaxed">
            {selectedPreset.description}
          </p>
        </div>
      </div>

      {/* SECTION 2: Glacial Melt Simulation Slider */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate Lake Expansion (t₁)</span>
          </label>
          <span
            className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border ${
              expansionPct > criticalThreshold
                ? 'text-rose-700 bg-rose-50 border-rose-200'
                : expansionPct > warningThreshold
                ? 'text-amber-800 bg-amber-50 border-amber-200'
                : 'text-teal-800 bg-teal-50 border-teal-200'
            }`}
          >
            {expansionPct >= 0 ? `+${expansionPct.toFixed(0)}%` : `${expansionPct.toFixed(0)}%`}
          </span>
        </div>

        <input
          id="melt-simulation-slider"
          type="range"
          min="0.9"
          max="1.7"
          step="0.02"
          value={meltExpansionFactor}
          onChange={(e) => onMeltExpansionChange(parseFloat(e.target.value))}
          className="w-full accent-teal-700 bg-teal-100 rounded-lg h-1.5 cursor-pointer"
        />

        {/* Quick Simulation Presets */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => onMeltExpansionChange(1.0)}
            className="py-1 px-1.5 text-[10px] font-medium rounded bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-900 transition text-center cursor-pointer"
          >
            Baseline (0%)
          </button>
          <button
            onClick={() => onMeltExpansionChange(1.15)}
            className="py-1 px-1.5 text-[10px] font-medium rounded bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-800 transition text-center cursor-pointer"
          >
            Swell (+15%)
          </button>
          <button
            onClick={() => onMeltExpansionChange(1.38)}
            className="py-1 px-1.5 text-[10px] font-medium rounded bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-800 transition text-center cursor-pointer"
          >
            Breach (+38%)
          </button>
        </div>
      </div>

      {/* SECTION 3: Risk Matrix Thresholds */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 flex flex-col gap-3">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Outburst Threshold Matrix</span>
        </label>

        <div className="space-y-3 text-xs">
          {/* Warning Limit */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Warning Trigger
              </span>
              <span className="font-mono text-amber-800 font-semibold">{warningThreshold}%</span>
            </div>
            <input
              id="warning-threshold-slider"
              type="range"
              min="5"
              max="20"
              step="1"
              value={warningThreshold}
              onChange={(e) => onWarningThresholdChange(parseFloat(e.target.value))}
              className="w-full accent-amber-600 bg-slate-200 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          {/* Critical Limit */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Critical Trigger
              </span>
              <span className="font-mono text-rose-700 font-semibold">{criticalThreshold}%</span>
            </div>
            <input
              id="critical-threshold-slider"
              type="range"
              min="15"
              max="45"
              step="1"
              value={criticalThreshold}
              onChange={(e) => onCriticalThresholdChange(parseFloat(e.target.value))}
              className="w-full accent-rose-600 bg-slate-200 rounded-lg h-1.5 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Computer Vision Albedo Tuning */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-teal-700" />
            <span>Water Albedo Sensitivity</span>
          </label>
          <span className="font-mono text-xs font-semibold text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200">
            {cvDarknessThreshold} / 255
          </span>
        </div>

        <input
          id="cv-darkness-slider"
          type="range"
          min="40"
          max="160"
          step="2"
          value={cvDarknessThreshold}
          onChange={(e) => onCvDarknessThresholdChange(parseInt(e.target.value, 10))}
          className="w-full accent-teal-700 bg-teal-100 rounded-lg h-1.5 cursor-pointer"
        />
        <p className="text-[10px] text-slate-500 leading-tight">
          Isolates low-albedo glacial water from high-reflectance snowpack and moraine rock.
        </p>
      </div>

      {/* SECTION 5: Satellite Imagery Upload */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload Satellite Rasters</span>
          </label>
          <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
            GeoTIFF / PNG / JPG
          </span>
        </div>

        {uploadError && (
          <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Raster Load Warning</p>
              <p className="text-[11px] text-rose-800 mt-0.5 leading-snug">{uploadError}</p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="p-2 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 text-xs flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin" />
            <span className="text-[11px]">Parsing and decoding multi-spectral raster...</span>
          </div>
        )}

        <div className="space-y-2.5">
          {/* Reference t0 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-600 font-medium">Baseline Pass (t₀):</span>
              {rasterT0 && (
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {rasterT0.format}
                </span>
              )}
            </div>
            <input
              ref={fileInputT0}
              type="file"
              accept="image/*,.tif,.tiff,.geotiff,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadT0(file);
                e.target.value = '';
              }}
            />

            {rasterT0 ? (
              <div className="p-2 bg-white rounded-lg border border-teal-300 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate" title={rasterT0.name}>
                      {rasterT0.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      {rasterT0.width}×{rasterT0.height}px &bull; {(rasterT0.sizeBytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={onRemoveT0}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="Remove this raster and use synthetic baseline"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingT0(true);
                }}
                onDragLeave={() => setIsDraggingT0(false)}
                onDrop={handleDropT0}
                onClick={() => fileInputT0.current?.click()}
                className={`w-full py-2 px-2.5 rounded-lg border border-dashed text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center ${
                  isDraggingT0
                    ? 'border-teal-600 bg-teal-50/70 text-teal-800'
                    : 'border-teal-300 hover:border-teal-500 bg-white text-slate-700 hover:bg-teal-50/20'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-medium text-slate-800">Select or Drop Baseline (t₀)</span>
                </div>
                <span className="text-[10px] text-slate-400">GeoTIFF (.tif/.tiff), PNG, or JPG</span>
              </div>
            )}
          </div>

          {/* Current t1 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-600 font-medium">Recent / Surge Pass (t₁):</span>
              {rasterT1 && (
                <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                  {rasterT1.format}
                </span>
              )}
            </div>
            <input
              ref={fileInputT1}
              type="file"
              accept="image/*,.tif,.tiff,.geotiff,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadT1(file);
                e.target.value = '';
              }}
            />

            {rasterT1 ? (
              <div className="p-2 bg-white rounded-lg border border-teal-300 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate" title={rasterT1.name}>
                      {rasterT1.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      {rasterT1.width}×{rasterT1.height}px &bull; {(rasterT1.sizeBytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={onRemoveT1}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="Remove this raster and use synthetic current"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingT1(true);
                }}
                onDragLeave={() => setIsDraggingT1(false)}
                onDrop={handleDropT1}
                onClick={() => fileInputT1.current?.click()}
                className={`w-full py-2 px-2.5 rounded-lg border border-dashed text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center ${
                  isDraggingT1
                    ? 'border-teal-600 bg-teal-50/70 text-teal-800'
                    : 'border-teal-300 hover:border-teal-500 bg-white text-slate-700 hover:bg-teal-50/20'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-medium text-slate-800">Select or Drop Current (t₁)</span>
                </div>
                <span className="text-[10px] text-slate-400">GeoTIFF (.tif/.tiff), PNG, or JPG</span>
              </div>
            )}
          </div>

          {/* Quick Benchmark Satellite Sample Loader */}
          <div className="pt-1">
            <button
              onClick={onLoadSampleRasters}
              className="w-full py-1.5 px-2.5 rounded-lg border border-teal-200 bg-teal-50/60 hover:bg-teal-100 text-teal-900 text-xs flex items-center justify-center gap-1.5 font-medium transition cursor-pointer shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-teal-700" />
              <span>Load Sentinel-2 Sample Passes</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};


