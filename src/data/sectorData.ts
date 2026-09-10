import { SectorAnalysisData } from '../types';

export const HIMALAYA_SECTOR_4_ANALYSIS: SectorAnalysisData = {
  zone_id: 'Himalaya-Catchment-Sector-4',
  target_coordinates: '27.9881° N, 86.9250° E',
  indicators: {
    surface_area_expansion: {
      growth_pct: 34.0,
      ndwi_shift: 'NDWI index increase from 0.42 to 0.78 (Rapid shoreline progression of 48m)',
      details: 'Temporal multi-spectral raster comparison shows rapid shoreline displacement and aggressive surface area expansion for Imja Tsho and Tsho Rolpa.'
    },
    terrain_slope_stress: {
      status: 'Severe Slope Displacement & Tension Fractures',
      sar_displacement_rate: '14.8 cm/day lateral displacement via Sentinel-1 SAR interferometry',
      details: 'Visible moraine tensile cracking, ice-mass displacement along hanging tributary glaciers, and thermal moisture seepage anomalies along dam toe.'
    },
    upstream_runoff: {
      anomaly_rate: '+410 m³/s surge deviation above seasonal baseline',
      details: 'Abnormal thermal ablation and supra-glacial lake coalescence routing extreme hydrostatic inflow into terminal lake body.'
    }
  },
  hazard_score: 92.5,
  alert_tier: 'RED',
  precursors: 'Glacial lake expansion of 34% with severe slope displacement.',
  cap_message: {
    identifier: 'CAP-AQUA-SENTINEL-HIMALAYA-SEC4-20260909-0853Z',
    sender: 'AquaSentinel-AI',
    sent_timestamp: '2026-09-09T08:53:34Z',
    status: 'Actual',
    msgType: 'Alert',
    scope: 'Public',
    headline: 'CRITICAL EMERGENCY: Imminent Glacial Lake Outburst Flood (GLOF) Alert - Himalaya Sector 4 Catchment',
    description: 'Multi-temporal satellite radar and optical imagery analysis by Aqua Sentinel confirms a 34.0% surface area expansion across Imja Tsho and Tsho Rolpa basins (27.9881° N, 86.9250° E). Hazard probability is evaluated at 92.5% (Alert Tier: RED). Critical precursors detected include acute hydrostatic overtopping pressure, lateral moraine shear fractures, and severe slope displacement indicating catastrophic terminal moraine structural failure and surge flood release.',
    instruction: 'MANDATORY EVACUATION ORDER: All downstream communities, field teams, and critical infrastructure along the Imja and Dudh Koshi river valleys within an 18.5 km radius must immediately ascend to high ground (minimum 40 vertical meters above the riverbed channel). Do not attempt to cross valley bridges or gather belongings. Follow marked evacuation ascent routes toward designated seismic and flood refuge spurs immediately.'
  },
  offline_dispatch_routes: [
    {
      channel: 'D2D Satellite LEO Broadcast',
      protocol: 'Iridium Short Burst Data (SBD) / Direct-to-Cell Sub-GHz',
      status: 'Transmitted',
      target_coverage: '100% trans-Himalayan high-altitude dead zones and base camps'
    },
    {
      channel: 'LoRa Mesh Solar Nodes',
      protocol: 'LoRaWAN 868/915 MHz Multi-Hop Mesh (OASIS CAP Packetized)',
      status: 'Acknowledged (34/34 Relay Nodes Online)',
      target_coverage: '18.5 km downstream riverbed corridor & valley settlements'
    },
    {
      channel: 'Emergency Cellular / SMS Gateway',
      protocol: 'GSM/LTE Cell Broadcast Service (CBS 3GPP TS 23.041)',
      status: 'Dispatched',
      target_coverage: 'All registered mobile devices within Sector-4 cells'
    },
    {
      channel: 'Autonomous Acoustic Siren Array',
      protocol: 'RF Telemetry Trigger / VHF High-Power Modulated Alert',
      status: 'Armed & Sounding',
      target_coverage: 'Direct riparian villages and critical downstream bridges'
    }
  ],
  ui_log_simulation: [
    '[08:53:34.102] [AquaSentinel-AI] Multi-temporal Sentinel-2 MSI NDWI shift evaluated: +34.0% surface area expansion confirmed.',
    '[08:53:34.185] [AquaSentinel-AI] Synthetic Aperture Radar (SAR) interferometry flags 14.8 cm/day lateral moraine displacement.',
    '[08:53:34.240] [RiskEngine] Computed Hazard Probability Score: 92.5% -> Alert Tier escalated to RED (Critical Imminent Breach).',
    '[08:53:34.310] [CAP-Generator] Formatted OASIS CAP v1.2 payload [ID: CAP-AQUA-SENTINEL-HIMALAYA-SEC4-20260909-0853Z].',
    '[08:53:34.390] [Dispatch] Establishing connection to LEO Satellite Constellation uplink gateway...',
    '[08:53:34.520] [Dispatch] Satellite SBD broadcast packet emitted to trans-Himalayan Sector 4 footprint [OK].',
    '[08:53:34.615] [Mesh] Routing CAP payload across 34 decentralized solar LoRa repeater nodes along Dudh Koshi corridor...',
    '[08:53:34.780] [Mesh] LoRa mesh consensus reached: 34/34 nodes confirmed relay propagation.',
    '[08:53:34.850] [Telecom] Triggered 3GPP Cell Broadcast Service (CBS) emergency override to regional mobile towers.',
    '[08:53:34.920] [Acoustic] Automated VHF tone transmitted: Downstream high-decibel valley sirens activated.',
    '[08:53:35.000] [AquaSentinel-AI] Full multi-channel emergency broadcast completed. Standing by for telemetry verification.'
  ]
};

export const RAW_JSON_PAYLOAD = {
  cap_message: HIMALAYA_SECTOR_4_ANALYSIS.cap_message,
  offline_dispatch_routes: HIMALAYA_SECTOR_4_ANALYSIS.offline_dispatch_routes,
  ui_log_simulation: HIMALAYA_SECTOR_4_ANALYSIS.ui_log_simulation
};
