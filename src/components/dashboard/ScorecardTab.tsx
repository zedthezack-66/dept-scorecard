import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getStatus, fmt, fmtK, MONTH_KEYS, MONTH_LABELS } from '@/lib/data';
import { useDashboard } from '@/lib/dashboard-store';
import type { AgentCollectionData, AgentSettlementData, MonthKey } from '@/lib/data';


const statusBadge = (status: string) => {
  const map: Record<string, { bg: string; text: string; label: string; rating: number }> = {
    'outstanding':    { bg: 'bg-[hsl(120,100%,25%)]/15', text: 'text-[hsl(120,100%,25%)]', label: '1 — Outstanding', rating: 1 },
    'exceed':         { bg: 'bg-[hsl(90,80%,40%)]/15',   text: 'text-[hsl(90,80%,35%)]',  label: '2 — Exceed Expectations', rating: 2 },
    'meet':           { bg: 'bg-[hsl(55,90%,45%)]/20',   text: 'text-[hsl(45,90%,35%)]',  label: '3 — Meet Expectations', rating: 3 },
    'unsatisfactory': { bg: 'bg-[hsl(35,100%,50%)]/15',  text: 'text-[hsl(35,100%,40%)]', label: '4 — Unsatisfactory', rating: 4 },
    'poor':           { bg: 'bg-red/15',                  text: 'text-red',                 label: '5 — Poor Performance', rating: 5 },
    'pending':        { bg: 'bg-secondary',               text: 'text-muted-foreground',    label: 'Pending', rating: 0 },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase whitespace-nowrap ${s.bg} ${s.text}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {s.label}
    </span>
  );
};

const barColorClass = (status: string) => {
  const map: Record<string, string> = {
    'outstanding': 'bg-[hsl(120,100%,25%)]',
    'exceed': 'bg-[hsl(90,80%,40%)]',
    'meet': 'bg-[hsl(55,90%,45%)]',
    'unsatisfactory': 'bg-[hsl(35,100%,50%)]',
    'poor': 'bg-red',
  };
  return map[status] || 'bg-border';
};

const ScorecardTab = () => {
  const { metrics, weekly, monthly, agentCollections, agentSettlements } = useDashboard();

  const counts = useMemo(() => {
    let outstanding = 0, exceed = 0, meet = 0, unsatisfactory = 0, poor = 0;
    metrics.forEach(m => {
      const s = getStatus(m.actual, m.target, m.lowerIsBetter);
      if (s === 'outstanding') outstanding++;
      else if (s === 'exceed') exceed++;
      else if (s === 'meet') meet++;
      else if (s === 'unsatisfactory') unsatisfactory++;
      else if (s === 'poor') poor++;
    });
    return { outstanding, exceed, meet, unsatisfactory, poor };
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

      {/* Score summary KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: 'Outstanding', value: counts.outstanding, color: 'text-[hsl(120,100%,25%)]' },
          { label: 'Exceed', value: counts.exceed, color: 'text-[hsl(90,80%,35%)]' },
          { label: 'Meet', value: counts.meet, color: 'text-[hsl(45,90%,35%)]' },
          { label: 'Unsatisfactory', value: counts.unsatisfactory, color: 'text-[hsl(35,100%,40%)]' },
          { label: 'Poor', value: counts.poor, color: 'text-red' },
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

      {/* Quarterly Avg Metrics — Q1 + Q2 */}
      <div className="mb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden rounded-lg border border-border bg-card shadow-card"
        >
          <div className="flex items-center justify-between bg-primary px-6 py-4">
            <span className="font-display text-[20px] tracking-[3px] text-primary-foreground">Quarterly Avg Metrics</span>
            <span className="rounded border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-[11px] font-bold tracking-[2px] uppercase text-primary-foreground/50">Q1–Q2 2026</span>
          </div>
          {(() => {
            const q1Months: MonthKey[] = ['jan', 'feb', 'mar'];
            const q2Months: MonthKey[] = ['apr', 'may', 'jun'];
            const qAvg = (m: any, months: MonthKey[]) => {
              const vals = months.map(mk => m[mk]).filter(v => v !== null && v !== undefined) as number[];
              return vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
            };
            const statusDot = (status: string) => {
              const map: Record<string, string> = {
                outstanding: 'bg-[hsl(120,100%,25%)]',
                exceed: 'bg-[hsl(90,80%,40%)]',
                meet: 'bg-[hsl(55,90%,45%)]',
                unsatisfactory: 'bg-[hsl(35,100%,50%)]',
                poor: 'bg-red',
              };
              return <span className={`inline-block h-4 w-4 rounded-full ${map[status] || 'bg-border'}`} />;
            };
            return (
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr className="border-b-2 border-border bg-secondary">
                    <th className="w-[30%] px-4 py-3 text-left text-[12px] font-bold tracking-[1px] uppercase text-muted-foreground">Metric</th>
                    <th className="w-[12%] px-3 py-3 text-right text-[12px] font-bold tracking-[1px] uppercase text-muted-foreground">Target</th>
                    <th className="w-[18%] px-3 py-3 text-right text-[12px] font-bold tracking-[1px] uppercase text-muted-foreground">Q1 AVG</th>
                    <th className="w-[8%] px-3 py-3 text-center text-[12px] font-bold tracking-[1px] uppercase text-muted-foreground">Status</th>
                    <th className="w-[18%] px-3 py-3 text-right text-[12px] font-bold tracking-[1px] uppercase text-muted-foreground">Q2 AVG</th>
                    <th className="w-[8%] px-3 py-3 text-center text-[12px] font-bold tracking-[1px] uppercase text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map(m => {
                    const q1Avg = qAvg(m, q1Months);
                    const q2Avg = qAvg(m, q2Months);
                    const q1Status = getStatus(q1Avg, m.target, m.lowerIsBetter);
                    const q2Status = getStatus(q2Avg, m.target, m.lowerIsBetter);
                    return (
                      <tr key={m.key} className="border-b border-border hover:bg-primary/[0.03]">
                        <td className="px-4 py-3.5 text-[14px] font-semibold text-foreground leading-tight break-words whitespace-normal">{m.name}</td>
                        <td className="px-3 py-3.5 text-right text-[14px] font-medium">{m.target}{m.unit}</td>
                        <td className="px-3 py-3.5 text-right">
                          {q1Avg !== null
                            ? <span className="font-display text-[20px] tracking-wider">{q1Avg.toFixed(1)}{m.unit}</span>
                            : <span className="italic text-border">—</span>
                          }
                        </td>
                        <td className="px-3 py-3.5 text-center">{statusDot(q1Status)}</td>
                        <td className="px-3 py-3.5 text-right">
                          {q2Avg !== null
                            ? <span className="font-display text-[20px] tracking-wider">{q2Avg.toFixed(1)}{m.unit}</span>
                            : <span className="italic text-border">—</span>
                          }
                        </td>
                        <td className="px-3 py-3.5 text-center">{statusDot(q2Status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          })()}
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

      {/* Agent Collection Breakdown */}
      {agentCollections.length > 0 && (() => {
        const activeMonths: MonthKey[] = MONTH_KEYS.filter(mk =>
          agentCollections.some(a => (a as any)[`${mk}Actual`] !== null && (a as any)[`${mk}Actual`] !== undefined)
        );
        const monthsToShow: MonthKey[] = activeMonths.length > 0 ? activeMonths : (['jan','feb','mar'] as MonthKey[]);
        const monthsCount = monthsToShow.length || 1;
        return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-5 overflow-hidden rounded-lg border border-border bg-card shadow-card"
        >
          <div className="flex items-center justify-between bg-primary px-6 py-4">
            <span className="font-display text-[20px] tracking-[3px] text-primary-foreground">Agent Collection Breakdown</span>
            <span className="rounded border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-[11px] font-bold tracking-[2px] uppercase text-primary-foreground/50">
              {agentCollections.length} Agents
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border bg-secondary">
                  <th className="px-5 py-3 text-left text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Agent Name</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Collection Target</th>
                  {monthsToShow.map(mk => (
                    <th key={mk} className="px-3 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">{MONTH_LABELS[mk]}</th>
                  ))}
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">YTD Expected</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">YTD Actual</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">YTD Variance</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Monthly Avg</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const rows = agentCollections.map((a, i) => {
                    const actuals = monthsToShow.map(mk => (a as any)[`${mk}Actual`]).filter(v => v !== null && v !== undefined) as number[];
                    const ytdActual = actuals.reduce((s, v) => s + v, 0);
                    const ytdExpected = a.collectionTarget * monthsCount;
                    const monthlyAvg = actuals.length > 0 ? Math.round(ytdActual / actuals.length) : 0;
                    const ytdVariance = ytdActual - ytdExpected;
                    const rate = ytdExpected > 0 ? Math.round((ytdActual / ytdExpected) * 100) : 0;
                    const rateColor = rate >= 90 ? 'text-emerald' : rate >= 70 ? 'text-amber' : 'text-red';

                    return (
                      <tr key={i} className="border-b border-border hover:bg-primary/[0.03]">
                        <td className="px-5 py-3.5 text-[14px] font-semibold text-foreground">{a.agentName}</td>
                        <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(a.collectionTarget)}</td>
                        {monthsToShow.map(mk => {
                          const v = (a as any)[`${mk}Actual`];
                          return (
                            <td key={mk} className="px-3 py-3.5 text-right text-[14px]">
                              {v !== null && v !== undefined ? `K ${fmt(v)}` : <span className="italic text-border">—</span>}
                            </td>
                          );
                        })}
                        <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(ytdExpected)}</td>
                        <td className={`px-5 py-3.5 text-right text-[14px] font-semibold ${rateColor}`}>K {fmt(ytdActual)}</td>
                        <td className={`px-5 py-3.5 text-right text-[14px] font-semibold ${ytdVariance >= 0 ? 'text-emerald' : 'text-red'}`}>{ytdVariance >= 0 ? '+' : ''}K {fmt(Math.abs(ytdVariance))}</td>
                        <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(monthlyAvg)}</td>
                      </tr>
                    );
                  });

                  const totTarget = agentCollections.reduce((s, a) => s + a.collectionTarget, 0);
                  const monthTotals = monthsToShow.map(mk =>
                    agentCollections.reduce((s, a) => s + (((a as any)[`${mk}Actual`]) ?? 0), 0)
                  );
                  const totYtdExpected = totTarget * monthsCount;
                  const totYtdActual = monthTotals.reduce((s, v) => s + v, 0);
                  const totYtdVariance = totYtdActual - totYtdExpected;
                  const totMonthlyAvg = monthsCount > 0 ? Math.round(totYtdActual / monthsCount) : 0;

                  return (
                    <>
                      {rows}
                      <tr className="border-t-2 border-border bg-secondary font-bold">
                        <td className="px-5 py-3.5 text-[14px] font-bold text-foreground">TOTAL</td>
                        <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(totTarget)}</td>
                        {monthTotals.map((v, idx) => (
                          <td key={idx} className="px-3 py-3.5 text-right text-[14px]">K {fmt(v)}</td>
                        ))}
                        <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(totYtdExpected)}</td>
                        <td className="px-5 py-3.5 text-right text-[14px] font-bold">K {fmt(totYtdActual)}</td>
                        <td className={`px-5 py-3.5 text-right text-[14px] font-bold ${totYtdVariance >= 0 ? 'text-emerald' : 'text-red'}`}>{totYtdVariance >= 0 ? '+' : ''}K {fmt(Math.abs(totYtdVariance))}</td>
                        <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(totMonthlyAvg)}</td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </motion.div>
      );})()}

      {/* Agent Settlement Breakdown */}
      {agentSettlements.length > 0 && (() => {
        const activeMonths: MonthKey[] = MONTH_KEYS.filter(mk =>
          agentSettlements.some(a => (a as any)[`${mk}Actual`] !== null && (a as any)[`${mk}Actual`] !== undefined)
        );
        const monthsToShow: MonthKey[] = activeMonths.length > 0 ? activeMonths : (['jan','feb','mar'] as MonthKey[]);
        const monthsCount = monthsToShow.length || 1;
        return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-5 overflow-hidden rounded-lg border border-border bg-card shadow-card"
        >
          <div className="flex items-center justify-between bg-primary px-6 py-4">
            <span className="font-display text-[20px] tracking-[3px] text-primary-foreground">Agent Settlement Breakdown</span>
            <span className="rounded border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-[11px] font-bold tracking-[2px] uppercase text-primary-foreground/50">
              {agentSettlements.length} Agents
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border bg-secondary">
                  <th className="px-5 py-3 text-left text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Agent Name</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Settlement Target</th>
                  {monthsToShow.map(mk => (
                    <th key={mk} className="px-3 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">{MONTH_LABELS[mk]}</th>
                  ))}
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">YTD Expected</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">YTD Actual</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">YTD Variance</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Monthly Avg</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const rows = agentSettlements.map((a, i) => {
                    const actuals = monthsToShow.map(mk => (a as any)[`${mk}Actual`]).filter(v => v !== null && v !== undefined) as number[];
                    const ytdActual = actuals.reduce((s, v) => s + v, 0);
                    const ytdExpected = a.settlementTarget * monthsCount;
                    const monthlyAvg = actuals.length > 0 ? Math.round(ytdActual / actuals.length) : 0;
                    const ytdVariance = ytdActual - ytdExpected;
                    const rate = ytdExpected > 0 ? Math.round((ytdActual / ytdExpected) * 100) : 0;
                    const rateColor = rate >= 90 ? 'text-emerald' : rate >= 70 ? 'text-amber' : 'text-red';

                    return (
                      <tr key={i} className="border-b border-border hover:bg-primary/[0.03]">
                        <td className="px-5 py-3.5 text-[14px] font-semibold text-foreground">{a.agentName}</td>
                        <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(a.settlementTarget)}</td>
                        {monthsToShow.map(mk => {
                          const v = (a as any)[`${mk}Actual`];
                          return (
                            <td key={mk} className="px-3 py-3.5 text-right text-[14px]">
                              {v !== null && v !== undefined ? `K ${fmt(v)}` : <span className="italic text-border">—</span>}
                            </td>
                          );
                        })}
                        <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(ytdExpected)}</td>
                        <td className={`px-5 py-3.5 text-right text-[14px] font-semibold ${rateColor}`}>K {fmt(ytdActual)}</td>
                        <td className={`px-5 py-3.5 text-right text-[14px] font-semibold ${ytdVariance >= 0 ? 'text-emerald' : 'text-red'}`}>{ytdVariance >= 0 ? '+' : ''}K {fmt(Math.abs(ytdVariance))}</td>
                        <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(monthlyAvg)}</td>
                      </tr>
                    );
                  });

                  const totTarget = agentSettlements.reduce((s, a) => s + a.settlementTarget, 0);
                  const monthTotals = monthsToShow.map(mk =>
                    agentSettlements.reduce((s, a) => s + (((a as any)[`${mk}Actual`]) ?? 0), 0)
                  );
                  const totYtdExpected = totTarget * monthsCount;
                  const totYtdActual = monthTotals.reduce((s, v) => s + v, 0);
                  const totYtdVariance = totYtdActual - totYtdExpected;
                  const totMonthlyAvg = monthsCount > 0 ? Math.round(totYtdActual / monthsCount) : 0;

                  return (
                    <>
                      {rows}
                      <tr className="border-t-2 border-border bg-secondary font-bold">
                        <td className="px-5 py-3.5 text-[14px] font-bold text-foreground">TOTAL</td>
                        <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(totTarget)}</td>
                        {monthTotals.map((v, idx) => (
                          <td key={idx} className="px-3 py-3.5 text-right text-[14px]">K {fmt(v)}</td>
                        ))}
                        <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(totYtdExpected)}</td>
                        <td className="px-5 py-3.5 text-right text-[14px] font-bold">K {fmt(totYtdActual)}</td>
                        <td className={`px-5 py-3.5 text-right text-[14px] font-bold ${totYtdVariance >= 0 ? 'text-emerald' : 'text-red'}`}>{totYtdVariance >= 0 ? '+' : ''}K {fmt(Math.abs(totYtdVariance))}</td>
                        <td className="px-5 py-3.5 text-right text-[14px]">K {fmt(totMonthlyAvg)}</td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </motion.div>
      );})()}


      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-[12px] tracking-wider text-muted-foreground">
        <span>Credit Department · Scorecard Tracker Q1 2026</span>
        <span>{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  );
};

export default ScorecardTab;
