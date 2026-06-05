import type { ProfitabilityRatios } from '@/types/financial';
import { formatPercent } from '@/lib/formatters';

interface Props {
  profitability: ProfitabilityRatios;
  t: Record<string, string>;
  isRTL: boolean;
}

function RatioCard({ label, value, formula, status }: { label: string; value: number; formula: string; status: string }) {
  const statusColors: Record<string, string> = {
    'Excellent': 'text-emerald-400',
    'Good': 'text-cyan-400',
    'Moderate': 'text-amber-400',
    'Weak': 'text-red-400',
    'ممتاز': 'text-emerald-400',
    'جيد': 'text-cyan-400',
    'متوسط': 'text-amber-400',
    'ضعيف': 'text-red-400',
  };

  return (
    <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-color)' }}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className={`text-xs font-bold ${statusColors[status] || 'text-emerald-400'}`}>{status}</span>
      </div>
      <div className="text-2xl font-bold mb-1">{formatPercent(value)}</div>
      <div className="mono text-xs" style={{ color: 'var(--text-muted)' }}>{formula}</div>
    </div>
  );
}

export default function ProfitabilityPanel({ profitability, t }: Props) {
  const p = profitability;
  const isArabic = t.brand === 'AI-CFO Pro' && t.profitabilityTitle === 'تحليل الربحية';

  const getStatus = (v: number, excellent: number, good: number) =>
    v >= excellent ? (isArabic ? 'ممتاز' : 'Excellent') : v >= good ? (isArabic ? 'جيد' : 'Good') : (isArabic ? 'متوسط' : 'Moderate');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <RatioCard label={t.grossMargin || 'Gross Margin'} value={p.grossMargin} formula="Gross Profit / Revenue" status={getStatus(p.grossMargin, 40, 25)} />
      <RatioCard label={t.operatingMargin || 'Operating Margin'} value={p.operatingMargin} formula="EBIT / Revenue" status={getStatus(p.operatingMargin, 20, 10)} />
      <RatioCard label={t.ebitdaMargin || 'EBITDA Margin'} value={p.ebitdaMargin} formula="EBITDA / Revenue" status={getStatus(p.ebitdaMargin, 25, 15)} />
      <RatioCard label={t.netMargin || 'Net Margin'} value={p.netMargin} formula="Net Income / Revenue" status={getStatus(p.netMargin, 15, 8)} />
      <RatioCard label={t.roa || 'ROA'} value={p.roa} formula="Net Income / Total Assets" status={getStatus(p.roa, 10, 5)} />
      <RatioCard label={t.roe || 'ROE'} value={p.roe} formula="Net Income / Equity" status={getStatus(p.roe, 15, 10)} />
      <RatioCard label={t.roce || 'ROCE'} value={p.roce} formula="EBIT / (Assets - CL)" status={getStatus(p.roce, 15, 10)} />
      <RatioCard label={t.roic || 'ROIC'} value={p.roic} formula="NOPAT / Invested Capital" status={getStatus(p.roic, 12, 8)} />
    </div>
  );
}
