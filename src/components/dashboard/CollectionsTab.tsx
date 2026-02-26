import { useMemo } from 'react';
import { SAMPLE_AGENTS, processAgents, fmtK } from '@/lib/data';
import KPIStrip, { type KPIItem } from './KPIStrip';
import AchievementBar from './AchievementBar';
import AgentLeaderboard from './AgentLeaderboard';
import SidePanel from './SidePanel';

const CollectionsTab = () => {
  const data = useMemo(() => processAgents(SAMPLE_AGENTS), []);
  const { rows, totT, totM, totV, rate, maxM } = data;

  const kpis: KPIItem[] = [
    { label: 'Monthly Target', value: fmtK(totT), note: 'Total allocated', barPct: 100, color: 'navy' },
    { label: 'Total Collected', value: fmtK(totM), note: `${rows.length} agents reporting`, barPct: rate, color: 'emerald' },
    { label: 'Outstanding Gap', value: fmtK(totV), note: 'Remaining to collect', barPct: (totV / totT) * 100, color: 'amber' },
    { label: 'Collection Rate', value: `${rate}%`, note: 'Overall achievement', barPct: rate, color: 'gold' },
  ];

  const topPerformer = rows[0];
  const needsAttention = [...rows].sort((a, b) => a.rate - b.rate).slice(0, 3);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <div className="mx-auto max-w-[1340px] px-4 py-6 sm:px-7">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-primary pb-5">
        <div>
          <h1 className="font-display text-[clamp(26px,4vw,48px)] leading-none text-foreground">
            Department <span className="text-accent">Performance</span>
          </h1>
          <div className="mt-1 text-[11px] font-semibold tracking-[3px] uppercase text-muted-foreground">
            Collections Division — Weekly Summary
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="rounded-lg bg-primary px-4 py-2 text-right">
            <div className="text-[8px] tracking-[3px] uppercase text-primary-foreground/35">Report Date</div>
            <div className="font-display text-[13px] tracking-[2px] text-accent">{dateStr}</div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-amber" />
            Sample data
          </div>
        </div>
      </div>

      <KPIStrip items={kpis} />
      <AchievementBar rate={rate} collected={totM} target={totT} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_310px]">
        <AgentLeaderboard rows={rows} totT={totT} totM={totM} totV={totV} rate={rate} maxM={maxM} />
        <SidePanel
          rate={rate}
          collected={totM}
          remaining={totV}
          topPerformer={topPerformer}
          needsAttention={needsAttention}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3.5 text-[10px] tracking-wider text-muted-foreground">
        <span>Collections Division · Weekly Performance Report</span>
        <span>{now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  );
};

export default CollectionsTab;
