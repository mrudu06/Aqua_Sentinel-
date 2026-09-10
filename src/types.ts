export type RiskLevel = 'Safe' | 'Warning' | 'Critical';

export interface CVProcessingResult {
  width: number;
  height: number;
  surfaceAreaPx: number;
  contourCount: number;
  contours: Array<Array<{ x: number; y: number }>>;
  boundingBoxes: Array<{ x: number; y: number; width: number; height: number }>;
  processedDataUrl: string;
  maskDataUrl: string;
  rawImageData: ImageData;
  maskImageData: ImageData;
}

export interface RiskEvaluation {
  deltaPx: number;
  expansionPct: number;
  level: RiskLevel;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  actionProtocol: string;
  alertCode: string;
}

export interface DispatchLog {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'critical' | 'action';
  message: string;
}

export interface GlacialLakePreset {
  id: string;
  name: string;
  region: string;
  elevation: string;
  baselineAreaKm2: number;
  description: string;
  t0ExpansionFactor: number;
  t1ExpansionFactor: number;
}

export interface CAPMessage {
  identifier: string;
  sender: string;
  sent_timestamp: string;
  status: string;
  msgType: string;
  scope: string;
  headline: string;
  description: string;
  instruction: string;
}

export interface OfflineDispatchRoute {
  channel: string;
  protocol: string;
  status: string;
  target_coverage: string;
}

export interface SectorAnalysisData {
  zone_id: string;
  target_coordinates: string;
  indicators: {
    surface_area_expansion: {
      growth_pct: number;
      ndwi_shift: string;
      details: string;
    };
    terrain_slope_stress: {
      status: string;
      sar_displacement_rate: string;
      details: string;
    };
    upstream_runoff: {
      anomaly_rate: string;
      details: string;
    };
  };
  hazard_score: number;
  alert_tier: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
  precursors: string;
  cap_message: CAPMessage;
  offline_dispatch_routes: OfflineDispatchRoute[];
  ui_log_simulation: string[];
}
