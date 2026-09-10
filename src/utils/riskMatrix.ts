import { RiskEvaluation, RiskLevel } from '../types';

export function evaluateRiskMatrix(
  areaT0: number,
  areaT1: number,
  warningLimit: number = 10.0,
  criticalLimit: number = 25.0
): RiskEvaluation {
  if (areaT0 <= 0) {
    return {
      deltaPx: 0,
      expansionPct: 0.0,
      level: 'Safe',
      badgeColor: '#10B981',
      badgeBg: 'bg-emerald-500/10',
      badgeBorder: 'border-emerald-500/30',
      actionProtocol: 'Insufficient baseline imagery. Sentinel-2 polling active.',
      alertCode: 'DEF-00-STANDBY'
    };
  }

  const deltaPx = areaT1 - areaT0;
  const expansionPct = (deltaPx / areaT0) * 100.0;

  let level: RiskLevel = 'Safe';
  let badgeColor = '#10B981';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-300';
  let badgeBorder = 'border-emerald-300';
  let actionProtocol = 'Lake expansion within nominal seasonal melt variance. Continuous orbital monitoring.';
  let alertCode = 'STATUS-GREEN (NORMAL)';

  if (expansionPct > criticalLimit) {
    level = 'Critical';
    badgeColor = '#EF4444';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-300';
    badgeBorder = 'border-rose-300';
    actionProtocol = 'CRITICAL MORAINE INSTABILITY DETECTED. Immediate evacuation advisory dispatched to downstream valleys.';
    alertCode = 'STATUS-RED (CRITICAL GLOF IMMINENT)';
  } else if (expansionPct > warningLimit) {
    level = 'Warning';
    badgeColor = '#F59E0B';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-300';
    badgeBorder = 'border-amber-300';
    actionProtocol = 'Accelerated glacial melting detected. Alerting District Disaster Management Authority (DDMA) & Hydrology Units.';
    alertCode = 'STATUS-YELLOW (ELEVATED WATCH)';
  }

  return {
    deltaPx,
    expansionPct,
    level,
    badgeColor,
    badgeBg,
    badgeBorder,
    actionProtocol,
    alertCode
  };
}
