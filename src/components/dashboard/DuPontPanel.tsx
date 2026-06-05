import type { DuPontAnalysis } from '@/types/financial';
import { formatPercent, formatRatio, formatNumber } from '@/lib/formatters';
import { ArrowRight } from 'lucide-react';

interface Props {
  dupont: DuPontAnalysis;
  t: Record<string, string>;
  isRTL: boolean;
}

export default function DuPontPanel({ dupont, t, isRTL }: Props) {
  const d = dupont;

  return (
    <div className="space-y-4">
      {/* ROE Result */}
      <div className="text-center p-4 rounded-xl border" style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-color)' }}>
        <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>ROE</div>
        <div className="text-4xl font-black gradient-text">{formatPercent(d.roe)}</div>
        <div className="mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Net Margin × Asset Turnover × Financial Leverage</div>
      </div>

      {/* Three Factors */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Net Profit Margin */}
        <div className="flex-1 rounded-xl p-4 border text-center" style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-color)' }}>
          <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{isRTL ? 'هامش الربح الصافي' : 'Net Profit Margin'}</div>
          <div className="text-2xl font-bold text-[#4F6AF6]">{formatPercent(d.netProfitMargin)}</div>
          <div className="mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Net Income / Revenue</div>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-full rounded-full bg-[#4F6AF6] bar-fill" style={{ width: `${Math.min(d.npmContribution, 100)}%` }} />
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatNumber(d.npmContribution)}% {isRTL ? 'مساهمة' : 'contribution'}</div>
        </div>

        <ArrowRight className={`w-6 h-6 hidden md:block ${isRTL ? 'rotate-180' : ''}`} style={{ color: 'var(--accent-primary)' }} />

        {/* Asset Turnover */}
        <div className="flex-1 rounded-xl p-4 border text-center" style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-color)' }}>
          <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{isRTL ? 'دوران الأصول' : 'Asset Turnover'}</div>
          <div className="text-2xl font-bold text-[#06B6D4]">{formatRatio(d.assetTurnover)}</div>
          <div className="mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Revenue / Total Assets</div>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-full rounded-full bg-[#06B6D4] bar-fill" style={{ width: `${Math.min(d.atoContribution, 100)}%` }} />
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatNumber(d.atoContribution)}% {isRTL ? 'مساهمة' : 'contribution'}</div>
        </div>

        <ArrowRight className={`w-6 h-6 hidden md:block ${isRTL ? 'rotate-180' : ''}`} style={{ color: 'var(--accent-primary)' }} />

        {/* Financial Leverage */}
        <div className="flex-1 rounded-xl p-4 border text-center" style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-color)' }}>
          <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{isRTL ? 'الرافعة المالية' : 'Financial Leverage'}</div>
          <div className="text-2xl font-bold text-[#8B5CF6]">{formatRatio(d.financialLeverage)}</div>
          <div className="mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Assets / Equity</div>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-full rounded-full bg-[#8B5CF6] bar-fill" style={{ width: `${Math.min(d.flContribution, 100)}%` }} />
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatNumber(d.flContribution)}% {isRTL ? 'مساهمة' : 'contribution'}</div>
        </div>
      </div>
    </div>
  );
}
