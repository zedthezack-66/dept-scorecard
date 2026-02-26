import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDashboard } from '@/lib/dashboard-store';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditTargetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab: 'collections' | 'scorecard';
}

const EditTargetsDialog = ({ open, onOpenChange, tab }: EditTargetsDialogProps) => {
  const store = useDashboard();

  // Local draft state
  const [agentTargets, setAgentTargets] = useState<number[]>([]);
  const [metricTargets, setMetricTargets] = useState<Record<string, number>>({});
  const [weeklyTargets, setWeeklyTargets] = useState<number[]>([]);
  const [monthlyTargets, setMonthlyTargets] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      setAgentTargets(store.agents.map(a => a.target));
      setMetricTargets(Object.fromEntries(store.metrics.map(m => [m.key, m.target])));
      setWeeklyTargets(store.weekly.map(w => w.target));
      setMonthlyTargets(store.monthly.map(m => m.target));
    }
  }, [open, store.agents, store.metrics, store.weekly, store.monthly]);

  const handleSave = () => {
    if (tab === 'collections') {
      agentTargets.forEach((t, i) => store.updateAgentTarget(i, t));
    } else {
      Object.entries(metricTargets).forEach(([key, val]) => store.updateMetricTarget(key, val));
      weeklyTargets.forEach((t, i) => store.updateWeeklyTarget(i, t));
      monthlyTargets.forEach((t, i) => store.updateMonthlyTarget(i, t));
    }
    toast.success('Targets updated');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-[22px] tracking-wider">
            Edit {tab === 'collections' ? 'Agent' : 'Scorecard'} Targets
          </DialogTitle>
          <DialogDescription>
            Adjust target values below and click Save.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-2">
          {tab === 'collections' ? (
            <div className="space-y-3">
              {store.agents.map((agent, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="min-w-[90px] text-[12px] font-medium text-foreground">{agent.name}</span>
                  <Input
                    type="number"
                    value={agentTargets[i] ?? ''}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setAgentTargets(prev => prev.map((t, j) => j === i ? val : t));
                    }}
                    className="h-8 text-[12px]"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-[10px] font-bold tracking-[2px] uppercase text-muted-foreground">Metrics</div>
                <div className="space-y-2">
                  {store.metrics.map(m => (
                    <div key={m.key} className="flex items-center gap-3">
                      <span className="min-w-[140px] text-[11px] font-medium text-foreground leading-tight">{m.name.split('—')[0].trim()}</span>
                      <Input
                        type="number"
                        step="0.1"
                        value={metricTargets[m.key] ?? ''}
                        onChange={e => setMetricTargets(prev => ({ ...prev, [m.key]: Number(e.target.value) }))}
                        className="h-8 text-[12px]"
                      />
                      <span className="text-[10px] text-muted-foreground">{m.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-bold tracking-[2px] uppercase text-muted-foreground">Weekly Targets</div>
                <div className="space-y-2">
                  {store.weekly.map((w, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="min-w-[90px] text-[11px] font-medium text-foreground">{w.week}</span>
                      <Input
                        type="number"
                        value={weeklyTargets[i] ?? ''}
                        onChange={e => setWeeklyTargets(prev => prev.map((t, j) => j === i ? Number(e.target.value) : t))}
                        className="h-8 text-[12px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-bold tracking-[2px] uppercase text-muted-foreground">Monthly Targets</div>
                <div className="space-y-2">
                  {store.monthly.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="min-w-[90px] text-[11px] font-medium text-foreground">{m.month}</span>
                      <Input
                        type="number"
                        value={monthlyTargets[i] ?? ''}
                        onChange={e => setMonthlyTargets(prev => prev.map((t, j) => j === i ? Number(e.target.value) : t))}
                        className="h-8 text-[12px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save Targets</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTargetsDialog;
