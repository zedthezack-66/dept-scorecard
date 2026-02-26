import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getStatus, fmt, fmtK } from '@/lib/data';
import { useDashboard } from '@/lib/dashboard-store';
import DataToolbar from './DataToolbar';

const statusBadge = (status: string) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    'on-track': { bg: 'bg-emerald/15', text: 'text-emerald', label: 'On Track' },
    'at-risk': { bg: 'bg-amber/20', text: 'text-amber', label: 'At Risk' },
    'off-track': { bg: 'bg-red/15', text: 'text-red', label: 'Off Track' },
    'pending': { bg: 'bg-secondary', text: 'text-muted-foreground', label: 'Pending' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-bold tracking-wider uppercase whitespace-nowrap ${s.bg} ${s.text}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {s.label}
    </span>
  );
};

const barColorClass = (status: string) =>
  status === 'on-track' ? 'bg-emerald' : status === 'at-risk' ? 'bg-amber' : status === 'off-track' ? 'bg-red' : 'bg-border';

const ScorecardTab = () => {
  const { metrics, weekly, monthly } = useDashboard();

  const counts = useMemo(() => {
    let on = 0, at = 0, off = 0;
    metrics.forEach(m => {
      const s = getStatus(m.actual, m.target, m.lowerIsBetter);
      if (s === 'on-track') on++;
      else if (s === 'at-risk') at++;
      else if (s === 'off-track') off++;
    });
    return { on, at, off };
  }, [metrics]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-7">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-primary pb-5">
        <div>
          <h1 className="font-display text-[clamp(30px,4.5vw,54px)] leading-none text-foreground">
            Department <span className="text-accent">Scorecard</span>
          </h1>
          <div className="mt-1.5 text-[13px] font-semibold tracking-[3px] uppercase text-muted-foreground">
            Q1 2026 — Overall Department Performance
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="rounded-lg bg-primary px-5 py-2.5 text-right">
            <div className="text-[10px] tracking-[3px] uppercase text-primary-foreground/35">Quarter</div>
            <div className="font-display text-[16px] tracking-[2px] text-accent">Q1 2026</div>
          </div>
        </div>
      </div>

      <DataToolbar tab="scorecard" />

      {/* Score summary KPIs */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'On Track', value: counts.on, color: 'text-emerald' },
          { label: 'At Risk', value: counts.at, color: 'text-amber' },
          { label: 'Off Track', value: counts.off, color: 'text-red' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-border bg-card p-5 text-center shadow-card"
          >
            <div className="text-[12px] font-bold tracking-[2px] uppercase text-muted-foreground">{item.label}</div>
            <div className={`font-display text-[36px] leading-none ${item.color}`}>{item.value}</div>
            <div className="text-[12px] text-muted-foreground">metrics</div>
          </motion.div>
        ))}
      </div>

      {/* Metrics Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-5 overflow-hidden rounded-lg border border-border bg-card shadow-card"
      >
        <div className="flex items-center justify-between bg-primary px-6 py-4">
          <span className="font-display text-[20px] tracking-[3px] text-primary-foreground">Monthly Metrics — Current Period</span>
          <span className="rounded border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-[11px] font-bold tracking-[2px] uppercase text-primary-foreground/50">
            {metrics.length} Metrics
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border bg-secondary">
                <th className="px-5 py-3 text-left text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Metric</th>
                <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Target</th>
                <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Actual</th>
                <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Variance</th>
                <th className="px-5 py-3 text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Progress</th>
                <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => {
                const status = getStatus(m.actual, m.target, m.lowerIsBetter);
                let pct = 0;
                if (m.actual !== null) {
                  pct = m.lowerIsBetter
                    ? Math.min(100, Math.max(0, Math.round((1 - (m.actual - m.target) / m.target) * 100)))
                    : Math.min(100, Math.round((m.actual / m.target) * 100));
                }
                const varVal = m.actual !== null ? (m.lowerIsBetter ? m.target - m.actual : m.actual - m.target) : null;

                return (
                  <tr key={m.key} className="border-b border-border transition-colors hover:bg-primary/[0.03]">
                    <td className="px-5 py-4">
                      <div className="text-[14px] font-semibold text-foreground">{m.name}</div>
                      <div className="text-[11px] tracking-wider uppercase text-muted-foreground">{m.type}</div>
                    </td>
                    <td className="px-5 py-4 text-right text-[14px] font-semibold">{m.target}{m.unit}</td>
                    <td className="px-5 py-4 text-right">
                      {m.actual !== null
                        ? <span className="font-display text-[22px] tracking-wider text-foreground">{m.actual}{m.unit}</span>
                        : <span className="text-[13px] italic text-border">Not entered</span>
                      }
                    </td>
                    <td className="px-5 py-4 text-right text-[13px] font-semibold">
                      {varVal !== null
                        ? <span className={varVal >= 0 ? 'text-emerald' : 'text-red'}>{varVal >= 0 ? '+' : ''}{varVal.toFixed(1)}{m.unit}</span>
                        : <span className="text-border">—</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="min-w-[80px] flex-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                          <motion.div
                            className={`h-full rounded-full ${barColorClass(status)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1.3, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                        <span className="w-10 text-right text-[12px] text-muted-foreground">{m.actual !== null ? `${pct}%` : '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">{statusBadge(status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Weekly Counter Payments */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-5"
      >
        <div className="flex items-center justify-between rounded-t-lg bg-primary px-6 py-4">
          <span className="font-display text-[20px] tracking-[3px] text-primary-foreground">Weekly Counter Payments</span>
          <span className="rounded border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-[11px] font-bold tracking-[2px] uppercase text-primary-foreground/50">
            Target: K {fmt(weekly[0]?.target ?? 15000)} / week
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 rounded-b-lg border border-t-0 border-border bg-card p-5 lg:grid-cols-4">
          {weekly.map((w, i) => {
            const wRate = w.actual !== null ? Math.round((w.actual / w.target) * 100) : null;
            const wColor = wRate !== null ? (wRate >= 90 ? 'bg-emerald' : wRate >= 70 ? 'bg-amber' : 'bg-red') : 'bg-border';
            const wTextColor = wRate !== null ? (wRate >= 90 ? 'text-emerald' : wRate >= 70 ? 'text-amber' : 'text-red') : 'text-muted-foreground';

            return (
              <div key={i} className="relative overflow-hidden rounded-lg border border-border p-5">
                <div className={`absolute top-0 left-0 right-0 h-[4px] ${wColor}`} />
                <div className="text-[12px] font-bold tracking-[2px] uppercase text-muted-foreground">{w.week}</div>
                <div className="text-[12px] text-muted-foreground">{w.start} – {w.end}</div>
                <div className="mt-2.5 font-display text-[32px] leading-none text-foreground">{w.actual !== null ? fmtK(w.actual) : '—'}</div>
                <div className="text-[12px] text-muted-foreground">Target: K {fmt(w.target)}</div>
                {wRate !== null && <div className={`mt-1 text-[13px] font-bold ${wTextColor}`}>{wRate}%</div>}
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className={`h-full rounded-full ${wColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${wRate || 0}%` }}
                    transition={{ duration: 1.3, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quarterly + Monthly */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden rounded-lg border border-border bg-card shadow-card"
        >
          <div className="flex items-center justify-between bg-primary px-6 py-4">
            <span className="font-display text-[20px] tracking-[3px] text-primary-foreground">Quarterly Avg Metrics</span>
            <span className="rounded border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-[11px] font-bold tracking-[2px] uppercase text-primary-foreground/50">Q1 2026</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border bg-secondary">
                  <th className="px-5 py-3 text-left text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Metric</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Target</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Jan</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Feb</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Mar</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Q Avg</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.filter(m => m.jan !== null || m.feb !== null || m.mar !== null).map(m => {
                  const vals = [m.jan, m.feb, m.mar].filter(v => v !== null) as number[];
                  const qAvg = vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
                  const status = getStatus(qAvg, m.target, m.lowerIsBetter);
                  return (
                    <tr key={m.key} className="border-b border-border hover:bg-primary/[0.03]">
                      <td className="px-5 py-3 text-[14px] font-semibold text-foreground">{m.name.split('—')[0].trim()}</td>
                      <td className="px-5 py-3 text-right text-[14px]">{m.target}{m.unit}</td>
                      <td className="px-5 py-3 text-right text-[14px]">{m.jan !== null ? `${m.jan}${m.unit}` : <span className="italic text-border">—</span>}</td>
                      <td className="px-5 py-3 text-right text-[14px]">{m.feb !== null ? `${m.feb}${m.unit}` : <span className="italic text-border">—</span>}</td>
                      <td className="px-5 py-3 text-right text-[14px]">{m.mar !== null ? `${m.mar}${m.unit}` : <span className="italic text-border">—</span>}</td>
                      <td className="px-5 py-3 text-right">
                        {qAvg !== null
                          ? <span className="font-display text-[20px] tracking-wider">{qAvg.toFixed(1)}{m.unit}</span>
                          : <span className="italic text-border">—</span>
                        }
                      </td>
                      <td className="px-5 py-3 text-right">{statusBadge(status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="overflow-hidden rounded-lg border border-border bg-card shadow-card"
        >
          <div className="flex items-center justify-between bg-primary px-6 py-4">
            <span className="font-display text-[20px] tracking-[3px] text-primary-foreground">Monthly Counter Totals</span>
            <span className="rounded border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-[11px] font-bold tracking-[2px] uppercase text-primary-foreground/50">K {fmt(monthly[0]?.target ?? 60000)} target</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border bg-secondary">
                  <th className="px-5 py-3 text-left text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Month</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Target</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Actual</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Rate</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m, i) => {
                  const mRate = m.actual !== null ? Math.round((m.actual / m.target) * 100) : null;
                  const status = m.actual !== null ? (mRate! >= 90 ? 'on-track' : mRate! >= 70 ? 'at-risk' : 'off-track') : 'pending';
                  return (
                    <tr key={i} className="border-b border-border hover:bg-primary/[0.03]">
                      <td className="px-5 py-3.5 text-[14px] font-semibold text-foreground">{m.month}</td>
                      <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(m.target)}</td>
                      <td className="px-5 py-3.5 text-right">
                        {m.actual !== null
                          ? <span className="font-display text-[20px] tracking-wider">K {fmt(m.actual)}</span>
                          : <span className="italic text-border">—</span>
                        }
                      </td>
                      <td className="px-5 py-3.5 text-right text-[14px] font-semibold">{mRate !== null ? `${mRate}%` : '—'}</td>
                      <td className="px-5 py-3.5 text-right">{statusBadge(status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-[12px] tracking-wider text-muted-foreground">
        <span>Credit Department · Scorecard Tracker Q1 2026</span>
        <span>{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  );
};

export default ScorecardTab;
