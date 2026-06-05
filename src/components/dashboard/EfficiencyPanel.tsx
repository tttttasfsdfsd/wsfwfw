import type { EfficiencyRatios } from '@/types/financial';
import { formatRatio, formatNumber } from '@/lib/formatters';

interface Props {
  efficiency: EfficiencyRatios;
  t: Record<string, string>;
  isRTL: boolean;
}

function RatioCard({ label, value, target }: { label: string; value: string; target: string }) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-color)' }}>
      <span className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{target}</div>
    </div>
  );
}

export default function EfficiencyPanel({ efficiency, t }: Props) {
  const e = efficiency;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <RatioCard label={t.assetTurnover || 'Asset Turnover'} value={formatRatio(e.assetTurnover)} target="Target: >0.5" />
      <RatioCard label={t.fixedAssetTurnover || 'Fixed Asset Turnover'} value={formatRatio(e.fixedAssetTurnover)} target="Target: >2.0" />
      <RatioCard label={t.inventoryTurnover || 'Inventory Turnover'} value={formatRatio(e.inventoryTurnover)} target="Target: >6.0" />
      <RatioCard label={t.dio || 'DIO'} value={`${formatNumber(e.dio)} days`} target="Target: <60 days" />
      <RatioCard label={t.arTurnover || 'AR Turnover'} value={formatRatio(e.arTurnover)} target="Target: >8.0" />
      <RatioCard label={t.dso || 'DSO'} value={`${formatNumber(e.dso)} days`} target="Target: <45 days" />
      <RatioCard label={t.apTurnover || 'AP Turnover'} value={formatRatio(e.apTurnover)} target="Target: >6.0" />
      <RatioCard label={t.dpo || 'DPO'} value={`${formatNumber(e.dpo)} days`} target="Target: 30-60 days" />
      <RatioCard label={t.ccc || 'Cash Conversion Cycle'} value={`${formatNumber(e.ccc)} days`} target="Target: <60 days" />
    </div>
  );
}
