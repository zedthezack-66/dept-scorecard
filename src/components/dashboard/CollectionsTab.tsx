import { useMemo, useState } from 'react';
import { processAgents, fmtK } from '@/lib/data';
import { useDashboard } from '@/lib/dashboard-store';
import { useAdmin } from '@/lib/admin-store';
import KPIStrip, { type KPIItem } from './KPIStrip';
import AchievementBar from './AchievementBar';
import AgentLeaderboard from './AgentLeaderboard';
import SidePanel from './SidePanel';
import PinDialog from './PinDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const CollectionsTab = () => {
  const { agents, monthlyTarget, setMonthlyTarget } = useDashboard();
  const { isUnlocked } = useAdmin();
  const data = useMemo(() => processAgents(agents), [agents]);
  const { rows, totM, maxM } = data;

  const totT = monthlyTarget;
  const totV = Math.max(0, totT - totM);
  const rate = totT > 0 ? Math.round((totM / totT) * 100) : 0;

  // Rebuild rows so per-agent rate isn't affected, but Grand Total uses monthlyTarget
  const [pinOpen, setPinOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<string>(String(monthlyTarget));

  const openEdit = () => {
    setDraft(String(monthlyTarget));
    if (isUnlocked) setEditOpen(true);
    else setPinOpen(true);
  };

  const saveTarget = () => {
    const n = Number(draft.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(n) && n > 0) {
      setMonthlyTarget(Math.round(n));
      setEditOpen(false);
    }
  };

  const kpis: KPIItem[] = [
    { label: 'Monthly Target', value: fmtK(totT), note: 'Total allocated', barPct: 100, color: 'navy', onEdit: openEdit },
    { label: 'Total Collected', value: fmtK(totM), note: `${rows.length} agents reporting`, barPct: Math.min(rate, 100), color: 'emerald' },
    { label: 'Outstanding Gap', value: fmtK(totV), note: 'Remaining to collect', barPct: totT > 0 ? Math.min((totV / totT) * 100, 100) : 0, color: 'amber' },
    { label: 'Collection Rate', value: `${rate}%`, note: 'Overall achievement', barPct: Math.min(rate, 100), color: 'gold' },
  ];

  const topPerformer = rows[0];
  const needsAttention = [...rows].sort((a, b) => a.rate - b.rate).slice(0, 3);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-primary pb-5">
        <div>
          <h1 className="font-display text-[clamp(34px,5vw,60px)] leading-none text-foreground">
            Department <span className="text-accent">Performance</span>
          </h1>
          <div className="mt-1.5 text-[15px] font-semibold tracking-[3px] uppercase text-muted-foreground">
            Collections Division — Weekly Summary
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="rounded-lg bg-primary px-5 py-2.5 text-right">
            <div className="text-[12px] tracking-[3px] uppercase text-primary-foreground/35">Report Date</div>
            <div className="font-display text-[20px] tracking-[2px] text-accent">{dateStr}</div>
          </div>
        </div>
      </div>

      <KPIStrip items={kpis} />
      <AchievementBar rate={rate} collected={totM} target={totT} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <AgentLeaderboard rows={rows} totT={totT} totM={totM} totV={totV} rate={rate} maxM={maxM} />
        <SidePanel
          rate={rate}
          collected={totM}
          remaining={totV}
          topPerformer={topPerformer}
          needsAttention={needsAttention}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-[14px] tracking-wider text-muted-foreground">
        <span>Collections Division · Weekly Performance Report</span>
        <span>{now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>

      <PinDialog open={pinOpen} onOpenChange={setPinOpen} onSuccess={() => setEditOpen(true)} />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display tracking-[2px]">Edit Monthly Target</DialogTitle>
            <DialogDescription>Set the collections monthly target (Kwacha).</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="monthly-target">Monthly Target (K)</Label>
            <Input
              id="monthly-target"
              inputMode="numeric"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="580000"
            />
            <p className="text-[12px] text-muted-foreground">Currently: {fmtK(monthlyTarget)}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveTarget}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionsTab;
