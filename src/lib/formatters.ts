export function formatCurrency(value: number | undefined, currency: string = ' SAR'): string {
  if (value === undefined || value === null || isNaN(value) || !isFinite(value)) return `0${currency}`;
  const absVal = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (absVal >= 1_000_000_000) return `${sign}${(absVal / 1_000_000_000).toFixed(1)}B${currency}`;
  if (absVal >= 1_000_000) return `${sign}${(absVal / 1_000_000).toFixed(1)}M${currency}`;
  if (absVal >= 1_000) return `${sign}${(absVal / 1_000).toFixed(1)}K${currency}`;
  return `${sign}${absVal.toFixed(0)}${currency}`;
}

export function formatNumber(value: number | undefined, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value) || !isFinite(value)) return '0';
  return value.toFixed(decimals);
}

export function formatPercent(value: number | undefined, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

export function formatRatio(value: number | undefined, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value) || !isFinite(value)) return '0.00';
  return value.toFixed(decimals);
}

export function getScoreColor(score: number): { text: string; border: string; bg: string } {
  if (score >= 80) return { text: 'text-emerald-400', border: 'border-emerald-400', bg: 'bg-emerald-400/20' };
  if (score >= 60) return { text: 'text-cyan-400', border: 'border-cyan-400', bg: 'bg-cyan-400/20' };
  if (score >= 40) return { text: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-400/20' };
  return { text: 'text-red-400', border: 'border-red-400', bg: 'bg-red-400/20' };
}

export function getStatusBadge(value: number, thresholds: { excellent: number; good: number; moderate: number },
  labels: { excellent: string; good: string; moderate: string; weak: string }): { text: string; color: string } {
  if (value >= thresholds.excellent) return { text: labels.excellent, color: 'text-emerald-400' };
  if (value >= thresholds.good) return { text: labels.good, color: 'text-cyan-400' };
  if (value >= thresholds.moderate) return { text: labels.moderate, color: 'text-amber-400' };
  return { text: labels.weak, color: 'text-red-400' };
}

// For altman z-score zone colors
export function getAltmanZoneColor(zone: 'safe' | 'grey' | 'distress'): string {
  switch (zone) {
    case 'safe': return 'text-emerald-400';
    case 'grey': return 'text-amber-400';
    case 'distress': return 'text-red-400';
  }
}

// For beneish m-score
export function getBeneishStatusColor(isManipulator: boolean): string {
  return isManipulator ? 'text-red-400' : 'text-emerald-400';
}

// For liquidity risk
export function getLiquidityRiskColor(risk: 'safe' | 'caution' | 'danger'): string {
  switch (risk) {
    case 'safe': return 'text-emerald-400';
    case 'caution': return 'text-amber-400';
    case 'danger': return 'text-red-400';
  }
}
