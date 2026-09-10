import React from 'react';
import { BookOpen, ShieldCheck, Waves, Cpu, Eye, AlertOctagon, HelpCircle, ArrowRight } from 'lucide-react';

export const MethodologyGuide: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs mb-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-teal-950/10">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <span>Aqua Sentinel: Glacial Lake Outburst Early-Warning Architecture & Hydrological CV</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated satellite lake boundary delineation, multi-spectral water index segmentation, and moraine breach hazard matrices.
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200/60 font-semibold">
          USGS / ICIMOD Reference
        </span>
      </div>

      {/* 4 Clean Visual Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1 */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs mb-3">
              01
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-600" />
              <span>Multi-Spectral Albedo</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Glacial water bodies absorb near-infrared (NIR) strongly while reflecting green light. The Normalized Difference Water Index (NDWI) isolates water from bright snowpack.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 font-mono text-[10px] text-cyan-800">
            NDWI = (Green - NIR) / (Green + NIR)
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3">
              02
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contour Boundary Tracing</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Using OpenCV's Suzuki-Abe border following algorithm, the CV pipeline extracts closed polygons of the lake perimeter and calculates precise 2D surface area in real-time.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 font-mono text-[10px] text-emerald-800">
            cv2.findContours(cv2.RETR_EXTERNAL)
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs mb-3">
              03
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-amber-600" />
              <span>Moraine Dilatation Delta (Δ)</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Subtracting the baseline raster mask (t₀) from the current pass (t₁) identifies newly submerged moraine dam areas. Rapid expansion signals imminent piping or hydrostatic failure.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 font-mono text-[10px] text-amber-800">
            Δ Area = Area(t₁) - Area(t₀)
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs mb-3">
              04
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>Early Warning & Dispatch</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When delta expansion surpasses 25%, the system immediately triggers the Common Alerting Protocol (CAP XML), civil defense acoustic sirens, and downstream evacuation directives.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 font-mono text-[10px] text-rose-800">
            CAP v1.2 OASIS Standard Broadcast
          </div>
        </div>
      </div>

      {/* Case Study & Real-world Relevance */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Real-World Disaster Context: South Lhonak Lake (Sikkim 2023)
            </span>
            <h4 className="text-sm font-semibold text-white mt-0.5">
              Why 20-30 Minutes of Satellite Early Warning Saves Thousands of Lives
            </h4>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-rose-950/80 border border-rose-800/80 text-rose-300 font-bold font-mono">
            October 4, 2023 Case Study
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3.5 text-xs text-slate-300">
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <span className="text-cyan-400 font-semibold block mb-1">The Trigger</span>
            <p className="text-slate-400 leading-relaxed">
              A high-altitude ice & rock avalanche plunged into South Lhonak lake, generating a catastrophic displacement wave that overtopped and eroded the loose terminal moraine.
            </p>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <span className="text-amber-400 font-semibold block mb-1">The Downstream Surge</span>
            <p className="text-slate-400 leading-relaxed">
              The Chungthang Hydroelectric Dam (Teesta III) was overwhelmed within 30 minutes, carrying sediment boulders down the Teesta River and destroying military camps and bridges.
            </p>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <span className="text-emerald-400 font-semibold block mb-1">Our Sentinel Solution</span>
            <p className="text-slate-400 leading-relaxed">
              Automated multi-temporal optical/SAR computer vision detects early lake swell and moraine deformation, providing downstream communities up to 45 minutes of actionable evacuation notice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
